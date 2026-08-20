import { WalletOption } from '../types/poll';

// Supported Stellar Wallets list
export const SUPPORTED_WALLETS: WalletOption[] = [
  {
    id: 'freighter',
    name: 'Freighter Wallet',
    icon: '🚀',
    installed: typeof window !== 'undefined' && 'freighter' in window,
    type: 'freighter',
    description: 'Official browser extension wallet for Stellar & Soroban.',
  },
  {
    id: 'albedo',
    name: 'Albedo Link',
    icon: '🌌',
    installed: true, // Albedo uses web popup flow
    type: 'albedo',
    description: 'Web-based sign-in and key manager for Stellar applications.',
  },
  {
    id: 'xbull',
    name: 'xBull Wallet',
    icon: '🐂',
    installed: typeof window !== 'undefined' && 'xBullWallet' in window,
    type: 'xbull',
    description: 'Feature-packed non-custodial browser wallet.',
  },
  {
    id: 'rabet',
    name: 'Rabet Wallet',
    icon: '🐰',
    installed: typeof window !== 'undefined' && 'rabet' in window,
    type: 'rabet',
    description: 'Simple and secure Stellar extension wallet.',
  },
  {
    id: 'lobstr',
    name: 'LOBSTR Wallet',
    icon: '🦞',
    installed: true,
    type: 'lobstr',
    description: 'Leading mobile and web wallet for Stellar assets.',
  },
  {
    id: 'hana',
    name: 'Hana Wallet',
    icon: '🌸',
    installed: typeof window !== 'undefined' && 'hana' in window,
    type: 'hana',
    description: 'Multi-chain Web3 wallet with Stellar Soroban support.',
  },
  {
    id: 'demo',
    name: 'Stellar Testnet Demo Wallet',
    icon: '⚡',
    installed: true,
    type: 'demo',
    description: 'Instant testnet wallet pre-funded with 10,000 test XLM.',
  },
];

// Helper to check Freighter installation safely
export async function isFreighterAvailable(): Promise<boolean> {
  try {
    if (typeof window !== 'undefined' && (window as any).freighter) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Fetch XLM balance on Stellar Testnet
export async function getTestnetBalance(publicKey: string): Promise<string> {
  try {
    const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${publicKey}`);
    if (!res.ok) {
      if (res.status === 404) return '0.00 (Unfunded)';
      return '0.00';
    }
    const data = await res.json();
    const nativeAsset = data.balances.find((b: any) => b.asset_type === 'native');
    return nativeAsset ? parseFloat(nativeAsset.balance).toFixed(2) : '0.00';
  } catch (err) {
    console.warn('Failed to fetch testnet balance:', err);
    return '100.00 (Testnet)';
  }
}

// Request testnet XLM funding via Stellar Friendbot
export async function fundWithFriendbot(publicKey: string): Promise<boolean> {
  try {
    const res = await fetch(`https://friendbot.stellar.org/?addr=${publicKey}`);
    return res.ok;
  } catch {
    return false;
  }
}
