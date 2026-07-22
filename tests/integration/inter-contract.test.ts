import { describe, it, expect } from 'vitest';
import { SorobanContractService } from '@/features/contracts/service';

describe('Inter-Contract Communication Flow Integration Test', () => {
  it('fetches vendor list from contract service', async () => {
    const vendors = await SorobanContractService.listVendors();
    expect(vendors.length).toBeGreaterThan(0);
    expect(vendors[0]).toHaveProperty('id');
    expect(vendors[0]).toHaveProperty('avg_score');
  });

  it('triggers register vendor transaction lifecycle', async () => {
    const hash = await SorobanContractService.registerVendor({
      name: 'Integration Vendor Inc',
      category: 'Logistics & Shipping',
      contactEmail: 'integration@test.com',
    });
    expect(hash).toMatch(/^0x[a-f0-9]{64}$/i);
  });

  it('triggers review submission with inter-contract score calculation', async () => {
    const hash = await SorobanContractService.submitReview({
      vendorId: 1,
      deliveryScore: 90,
      qualityScore: 95,
      paymentScore: 88,
      communicationScore: 92,
      comment: 'Integration test automated review submission',
    });
    expect(hash).toMatch(/^0x[a-f0-9]{64}$/i);
  });
});
