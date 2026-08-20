import React from 'react';
import { VotingWindow } from '../types/ballot';
import { Clock, ShieldCheck, Calendar, Lock } from 'lucide-react';

interface VotingWindowBarProps {
  votingWindow: VotingWindow;
  totalVotes: number;
}

export const VotingWindowBar: React.FC<VotingWindowBarProps> = ({ votingWindow, totalVotes }) => {
  return (
    <div className="voting-window-card glass-panel">
      <div className="window-left">
        <div className="window-status-pill">
          <span className="live-dot animate-pulse"></span>
          <span className="window-status-text">
            {votingWindow.isOpen ? 'VOTING WINDOW ACTIVE' : 'VOTING CLOSED'}
          </span>
        </div>
        <div className="window-info-group">
          <div className="window-detail">
            <Calendar size={14} className="text-muted" />
            <span>
              Window: <strong>{votingWindow.startTime}</strong> ➔ <strong>{votingWindow.endTime}</strong>
            </span>
          </div>
          <div className="window-detail">
            <Clock size={14} className="text-cyan" />
            <span>
              Time Remaining: <strong className="text-cyan">{votingWindow.timeRemainingFormatted}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="window-right">
        <div className="votes-counter-box">
          <span className="counter-label">Verified On-Chain Ballots</span>
          <span className="counter-number">{totalVotes}</span>
        </div>
        <div className="one-vote-tag">
          <ShieldCheck size={14} className="text-cyan" />
          <span>1-Vote-Per-Wallet Enforced</span>
        </div>
      </div>
    </div>
  );
};
