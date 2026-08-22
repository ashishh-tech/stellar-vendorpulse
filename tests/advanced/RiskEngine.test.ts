import { describe, it, expect } from 'vitest';
import { VendorRiskEngine } from '@/features/analytics/risk-engine/service';
import { VendorDTO, ReviewDTO } from '@/features/contracts/types';

describe('VendorRiskEngine', () => {
  const engine = new VendorRiskEngine();

  const mockVendorHighRisk: VendorDTO = {
    id: 1,
    owner: 'GDQAAJ6RMTU3674NTTHOTLNTZGM6K546QO6J6O33C623CJA6Y7W6XXXX',
    name: 'At-Risk Supplier Inc',
    category: 'Logistics',
    contact_email: 'risk@supplier.io',
    status: 'Suspended',
    avg_score: 35,
    review_count: 3,
    created_at: 1720000000,
    updated_at: 1721000000,
  };

  const mockVendorLowRisk: VendorDTO = {
    id: 2,
    owner: 'GCLOWRISK1234567890STEL',
    name: 'Top Tier Logistics',
    category: 'Logistics',
    contact_email: 'ops@toptier.com',
    status: 'Active',
    avg_score: 95,
    review_count: 20,
    created_at: 1715000000,
    updated_at: 1721000000,
  };

  const mockReviews: ReviewDTO[] = [
    {
      id: 101,
      vendor_id: 1,
      reviewer: 'GREVIEWER1',
      delivery_score: 30,
      quality_score: 40,
      payment_score: 35,
      communication_score: 35,
      overall_score: 35,
      comment: 'Constant late deliveries and quality defects',
      created_at: 1721000000,
    },
    {
      id: 102,
      vendor_id: 1,
      reviewer: 'GREVIEWER2',
      delivery_score: 25,
      quality_score: 45,
      payment_score: 30,
      communication_score: 40,
      overall_score: 35,
      comment: 'Unresponsive to SLA escalation emails',
      created_at: 1721500000,
    },
  ];

  it('correctly assesses a high-risk vendor with elevated composite score', () => {
    const assessment = engine.assess(mockVendorHighRisk, mockReviews);
    expect(assessment.vendorId).toBe(1);
    expect(assessment.compositeRiskScore).toBeGreaterThan(50);
    expect(['HIGH', 'CRITICAL']).toContain(assessment.tier);
    expect(assessment.factors.length).toBe(6);
    expect(assessment.recommendations.length).toBeGreaterThan(0);
  });

  it('correctly assesses a low-risk vendor with low composite score', () => {
    const assessment = engine.assess(mockVendorLowRisk, []);
    expect(assessment.vendorId).toBe(2);
    expect(assessment.compositeRiskScore).toBeLessThan(35);
    expect(['LOW', 'MEDIUM']).toContain(assessment.tier);
  });

  it('evaluates batch assessments and sorts highest risk first', () => {
    const reviewMap = new Map<number, ReviewDTO[]>();
    reviewMap.set(1, mockReviews);
    reviewMap.set(2, []);

    const all = engine.assessAll([mockVendorLowRisk, mockVendorHighRisk], reviewMap);
    expect(all).toHaveLength(2);
    expect(all[0].vendorId).toBe(1); // Higher risk first
    expect(all[1].vendorId).toBe(2);
  });

  it('computes factor breakdowns across all 4 core pillars plus volatility and volume', () => {
    const assessment = engine.assess(mockVendorHighRisk, mockReviews);
    const factorNames = assessment.factors.map((f) => f.name);
    expect(factorNames).toContain('Delivery Reliability');
    expect(factorNames).toContain('Quality Deficiency');
    expect(factorNames).toContain('Payment Compliance Risk');
    expect(factorNames).toContain('Communication Reliability');
    expect(factorNames).toContain('Performance Volatility');
    expect(factorNames).toContain('Assessment Confidence');
  });
});
