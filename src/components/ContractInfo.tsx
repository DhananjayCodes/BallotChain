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
            <p className="info-subtitle">Deployed & Verified on Stellar Testnet</p>
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
          <span className="detail-label">Deployed Contract ID (Soroban Testnet)</span>
          <div className="copy-code-row">
            <code className="contract-code">{STELLAR_CONFIG.contractId}</code>
            <button onClick={handleCopy} className="btn-copy" title="Copy Contract ID">
              {copied ? <Check size={14} className="text-cyan" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* WASM Hash */}
        <div className="contract-detail-box">
          <div className="detail-meta-label">
            <Cpu size={14} className="text-muted" />
            <span>WASM Hash</span>
          </div>
          <code className="code-sm">{STELLAR_CONFIG.wasmHash.substring(0, 20)}...</code>
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
