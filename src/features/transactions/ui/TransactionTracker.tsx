'use client';

import React from 'react';
import { useTransactionStore } from '../store';
import { getExplorerUrl, truncateAddress, formatTimestamp } from '@/lib/utils';
import { Activity, CheckCircle2, XCircle, Clock, Loader2, ExternalLink, RefreshCw, X, Trash2 } from 'lucide-react';

export const TransactionTracker: React.FC = () => {
  const { transactions, isDrawerOpen, setDrawerOpen, clearTransactions } = useTransactionStore();

  const pendingCount = transactions.filter((t) => t.status === 'pending' || t.status === 'processing').length;

  return (
    <>
      {/* Floating Trigger Pill */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full glass-card border border-indigo-500/30 text-white shadow-xl hover:border-indigo-400 transition"
      >
        <Activity className={`w-4 h-4 ${pendingCount > 0 ? 'text-amber-400 animate-spin' : 'text-indigo-400'}`} />
        <span className="text-xs font-semibold">Transactions</span>
        {pendingCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
            {pendingCount} active
          </span>
        )}
      </button>

      {/* Slide-over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in-up">
          <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">Transaction Lifecycle Center</h3>
                </div>
                <div className="flex items-center gap-2">
                  {transactions.length > 0 && (
                    <button
                      onClick={clearTransactions}
                      className="p-2 text-slate-400 hover:text-rose-400 transition rounded-lg hover:bg-slate-800"
                      title="Clear History"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
                {transactions.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No transaction history yet</p>
                    <p className="text-xs text-slate-600 mt-1">Interactions with smart contracts will appear here live</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-xl glass-card border border-slate-800 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {tx.status === 'confirmed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {tx.status === 'failed' && <XCircle className="w-4 h-4 text-rose-400" />}
                          {(tx.status === 'pending' || tx.status === 'processing') && (
                            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                          )}
                          <span className="font-semibold text-sm text-white">{tx.contractName}.{tx.methodName}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${
                            tx.status === 'confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : tx.status === 'failed'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>

                      {tx.errorMessage && (
                        <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2 my-2 font-mono">
                          {tx.errorMessage}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/60 font-mono">
                        <span>{formatTimestamp(Math.floor(tx.submittedAt / 1000))}</span>
                        {tx.hash && (
                          <a
                            href={getExplorerUrl(tx.hash, 'tx')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            <span>Hash: {truncateAddress(tx.hash, 4)}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
