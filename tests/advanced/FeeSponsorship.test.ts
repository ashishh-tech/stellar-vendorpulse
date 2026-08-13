import { describe, it, expect, beforeEach } from 'vitest';
import { FeeSponsorshipService } from '@/features/advanced/fee-sponsorship/service';

describe('FeeSponsorshipService', () => {
  let service: FeeSponsorshipService;

  beforeEach(() => {
    service = new FeeSponsorshipService({
      sponsorAddress: 'GBTESTSPONSORACCOUNT1234567890STEL',
      maxBaseFeeInStroops: 25000,
      isEnabled: true,
      sponsoredTxTypes: ['register_vendor', 'submit_review'],
    });
  });

  it('calculates accurate quotes for eligible actions', () => {
    const quote = service.calculateQuote('register_vendor', 10000);
    expect(quote.isEligible).toBe(true);
    expect(quote.sponsoredFeeInStroops).toBe(10000);
    expect(quote.sponsorAccount).toBe('GBTESTSPONSORACCOUNT1234567890STEL');
    expect(quote.savingsUsd).toBeGreaterThan(0);
  });

  it('caps sponsorship fees at maxBaseFeeInStroops', () => {
    const quote = service.calculateQuote('submit_review', 50000);
    expect(quote.sponsoredFeeInStroops).toBe(25000);
  });

  it('rejects unsupported transaction types from sponsorship', () => {
    const quote = service.calculateQuote('arbitrary_external_call', 10000);
    expect(quote.isEligible).toBe(false);
    expect(quote.sponsoredFeeInStroops).toBe(0);
  });

  it('successfully wraps and sponsors an eligible transaction', async () => {
    const result = await service.wrapAndSponsorTransaction(
      'AAAAAG...',
      'register_vendor',
      'GUSERWALLET123'
    );

    expect(result.status).toBe('SUCCESS');
    expect(result.feeBumpTxHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(result.feePaidInXlm).toBe(0.001); // 10000 stroops = 0.001 XLM
    expect(service.getSponsorshipHistory()).toHaveLength(1);
    expect(service.getTotalSponsoredXlm()).toBe(0.001);
  });

  it('throws error when sponsorship is disabled', async () => {
    const disabledService = new FeeSponsorshipService({ isEnabled: false });
    await expect(
      disabledService.wrapAndSponsorTransaction('AAAAAG...', 'register_vendor', 'GUSER123')
    ).rejects.toThrow('Fee sponsorship is currently disabled');
  });
});
