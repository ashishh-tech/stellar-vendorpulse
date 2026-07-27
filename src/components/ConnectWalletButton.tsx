'use client';

/**
 * Top-Level Connect Wallet Button Component
 * Integrates with @stellar/freighter-api for Stellar wallet connection & balance display.
 */
import React from 'react';
import { Wallet, CheckCircle2, ChevronDown, LogOut, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

export function ConnectWalletButton() {
  const {
    isConnected,
    address,
    walletName,
    balance,
    isConnecting,
    setModalOpen,
    disconnect,
  } = useWallet();

  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-white text-xs font-mono transition shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold">{formatAddress(address)}</span>
          <span className="text-slate-400 text-[11px]">({balance} XLM)</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950 border border-slate-800 p-3 shadow-2xl z-50 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-white font-semibold block">{walletName}</span>
                <span className="text-slate-500 font-mono text-[10px] truncate block">{address}</span>
              </div>
            </div>

            <div className="p-2 bg-slate-900 rounded-xl text-xs flex justify-between items-center">
              <span className="text-slate-400">Balance:</span>
              <span className="text-emerald-400 font-mono font-bold">{balance} XLM</span>
            </div>

            <button
              onClick={() => {
                disconnect();
                setDropdownOpen(false);
              }}
              className="w-full py-2 px-3 bg-red-950/40 hover:bg-red-900/40 text-red-300 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setModalOpen(true)}
      disabled={isConnecting}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-orange-500 hover:from-indigo-500 hover:to-orange-400 text-white font-semibold text-xs shadow-lg transition disabled:opacity-50"
    >
      {isConnecting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
}

export default ConnectWalletButton;
