import { VendorDTO, ReviewDTO } from '@/features/contracts/types';
import {
  RiskAssessment,
  RiskFactor,
  RiskTier,
  RiskThresholds,
  DEFAULT_RISK_THRESHOLDS,
} from './types';
import { logger } from '@/lib/logger';

/**
 * VendorRiskEngine — Weighted multi-factor risk scoring engine.
 *
 * Evaluates vendors across 6 risk dimensions:
 *   1. Performance Volatility   (score variance across reviews)
 *   2. Delivery Reliability     (inverse of delivery timeliness score)
 *   3. Quality Deficiency       (inverse of quality score)
 *   4. Payment Risk             (inverse of payment compliance score)
 *   5. Communication Gap        (inverse of communication reliability)
 *   6. Review Volume Risk       (low review count = higher uncertainty)
 *
 * Each factor is weighted, and a composite score determines the risk tier.
 */
export class VendorRiskEngine {
  private thresholds: RiskThresholds;

  constructor(thresholds?: Partial<RiskThresholds>) {
    this.thresholds = { ...DEFAULT_RISK_THRESHOLDS, ...thresholds };
  }

  /**
   * Assess risk for a single vendor given their profile and reviews.
   */
  public assess(vendor: VendorDTO, reviews: ReviewDTO[]): RiskAssessment {
    const factors = this.computeFactors(vendor, reviews);

    // Weighted composite: sum(factor.score * factor.weight) / sum(weights)
    const totalWeight = factors.reduce((acc, f) => acc + f.weight, 0);
    const weightedSum = factors.reduce((acc, f) => acc + f.score * f.weight, 0);
    const compositeRiskScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    const tier = this.classifyTier(compositeRiskScore);
    const trend = this.detectTrend(reviews);
    const recommendations = this.generateRecommendations(tier, factors);

    logger.info('Vendor risk assessment completed', {
      vendorId: vendor.id,
      vendorName: vendor.name,
      compositeRiskScore,
      tier,
      trend,
    });

    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      compositeRiskScore,
      tier,
      factors,
      trend,
      lastAssessedAt: Date.now(),
      recommendations,
    };
  }

  /**
   * Batch-assess all vendors. Returns sorted by risk (highest first).
   */
  public assessAll(
    vendors: VendorDTO[],
    reviewsByVendor: Map<number, ReviewDTO[]>
  ): RiskAssessment[] {
    return vendors
      .map((v) => this.assess(v, reviewsByVendor.get(v.id) || []))
      .sort((a, b) => b.compositeRiskScore - a.compositeRiskScore);
  }

  private computeFactors(vendor: VendorDTO, reviews: ReviewDTO[]): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // 1. Delivery Reliability Risk — lower avg delivery score = higher risk
    const avgDelivery =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.delivery_score, 0) / reviews.length
        : vendor.avg_score;
    factors.push({
      name: 'Delivery Reliability',
      weight: 0.25,
      score: Math.round(100 - avgDelivery),
      description:
        avgDelivery >= 80
          ? 'Strong delivery track record with minimal delays'
          : avgDelivery >= 60
          ? 'Occasional delivery delays requiring monitoring'
          : 'Frequent delivery failures — critical SLA risk',
      category: 'operational',
    });

    // 2. Quality Deficiency Risk
    const avgQuality =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.quality_score, 0) / reviews.length
        : vendor.avg_score;
    factors.push({
      name: 'Quality Deficiency',
      weight: 0.25,
      score: Math.round(100 - avgQuality),
      description:
        avgQuality >= 80
          ? 'Consistent high quality with low defect rates'
          : avgQuality >= 60
          ? 'Moderate quality variance — periodic inspection recommended'
          : 'High defect rates and material specification failures',
      category: 'performance',
    });

    // 3. Payment Risk
    const avgPayment =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.payment_score, 0) / reviews.length
        : vendor.avg_score;
    factors.push({
      name: 'Payment Compliance Risk',
      weight: 0.2,
      score: Math.round(100 - avgPayment),
      description:
        avgPayment >= 80
          ? 'Clean payment history with no invoice disputes'
          : avgPayment >= 60
          ? 'Occasional payment delays or minor disputes'
          : 'Frequent invoice disputes and credit terms violations',
      category: 'financial',
    });

    // 4. Communication Gap Risk
    const avgComm =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.communication_score, 0) / reviews.length
        : vendor.avg_score;
    factors.push({
      name: 'Communication Reliability',
      weight: 0.15,
      score: Math.round(100 - avgComm),
      description:
        avgComm >= 80
          ? 'Highly responsive with clear escalation paths'
          : avgComm >= 60
          ? 'Response times vary — may need escalation protocols'
          : 'Consistently unresponsive during critical supply chain events',
      category: 'compliance',
    });

    // 5. Performance Volatility — standard deviation across overall scores
    const volatility = this.computeVolatility(reviews);
    factors.push({
      name: 'Performance Volatility',
      weight: 0.1,
      score: Math.min(100, Math.round(volatility * 5)), // scale: 20 std dev = 100 risk
      description:
        volatility < 8
          ? 'Stable and predictable performance patterns'
          : volatility < 15
          ? 'Moderate score variance across evaluation periods'
          : 'Highly unpredictable — scores swing dramatically between reviews',
      category: 'performance',
    });

    // 6. Review Volume Uncertainty — fewer reviews = higher uncertainty risk
    const volumeRisk = Math.max(0, 100 - vendor.review_count * 10);
    factors.push({
      name: 'Assessment Confidence',
      weight: 0.05,
      score: Math.min(100, volumeRisk),
      description:
        vendor.review_count >= 10
          ? 'Sufficient data points for confident risk assessment'
          : vendor.review_count >= 5
          ? 'Moderate review history — confidence is building'
          : 'Insufficient evaluation data — high uncertainty in risk score',
      category: 'compliance',
    });

    return factors;
  }

  private computeVolatility(reviews: ReviewDTO[]): number {
    if (reviews.length < 2) return 0;
    const scores = reviews.map((r) => r.overall_score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, s) => acc + (s - mean) ** 2, 0) / scores.length;
    return Math.sqrt(variance);
  }

  private classifyTier(score: number): RiskTier {
    if (score >= this.thresholds.critical) return 'CRITICAL';
    if (score >= this.thresholds.high) return 'HIGH';
    if (score >= this.thresholds.medium) return 'MEDIUM';
    return 'LOW';
  }

  private detectTrend(reviews: ReviewDTO[]): 'improving' | 'stable' | 'declining' {
    if (reviews.length < 3) return 'stable';

    // Compare average of latest 3 vs earliest 3
    const sorted = [...reviews].sort((a, b) => b.created_at - a.created_at);
    const recentAvg =
      sorted.slice(0, 3).reduce((s, r) => s + r.overall_score, 0) / 3;
    const olderAvg =
      sorted.slice(-3).reduce((s, r) => s + r.overall_score, 0) / 3;

    const delta = recentAvg - olderAvg;
    if (delta > 5) return 'improving';
    if (delta < -5) return 'declining';
    return 'stable';
  }

  private generateRecommendations(tier: RiskTier, factors: RiskFactor[]): string[] {
    const recs: string[] = [];
    const worstFactors = [...factors].sort((a, b) => b.score - a.score);

    if (tier === 'CRITICAL') {
      recs.push('Immediately escalate to procurement leadership for review');
      recs.push('Consider suspending new purchase orders pending investigation');
    }

    if (tier === 'HIGH' || tier === 'CRITICAL') {
      recs.push('Schedule urgent performance review meeting with vendor');
    }

    // Factor-specific recommendations
    for (const f of worstFactors.slice(0, 2)) {
      if (f.score > 50) {
        switch (f.category) {
          case 'operational':
            recs.push(`Address ${f.name}: implement SLA penalty clauses and delivery tracking`);
            break;
          case 'performance':
            recs.push(`Address ${f.name}: require quality certification and audit reports`);
            break;
          case 'financial':
            recs.push(`Address ${f.name}: renegotiate payment terms and enforce early payment discounts`);
            break;
          case 'compliance':
            recs.push(`Address ${f.name}: establish formal communication SLAs and escalation matrix`);
            break;
        }
      }
    }

    if (recs.length === 0) {
      recs.push('Continue routine monitoring — vendor performance is within acceptable thresholds');
    }

    return recs;
  }
}

export const vendorRiskEngine = new VendorRiskEngine();
