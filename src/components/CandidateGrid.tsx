import React, { useState } from 'react';
import { Candidate, BallotData, TxStatusState } from '../types/ballot';
import { Send, CheckCircle, BarChart3, Lock, PlusCircle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CandidateGridProps {
  ballotData: BallotData;
  onVote: (candidateId: number, candidateName: string) => void;
  txState: TxStatusState;
  hasVoted: boolean;
  userVotedCandidateId: number | null;
  isConnected: boolean;
  onConnectWallet: () => void;
  onOpenRegisterModal: () => void;
}

export const CandidateGrid: React.FC<CandidateGridProps> = ({
  ballotData,
  onVote,
  txState,
  hasVoted,
  userVotedCandidateId,
  isConnected,
  onConnectWallet,
  onOpenRegisterModal,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(0);

  const handleVoteSubmit = () => {
    if (selectedCandidateId === null) return;
    const cand = ballotData.candidates.find((c) => c.id === selectedCandidateId);
    if (cand) {
      onVote(cand.id, cand.name);
    }
  };

  const isSubmitting = txState === 'signing' || txState === 'submitting';

  return (
    <div className="candidate-grid-card glass-panel">
      {/* Card Header */}
      <div className="ballot-title-row">
        <div>
          <h2 className="ballot-title">{ballotData.title}</h2>
          <p className="ballot-desc">{ballotData.description}</p>
        </div>
        <button onClick={onOpenRegisterModal} className="btn-add-cand-header">
          <PlusCircle size={15} /> Add Candidate
        </button>
      </div>

      {/* Candidates List */}
      <div className="candidates-list">
        {ballotData.candidates.map((candidate) => {
          const isSelected = selectedCandidateId === candidate.id;
          const isUserVotedThis = userVotedCandidateId === candidate.id;

          return (
            <div
              key={candidate.id}
              onClick={() => {
                if (!hasVoted && !isSubmitting) {
                  setSelectedCandidateId(candidate.id);
                }
              }}
              className={`candidate-card ${isSelected ? 'selected' : ''} ${
                isUserVotedThis ? 'user-choice' : ''
              } ${hasVoted ? 'voted-disabled' : ''}`}
            >
              {/* Candidate Info Top */}
              <div className="candidate-header">
                <div className="candidate-identity">
                  {!hasVoted && (
                    <input
                      type="radio"
                      name="ballot-candidate"
                      checked={isSelected}
                      onChange={() => setSelectedCandidateId(candidate.id)}
                      disabled={isSubmitting || hasVoted}
                      className="radio-custom"
                    />
                  )}
                  <span className="candidate-avatar">{candidate.avatar}</span>
                  <div>
                    <div className="candidate-name-row">
                      <h3 className="candidate-name">{candidate.name}</h3>
                      {isUserVotedThis && (
                        <span className="voted-tag">
                          <CheckCircle size={14} /> Your Vote
                        </span>
                      )}
                    </div>
                    <span className="candidate-party">{candidate.party}</span>
                  </div>
                </div>

                <div className="candidate-stats">
                  <span className="candidate-votes">{candidate.votes} votes</span>
                  <span className="candidate-percent">{candidate.percentage}%</span>
                </div>
              </div>

              {/* Bio / Proposal Statement */}
              <p className="candidate-bio">{candidate.bio}</p>

              {/* Progress Bar */}
              <div className="progress-track">
                <div
                  className={`progress-fill ${isSelected ? 'progress-fill-active' : ''} ${
                    isUserVotedThis ? 'progress-fill-voted' : ''
                  }`}
                  style={{ width: `${candidate.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="ballot-actions">
        {!isConnected ? (
          <button onClick={onConnectWallet} className="btn-vote-submit glow-cyan">
            <Lock size={18} />
            Connect Wallet to Vote (StellarWalletsKit)
          </button>
        ) : hasVoted ? (
          <div className="voted-success-banner">
            <CheckCircle size={20} className="text-cyan" />
            <span>
              Your vote is recorded on the BallotChain Soroban Smart Contract! 1-Vote-Per-Wallet enforced.
            </span>
          </div>
        ) : (
          <button
            onClick={handleVoteSubmit}
            disabled={selectedCandidateId === null || isSubmitting}
            className="btn-vote-submit glow-purple"
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border" />
                Signing & Broadcasting to Soroban Contract...
              </>
            ) : (
              <>
                <Send size={18} />
                Cast Vote for Candidate on Soroban Contract
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
