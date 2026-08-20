import React from 'react';
import { Wallet, Vote, RefreshCw, CheckCircle2, ChevronDown, PlusCircle } from 'lucide-react';
import { WalletOption } from '../types/ballot';

interface HeaderProps {
  connectedWallet: WalletOption | null;
  accountPublicKey: string | null;
  balance: string;
  onOpenWalletModal: () => void;
  onDisconnectWallet: () => void;
  onFundFriendbot: () => void;
  onOpenRegisterModal: () => void;
  isFunding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  connectedWallet,
  accountPublicKey,
  balance,
  onOpenWalletModal,
  onDisconnectWallet,
  onFundFriendbot,
  onOpenRegisterModal,
  isFunding,
}) => {
  const truncatedAddress = accountPublicKey
    ? `${accountPublicKey.substring(0, 4)}...${accountPublicKey.substring(accountPublicKey.length - 4)}`
    : '';

  return (
    <header className="header-bar">
      <div className="header-container">
        {/* Brand Header */}
        <div className="brand-logo">
          <div className="logo-icon-wrap">
            <Vote className="logo-icon text-cyan" size={24} />
          </div>
          <div>
            <div className="brand-title-wrap">
              <h1 className="brand-title">BallotChain</h1>
              <span className="badge badge-testnet">TESTNET</span>
              <span className="badge badge-belt">🟡 Level 2 Yellow Belt</span>
            </div>
            <p className="brand-subtitle">One-Vote-Per-Wallet Soroban Voting Protocol</p>
          </div>
        </div>

        {/* Right Section: Actions & Wallet Status */}
        <div className="header-actions">
          <button onClick={onOpenRegisterModal} className="btn-register-candidate">
            <PlusCircle size={16} />
            <span>Register Candidate</span>
          </button>

          {accountPublicKey && connectedWallet ? (
            <div className="wallet-connected-pill">
              <button 
                onClick={onFundFriendbot} 
                disabled={isFunding}
                className="btn-friendbot"
                title="Get 10,000 Free Testnet XLM via Friendbot"
              >
                {isFunding ? (
                  <RefreshCw className="spin-icon" size={14} />
                ) : (
                  <span className="xlm-icon">🪂</span>
                )}
                <span>{balance} XLM</span>
              </button>

              <div className="wallet-info-dropdown">
                <span className="wallet-type-icon">{connectedWallet.icon}</span>
                <span className="wallet-address">{truncatedAddress}</span>
                <button onClick={onOpenWalletModal} className="btn-switch-wallet" title="Switch Wallet">
                  <ChevronDown size={14} />
                </button>
              </div>

              <button onClick={onDisconnectWallet} className="btn-disconnect" title="Disconnect Wallet">
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={onOpenWalletModal} className="btn-connect-wallet glow-effect">
              <Wallet size={18} />
              <span>Connect Wallet (StellarWalletsKit)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
