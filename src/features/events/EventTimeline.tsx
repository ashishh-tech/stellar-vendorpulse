'use client';

import React, { useState, useMemo } from 'react';
import { useEventStore } from './store';
import { ContractEvent } from './types';
import {
  Clock,
  UserPlus,
  Star,
  ToggleRight,
  RefreshCcw,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileCode2,
  Zap,
  Hash,
} from 'lucide-react';

const EVENT_TYPE_CONFIG: Record<
  ContractEvent['type'],
  { label: string; color: string; bgColor: string; borderColor: string; Icon: any }
> = {
  vendor_registered: { label: 'Vendor Registered', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', Icon: UserPlus },
  vendor_updated: { label: 'Vendor Updated', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', Icon: RefreshCcw },
  status_changed: { label: 'Status Changed', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', Icon: ToggleRight },
  review_submitted: { label: 'Review Submitted', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/30', Icon: Star },
  score_updated: { label: 'Score Updated', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30', Icon: Zap },
  unknown: { label: 'Unknown', color: 'text-slate-400', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30', Icon: FileCode2 },
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Seed some demo events for display
const DEMO_EVENTS: ContractEvent[] = [
  {
    id: 'tl_evt_1',
    contractId: 'CDLZFC4SYJLNW3BFATR7GQJX33VFPV6RCZOSXIL5PZXKN3KMAEJW3RL',
    topic: ['vendor', 'register'],
    data: 'Apex Global Logistics registered as Logistics & Shipping vendor',
    ledger: 54182934,
    ledgerClosedAt: new Date(Date.now() - 3600000).toISOString(),
    txHash: '0xef2e9c8d4a7b1f3e5d9c2a8b6f4e1d7c3a5b9e2d4f6a8c0e2b4d3a861c',
    type: 'vendor_registered',
  },
  {
    id: 'tl_evt_2',
    contractId: 'CAAHMZF5IZHFNZFCREULIMVXMBU2FQHPEXNXF7KRGJHM47LCNLJNFKK2',
    topic: ['review', 'submit'],
    data: 'Multi-Axis Score Review (92/100) — Delivery: 95, Quality: 90, Payment: 92, Communication: 90',
    ledger: 54182938,
    ledgerClosedAt: new Date(Date.now() - 2400000).toISOString(),
    txHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    type: 'review_submitted',
  },
  {
    id: 'tl_evt_3',
    contractId: 'CDLZFC4SYJLNW3BFATR7GQJX33VFPV6RCZOSXIL5PZXKN3KMAEJW3RL',
    topic: ['vendor', 'scored'],
    data: 'Inter-Contract Score Update: ReviewSystem → VendorRegistry.update_vendor_score()',
    ledger: 54182938,
    ledgerClosedAt: new Date(Date.now() - 2400000).toISOString(),
    txHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    type: 'score_updated',
  },
  {
    id: 'tl_evt_4',
    contractId: 'CDLZFC4SYJLNW3BFATR7GQJX33VFPV6RCZOSXIL5PZXKN3KMAEJW3RL',
    topic: ['vendor', 'status'],
    data: 'Quantum Microchips Inc status transition: Active → Probation',
    ledger: 54182940,
    ledgerClosedAt: new Date(Date.now() - 1200000).toISOString(),
    txHash: '0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    type: 'status_changed',
  },
  {
    id: 'tl_evt_5',
    contractId: 'CDLZFC4SYJLNW3BFATR7GQJX33VFPV6RCZOSXIL5PZXKN3KMAEJW3RL',
    topic: ['vendor', 'register'],
    data: 'Veritas Packaging Co registered as Packaging & Containers vendor',
    ledger: 54182945,
    ledgerClosedAt: new Date(Date.now() - 600000).toISOString(),
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    type: 'vendor_registered',
  },
  {
    id: 'tl_evt_6',
    contractId: 'CAAHMZF5IZHFNZFCREULIMVXMBU2FQHPEXNXF7KRGJHM47LCNLJNFKK2',
    topic: ['review', 'submit'],
    data: 'Multi-Axis Score Review (64/100) — Delivery: 55, Quality: 75, Payment: 60, Communication: 65',
    ledger: 54182950,
    ledgerClosedAt: new Date(Date.now() - 300000).toISOString(),
    txHash: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    type: 'review_submitted',
  },
];

export function EventTimeline() {
  const storeEvents = useEventStore((s) => s.events);
  const [filterType, setFilterType] = useState<ContractEvent['type'] | 'all'>('all');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  // Merge demo + store events and sort chronologically
  const allEvents = useMemo(() => {
    const merged = [...storeEvents];
    const existingIds = new Set(merged.map((e) => e.id));
    DEMO_EVENTS.forEach((d) => {
      if (!existingIds.has(d.id)) merged.push(d);
    });
    return merged.sort(
      (a, b) => new Date(b.ledgerClosedAt).getTime() - new Date(a.ledgerClosedAt).getTime()
    );
  }, [storeEvents]);

  const filtered = filterType === 'all' ? allEvents : allEvents.filter((e) => e.type === filterType);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allEvents.forEach((e) => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });
    return counts;
  }, [allEvents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Contract Event Timeline</h2>
            <p className="text-xs text-slate-400">
              Chronological replay of Soroban contract interactions • {allEvents.length} events
            </p>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
            filterType === 'all'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/80'
          }`}
        >
          <Filter className="w-3.5 h-3.5" /> All ({allEvents.length})
        </button>
        {(Object.keys(EVENT_TYPE_CONFIG) as ContractEvent['type'][])
          .filter((t) => typeCounts[t])
          .map((type) => {
            const cfg = EVENT_TYPE_CONFIG[type];
            const Icon = cfg.Icon;
            const isActive = filterType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(isActive ? 'all' : type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? `${cfg.bgColor} ${cfg.color} border ${cfg.borderColor}`
                    : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {cfg.label} ({typeCounts[type] || 0})
              </button>
            );
          })}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/40 via-slate-700 to-transparent" />

        <div className="space-y-1">
          {filtered.map((event, idx) => {
            const cfg = EVENT_TYPE_CONFIG[event.type];
            const Icon = cfg.Icon;
            const isExpanded = expandedEvent === event.id;

            return (
              <div key={event.id} className="relative pl-14">
                {/* Timeline Dot */}
                <div className={`absolute left-4 top-4 w-5 h-5 rounded-full flex items-center justify-center ${cfg.bgColor} border-2 ${cfg.borderColor} z-10`}>
                  <Icon className={`w-2.5 h-2.5 ${cfg.color}`} />
                </div>

                {/* Event Card */}
                <button
                  type="button"
                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  className="w-full text-left p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700 transition group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${cfg.bgColor} ${cfg.color} ${cfg.borderColor} border`}>
                          {cfg.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Ledger #{event.ledger.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-200 font-medium">{String(event.data)}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatTimeAgo(event.ledgerClosedAt)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Hash className="w-3 h-3 text-slate-500" />
                        <span className="font-mono text-slate-500">TX:</span>
                        <span className="font-mono text-indigo-400 truncate">{event.txHash}</span>
                        <a
                          href={`https://stellar.expert/explorer/public/tx/${event.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <FileCode2 className="w-3 h-3 text-slate-500" />
                        <span className="font-mono text-slate-500">Contract:</span>
                        <span className="font-mono text-slate-300 truncate">{event.contractId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="font-mono text-slate-500">Topics:</span>
                        <span className="font-mono text-slate-300">{event.topic.join(' → ')}</span>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-slate-500">
          No events matching the selected filter.
        </div>
      )}
    </div>
  );
}
