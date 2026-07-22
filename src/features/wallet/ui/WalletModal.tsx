'use client';

import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { SupportedWallet } from '../types';
import { Wallet, ShieldCheck, ExternalLink, AlertTriangle, X } from 'lucide-react';

interface WalletOption {
  id: SupportedWallet;
  name: string;
  description: string;
  iconBg: string;
  popular?: boolean;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'freighter',
    name: 'Freighter',
    description: 'Official browser extension by SDF',
    iconBg: 'bg-indigo-600',
    popular: true,
  },
  {
    id: 'albedo',
    name: 'Albedo',
    description: 'Web-based web3 wallet for Stellar',
    iconBg: 'bg-purple-600',
  },
  {
    id: 'xbull',
    name: 'xBull',
    description: 'Powerful cross-platform Stellar wallet',
    iconBg: 'bg-orange-600',
  },
  {
    id: 'hana',
    name: 'Hana Wallet',
    description: 'Multi-chain web3 wallet',
    iconBg: 'bg-pink-600',
  },
  {
    id: 'rabet',
    name: 'Rabet',
    description: 'Secure extension wallet for Stellar',
    iconBg: 'bg-cyan-600',
  },
];

export const WalletModal: React.FC = () => {
  const { isModalOpen, setModalOpen, connectWallet, isConnecting, error } = useWallet();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in-up">
      <div className="relative w-full max-w-md glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl">
        <button
          onClick={() => setModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Connect Stellar Wallet</h3>
            <p className="text-sm text-slate-400">Select your preferred Stellar ecosystem wallet</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          {WALLET_OPTIONS.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => connectWallet(wallet.id)}
              disabled={isConnecting}
              className="w-full flex items-center justify-between p-4 rounded-xl glass-card-hover bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 text-left group transition"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${wallet.iconBg} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                  {wallet.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white group-hover:text-indigo-300 transition">
                      {wallet.name}
                    </span>
                    {wallet.popular && (
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Popular
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{wallet.description}</span>
                </div>
              </div>

              <ShieldCheck className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition" />
            </button>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Need a wallet?</span>
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium underline-offset-2 hover:underline"
          >
            Install Freighter <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
