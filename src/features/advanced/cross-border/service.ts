import {
  SupportedCurrency,
  AnchorQuoteRequest,
  AnchorQuoteResponse,
  CrossBorderPayoutRecord,
} from './types';
import { logger } from '@/lib/logger';

export class CrossBorderFlowService {
  private payoutHistory: CrossBorderPayoutRecord[] = [];

  private exchangeRates: Record<string, number> = {
    'USDC:EUR': 0.92,
    'USDC:BRL': 5.45,
    'USDC:NGN': 1580.0,
    'USDC:INR': 83.5,
    'EURC:USD': 1.08,
    'XLM:USDC': 0.12,
    'XLM:EUR': 0.11,
  };

  constructor() {
    this.seedDefaultPayouts();
  }

  private seedDefaultPayouts(): void {
    this.payoutHistory = [
      {
        payoutId: 'CBP-8901',
        vendorId: 1,
        vendorName: 'Apex Logistics Global Ltd',
        quote: {
          quoteId: 'QTE-4891-USDC-EUR',
          fromAsset: 'USDC',
          toAsset: 'EUR',
          inputAmount: 15000,
          outputAmount: 13740,
          exchangeRate: 0.92,
          feeAmount: 60,
          estimatedDeliverySeconds: 120,
          sepProtocol: 'SEP-31',
          anchorName: 'Anchain Europe B.V.',
          anchorDomain: 'anchain.eu',
          expiresAt: Date.now() + 3600000,
        },
        status: 'SETTLED',
        stellarTxHash: '0x8f2a1b4c6e8d0f1a3c5e7b9d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a',
        fiatReferenceNumber: 'SEPA-REF-9081234',
        createdAt: 1723520000000,
        completedAt: 1723520120000,
      },
    ];
  }

  public getExchangeRate(from: SupportedCurrency, to: SupportedCurrency): number {
    if (from === to) return 1.0;
    const pair = `${from}:${to}`;
    if (this.exchangeRates[pair]) return this.exchangeRates[pair];
    const inverse = `${to}:${from}`;
    if (this.exchangeRates[inverse]) return 1 / this.exchangeRates[inverse];
    return 1.0;
  }

  public requestAnchorQuote(request: AnchorQuoteRequest): AnchorQuoteResponse {
    const rate = this.getExchangeRate(request.fromAsset, request.toAsset);
    const feeRate = 0.004; // 0.4% anchor rail fee
    const feeAmount = request.amount * feeRate;
    const netInput = request.amount - feeAmount;
    const outputAmount = Number((netInput * rate).toFixed(2));

    const quote: AnchorQuoteResponse = {
      quoteId: `QTE-${Math.floor(1000 + Math.random() * 9000)}-${request.fromAsset}-${request.toAsset}`,
      fromAsset: request.fromAsset,
      toAsset: request.toAsset,
      inputAmount: request.amount,
      outputAmount,
      exchangeRate: rate,
      feeAmount: Number(feeAmount.toFixed(2)),
      estimatedDeliverySeconds: 90,
      sepProtocol: ['EUR', 'BRL', 'NGN', 'INR'].includes(request.toAsset) ? 'SEP-31' : 'SEP-24',
      anchorName: 'Stellar Global Anchor Network',
      anchorDomain: 'anchor.stellar.org',
      expiresAt: Date.now() + 600_000, // 10 minutes lock
    };

    logger.info('Generated SEP anchor cross-border payment quote', {
      quoteId: quote.quoteId,
      pair: `${request.fromAsset}->${request.toAsset}`,
      amount: request.amount,
      output: quote.outputAmount,
    });

    return quote;
  }

  public async executeCrossBorderPayout(
    vendorId: number,
    vendorName: string,
    quote: AnchorQuoteResponse
  ): Promise<CrossBorderPayoutRecord> {
    const payout: CrossBorderPayoutRecord = {
      payoutId: `CBP-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorId,
      vendorName,
      quote,
      status: 'SETTLED',
      stellarTxHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      fiatReferenceNumber: `ANCHOR-TX-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: Date.now(),
      completedAt: Date.now() + 1500,
    };

    this.payoutHistory.unshift(payout);
    logger.info('Executed SEP-31 cross-border payout to supplier', {
      payoutId: payout.payoutId,
      vendorId,
      stellarTxHash: payout.stellarTxHash,
    });

    return payout;
  }

  public getPayoutHistory(): CrossBorderPayoutRecord[] {
    return [...this.payoutHistory];
  }
}

export const crossBorderFlowService = new CrossBorderFlowService();
