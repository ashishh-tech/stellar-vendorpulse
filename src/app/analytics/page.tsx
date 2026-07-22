'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { BarChart3, TrendingUp, ShieldAlert, Award } from 'lucide-react';

const SCORE_DISTRIBUTION = [
  { range: '90-100 (Exemplary)', count: 4 },
  { range: '75-89 (Good)', count: 7 },
  { range: '60-74 (Probation)', count: 3 },
  { range: '< 60 (Risk)', count: 2 },
];

const CATEGORY_BREAKDOWN = [
  { name: 'Logistics & Shipping', value: 35, color: '#6366f1' },
  { name: 'Hardware & Components', value: 25, color: '#f97316' },
  { name: 'Packaging & Containers', value: 20, color: '#10b981' },
  { name: 'IT Infrastructure', value: 20, color: '#a855f7' },
];

const RADAR_METRICS = [
  { metric: 'Delivery Timeliness', score: 88 },
  { metric: 'Product Quality', score: 92 },
  { metric: 'Payment Compliance', score: 78 },
  { metric: 'Communication', score: 85 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white">Vendor Performance Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">
          Deep-dive telemetry into supplier performance, risk evaluation, and category benchmarks
        </p>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Score Distribution Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Score Distribution</h3>
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SCORE_DISTRIBUTION}>
                <XAxis dataKey="range" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Category Distribution</h3>
            <TrendingUp className="w-5 h-5 text-orange-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CATEGORY_BREAKDOWN.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Axis Radar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 col-span-1 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">4-Axis Performance Radar</h3>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_METRICS}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="System Average" dataKey="score" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
