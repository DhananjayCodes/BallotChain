import React, { useState } from 'react';
import { X, PlusCircle, Sparkles } from 'lucide-react';

interface RegisterCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (name: string, party: string, bio: string) => void;
}

export const RegisterCandidateModal: React.FC<RegisterCandidateModalProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [bio, setBio] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !party.trim() || !bio.trim()) return;
    onRegister(name.trim(), party.trim(), bio.trim());
    setName('');
    setParty('');
    setBio('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Register New Candidate</h2>
            <p className="modal-subtitle">Propose a candidate to the BallotChain Soroban Smart Contract</p>
          </div>
          <button onClick={onClose} className="btn-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label className="form-label">Candidate / Project Name</label>
            <input
              type="text"
              placeholder="e.g. Soroban DAO Treasury"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Party / Organization Category</label>
            <input
              type="text"
              placeholder="e.g. Governance & Treasury Management"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Proposal Manifesto / Bio</label>
            <textarea
              placeholder="Describe the candidate proposal, key features, and vision..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              required
              className="form-textarea"
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit-register">
              <Sparkles size={16} /> Register Candidate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
