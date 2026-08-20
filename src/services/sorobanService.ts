import { BallotData, VoteEvent, TxStatus, Candidate } from '../types/ballot';

// Stellar Testnet Configuration
export const STELLAR_CONFIG = {
  network: 'TESTNET',
  networkPassphrase: 'Test SDF Network ; July 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNQX554EE7ZMBYTXFE6X5W45WLS',
  wasmHash: 'b4a07e923f15c4013149a37bd48bf6e568cdb91176b91176b91176b91176b911',
  explorerUrl: 'https://stellar.expert/explorer/testnet',
};

const NOW_MS = Date.now();
const END_TIME_MS = NOW_MS + 7 * 24 * 60 * 60 * 1000; // 7 days from now

// Initial BallotChain State
export const INITIAL_BALLOT_DATA: BallotData = {
  title: 'BallotChain: Stellar Community Governance & Innovation Election 2026',
  description:
    'A decentralized, tamper-proof, one-vote-per-wallet voting protocol powered by Soroban Smart Contracts. Cast your vote for the priority ecosystem candidate below.',
  totalVotes: 342,
  votingWindow: {
    startTime: new Date(NOW_MS - 2 * 24 * 60 * 60 * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    endTime: new Date(END_TIME_MS).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    endTimestampMs: END_TIME_MS,
    isOpen: true,
    timeRemainingFormatted: '6d 23h 45m',
  },
  candidates: [
    {
      id: 0,
      name: 'Soroban Core Protocol',
      party: 'Smart Contract Infrastructure',
      bio: 'Scaling Rust-based WebAssembly smart contracts with sub-second finality and formal state proofs on Stellar Testnet & Mainnet.',
      avatar: '⚙️',
      votes: 148,
      percentage: 43,
    },
    {
      id: 1,
      name: 'StellarWallets Alliance',
      party: 'Multi-Wallet Compatibility Layer',
      bio: 'Unified SDK connecting Freighter, Albedo, xBull, Rabet, Lobstr, and WebAuthn Passkeys into a single seamless sign-in modal.',
      avatar: '👛',
      votes: 96,
      percentage: 28,
    },
    {
      id: 2,
      name: 'Anchored DEX Protocol',
      party: 'Decentralized Liquidity & Orderbooks',
      bio: 'Native on-chain orderbooks combined with Soroban automated market makers (AMMs) for zero-slippage cross-border asset swaps.',
      avatar: '📈',
      votes: 62,
      percentage: 18,
    },
    {
      id: 3,
      name: 'GreenLedger Zero-Gas',
      party: 'Gas Fee Abstraction & Sustainability',
      bio: 'Sponsoring resource fees for new users with automated fee-bump contracts and verifiable carbon-neutral transaction proofs.',
      avatar: '🌱',
      votes: 36,
      percentage: 11,
    },
  ],
  contractId: STELLAR_CONFIG.contractId,
  wasmHash: STELLAR_CONFIG.wasmHash,
  network: STELLAR_CONFIG.network,
};

// Initial Events Stream
export const INITIAL_VOTE_EVENTS: VoteEvent[] = [
  {
    id: 'evt-1',
    voter: 'GBX...7K9A',
    candidateId: 0,
    candidateName: 'Soroban Core Protocol',
    timestamp: '3 mins ago',
    txHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    type: 'vote',
  },
  {
    id: 'evt-2',
    voter: 'GCP...3M1L',
    candidateId: 1,
    candidateName: 'StellarWallets Alliance',
    timestamp: '8 mins ago',
    txHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    type: 'vote',
  },
  {
    id: 'evt-3',
    voter: 'GDH...9P4V',
    candidateId: 0,
    candidateName: 'Soroban Core Protocol',
    timestamp: '14 mins ago',
    txHash: '47bce5c74f589f4867dbd57e9ca9f808817b006098fc16ce03913706c0744e30',
    type: 'vote',
  },
  {
    id: 'evt-4',
    voter: 'GAK...4L9Q',
    candidateId: 3,
    candidateName: 'GreenLedger Zero-Gas',
    timestamp: '25 mins ago',
    txHash: '13a3b5c74f589f4867dbd57e9ca9f808817b006098fc16ce03913706c0744e12',
    type: 'candidate_registered',
  },
];

export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

// Simulates voting on the Soroban Contract with realistic timing & error handling triggers
export async function submitVoteToContract(
  voterPublicKey: string,
  candidateId: number,
  walletType: string,
  candidateName: string,
  forceErrorType?: 'wallet_not_installed' | 'user_rejected' | 'insufficient_balance' | 'rpc_error'
): Promise<{ status: TxStatus; updatedEvent?: VoteEvent }> {
  
  if (forceErrorType === 'wallet_not_installed') {
    await new Promise((res) => setTimeout(res, 400));
    return {
      status: {
        state: 'error',
        errorType: 'wallet_not_installed',
        errorMessage: `Wallet Extension Error: ${walletType.toUpperCase()} browser extension is not installed or unreachable.`,
      },
    };
  }

  if (forceErrorType === 'user_rejected') {
    await new Promise((res) => setTimeout(res, 800));
    return {
      status: {
        state: 'error',
        errorType: 'user_rejected',
        errorMessage: 'User Rejected Error: Transaction signature request was declined in wallet modal.',
      },
    };
  }

  if (forceErrorType === 'insufficient_balance') {
    await new Promise((res) => setTimeout(res, 1000));
    return {
      status: {
        state: 'error',
        errorType: 'insufficient_balance',
        errorMessage: 'Insufficient Balance Error: Account requires testnet XLM to pay Soroban resource & transaction fees.',
      },
    };
  }

  if (forceErrorType === 'rpc_error') {
    await new Promise((res) => setTimeout(res, 1200));
    return {
      status: {
        state: 'error',
        errorType: 'rpc_error',
        errorMessage: 'RPC Network Error: Soroban RPC node timeout. Host node did not respond within 10000ms.',
      },
    };
  }

  // Normal Flow
  await new Promise((res) => setTimeout(res, 1200));
  const txHash = generateTxHash();
  await new Promise((res) => setTimeout(res, 1400));

  const truncatedVoter = `${voterPublicKey.substring(0, 3)}...${voterPublicKey.substring(voterPublicKey.length - 4)}`;

  const newEvent: VoteEvent = {
    id: `evt-${Date.now()}`,
    voter: truncatedVoter,
    candidateId,
    candidateName,
    timestamp: 'Just now',
    txHash,
    type: 'vote',
  };

  return {
    status: {
      state: 'success',
      txHash,
      message: 'Vote successfully recorded on BallotChain Soroban Smart Contract!',
    },
    updatedEvent: newEvent,
  };
}

// Register Candidate on Soroban Smart Contract
export async function registerCandidateOnContract(
  adminPublicKey: string,
  name: string,
  party: string,
  bio: string
): Promise<{ status: TxStatus; newCandidate?: Candidate; updatedEvent?: VoteEvent }> {
  await new Promise((res) => setTimeout(res, 1000));
  const txHash = generateTxHash();
  await new Promise((res) => setTimeout(res, 1200));

  const truncatedVoter = `${adminPublicKey.substring(0, 3)}...${adminPublicKey.substring(adminPublicKey.length - 4)}`;

  const newCandidate: Candidate = {
    id: Date.now(),
    name,
    party,
    bio,
    avatar: '🏅',
    votes: 0,
    percentage: 0,
  };

  const newEvent: VoteEvent = {
    id: `evt-${Date.now()}`,
    voter: truncatedVoter,
    candidateId: newCandidate.id,
    candidateName: name,
    timestamp: 'Just now',
    txHash,
    type: 'candidate_registered',
  };

  return {
    status: {
      state: 'success',
      txHash,
      message: `Candidate "${name}" successfully registered on BallotChain contract!`,
    },
    newCandidate,
    updatedEvent: newEvent,
  };
}
