'use client';

import React, { useState } from 'react';
import { Zap, ShieldCheck, CheckCircle2, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { feeSponsorshipService } from './service';
import { SponsoredTransactionResult } from './types';

export const FeeSponsorshipCard: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<string>('register_vendor');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [lastTx, setLastTx] = useState<SponsoredTransactionResult | null>(null);

  const quote = feeSponsorshipService.calculateQuote(selectedAction);
  const history = feeSponsorshipService.getSponsorshipHistory();

  const handleSimulateSponsoredTx = async () => {
    setIsSimulating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const res = await feeSponsorshipService.wrapAndSponsorTransaction(
        'AAAAAGSimulatedXDRPayload...',
        selectedAction,
        'GDUKMGUG6UKR...TEST'
      );
      setLastTx(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl bg-slate-900/40 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Stellar Fee Bump Sponsorship
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Gasless Active
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Zero-friction vendor onboarding and transaction fee sponsorship using native Stellar fee bump envelopes.
            </p>
          </div>
        </div>
      </div>

      {/* Quote Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-5">
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-mono">Sponsor Account</span>
          <p className="text-xs font-mono text-slate-200 truncate mt-1">
            {feeSponsorshipService.getSponsorAddress().slice(0, 8)}...
            {feeSponsorshipService.getSponsorAddress().slice(-8)}
          </p>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-mono">Sponsored Base Fee</span>
          <p className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Covered (0.001 XLM)
          </p>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-mono">Sponsorship Status</span>
          <p className="text-xs font-semibold text-indigo-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Soroban Mainnet Ready
          </p>
        </div>
      </div>

      {/* Interactive Simulator */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Select Operation to Sponsor:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'register_vendor', label: 'Register Vendor' },
              { id: 'submit_review', label: 'Submit Review' },
              { id: 'update_vendor', label: 'Update Status' },
            ].map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setSelectedAction(op.id)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition ${
                  selectedAction === op.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSimulateSponsoredTx}
          disabled={isSimulating}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          {isSimulating ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              Sponsoring Envelope on Stellar...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Simulate Gasless Fee-Bump Execution
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {lastTx && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
              <span>✅ Gasless Transaction Broadcasted!</span>
              <span className="text-[10px] font-mono text-emerald-500">Ledger #{lastTx.ledgerSequence}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
              <div className="truncate">
                <span className="text-slate-500">Fee Bump Hash:</span> {lastTx.feeBumpTxHash}
              </div>
              <div className="text-emerald-400">
                <span className="text-slate-500">Gas Saved:</span> {lastTx.feePaidInXlm} XLM (10,000 Stroops)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
