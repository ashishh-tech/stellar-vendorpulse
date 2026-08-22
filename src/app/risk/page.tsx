'use client';

import React from 'react';
import { RiskDashboard } from '@/features/analytics/risk-engine/RiskDashboard';

export default function RiskPage() {
  return (
    <div className="space-y-6">
      <RiskDashboard />
    </div>
  );
}
