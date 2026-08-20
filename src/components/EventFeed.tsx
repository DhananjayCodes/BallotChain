import React from 'react';
import { VoteEvent } from '../types/ballot';
import { STELLAR_CONFIG } from '../services/sorobanService';
import { Activity, ExternalLink, Clock, UserCheck, PlusCircle } from 'lucide-react';

interface EventFeedProps {
  events: VoteEvent[];
}

export const EventFeed: React.FC<EventFeedProps> = ({ events }) => {
  return (
    <div className="event-feed-card glass-panel">
      <div className="feed-header">
        <div className="feed-title-wrap">
          <Activity className="text-cyan animate-pulse" size={20} />
          <div>
            <h3 className="feed-title">BallotChain Contract Event Log</h3>
            <p className="feed-subtitle">Live stream of on-chain vote and candidate registration events.</p>
          </div>
        </div>
        <span className="badge badge-event">
          <span className="pulse-dot"></span> State Synced
        </span>
      </div>

      <div className="events-list">
        {events.length === 0 ? (
          <div className="events-empty">
            <Clock size={24} className="text-muted" />
            <p>No contract events logged yet. Cast a vote to generate a live event!</p>
          </div>
        ) : (
          events.map((evt) => (
            <div key={evt.id} className="event-item">
              <div className="event-item-left">
                <div className="event-avatar">
                  {evt.type === 'candidate_registered' ? (
                    <PlusCircle size={16} className="text-purple" />
                  ) : (
                    <UserCheck size={16} className="text-cyan" />
                  )}
                </div>
                <div>
                  <div className="event-voter-row">
                    <span className="voter-pubkey">{evt.voter}</span>
                    <span
                      className={
                        evt.type === 'candidate_registered' ? 'event-badge-reg' : 'event-badge-voted'
                      }
                    >
                      {evt.type === 'candidate_registered' ? 'Candidate Proposed' : 'Voted'}
                    </span>
                  </div>
                  <p className="event-choice-label">"{evt.candidateName}"</p>
                </div>
              </div>

              <div className="event-item-right">
                <span className="event-time">{evt.timestamp}</span>
                <a
                  href={`${STELLAR_CONFIG.explorerUrl}/tx/${evt.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-tx-link"
                  title="View Transaction on Stellar Explorer"
                >
                  Tx Hash <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
