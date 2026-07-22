import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Layers, BarChart3, Radio, CheckCircle, Lock, Users, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="relative text-center py-16 px-4 overflow-hidden rounded-3xl glass-card border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-orange-600/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <Zap className="w-3.5 h-3.5 text-orange-400" /> Powered by Soroban Smart Contracts
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Decentralized Vendor Performance Management on <span className="text-gradient-stellar">Stellar</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
          Replace messy spreadsheets with immutable on-chain supplier scoring. Track delivery timeliness, quality assurance, payment compliance, and communication reliability in real time.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-orange-500 hover:from-indigo-500 hover:to-orange-400 text-white font-bold text-base shadow-xl shadow-indigo-500/25 transition-all hover:scale-105"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/activity"
            className="flex items-center gap-2 px-8 py-4 rounded-xl glass-card border border-slate-700 hover:border-indigo-400 text-slate-200 font-semibold text-base transition-all"
          >
            <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span>Live Activity Stream</span>
          </Link>
        </div>

        {/* Feature Highlights Banner */}
        <div className="mt-16 pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-bold text-white">RBAC Access Control</h4>
              <p className="text-xs text-slate-400 mt-0.5">Admin & Manager role verification on-chain</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Layers className="w-6 h-6 text-orange-400 shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-bold text-white">Inter-Contract Calls</h4>
              <p className="text-xs text-slate-400 mt-0.5">ReviewSystem auto-calculates VendorRegistry scores</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Radio className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-bold text-white">Real-Time Events</h4>
              <p className="text-xs text-slate-400 mt-0.5">Sub-second Soroban RPC event polling</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-bold text-white">StellarWalletsKit</h4>
              <p className="text-xs text-slate-400 mt-0.5">Freighter & multi-wallet integration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center">
          <span className="text-4xl font-extrabold text-white">100%</span>
          <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">Immutable On-Chain Reviews</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center">
          <span className="text-4xl font-extrabold text-gradient-pulse">4-Axis</span>
          <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">Scoring Algorithm</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center">
          <span className="text-4xl font-extrabold text-indigo-400">&lt; 3s</span>
          <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">Soroban Finality</p>
        </div>
      </section>

      {/* How it works section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">How VendorPulse Works</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            A seamless bridge between procurement teams and Stellar Soroban smart contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-2xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-xl font-bold text-white">Register Vendor Profile</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Procurement managers onboard suppliers with verified Stellar address ownership and category classification.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-xl font-bold text-white">Submit Multi-Axis Review</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Evaluate vendors across delivery timeliness, product quality, payment compliance, and communication reliability.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-xl font-bold text-white">Inter-Contract Score Sync</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              ReviewSystem contract automatically calls VendorRegistry to update aggregate performance ratings on-chain.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
