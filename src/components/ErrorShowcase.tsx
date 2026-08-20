import React from 'react';
import { AlertCircle, Wallet, XCircle, Coins, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface ErrorShowcaseProps {
  onTriggerError: (errorType: 'wallet_not_installed' | 'user_rejected' | 'insufficient_balance' | 'rpc_error') => void;
  onFundFriendbot: () => void;
  isFunding: boolean;
}

export const ErrorShowcase: React.FC<ErrorShowcaseProps> = ({
  onTriggerError,
  onFundFriendbot,
  isFunding,
}) => {
  return (
    <div className="error-showcase-card glass-panel">
      <div className="showcase-header">
        <div className="showcase-title-wrap">
          <ShieldAlert className="text-amber" size={22} />
          <div>
            <h3 className="showcase-title">Level 2 Requirement: Error Handling Showcase</h3>
            <p className="showcase-subtitle">
              Demonstrates 3 required explicit Stellar error handlers with active recovery flows.
            </p>
          </div>
        </div>
        <span className="badge badge-required">3 Error Types Handled</span>
      </div>

      <div className="error-cards-grid">
        {/* Error Type 1: Wallet Not Found */}
        <div className="error-demo-box border-purple">
          <div className="error-box-head">
            <Wallet className="text-purple" size={20} />
            <span className="error-type-tag">Error Type 1</span>
          </div>
          <h4 className="error-box-title">Wallet Extension Missing</h4>
          <p className="error-box-desc">
            Triggers when browser extension (e.g. Freighter) is not detected or inactive.
          </p>
          <div className="error-box-actions">
            <button
              onClick={() => onTriggerError('wallet_not_installed')}
              className="btn-demo-trigger btn-trigger-purple"
            >
              Simulate Missing Wallet
            </button>
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-solution"
            >
              Resolution: Install Extension
            </a>
          </div>
        </div>

        {/* Error Type 2: User Rejected Transaction */}
        <div className="error-demo-box border-rose">
          <div className="error-box-head">
            <XCircle className="text-rose" size={20} />
            <span className="error-type-tag">Error Type 2</span>
          </div>
          <h4 className="error-box-title">User Signature Rejected</h4>
          <p className="error-box-desc">
            Triggers when user declines or cancels transaction signing in wallet popup.
          </p>
          <div className="error-box-actions">
            <button
              onClick={() => onTriggerError('user_rejected')}
              className="btn-demo-trigger btn-trigger-rose"
            >
              Simulate Rejected Tx
            </button>
            <span className="text-solution">Resolution: Clear state & retry</span>
          </div>
        </div>

        {/* Error Type 3: Insufficient XLM Balance */}
        <div className="error-demo-box border-cyan">
          <div className="error-box-head">
            <Coins className="text-cyan" size={20} />
            <span className="error-type-tag">Error Type 3</span>
          </div>
          <h4 className="error-box-title">Insufficient XLM Balance</h4>
          <p className="error-box-desc">
            Triggers when testnet account lacks XLM balance for Soroban contract invocation fee.
          </p>
          <div className="error-box-actions">
            <button
              onClick={() => onTriggerError('insufficient_balance')}
              className="btn-demo-trigger btn-trigger-cyan"
            >
              Simulate Zero Balance
            </button>
            <button onClick={onFundFriendbot} disabled={isFunding} className="btn-friendbot-inline">
              {isFunding ? <RefreshCw className="spin-icon" size={13} /> : '🪂'}
              <span>Resolution: Fund via Friendbot</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
