'use client';

import React from 'react';
import { useEvents } from '../hooks/useEvents';
import { useEventStore } from '../store';
import { getExplorerUrl, truncateAddress } from '@/lib/utils';
import { Radio, Star, UserPlus, RefreshCw, Award, Activity, ExternalLink } from 'lucide-react';

export const ActivityFeed: React.FC = () => {
  useEvents(6000); // Poll every 6 seconds
  const { events, isStreaming } = useEventStore();

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'vendor_registered':
        return { icon: UserPlus, label: 'Vendor Registered', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
      case 'review_submitted':
        return { icon: Star, label: 'Review Submitted', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'score_updated':
        return { icon: Award, label: 'Score Calculated', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'status_changed':
        return { icon: RefreshCw, label: 'Status Transition', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
      default:
        return { icon: Activity, label: 'Contract Event', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Live On-Chain Activity Feed</h3>
            <p className="text-xs text-slate-400">Subscribed to Soroban contract events</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">
            {isStreaming ? 'Streaming' : 'Connecting'}
          </span>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 animate-pulse" />
          <p className="text-sm font-medium">Listening for Soroban contract events...</p>
          <p className="text-xs text-slate-600 mt-1">Actions on Vendors or Reviews trigger real-time updates</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {events.map((evt) => {
            const badge = getEventBadge(evt.type);
            const Icon = badge.icon;

            return (
              <div
                key={evt.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/30 transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${badge.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{badge.label}</span>
                      <span className="text-[10px] font-mono text-slate-500">Ledger #{evt.ledger}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Contract: {truncateAddress(evt.contractId, 4)}
                    </p>
                  </div>
                </div>

                <a
                  href={getExplorerUrl(evt.txHash, 'tx')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-indigo-300 rounded-lg hover:bg-slate-800 transition flex items-center gap-1 text-xs"
                >
                  <span className="hidden sm:inline font-mono">View Tx</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
