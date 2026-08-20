import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VotingWindowBar } from './components/VotingWindowBar';
import { CandidateGrid } from './components/CandidateGrid';
import { RegisterCandidateModal } from './components/RegisterCandidateModal';
import { TransactionStatus } from './components/TransactionStatus';
import { ErrorShowcase } from './components/ErrorShowcase';
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

    // For Demo or Web Wallets (Albedo, xBull, Demo)
    setConnectedWallet(wallet);
    const mockPubKey =
      wallet.type === 'albedo'
        ? 'GCP9R3M1L7V4K2B8P0X9Y5Z1A3C5E7G9I1K3M5O7Q9S'
        : 'GDH4P9V1Z3X5C7V9B1N3M5L7K9J1H3F5D7S9A1Q3W';

    setAccountPublicKey(mockPubKey);
    const bal = await getTestnetBalance(mockPubKey);
    setBalance(bal === '0.00 (Unfunded)' ? '10000.00' : bal);

    setTxStatus({
      state: 'success',
      message: `Connected to ${wallet.name}: ${mockPubKey.substring(0, 6)}...${mockPubKey.substring(mockPubKey.length - 4)}`,
    });
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
    forceErrorType?: 'wallet_not_installed' | 'user_rejected' | 'insufficient_balance' | 'rpc_error'
  ) => {
    if (!accountPublicKey || !connectedWallet) {
      setIsWalletModalOpen(true);
      return;
    }

    setTxStatus({
      state: 'signing',
      message: `Awaiting signature authorization from ${connectedWallet.name}...`,
    });

    setTimeout(() => {
      setTxStatus({
        state: 'submitting',
        message: 'Broadcasting signed ballot transaction to Soroban Testnet RPC node...',
      });
    }, 1000);

    const result = await submitVoteToContract(
      accountPublicKey,
      candidateId,
      connectedWallet.type,
      candidateName,
      forceErrorType
    );

    setTxStatus(result.status);

    if (result.status.state === 'success' && result.updatedEvent) {
      setHasVoted(true);
      setUserVotedCandidateId(candidateId);

      const updatedCandidates = ballotData.candidates.map((cand) => {
        if (cand.id === candidateId) {
          return { ...cand, votes: cand.votes + 1 };
        }
        return cand;
      });

      const newTotal = ballotData.totalVotes + 1;

      const recalculatedCandidates = updatedCandidates.map((cand) => ({
        ...cand,
        percentage: Math.round((cand.votes / newTotal) * 100),
      }));

      setBallotData({
        ...ballotData,
        totalVotes: newTotal,
        candidates: recalculatedCandidates,
      });

      setEvents([result.updatedEvent, ...events]);
    }
  };

  const handleRegisterCandidate = async (name: string, party: string, bio: string) => {
    if (!accountPublicKey || !connectedWallet) {
      setIsWalletModalOpen(true);
      return;
    }

    setTxStatus({
      state: 'signing',
      message: `Awaiting candidate proposal signature authorization from ${connectedWallet.name}...`,
    });

    const result = await registerCandidateOnContract(accountPublicKey, name, party, bio);
    setTxStatus(result.status);

    if (result.status.state === 'success' && result.newCandidate && result.updatedEvent) {
      setBallotData({
        ...ballotData,
        candidates: [...ballotData.candidates, result.newCandidate],
      });
      setEvents([result.updatedEvent, ...events]);
    }
  };

  const handleTriggerError = (
    errorType: 'wallet_not_installed' | 'user_rejected' | 'insufficient_balance' | 'rpc_error'
  ) => {
    handleVote(0, 'Soroban Core Protocol', errorType);
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

          {/* Level 2 Error Handling Showcase Section */}
          <ErrorShowcase
            onTriggerError={handleTriggerError}
            onFundFriendbot={handleFundFriendbot}
            isFunding={isFunding}
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
