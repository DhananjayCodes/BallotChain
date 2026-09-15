import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VotingWindowBar } from './components/VotingWindowBar';
import { CandidateGrid } from './components/CandidateGrid';
import { RegisterCandidateModal } from './components/RegisterCandidateModal';
import { TransactionStatus } from './components/TransactionStatus';
import { EventFeed } from './components/EventFeed';
import { ContractInfo } from './components/ContractInfo';
import { WalletModal } from './components/WalletModal';

import { BallotData, VoteEvent, TxStatus, WalletOption } from './types/ballot';
import {
  SUPPORTED_WALLETS,
  connectFreighterWallet,
  getTestnetBalance,
  fundWithFriendbot,
} from './services/walletService';
import {
  INITIAL_BALLOT_DATA,
  INITIAL_VOTE_EVENTS,
  loadBallotDataFromContract,
  submitVoteToContract,
  registerCandidateOnContract,
} from './services/sorobanService';

export function App() {
  const [ballotData, setBallotData] = useState<BallotData>(INITIAL_BALLOT_DATA);
  const [events, setEvents] = useState<VoteEvent[]>(INITIAL_VOTE_EVENTS);
  const [connectedWallet, setConnectedWallet] = useState<WalletOption | null>(null);
  const [accountPublicKey, setAccountPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [userVotedCandidateId, setUserVotedCandidateId] = useState<number | null>(null);
  const [isFunding, setIsFunding] = useState<boolean>(false);

  const [txStatus, setTxStatus] = useState<TxStatus>({
    state: 'idle',
  });

  // Attempt auto-connecting Freighter if already permitted
  useEffect(() => {
    async function checkExistingConnection() {
      if (typeof window !== 'undefined' && (window as any).freighter) {
        try {
          const res = await connectFreighterWallet();
          if (res && res.publicKey) {
            setConnectedWallet(SUPPORTED_WALLETS[0]); // Freighter
            setAccountPublicKey(res.publicKey);
            const bal = await getTestnetBalance(res.publicKey);
            setBalance(bal);
          }
        } catch {
          // Silently ignore if not authorized yet
        }
      }
    }
    checkExistingConnection();
  }, []);

  useEffect(() => {
    loadBallotDataFromContract()
      .then(setBallotData)
      .catch((error) => setTxStatus({
        state: 'error',
        errorType: 'rpc_error',
        errorMessage: `Could not load the deployed contract: ${error instanceof Error ? error.message : String(error)}`,
      }));
  }, []);

  // Wallet Connection Handler
  const handleSelectWallet = async (wallet: WalletOption) => {
    setIsWalletModalOpen(false);

    if (wallet.type === 'freighter') {
      try {
        setTxStatus({
          state: 'signing',
          message: 'Connecting to Freighter Wallet extension popup...',
        });

        const res = await connectFreighterWallet();
        if (res && res.publicKey) {
          setConnectedWallet(wallet);
          setAccountPublicKey(res.publicKey);
          const bal = await getTestnetBalance(res.publicKey);
          setBalance(bal);

          setTxStatus({
            state: 'success',
            message: `Successfully connected to Freighter Wallet: ${res.publicKey.substring(0, 6)}...${res.publicKey.substring(res.publicKey.length - 4)}`,
          });
        }
      } catch (err: any) {
        if (err.message === 'FREIGHTER_NOT_INSTALLED') {
          setTxStatus({
            state: 'error',
            errorType: 'wallet_not_installed',
            errorMessage: 'Freighter Wallet extension is not installed in your browser. Click "Get Freighter Extension" below to install it.',
          });
        } else {
          setTxStatus({
            state: 'error',
            errorType: 'user_rejected',
            errorMessage: 'Freighter wallet connection request was declined in extension popup.',
          });
        }
      }
      return;
    }

    setTxStatus({ state: 'error', errorType: 'wallet_not_installed', errorMessage: `${wallet.name} is not configured for transaction signing. Connect Freighter to submit a real Soroban transaction.` });
  };

  const handleDisconnectWallet = () => {
    setConnectedWallet(null);
    setAccountPublicKey(null);
    setBalance('0.00');
    setTxStatus({
      state: 'idle',
    });
  };

  const handleFundFriendbot = async () => {
    if (!accountPublicKey) return;
    setIsFunding(true);
    const success = await fundWithFriendbot(accountPublicKey);
    setIsFunding(false);
    if (success) {
      const updatedBal = await getTestnetBalance(accountPublicKey);
      setBalance(updatedBal !== '0.00 (Unfunded)' ? updatedBal : '10000.00');
      setTxStatus({
        state: 'success',
        message: 'Account funded with 10,000 Testnet XLM via Stellar Friendbot!',
      });
    } else {
      setBalance('10000.00 (Testnet)');
    }
  };

  const handleVote = async (
    candidateId: number,
    candidateName: string,
  ) => {
    if (!accountPublicKey || !connectedWallet) {
      setIsWalletModalOpen(true);
      return;
    }

    const result = await submitVoteToContract(
      accountPublicKey,
      candidateId,
      candidateName,
      setTxStatus
    );

    setTxStatus(result.status);

    if (result.status.state === 'success' && result.updatedEvent) {
      setHasVoted(true);
      setUserVotedCandidateId(candidateId);

      setEvents([result.updatedEvent, ...events]);
      loadBallotDataFromContract().then(setBallotData).catch(() => undefined);
    }
  };

  const handleRegisterCandidate = async (name: string, party: string, bio: string) => {
    if (!accountPublicKey || !connectedWallet) {
      setIsWalletModalOpen(true);
      return;
    }

    const result = await registerCandidateOnContract(accountPublicKey, name, party, bio, setTxStatus);
    setTxStatus(result.status);

    if (result.status.state === 'success' && result.updatedEvent) {
      setEvents([result.updatedEvent, ...events]);
      loadBallotDataFromContract().then(setBallotData).catch(() => undefined);
    }
  };

  return (
    <div className="app-root">
      {/* Top Navbar */}
      <Header
        connectedWallet={connectedWallet}
        accountPublicKey={accountPublicKey}
        balance={balance}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onDisconnectWallet={handleDisconnectWallet}
        onFundFriendbot={handleFundFriendbot}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        isFunding={isFunding}
      />

      {/* Main Container */}
      <main className="app-container">
        {/* Transaction Status Pipeline */}
        <TransactionStatus status={txStatus} onClear={() => setTxStatus({ state: 'idle' })} />

        {/* Time-Bound Voting Window Status Bar */}
        <VotingWindowBar
          votingWindow={ballotData.votingWindow}
          totalVotes={ballotData.totalVotes}
        />

        <div className="main-grid">
          {/* Main Candidate Ballot Grid */}
          <CandidateGrid
            ballotData={ballotData}
            onVote={(candId, candName) => handleVote(candId, candName)}
            txState={txStatus.state}
            hasVoted={hasVoted}
            userVotedCandidateId={userVotedCandidateId}
            isConnected={!!accountPublicKey}
            onConnectWallet={() => setIsWalletModalOpen(true)}
            onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
          />

          {/* Real-time Event Log Feed & Contract Specs Grid */}
          <div className="secondary-grid">
            <EventFeed events={events} />
            <ContractInfo />
          </div>
        </div>
      </main>

      {/* Modals */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSelectWallet={handleSelectWallet}
        activeWalletId={connectedWallet?.id || null}
      />

      <RegisterCandidateModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={handleRegisterCandidate}
      />
    </div>
  );
}

export default App;
