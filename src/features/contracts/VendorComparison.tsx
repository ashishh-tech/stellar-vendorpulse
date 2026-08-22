'use client';

import React, { useState, useMemo } from 'react';
import { useVendors } from '@/features/contracts/hooks/useVendors';
import { VendorDTO } from './types';
import {
  GitCompareArrows,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Star,
  Truck,
  Package,
  CreditCard,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';

const SCORE_AXES = [
  { key: 'delivery', label: 'Delivery', Icon: Truck, color: 'text-blue-400', bgColor: 'bg-blue-500' },
  { key: 'quality', label: 'Quality', Icon: Package, color: 'text-emerald-400', bgColor: 'bg-emerald-500' },
  { key: 'payment', label: 'Payment', Icon: CreditCard, color: 'text-amber-400', bgColor: 'bg-amber-500' },
  { key: 'communication', label: 'Communication', Icon: MessageCircle, color: 'text-purple-400', bgColor: 'bg-purple-500' },
] as const;

const VENDOR_COLORS = [
  { text: 'text-indigo-400', bg: 'bg-indigo-500', border: 'border-indigo-500/30', bgLight: 'bg-indigo-500/10' },
  { text: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500/30', bgLight: 'bg-rose-500/10' },
  { text: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500/30', bgLight: 'bg-cyan-500/10' },
];

// Derive simulated per-axis scores from overall avg_score with variance
function deriveAxisScores(vendor: VendorDTO) {
  const base = vendor.avg_score;
  // Create deterministic variance per vendor using id as seed
  const seed = vendor.id % 20;
  return {
    delivery: Math.min(100, Math.max(0, base + (seed % 5) - 2)),
    quality: Math.min(100, Math.max(0, base - (seed % 4) + 1)),
    payment: Math.min(100, Math.max(0, base + (seed % 3) - 3)),
    communication: Math.min(100, Math.max(0, base - (seed % 6) + 4)),
  };
}

export function VendorComparison() {
  const { data: vendors = [] } = useVendors();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const selectedVendors = useMemo(
    () => selectedIds.map((id) => vendors.find((v) => v.id === id)).filter(Boolean) as VendorDTO[],
    [selectedIds, vendors]
  );

  const addVendor = (id: number) => {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
    setShowPicker(false);
  };

  const removeVendor = (id: number) => {
    setSelectedIds(selectedIds.filter((sid) => sid !== id));
  };

  const vendorScores = useMemo(
    () => selectedVendors.map((v) => ({ vendor: v, scores: deriveAxisScores(v) })),
    [selectedVendors]
  );

  // Find winner per axis
  const axisWinners = useMemo(() => {
    const winners: Record<string, number | null> = {};
    SCORE_AXES.forEach((axis) => {
      let bestScore = -1;
      let bestId: number | null = null;
      vendorScores.forEach(({ vendor, scores }) => {
        const s = scores[axis.key as keyof typeof scores];
        if (s > bestScore) {
          bestScore = s;
          bestId = vendor.id;
        }
      });
      winners[axis.key] = bestId;
    });
    return winners;
  }, [vendorScores]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <GitCompareArrows className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Vendor Comparison</h2>
            <p className="text-xs text-slate-400">
              Select up to 3 vendors for side-by-side multi-axis analysis
            </p>
          </div>
        </div>
      </div>

      {/* Selected Vendor Chips + Add Button */}
      <div className="flex items-center gap-3 flex-wrap">
        {selectedVendors.map((vendor, idx) => {
          const colorSet = VENDOR_COLORS[idx];
          return (
            <div
              key={vendor.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl ${colorSet.bgLight} border ${colorSet.border}`}
            >
              <div className={`w-3 h-3 rounded-full ${colorSet.bg}`} />
              <span className={`text-xs font-semibold ${colorSet.text}`}>{vendor.name}</span>
              <button
                type="button"
                onClick={() => removeVendor(vendor.id)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {selectedIds.length < 3 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPicker(!showPicker)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/60 border border-dashed border-slate-700 text-xs text-slate-400 hover:text-white hover:border-slate-500 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Vendor
            </button>

            {showPicker && (
              <div className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-20 max-h-60 overflow-y-auto">
                {vendors
                  .filter((v) => !selectedIds.includes(v.id))
                  .map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => addVendor(v.id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-800 transition text-xs"
                    >
                      <span className="font-semibold text-slate-200">{v.name}</span>
                      <span className="text-slate-500 ml-2">Score: {v.avg_score}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comparison Content */}
      {selectedVendors.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-800 bg-slate-900/20">
          <GitCompareArrows className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-1">No vendors selected for comparison</p>
          <p className="text-xs text-slate-600">Click "Add Vendor" to begin comparing performance metrics</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Score Comparison */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Overall Score</h3>
            </div>
            <div className="space-y-3">
              {vendorScores.map(({ vendor }, idx) => {
                const colorSet = VENDOR_COLORS[idx];
                const isHighest =
                  vendor.avg_score === Math.max(...selectedVendors.map((v) => v.avg_score));
                return (
                  <div key={vendor.id} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colorSet.bg} shrink-0`} />
                    <span className="text-xs font-medium text-slate-300 w-40 truncate">{vendor.name}</span>
                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colorSet.bg} transition-all duration-700`}
                        style={{ width: `${vendor.avg_score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold font-mono ${colorSet.text} w-10 text-right`}>
                      {vendor.avg_score}
                    </span>
                    {isHighest && selectedVendors.length > 1 && (
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/50 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Per-Axis Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCORE_AXES.map((axis) => {
              const Icon = axis.Icon;
              return (
                <div key={axis.key} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-4 h-4 ${axis.color}`} />
                    <h4 className="text-xs font-bold text-white">{axis.label}</h4>
                  </div>
                  <div className="space-y-2.5">
                    {vendorScores.map(({ vendor, scores }, idx) => {
                      const score = scores[axis.key as keyof typeof scores];
                      const colorSet = VENDOR_COLORS[idx];
                      const isWinner = axisWinners[axis.key] === vendor.id && selectedVendors.length > 1;
                      return (
                        <div key={vendor.id} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${colorSet.bg} shrink-0`} />
                          <span className="text-[10px] text-slate-400 w-28 truncate">{vendor.name}</span>
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${colorSet.bg} transition-all duration-700`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className={`text-xs font-mono font-bold ${colorSet.text} w-8 text-right`}>
                            {score}
                          </span>
                          {isWinner && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Table */}
          {selectedVendors.length >= 2 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Comparison Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left px-4 py-3 text-slate-400 font-semibold">Metric</th>
                      {selectedVendors.map((v, idx) => (
                        <th key={v.id} className={`text-center px-4 py-3 font-semibold ${VENDOR_COLORS[idx].text}`}>
                          {v.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="px-4 py-3 text-slate-300 font-medium">Overall Score</td>
                      {selectedVendors.map((v) => (
                        <td key={v.id} className="px-4 py-3 text-center font-mono font-bold text-white">
                          {v.avg_score}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-300 font-medium">Reviews</td>
                      {selectedVendors.map((v) => (
                        <td key={v.id} className="px-4 py-3 text-center font-mono text-slate-300">
                          {v.review_count}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-300 font-medium">Status</td>
                      {selectedVendors.map((v) => (
                        <td key={v.id} className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            v.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400'
                              : v.status === 'Probation' ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-300 font-medium">Category</td>
                      {selectedVendors.map((v) => (
                        <td key={v.id} className="px-4 py-3 text-center text-slate-400">
                          {v.category}
                        </td>
                      ))}
                    </tr>
                    {SCORE_AXES.map((axis) => (
                      <tr key={axis.key}>
                        <td className="px-4 py-3 text-slate-300 font-medium">{axis.label}</td>
                        {vendorScores.map(({ vendor, scores }) => {
                          const score = scores[axis.key as keyof typeof scores];
                          return (
                            <td key={vendor.id} className="px-4 py-3 text-center font-mono text-slate-300">
                              {score}
                              {axisWinners[axis.key] === vendor.id && selectedVendors.length > 1 && (
                                <span className="text-emerald-400 ml-1">★</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
