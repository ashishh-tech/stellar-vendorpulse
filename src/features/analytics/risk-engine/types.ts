export type RiskTier = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskFactor {
  name: string;
  weight: number;
  score: number; // 0-100, higher = more risky
  description: string;
  category: 'performance' | 'compliance' | 'financial' | 'operational';
}

export interface RiskAssessment {
  vendorId: number;
  vendorName: string;
  compositeRiskScore: number; // 0-100
  tier: RiskTier;
  factors: RiskFactor[];
  trend: 'improving' | 'stable' | 'declining';
  lastAssessedAt: number;
  recommendations: string[];
}

export interface RiskThresholds {
  critical: number; // score >= this = CRITICAL
  high: number;
  medium: number;
  // anything below medium = LOW
}

export const DEFAULT_RISK_THRESHOLDS: RiskThresholds = {
  critical: 75,
  high: 50,
  medium: 25,
};
