import React from 'react';
import { PollEvent } from '../types/poll';
import { STELLAR_CONFIG } from '../services/sorobanService';
import { Activity, ExternalLink, Clock, UserCheck, ShieldCheck } from 'lucide-react';

interface EventFeedProps {
  events: PollEvent[];
}

export const EventFeed: React.FC<EventFeedProps> = ({ events }) => {
  return (
    <div className="event-feed-card glass-panel">
      <div className="feed-header">
        <div className="feed-title-wrap">
          <Activity className="text-cyan animate-pulse" size={20} />
          <div>
            <h3 className="feed-title">Real-Time Soroban Contract Events</h3>
            <p className="feed-subtitle">Live stream of on-chain vote events published by the smart contract.</p>
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
                  <UserCheck size={16} className="text-cyan" />
                </div>
                <div>
                  <div className="event-voter-row">
                    <span className="voter-pubkey">{evt.voter}</span>
                    <span className="event-badge-voted">Voted</span>
                  </div>
                  <p className="event-choice-label">"{evt.optionLabel}"</p>
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
