import { Account, Contract, Keypair, Networks, Transaction, TransactionBuilder, nativeToScVal, rpc as SorobanRpc, scValToNative } from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';
import { BallotData, Candidate, TxStatus, VoteEvent } from '../types/ballot';

const CONTRACT_ID_PATTERN = /^C[1-9A-HJ-NP-Za-km-z]{55}$/;
const envContractId = (import.meta.env.VITE_SOROBAN_CONTRACT_ID as string | undefined) || '';
const isConfiguredContract = Boolean(envContractId && CONTRACT_ID_PATTERN.test(envContractId));

const SIMULATED_CANDIDATES: Candidate[] = [
  { id: 0, name: 'Soroban Core Lab', party: 'Smart Contract Infrastructure', bio: 'Scaling rust-based sub-second state execution on Stellar.', avatar: '⚙️', votes: 4, percentage: 33 },
  { id: 1, name: 'StellarWallets Alliance', party: 'Multi-Wallet Ecosystem', bio: 'Unifying web3 browser extensions and mobile signers.', avatar: '👛', votes: 8, percentage: 67 },
];

export const STELLAR_CONFIG = {
  network: 'TESTNET',
  networkPassphrase: Networks.TESTNET,
  rpcUrl: (import.meta.env.VITE_SOROBAN_RPC_URL as string | undefined) || 'https://soroban-testnet.stellar.org',
  horizonUrl: (import.meta.env.VITE_STELLAR_HORIZON_URL as string | undefined) || 'https://horizon-testnet.stellar.org',
  contractId: envContractId || 'SIMULATED_LOCAL_ONLY',
  wasmHash: isConfiguredContract ? 'Verified on-chain contract' : 'Local custom Soroban contract in repo; no live deployment configured',
  explorerUrl: 'https://stellar.expert/explorer/testnet',
  isSimulationMode: !isConfiguredContract,
};
const rpc = new SorobanRpc.Server(STELLAR_CONFIG.rpcUrl);
let contractInstance: Contract | null = null;

const getContract = (): Contract | null => {
  if (!STELLAR_CONFIG.contractId || !CONTRACT_ID_PATTERN.test(STELLAR_CONFIG.contractId)) {
    return null;
  }

  if (!contractInstance) {
    try {
      contractInstance = new Contract(STELLAR_CONFIG.contractId);
    } catch {
      return null;
    }
  }

  return contractInstance;
};

export const INITIAL_BALLOT_DATA: BallotData = {
  title: 'BallotChain election',
  description: STELLAR_CONFIG.isSimulationMode
    ? 'Simulation mode: the custom Soroban contract exists in contracts/live_poll/src/lib.rs, but no deployed testnet ID is configured in this browser build.'
    : 'Waiting for a valid deployed Soroban contract…',
  totalVotes: 0,
  votingWindow: {
    startTime: STELLAR_CONFIG.isSimulationMode ? 'Local simulation' : '—',
    endTime: STELLAR_CONFIG.isSimulationMode ? 'Local simulation' : '—',
    endTimestampMs: 0,
    isOpen: STELLAR_CONFIG.isSimulationMode,
    timeRemainingFormatted: STELLAR_CONFIG.isSimulationMode ? 'Simulation mode' : 'Waiting for contract…',
  },
  candidates: STELLAR_CONFIG.isSimulationMode ? SIMULATED_CANDIDATES : [],
  contractId: STELLAR_CONFIG.contractId,
  wasmHash: STELLAR_CONFIG.wasmHash,
  network: STELLAR_CONFIG.network,
};
export const INITIAL_VOTE_EVENTS: VoteEvent[] = [];
type Reporter = (status: TxStatus) => void;

function getSimulatedBallotData(): BallotData {
  const totalVotes = SIMULATED_CANDIDATES.reduce((sum, candidate) => sum + candidate.votes, 0);
  return {
    ...INITIAL_BALLOT_DATA,
    title: 'BallotChain election (simulated)',
    description: 'This browser build is intentionally running in simulation mode until VITE_SOROBAN_CONTRACT_ID points to a live Stellar testnet contract.',
    totalVotes,
    candidates: SIMULATED_CANDIDATES.map(candidate => ({ ...candidate, percentage: totalVotes ? Math.round((candidate.votes / totalVotes) * 100) : 0 })),
    votingWindow: {
      startTime: 'Local simulation',
      endTime: 'Local simulation',
      endTimestampMs: 0,
      isOpen: true,
      timeRemainingFormatted: 'Simulation mode',
    },
  };
}

function call(method: string, args: ReturnType<typeof nativeToScVal>[] = []) {
  const contract = getContract();
  if (!contract) {
    throw new Error('Soroban contract is unavailable in this browser session.');
  }

  const source = new Account(Keypair.random().publicKey(), '0');
  return new TransactionBuilder(source, { fee: '100', networkPassphrase: STELLAR_CONFIG.networkPassphrase }).addOperation(contract.call(method, ...args)).setTimeout(30).build();
}
async function read(method: string, args: ReturnType<typeof nativeToScVal>[] = []) {
  const contract = getContract();
  if (!contract) {
    throw new Error('Soroban contract is unavailable in this browser session.');
  }

  const response = await rpc.simulateTransaction(call(method, args));
  if ('error' in response) throw new Error(response.error);
  if (!response.result?.retval) throw new Error(`${method} returned no value`);
  return scValToNative(response.result.retval);
}
const avatar = (id: number) => ['⚙️', '👛', '📈', '🌱', '🏅', '🗳️'][id % 6];

/** Reads all displayed election data from the deployed Soroban contract. */
export async function loadBallotDataFromContract(): Promise<BallotData> {
  if (STELLAR_CONFIG.isSimulationMode) {
    return getSimulatedBallotData();
  }

  const contract = getContract();
  if (!contract) {
    throw new Error('No valid Soroban contract is configured. Set VITE_SOROBAN_CONTRACT_ID to a deployed testnet contract.');
  }

  const [title, count, totalVotes, isOpen] = await Promise.all([read('get_title'), read('get_candidate_count'), read('get_total_votes'), read('is_voting_open')]);
  const candidates = await Promise.all(Array.from({ length: Number(count) }, async (_, id) => {
    const [raw, votes] = await Promise.all([read('get_candidate', [nativeToScVal(id, { type: 'u32' })]), read('get_votes', [nativeToScVal(id, { type: 'u32' })])]);
    const data = raw as { id: number; name: string; party: string; bio: string };
    return { id: Number(data.id), name: String(data.name), party: String(data.party), bio: String(data.bio), avatar: avatar(id), votes: Number(votes), percentage: Number(totalVotes) ? Math.round(Number(votes) * 100 / Number(totalVotes)) : 0 } satisfies Candidate;
  }));
  return { ...INITIAL_BALLOT_DATA, title: String(title), totalVotes: Number(totalVotes), candidates, votingWindow: { startTime: 'On-chain election', endTime: 'Enforced by contract', endTimestampMs: 0, isOpen: Boolean(isOpen), timeRemainingFormatted: Boolean(isOpen) ? 'Open on-chain' : 'Closed on-chain' } };
}
function failure(error: unknown): TxStatus {
  const message = error instanceof Error ? error.message : String(error); const lower = message.toLowerCase();
  if (lower.includes('reject') || lower.includes('declin') || lower.includes('cancel')) return { state: 'error', errorType: 'user_rejected', errorMessage: 'Transaction signature was declined in Freighter.' };
  if (lower.includes('insufficient') || lower.includes('underfunded') || lower.includes('funded')) return { state: 'error', errorType: 'insufficient_balance', errorMessage: `Transaction could not be funded: ${message}` };
  return { state: 'error', errorType: 'rpc_error', errorMessage: `Soroban transaction failed: ${message}` };
}
async function invoke(voter: string, method: string, args: ReturnType<typeof nativeToScVal>[], report: Reporter): Promise<string> {
  const contract = getContract();
  if (!contract) {
    throw new Error('Soroban contract is unavailable in this browser session.');
  }

  try {
    const accountResponse = await fetch(`${STELLAR_CONFIG.horizonUrl}/accounts/${voter}`);
    if (!accountResponse.ok) throw new Error(accountResponse.status === 404 ? 'Account is not funded on Testnet' : 'Unable to load account sequence number');
    const account = new Account(voter, (await accountResponse.json() as { sequence: string }).sequence);
    const raw = new TransactionBuilder(account, { fee: '100', networkPassphrase: STELLAR_CONFIG.networkPassphrase }).addOperation(contract.call(method, ...args)).setTimeout(120).build();
    const prepared = await rpc.prepareTransaction(raw);
    report({ state: 'signing', message: 'Approve this Soroban transaction in Freighter…' });
    const signed = await signTransaction(prepared.toXDR(), { address: voter, networkPassphrase: STELLAR_CONFIG.networkPassphrase });
    if (signed.error || !signed.signedTxXdr) throw new Error(signed.error?.message || 'Transaction was not signed');
    report({ state: 'submitting', message: 'Submitting signed transaction to Soroban Testnet…' });
    const submitted = await rpc.sendTransaction(TransactionBuilder.fromXDR(signed.signedTxXdr, STELLAR_CONFIG.networkPassphrase));
    if (submitted.status === 'ERROR') throw new Error(submitted.errorResult?.toString() || 'Soroban rejected the transaction');
    for (let i = 0; i < 20; i += 1) { const result = await rpc.getTransaction(submitted.hash); if (result.status === 'SUCCESS') return submitted.hash; if (result.status === 'FAILED') throw new Error('Contract execution failed'); await new Promise(resolve => window.setTimeout(resolve, 1000)); }
    throw new Error('Timed out waiting for transaction confirmation');
  } catch (error) { throw failure(error); }
}
export async function submitVoteToContract(voter: string, candidateId: number, candidateName: string, report: Reporter) {
  if (STELLAR_CONFIG.isSimulationMode) {
    const txHash = `simulated-vote-${Date.now()}`;
    return {
      status: {
        state: 'success',
        txHash,
        message: 'Simulation mode: vote accepted locally. The real Soroban contract is defined in contracts/live_poll/src/lib.rs and will be used once VITE_SOROBAN_CONTRACT_ID is configured.',
      } as TxStatus,
      updatedEvent: {
        id: txHash,
        voter: `${voter.slice(0, 3)}…${voter.slice(-4)}`,
        candidateId,
        candidateName,
        timestamp: 'Just now',
        txHash,
        type: 'vote' as const,
      },
    };
  }

  try { const txHash = await invoke(voter, 'vote', [nativeToScVal(voter, { type: 'address' }), nativeToScVal(candidateId, { type: 'u32' })], report); return { status: { state: 'success', txHash, message: 'Vote confirmed by the Soroban contract.' } as TxStatus, updatedEvent: { id: txHash, voter: `${voter.slice(0, 3)}…${voter.slice(-4)}`, candidateId, candidateName, timestamp: 'Just now', txHash, type: 'vote' as const } }; } catch (status) { return { status: status as TxStatus }; }
}
export async function registerCandidateOnContract(voter: string, name: string, party: string, bio: string, report: Reporter) {
  if (STELLAR_CONFIG.isSimulationMode) {
    const txHash = `simulated-register-${Date.now()}`;
    return {
      status: {
        state: 'success',
        txHash,
        message: 'Simulation mode: candidate registration accepted locally. The contract logic is in contracts/live_poll/src/lib.rs and will run on-chain once a deployed ID is supplied.',
      } as TxStatus,
      updatedEvent: {
        id: txHash,
        voter: `${voter.slice(0, 3)}…${voter.slice(-4)}`,
        candidateId: -1,
        candidateName: name,
        timestamp: 'Just now',
        txHash,
        type: 'candidate_registered' as const,
      },
    };
  }

  try { const txHash = await invoke(voter, 'register_candidate', [nativeToScVal(voter, { type: 'address' }), nativeToScVal(name, { type: 'string' }), nativeToScVal(party, { type: 'string' }), nativeToScVal(bio, { type: 'string' })], report); return { status: { state: 'success', txHash, message: `Candidate “${name}” was registered on-chain.` } as TxStatus, updatedEvent: { id: txHash, voter: `${voter.slice(0, 3)}…${voter.slice(-4)}`, candidateId: -1, candidateName: name, timestamp: 'Just now', txHash, type: 'candidate_registered' as const } }; } catch (status) { return { status: status as TxStatus }; }
}
