import { describe, it, expect, beforeEach } from 'vitest';
import { CrossBorderFlowService } from '@/features/advanced/cross-border/service';

describe('CrossBorderFlowService', () => {
  let service: CrossBorderFlowService;

  beforeEach(() => {
    service = new CrossBorderFlowService();
  });

  it('calculates real-time exchange rates correctly', () => {
    expect(service.getExchangeRate('USDC', 'EUR')).toBe(0.92);
    expect(service.getExchangeRate('USDC', 'BRL')).toBe(5.45);
    expect(service.getExchangeRate('USDC', 'USDC')).toBe(1.0);
  });

  it('generates accurate SEP-31 anchor payment quotes with net fees', () => {
    const quote = service.requestAnchorQuote({
      fromAsset: 'USDC',
      toAsset: 'EUR',
      amount: 10000,
      vendorAddress: 'GBVENDOR123',
    });

    expect(quote.quoteId).toContain('USDC-EUR');
    expect(quote.feeAmount).toBe(40); // 0.4% of 10,000 = 40
    expect(quote.outputAmount).toBe(9163.2); // (10000 - 40) * 0.92 = 9163.2
    expect(quote.sepProtocol).toBe('SEP-31');
    expect(quote.expiresAt).toBeGreaterThan(Date.now());
  });

  it('executes cross-border payout and tracks settlement history', async () => {
    const quote = service.requestAnchorQuote({
      fromAsset: 'USDC',
      toAsset: 'BRL',
      amount: 5000,
      vendorAddress: 'GBBRAZILVENDOR999',
    });

    const payout = await service.executeCrossBorderPayout(2, 'São Paulo Industrial S.A.', quote);

    expect(payout.status).toBe('SETTLED');
    expect(payout.stellarTxHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(payout.fiatReferenceNumber).toContain('ANCHOR-TX-');
    expect(service.getPayoutHistory().length).toBeGreaterThanOrEqual(2);
  });
});
