'use client';

import React from 'react';
import { ActivityFeed } from '@/features/events/ui/ActivityFeed';
import { Radio, Zap } from 'lucide-react';

export default function ActivityPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
          <Radio className="w-4 h-4 animate-pulse" /> Real-time Event Subscription
        </div>
        <h1 className="text-3xl font-bold text-white">Live On-Chain Activity Stream</h1>
        <p className="text-sm text-slate-400 mt-1">
          Streaming smart contract events directly from the Soroban RPC ledger ingestion engine
        </p>
      </div>

      <ActivityFeed />
    </div>
  );
}
