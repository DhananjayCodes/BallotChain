export interface Candidate {
  id: number;
  name: string;
  party: string;
  bio: string;
  avatar: string;
  votes: number;
  percentage: number;
}

export interface VotingWindow {
  startTime: string;
  endTime: string;
  endTimestampMs: number;
  isOpen: boolean;
  timeRemainingFormatted: string;
}

export interface BallotData {
  title: string;
  description: string;
  totalVotes: number;
  candidates: Candidate[];
  votingWindow: VotingWindow;
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

export interface VoteEvent {
  id: string;
  voter: string;
  candidateId: number;
  candidateName: string;
  timestamp: string;
  txHash: string;
  type: 'vote' | 'candidate_registered';
}
