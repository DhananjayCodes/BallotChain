import React from 'react';
import { TxStatus } from '../types/ballot';
import { STELLAR_CONFIG } from '../services/sorobanService';
import { CheckCircle2, AlertTriangle, ExternalLink, Loader2, ArrowRight } from 'lucide-react';

interface TransactionStatusProps {
  status: TxStatus;
  onClear: () => void;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({ status, onClear }) => {
  if (status.state === 'idle') return null;

  const isSuccess = status.state === 'success';
  const isError = status.state === 'error';
  const isSigning = status.state === 'signing';
  const isSubmitting = status.state === 'submitting';

  return (
    <div className={`tx-status-card ${isSuccess ? 'tx-success' : isError ? 'tx-error' : 'tx-pending'}`}>
      <div className="tx-status-header">
        <div className="tx-title-group">
          {isSuccess && <CheckCircle2 className="tx-icon text-cyan" size={24} />}
          {isError && <AlertTriangle className="tx-icon text-rose" size={24} />}
          {(isSigning || isSubmitting) && <Loader2 className="tx-icon spin-icon text-amber" size={24} />}

          <div>
            <h3 className="tx-status-title">
              {isSuccess && 'Transaction Confirmed on Soroban Testnet! 🎉'}
              {isError && 'Transaction Execution Error'}
              {isSigning && 'Awaiting Wallet Signature...'}
              {isSubmitting && 'Broadcasting to Stellar Testnet RPC...'}
            </h3>
            <p className="tx-status-subtitle">
              {status.message || status.errorMessage || 'Processing Soroban smart contract invocation.'}
            </p>
          </div>
        </div>

        {(isSuccess || isError) && (
          <button onClick={onClear} className="btn-dismiss">
            Dismiss
          </button>
        )}
      </div>

      {/* Pipeline Steps */}
      <div className="tx-pipeline">
        <div className={`pipeline-step ${isSigning || isSubmitting || isSuccess ? 'complete' : ''}`}>
          <span className="step-num">1</span>
          <span className="step-label">Wallet Sign</span>
        </div>
        <ArrowRight size={14} className="pipeline-arrow" />
        <div className={`pipeline-step ${isSubmitting || isSuccess ? 'complete' : ''}`}>
          <span className="step-num">2</span>
          <span className="step-label">Testnet Consensus</span>
        </div>
        <ArrowRight size={14} className="pipeline-arrow" />
        <div className={`pipeline-step ${isSuccess ? 'complete' : isError ? 'error' : ''}`}>
          <span className="step-num">3</span>
          <span className="step-label">Final State Sync</span>
        </div>
      </div>

      {/* Verifiable Testnet Tx Hash Link */}
      {status.txHash && (
        <div className="tx-hash-banner">
          <span className="tx-hash-label">Testnet Transaction Hash:</span>
          <a
            href={`${STELLAR_CONFIG.explorerUrl}/tx/${status.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-hash-link"
          >
            <code>{status.txHash}</code>
            <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
};
