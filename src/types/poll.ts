export interface PollOption {
  id: number;
  label: string;
  votes: number;
  percentage: number;
}

export interface PollData {
  title: string;
  totalVotes: number;
  options: PollOption[];
  contractId: string;
  wasmHash: string;
  network: string;
}

export interface WalletOption {
  id: string;
  name: string;
  icon: string;
  installed: boolean;
  type: 'freighter' | 'albedo' | 'xbull' | 'rabet' | 'lobstr' | 'hana' | 'demo';
  description: string;
}

export type TxStatusState = 'idle' | 'signing' | 'submitting' | 'success' | 'error';

export interface TxStatus {
  state: TxStatusState;
  message?: string;
  txHash?: string;
  errorType?: 'wallet_not_installed' | 'user_rejected' | 'insufficient_balance' | 'rpc_error';
  errorMessage?: string;
}

export interface PollEvent {
  id: string;
  voter: string;
  optionId: number;
  optionLabel: string;
  timestamp: string;
  txHash: string;
}
