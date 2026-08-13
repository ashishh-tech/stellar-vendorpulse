'use client';

import React, { useState } from 'react';
import { Users, FileCheck2, CheckCircle2, ShieldAlert, ArrowUpRight, Plus, Send } from 'lucide-react';
import { multiSigService } from './service';
import { MultiSigProposal } from './types';

export const MultiSigApprovalCenter: React.FC = () => {
  const [proposals, setProposals] = useState<MultiSigProposal[]>(multiSigService.getProposals());
  const [activeSigner, setActiveSigner] = useState<string>(
    'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWBDJJGTH46W45H2B2J5M4U6'
  );
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  const handleSign = (proposalId: string) => {
    try {
      multiSigService.signProposal(proposalId, activeSigner);
      setProposals([...multiSigService.getProposals()]);
    } catch (err: any) {
      alert(err.message || 'Signature failed');
    }
  };

  const handleExecute = async (proposalId: string) => {
    setIsExecuting(proposalId);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await multiSigService.executeProposal(proposalId, activeSigner);
      setProposals([...multiSigService.getProposals()]);
    } catch (err: any) {
      alert(err.message || 'Execution failed');
    } finally {
      setIsExecuting(null);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl bg-slate-900/40 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Multi-Signature Governance Center
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Threshold: 2-of-3
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Multi-party cryptographic authorization for Soroban contract upgrades, key parameters, and high-value operations.
            </p>
          </div>
        </div>

        {/* Signer Switcher */}
        <div className="flex items-center gap-2 text-xs bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <span className="text-slate-500 text-[11px] font-mono px-2">Active Signer:</span>
          <select
            value={activeSigner}
            onChange={(e) => setActiveSigner(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-indigo-500 font-mono"
          >
            <option value="GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWBDJJGTH46W45H2B2J5M4U6">Security Council (Signer 1)</option>
            <option value="GBN4M5J8Z9X2L3K4T5R6V7W8P9Q0S1D2F3G4H5J6K7L8M9N0P1Q2">Lead Auditor (Signer 2)</option>
            <option value="GCD8P3K2M4N5L6J7H8G9F0D1S2A3W4E5R6T7Y8U9I0O1P2Q3R4S5">Procurement Lead (Signer 3)</option>
          </select>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-3">
        {proposals.map((prop) => {
          const hasCurrentSigned = prop.signers.find((s) => s.address === activeSigner)?.hasSigned;
          const isApproved = prop.status === 'APPROVED';
          const isExecuted = prop.status === 'EXECUTED';

          return (
            <div
              key={prop.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition flex flex-col gap-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {prop.id}
                  </span>
                  <h4 className="text-sm font-semibold text-white">{prop.title}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                      isExecuted
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isApproved
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {prop.status} ({prop.currentWeight}/{prop.threshold})
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{prop.description}</p>

              {/* Signers Status Indicators */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-900 text-xs">
                {prop.signers.map((s, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border ${
                      s.hasSigned
                        ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    {s.hasSigned ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <div className="w-2 h-2 rounded-full bg-slate-600" />}
                    <span>{s.name}</span>
                  </div>
                ))}

                <div className="ml-auto flex items-center gap-2">
                  {prop.status === 'PROPOSED' && (
                    <button
                      type="button"
                      onClick={() => handleSign(prop.id)}
                      disabled={hasCurrentSigned}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        hasCurrentSigned
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                      }`}
                    >
                      <Send className="w-3 h-3" />
                      {hasCurrentSigned ? 'Signed' : 'Sign Proposal'}
                    </button>
                  )}

                  {prop.status === 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handleExecute(prop.id)}
                      disabled={isExecuting === prop.id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      {isExecuting === prop.id ? 'Broadcasting...' : 'Execute On-Chain'}
                    </button>
                  )}

                  {isExecuted && prop.txHash && (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      Tx: {prop.txHash.slice(0, 8)}...{prop.txHash.slice(-6)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
