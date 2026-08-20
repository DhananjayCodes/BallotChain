import React, { useState } from 'react';
import { PollData, TxStatusState } from '../types/poll';
import { Vote, CheckCircle, BarChart3, Lock, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PollCardProps {
  pollData: PollData;
  onVote: (optionId: number) => void;
  txState: TxStatusState;
  hasVoted: boolean;
  userVotedOptionId: number | null;
  isConnected: boolean;
  onConnectWallet: () => void;
}

export const PollCard: React.FC<PollCardProps> = ({
  pollData,
  onVote,
  txState,
  hasVoted,
  userVotedOptionId,
  isConnected,
  onConnectWallet,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(0);

  const handleVoteSubmit = () => {
    if (selectedOptionId === null) return;
    onVote(selectedOptionId);
  };

  const isSubmitting = txState === 'signing' || txState === 'submitting';

  return (
    <div className="poll-card glass-panel">
      {/* Poll Header */}
      <div className="poll-header-badge">
        <span className="live-indicator">
          <span className="live-dot animate-pulse"></span> LIVE SOROBAN POLL
        </span>
        <span className="total-votes-pill">
          <BarChart3 size={15} />
          <strong>{pollData.totalVotes}</strong> Total Votes Cast
        </span>
      </div>

      <h2 className="poll-title">{pollData.title}</h2>

      {/* Poll Options Grid */}
      <div className="options-container">
        {pollData.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isUserVotedThis = userVotedOptionId === option.id;

          return (
            <div
              key={option.id}
              onClick={() => {
                if (!hasVoted && !isSubmitting) {
                  setSelectedOptionId(option.id);
                }
              }}
              className={`option-row ${isSelected ? 'selected' : ''} ${
                isUserVotedThis ? 'user-choice' : ''
              } ${hasVoted ? 'voted-disabled' : ''}`}
            >
              {/* Option Top Bar */}
              <div className="option-top">
                <div className="option-label-wrap">
                  {!hasVoted && (
                    <input
                      type="radio"
                      name="poll-option"
                      checked={isSelected}
                      onChange={() => setSelectedOptionId(option.id)}
                      disabled={isSubmitting || hasVoted}
                      className="radio-custom"
                    />
                  )}
                  {isUserVotedThis && <CheckCircle size={18} className="text-cyan text-voted" />}
                  <span className="option-label">{option.label}</span>
                </div>
                <div className="option-stats">
                  <span className="option-count">{option.votes} votes</span>
                  <span className="option-percent">{option.percentage}%</span>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="progress-track">
                <div
                  className={`progress-fill ${isSelected ? 'progress-fill-active' : ''} ${
                    isUserVotedThis ? 'progress-fill-voted' : ''
                  }`}
                  style={{ width: `${option.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="poll-actions">
        {!isConnected ? (
          <button onClick={onConnectWallet} className="btn-vote-submit glow-cyan">
            <Lock size={18} />
            Connect Wallet to Vote
          </button>
        ) : hasVoted ? (
          <div className="voted-success-banner">
            <CheckCircle size={20} className="text-cyan" />
            <span>You have submitted your vote to the Soroban Contract on Testnet!</span>
          </div>
        ) : (
          <button
            onClick={handleVoteSubmit}
            disabled={selectedOptionId === null || isSubmitting}
            className="btn-vote-submit glow-purple"
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border" />
                Signing & Submitting Tx...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Vote to Soroban Contract
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
