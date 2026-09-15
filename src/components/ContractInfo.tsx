import React from 'react';
import { STELLAR_CONFIG } from '../services/sorobanService';
import { FileCode2, ExternalLink, Copy, Check, Server, Layers, Cpu } from 'lucide-react';

export const ContractInfo: React.FC = () => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(STELLAR_CONFIG.contractId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="contract-info-card glass-panel">
      <div className="info-header">
        <div className="info-title-wrap">
          <FileCode2 className="text-purple" size={22} />
          <div>
            <h3 className="info-title">Soroban Smart Contract Specs</h3>
            <p className="info-subtitle">
              {STELLAR_CONFIG.isSimulationMode ? 'Local contract source + simulated frontend flow' : 'Deployed on Stellar Testnet'}
            </p>
          </div>
        </div>
        <a
          href={`${STELLAR_CONFIG.explorerUrl}/contract/${STELLAR_CONFIG.contractId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-explorer-link"
        >
          Contract Explorer <ExternalLink size={13} />
        </a>
      </div>

      <div className="contract-details-grid">
        {/* Contract Address */}
        <div className="contract-detail-box full-width">
          <span className="detail-label">
            {STELLAR_CONFIG.isSimulationMode ? 'Contract source path' : 'Deployed Contract ID (Soroban Testnet)'}
          </span>
          <div className="copy-code-row">
            <code className="contract-code">
              {STELLAR_CONFIG.isSimulationMode ? 'contracts/live_poll/src/lib.rs' : STELLAR_CONFIG.contractId}
            </code>
            {!STELLAR_CONFIG.isSimulationMode && (
              <button onClick={handleCopy} className="btn-copy" title="Copy Contract ID">
                {copied ? <Check size={14} className="text-cyan" /> : <Copy size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* Contract deployment */}
        <div className="contract-detail-box">
          <div className="detail-meta-label">
            <Cpu size={14} className="text-muted" />
            <span>Contract state</span>
          </div>
          <code className="code-sm">
            {STELLAR_CONFIG.isSimulationMode ? 'Local Rust contract + simulated browser actions' : 'Live RPC reads enabled'}
          </code>
        </div>

        {/* Network & RPC */}
        <div className="contract-detail-box">
          <div className="detail-meta-label">
            <Server size={14} className="text-muted" />
            <span>Network RPC</span>
          </div>
          <span className="text-sm">Stellar Soroban Testnet (RPC 20.0)</span>
        </div>
      </div>
    </div>
  );
};
