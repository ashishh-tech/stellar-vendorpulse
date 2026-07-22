'use client';

import React from 'react';
import {
  STELLAR_NETWORK,
  STELLAR_RPC_URL,
  STELLAR_HORIZON_URL,
  VENDOR_REGISTRY_CONTRACT_ID,
  REVIEW_SYSTEM_CONTRACT_ID,
} from '@/lib/stellar';
import { Settings, Shield, Server, Terminal, Copy, Check } from 'lucide-react';

export default function SettingsPage() {
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white">System Settings & Governance</h1>
        <p className="text-sm text-slate-400 mt-1">
          Network infrastructure parameters, contract IDs, and RBAC governance configuration
        </p>
      </div>

      {/* Contract Telemetry Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Deployed Smart Contracts</h2>
        </div>

        <div className="space-y-4 font-mono text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px] block font-sans">VendorRegistry Contract</span>
              <span className="text-indigo-300 font-semibold mt-1 block break-all font-mono">
                {VENDOR_REGISTRY_CONTRACT_ID || 'Not Deployed (Run ./scripts/deploy-testnet.sh)'}
              </span>
            </div>
            {VENDOR_REGISTRY_CONTRACT_ID && (
              <button
                onClick={() => copyToClipboard(VENDOR_REGISTRY_CONTRACT_ID, 'vr')}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                {copied === 'vr' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px] block font-sans">ReviewSystem Contract</span>
              <span className="text-orange-300 font-semibold mt-1 block break-all font-mono">
                {REVIEW_SYSTEM_CONTRACT_ID || 'Not Deployed (Run ./scripts/deploy-testnet.sh)'}
              </span>
            </div>
            {REVIEW_SYSTEM_CONTRACT_ID && (
              <button
                onClick={() => copyToClipboard(REVIEW_SYSTEM_CONTRACT_ID, 'rs')}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                {copied === 'rs' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Network Configuration */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <Server className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-bold text-white">Stellar Infrastructure Configuration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">Active Network</span>
            <span className="text-white font-semibold mt-0.5 block uppercase">{STELLAR_NETWORK}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">Soroban RPC URL</span>
            <span className="text-indigo-300 font-mono mt-0.5 block truncate">{STELLAR_RPC_URL}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">Horizon API Endpoint</span>
            <span className="text-indigo-300 font-mono mt-0.5 block truncate">{STELLAR_HORIZON_URL}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">Inter-Contract Status</span>
            <span className="text-emerald-400 font-semibold mt-0.5 block">Enabled (ReviewSystem -&gt; VendorRegistry)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
