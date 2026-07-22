'use client';

import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { truncateAddress } from '@/lib/utils';
import { Wallet, LogOut, Copy, Check, ChevronDown, RefreshCw } from 'lucide-react';

export const ConnectWalletButton: React.FC = () => {
  const { isConnected, address, balance, walletName, setModalOpen, disconnect, refreshBalance } = useWallet();
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected || !address) {
    return (
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 backdrop-blur-md">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 rounded-lg text-indigo-300 font-mono text-xs font-semibold">
          <span>{Number(balance).toFixed(2)}</span>
          <span className="text-indigo-400">XLM</span>
          <button onClick={refreshBalance} className="text-slate-400 hover:text-indigo-300 transition ml-1">
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 rounded-lg text-sm text-white font-mono font-medium transition"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{truncateAddress(address)}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 glass-card rounded-xl border border-slate-800 p-2 shadow-2xl z-50 animate-fade-in-up">
          <div className="p-3 border-b border-slate-800/80">
            <span className="text-xs text-slate-400 block font-sans">Connected via {walletName || 'Freighter'}</span>
            <span className="text-xs font-mono text-white break-all block mt-1">{address}</span>
          </div>

          <div className="py-1">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition"
            >
              <span className="flex items-center gap-2">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                {copied ? 'Copied!' : 'Copy Address'}
              </span>
            </button>

            <button
              onClick={() => {
                disconnect();
                setDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition mt-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
