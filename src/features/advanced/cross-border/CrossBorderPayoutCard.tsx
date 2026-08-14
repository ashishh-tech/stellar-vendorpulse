'use client';

import React, { useState } from 'react';
import { Globe, ArrowRight, ArrowLeftRight, CheckCircle2, ShieldCheck, DollarSign, Activity } from 'lucide-react';
import { crossBorderFlowService } from './service';
import { SupportedCurrency, AnchorQuoteResponse, CrossBorderPayoutRecord } from './types';

export const CrossBorderPayoutCard: React.FC = () => {
  const [fromAsset, setFromAsset] = useState<SupportedCurrency>('USDC');
  const [toAsset, setToAsset] = useState<SupportedCurrency>('EUR');
  const [amount, setAmount] = useState<number>(5000);
  const [isQuoting, setIsQuoting] = useState<boolean>(false);
  const [quote, setQuote] = useState<AnchorQuoteResponse | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [lastPayout, setLastPayout] = useState<CrossBorderPayoutRecord | null>(null);

  const handleGetQuote = () => {
    setIsQuoting(true);
    setTimeout(() => {
      const q = crossBorderFlowService.requestAnchorQuote({
        fromAsset,
        toAsset,
        amount,
        vendorAddress: 'GBVNDR99281...STEL',
      });
      setQuote(q);
      setIsQuoting(false);
    }, 400);
  };

  const handleExecutePayout = async () => {
    if (!quote) return;
    setIsExecuting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const res = await crossBorderFlowService.executeCrossBorderPayout(
        1,
        'Apex Global Logistics Ltd',
        quote
      );
      setLastPayout(res);
      setQuote(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl bg-slate-900/40 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Cross-Border Anchor Settlement (SEP-24 / SEP-31)
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Stellar Rails
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Low-cost instant cross-border vendor invoice payouts via regulated Stellar anchor on/off-ramps.
            </p>
          </div>
        </div>
      </div>

      {/* Converter / Quote Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Send Asset</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-900 text-white font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 text-sm outline-none focus:border-emerald-500"
            />
            <select
              value={fromAsset}
              onChange={(e) => setFromAsset(e.target.value as SupportedCurrency)}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono font-bold"
            >
              <option value="USDC">USDC</option>
              <option value="EURC">EURC</option>
              <option value="XLM">XLM</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handleGetQuote}
            disabled={isQuoting}
            className="w-full h-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
            {isQuoting ? 'Fetching Anchor Rates...' : 'Fetch Live Anchor Quote'}
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Target Currency</label>
          <div className="flex items-center gap-2">
            <select
              value={toAsset}
              onChange={(e) => setToAsset(e.target.value as SupportedCurrency)}
              className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono font-bold"
            >
              <option value="EUR">EUR (SEPA)</option>
              <option value="BRL">BRL (PIX)</option>
              <option value="NGN">NGN (NIBSS)</option>
              <option value="INR">INR (IMPS/UPI)</option>
              <option value="USD">USD (FedNow)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quote Display */}
      {quote && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 mb-5 animate-fade-in">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Locked Quote: {quote.quoteId}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300">
              Protocol: {quote.sepProtocol} ({quote.anchorName})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
            <div>
              <span className="text-slate-400 text-[11px]">Payout Amount:</span>
              <p className="font-bold text-white text-sm">
                {quote.outputAmount.toLocaleString()} {quote.toAsset}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Exchange Rate:</span>
              <p className="font-mono text-slate-200">1 {quote.fromAsset} = {quote.exchangeRate} {quote.toAsset}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Anchor Network Fee:</span>
              <p className="font-mono text-emerald-400">${quote.feeAmount} (0.4%)</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Estimated Settlement:</span>
              <p className="font-semibold text-indigo-300">&lt; 90 seconds</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExecutePayout}
            disabled={isExecuting}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                Settling via Stellar SEP Anchor...
              </>
            ) : (
              <>
                Confirm & Settle Supplier Payout
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {lastPayout && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 animate-fade-in text-xs font-mono">
          <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
            <span>✅ Payout Settled Successfully</span>
            <span>Ref: {lastPayout.fiatReferenceNumber}</span>
          </div>
          <div className="text-slate-300 truncate">
            <span className="text-slate-500">Stellar Tx:</span> {lastPayout.stellarTxHash}
          </div>
        </div>
      )}
    </div>
  );
};
