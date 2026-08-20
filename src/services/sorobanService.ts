import { PollData, PollEvent, TxStatus } from '../types/poll';

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

// Initial Poll State
export const INITIAL_POLL_DATA: PollData = {
  title: 'Stellar Journey to Mastery: What is the most game-changing feature of Soroban?',
  totalVotes: 148,
  options: [
    { id: 0, label: 'Soroban Rust Smart Contracts & Sub-second Finality', votes: 64, percentage: 43 },
    { id: 1, label: 'StellarWalletsKit Multi-Wallet Compatibility', votes: 42, percentage: 28 },
    { id: 2, label: 'Decentralized Orderbook DEX & Built-in AMMs', votes: 26, percentage: 18 },
    { id: 3, label: 'Zero-Gas Fee Abstraction & Passkey Authentication', votes: 16, percentage: 11 },
  ],
  contractId: STELLAR_CONFIG.contractId,
  wasmHash: STELLAR_CONFIG.wasmHash,
  network: STELLAR_CONFIG.network,
};

// Mock initial live events
export const INITIAL_EVENTS: PollEvent[] = [
  {
    id: 'evt-1',
    voter: 'GBX...7K9A',
    optionId: 0,
    optionLabel: 'Soroban Rust Smart Contracts & Sub-second Finality',
    timestamp: '2 mins ago',
    txHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'evt-2',
    voter: 'GCP...3M1L',
    optionId: 1,
    optionLabel: 'StellarWalletsKit Multi-Wallet Compatibility',
    timestamp: '5 mins ago',
    txHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  },
  {
    id: 'evt-3',
    voter: 'GDH...9P4V',
    optionId: 0,
    optionLabel: 'Soroban Rust Smart Contracts & Sub-second Finality',
    timestamp: '12 mins ago',
    txHash: '47bce5c74f589f4867dbd57e9ca9f808817b006098fc16ce03913706c0744e30',
  },
];

// Utility to generate random valid-looking 64-char transaction hash for Stellar Testnet
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
  optionId: number,
  walletType: string,
  forceErrorType?: 'wallet_not_installed' | 'user_rejected' | 'insufficient_balance' | 'rpc_error'
): Promise<{ status: TxStatus; updatedEvent?: PollEvent }> {
  
  // Handled Error Showcase Triggers
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

  // Normal Vote Execution Flow
  // Phase 1: Signing
  await new Promise((res) => setTimeout(res, 1200));

  // Phase 2: Submitting to Stellar Testnet
  const txHash = generateTxHash();

  await new Promise((res) => setTimeout(res, 1500));

  const truncatedVoter = `${voterPublicKey.substring(0, 3)}...${voterPublicKey.substring(voterPublicKey.length - 4)}`;

  const newEvent: PollEvent = {
    id: `evt-${Date.now()}`,
    voter: truncatedVoter,
    optionId,
    optionLabel: INITIAL_POLL_DATA.options[optionId]?.label || 'Selected Option',
    timestamp: 'Just now',
    txHash,
  };

  return {
    status: {
      state: 'success',
      txHash,
      message: 'Vote successfully recorded on Soroban Smart Contract!',
    },
    updatedEvent: newEvent,
  };
}
