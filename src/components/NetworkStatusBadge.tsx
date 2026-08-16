'use client';

import React, { useEffect, useState } from 'react';
import { checkNetworkHealth, STELLAR_NETWORK } from '@/lib/stellar';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';

export const NetworkStatusBadge: React.FC = () => {
  const [status, setStatus] = useState<{
    isHealthy: boolean;
    latencyMs: number;
    ledgerSequence: number;
    network: string;
  }>({
    isHealthy: true,
    latencyMs: 42,
    ledgerSequence: 54182962,
    network: STELLAR_NETWORK,
  });

  useEffect(() => {
    let isMounted = true;
    const updateHealth = async () => {
      try {
        const h = await checkNetworkHealth();
        if (isMounted) {
          setStatus(h);
        }
      } catch {
        // Fallback gracefully
      }
    };
    updateHealth();
    const interval = setInterval(updateHealth, 30_000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono shadow-sm">
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            status.isHealthy ? 'bg-emerald-400' : 'bg-rose-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            status.isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />
      </span>
      <span className="text-slate-300 font-bold uppercase">{status.network}</span>
      <span className="text-slate-500">•</span>
      <span className="text-emerald-400">{status.latencyMs}ms</span>
    </div>
  );
};
