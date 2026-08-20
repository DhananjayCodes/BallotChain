import React from 'react';
import { X, Check, ExternalLink, ShieldCheck, Download } from 'lucide-react';
import { WalletOption } from '../types/ballot';
import { SUPPORTED_WALLETS } from '../services/walletService';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (wallet: WalletOption) => void;
  activeWalletId: string | null;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onSelectWallet,
  activeWalletId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Select Stellar Wallet</h2>
            <p className="modal-subtitle">
              Powered by <strong>StellarWalletsKit</strong> • Connect to Stellar Testnet
            </p>
          </div>
          <button onClick={onClose} className="btn-close">
            <X size={20} />
          </button>
        </div>

        {/* Wallets List */}
        <div className="wallets-grid">
          {SUPPORTED_WALLETS.map((wallet) => {
            const isActive = activeWalletId === wallet.id;
            return (
              <div
                key={wallet.id}
                onClick={() => onSelectWallet(wallet)}
                className={`wallet-card ${isActive ? 'active' : ''}`}
              >
                <div className="wallet-card-left">
                  <div className="wallet-icon-box">{wallet.icon}</div>
                  <div>
                    <div className="wallet-name-wrap">
                      <span className="wallet-name">{wallet.name}</span>
                      {isActive && <span className="tag-connected">Connected</span>}
                    </div>
                    <p className="wallet-desc">{wallet.description}</p>
                  </div>
                </div>

                <div className="wallet-card-right">
                  {wallet.installed ? (
                    <span className="status-installed" title="Wallet Available">
                      <Check size={16} /> Ready
                    </span>
                  ) : (
                    <span className="status-missing" title="Extension Not Detected">
                      <Download size={14} /> Install
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="modal-footer-note">
            <ShieldCheck size={16} className="text-cyan" />
            <span>StellarWalletsKit standard security wrapper • Testnet environment</span>
          </div>
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="link-install-freighter"
          >
            Get Freighter Extension <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
};
