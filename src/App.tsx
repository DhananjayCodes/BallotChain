import React, { useState } from 'react';
import { Header } from './components/Header';
import { PollCard } from './components/PollCard';
import { TransactionStatus } from './components/TransactionStatus';
import { ErrorShowcase } from './components/ErrorShowcase';
import { EventFeed } from './components/EventFeed';
import { ContractInfo } from './components/ContractInfo';
import { WalletModal } from './components/WalletModal';

import { PollData, PollEvent, TxStatus, WalletOption } from './types/poll';
import { SUPPORTED_WALLETS, getTestnetBalance, fundWithFriendbot } from './services/walletService';
import { INITIAL_POLL_DATA, INITIAL_EVENTS, submitVoteToContract } from './services/sorobanService';

export function App() {
  const [pollData, setPollData] = useState<PollData>(INITIAL_POLL_DATA);
  const [events, setEvents] = useState<PollEvent[]>(INITIAL_EVENTS);
  const [connectedWallet, setConnectedWallet] = useState<WalletOption | null>(SUPPORTED_WALLETS[0]); // Default connected to Freighter
  const [accountPublicKey, setAccountPublicKey] = useState<string | null>(
    'GBX3K7QW49ZLPV2M8NR9YTX6A1K0S5E8H3F2J9C4M7L1P8V'
  );
  const [balance, setBalance] = useState<string>('1000.00');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [userVotedOptionId, setUserVotedOptionId] = useState<number | null>(null);
  const [isFunding, setIsFunding] = useState<boolean>(false);

  const [txStatus, setTxStatus] = useState<TxStatus>({
    state: 'idle',
  });

  // Handle Wallet Selection via StellarWalletsKit
  const handleSelectWallet = async (wallet: WalletOption) => {
    setConnectedWallet(wallet);
    setIsWalletModalOpen(false);

    // Generate/Set a mock testnet public key for selected wallet
    const mockPubKey =
      wallet.type === 'freighter'
        ? 'GBX3K7QW49ZLPV2M8NR9YTX6A1K0S5E8H3F2J9C4M7L1P8V'
        : wallet.type === 'albedo'
        ? 'GCP9R3M1L7V4K2B8P0X9Y5Z1A3C5E7G9I1K3M5O7Q9S'
        : 'GDH4P9V1Z3X5C7V9B1N3M5L7K9J1H3F5D7S9A1Q3W';

    setAccountPublicKey(mockPubKey);

    // Fetch balance
    const bal = await getTestnetBalance(mockPubKey);
    setBalance(bal);
  };

  const handleDisconnectWallet = () => {
    setConnectedWallet(null);
    setAccountPublicKey(null);
    setBalance('0.00');
  };

  // Handle Friendbot Funding Trigger
  const handleFundFriendbot = async () => {
    if (!accountPublicKey) return;
    setIsFunding(true);
    const success = await fundWithFriendbot(accountPublicKey);
    setIsFunding(false);
    if (success) {
      setBalance('10000.00');
      setTxStatus({
        state: 'success',
        message: 'Account successfully funded with 10,000 Testnet XLM via Stellar Friendbot!',
      });
    } else {
      setBalance('1000.00 (Testnet)');
    }
  };

  // Handle Vote Submission to Soroban Smart Contract
  const handleVote = async (
    optionId: number,
    forceErrorType?: 'wallet_not_installed' | 'user_rejected' | 'insufficient_balance' | 'rpc_error'
  ) => {
    if (!accountPublicKey || !connectedWallet) {
      setIsWalletModalOpen(true);
      return;
    }

    // Step 1: Wallet Signing state
    setTxStatus({
      state: 'signing',
      message: `Awaiting signature authorization from ${connectedWallet.name}...`,
    });

    // Step 2: Submit to Soroban Contract
    setTimeout(() => {
      setTxStatus({
        state: 'submitting',
        message: 'Broadcasting signed transaction to Soroban Testnet RPC node...',
      });
    }, 1000);

    const result = await submitVoteToContract(
      accountPublicKey,
      optionId,
      connectedWallet.type,
      forceErrorType
    );

    setTxStatus(result.status);

    // On Success: Update state, add event, recalculate percentage
    if (result.status.state === 'success' && result.updatedEvent) {
      setHasVoted(true);
      setUserVotedOptionId(optionId);

      const updatedOptions = pollData.options.map((opt) => {
        if (opt.id === optionId) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });

      const newTotal = pollData.totalVotes + 1;

      const recalculatedOptions = updatedOptions.map((opt) => ({
        ...opt,
        percentage: Math.round((opt.votes / newTotal) * 100),
      }));

      setPollData({
        ...pollData,
        totalVotes: newTotal,
        options: recalculatedOptions,
      });

      setEvents([result.updatedEvent, ...events]);
    }
  };

  // Error Showcase Trigger Callback
  const handleTriggerError = (
    errorType: 'wallet_not_installed' | 'user_rejected' | 'insufficient_balance' | 'rpc_error'
  ) => {
    handleVote(0, errorType);
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
        isFunding={isFunding}
      />

      {/* Main Container */}
      <main className="app-container">
        {/* Transaction Status Banner */}
        <TransactionStatus
          status={txStatus}
          onClear={() => setTxStatus({ state: 'idle' })}
        />

        <div className="main-grid">
          {/* Main Voting Card */}
          <PollCard
            pollData={pollData}
            onVote={(optionId) => handleVote(optionId)}
            txState={txStatus.state}
            hasVoted={hasVoted}
            userVotedOptionId={userVotedOptionId}
            isConnected={!!accountPublicKey}
            onConnectWallet={() => setIsWalletModalOpen(true)}
          />

          {/* Error Handling Showcase Section */}
          <ErrorShowcase
            onTriggerError={handleTriggerError}
            onFundFriendbot={handleFundFriendbot}
            isFunding={isFunding}
          />

          {/* Event Feed & Contract Specs Grid */}
          <div className="secondary-grid">
            <EventFeed events={events} />
            <ContractInfo />
          </div>
        </div>
      </main>

      {/* Wallet Selection Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSelectWallet={handleSelectWallet}
        activeWalletId={connectedWallet?.id || null}
      />
    </div>
  );
}

export default App;
