'use client';

import React, { useMemo, useState } from 'react';
import { useVendors } from '@/features/contracts/hooks/useVendors';
import { vendorRiskEngine } from './service';
import { RiskAssessment, RiskTier } from './types';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Activity,
  BarChart3,
} from 'lucide-react';

const TIER_CONFIG: Record<RiskTier, { label: string; color: string; bgColor: string; borderColor: string; Icon: any }> = {
  CRITICAL: { label: 'Critical', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', Icon: ShieldAlert },
  HIGH: { label: 'High', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', Icon: AlertTriangle },
  MEDIUM: { label: 'Medium', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', Icon: Shield },
  LOW: { label: 'Low', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', Icon: ShieldCheck },
};

const TrendIcon: React.FC<{ trend: RiskAssessment['trend'] }> = ({ trend }) => {
  if (trend === 'improving') return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === 'declining') return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-slate-400" />;
};

export function RiskDashboard() {
  const { data: vendors = [] } = useVendors();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterTier, setFilterTier] = useState<RiskTier | 'ALL'>('ALL');

  const assessments = useMemo(() => {
    // Build empty reviews map (real reviews would come from the contract service)
    const reviewMap = new Map<number, any[]>();
    return vendorRiskEngine.assessAll(vendors, reviewMap);
  }, [vendors]);

  const filtered = filterTier === 'ALL'
    ? assessments
    : assessments.filter((a) => a.tier === filterTier);

  const tierCounts = useMemo(() => {
    const counts: Record<RiskTier, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    assessments.forEach((a) => counts[a.tier]++);
    return counts;
  }, [assessments]);

  const avgRisk = assessments.length > 0
    ? Math.round(assessments.reduce((s, a) => s + a.compositeRiskScore, 0) / assessments.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Vendor Risk Assessment</h2>
            <p className="text-xs text-slate-400">
              Weighted multi-factor risk analysis across {vendors.length} vendors
            </p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Portfolio Risk Score: </span>
          <span className={avgRisk >= 50 ? 'text-red-400 font-bold' : avgRisk >= 25 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
            {avgRisk}/100
          </span>
        </div>
      </div>

      {/* Tier Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as RiskTier[]).map((tier) => {
          const cfg = TIER_CONFIG[tier];
          const Icon = cfg.Icon;
          const isActive = filterTier === tier;
          return (
            <button
              key={tier}
              type="button"
              onClick={() => setFilterTier(isActive ? 'ALL' : tier)}
              className={`p-4 rounded-xl border transition-all text-left ${
                isActive
                  ? `${cfg.bgColor} ${cfg.borderColor} ring-1 ring-inset ring-${tier === 'CRITICAL' ? 'red' : tier === 'HIGH' ? 'orange' : tier === 'MEDIUM' ? 'amber' : 'emerald'}-500/20`
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{tierCounts[tier]}</p>
              <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">Vendors</p>
            </button>
          );
        })}
      </div>

      {/* Risk Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-white">Risk Matrix</span>
          </div>
          {filterTier !== 'ALL' && (
            <button
              type="button"
              onClick={() => setFilterTier('ALL')}
              className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 transition"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-800/60">
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              No vendors found in this risk tier.
            </div>
          )}
          {filtered.map((assessment) => {
            const cfg = TIER_CONFIG[assessment.tier];
            const Icon = cfg.Icon;
            const isExpanded = expandedId === assessment.vendorId;

            return (
              <div key={assessment.vendorId} className="group">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : assessment.vendorId)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-800/30 transition text-left"
                >
                  {/* Risk Score Circle */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${cfg.bgColor} ${cfg.color} border ${cfg.borderColor} shrink-0`}>
                    {assessment.compositeRiskScore}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">{assessment.vendorName}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${cfg.bgColor} ${cfg.color} ${cfg.borderColor} border`}>
                        <Icon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {assessment.recommendations[0]}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <TrendIcon trend={assessment.trend} />
                      <span className="capitalize">{assessment.trend}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4">
                    {/* Factor Bars */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {assessment.factors.map((factor) => (
                        <div key={factor.name} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-slate-300">{factor.name}</span>
                            <span className={`text-xs font-mono font-bold ${
                              factor.score >= 50 ? 'text-red-400' : factor.score >= 25 ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {factor.score}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                factor.score >= 50 ? 'bg-red-500' : factor.score >= 25 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${factor.score}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1.5">{factor.description}</p>
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <h4 className="text-xs font-semibold text-slate-300 mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {assessment.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
