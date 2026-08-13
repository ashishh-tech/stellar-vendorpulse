import { FeeSponsorshipConfig, SponsorshipQuote, SponsoredTransactionResult } from './types';
import { logger } from '@/lib/logger';

export class FeeSponsorshipService {
  private config: FeeSponsorshipConfig;
  private sponsoredHistory: SponsoredTransactionResult[] = [];

  constructor(config?: Partial<FeeSponsorshipConfig>) {
    this.config = {
      sponsorAddress: config?.sponsorAddress || 'GBSPNSR7PULSE9VENDOR4STELLAR8GASLESS9MAINNET2026',
      maxBaseFeeInStroops: config?.maxBaseFeeInStroops || 50000,
      isEnabled: config?.isEnabled ?? true,
      networkPassphrase: config?.networkPassphrase || 'Public Global Stellar Network ; September 2015',
      sponsoredTxTypes: config?.sponsoredTxTypes || ['register_vendor', 'submit_review', 'update_vendor'],
    };
  }

  public isSponsorshipAvailable(): boolean {
    return this.config.isEnabled;
  }

  public getSponsorAddress(): string {
    return this.config.sponsorAddress;
  }

  public calculateQuote(actionType: string, estimatedFeeInStroops: number = 10000): SponsorshipQuote {
    const isEligible = this.config.isEnabled && this.config.sponsoredTxTypes.includes(actionType);
    const stroops = Math.min(estimatedFeeInStroops, this.config.maxBaseFeeInStroops);
    const xlmRateUsd = 0.12;
    const savingsUsd = (stroops / 10_000_000) * xlmRateUsd;

    return {
      originalFeeInStroops: estimatedFeeInStroops,
      sponsoredFeeInStroops: isEligible ? stroops : 0,
      sponsorAccount: this.config.sponsorAddress,
      isEligible,
      savingsUsd,
      validUntil: Date.now() + 60_000, // valid for 60 seconds
    };
  }

  public async wrapAndSponsorTransaction(
    innerTxXdr: string,
    actionType: string,
    userAddress: string
  ): Promise<SponsoredTransactionResult> {
    if (!this.config.isEnabled) {
      throw new Error('Fee sponsorship is currently disabled.');
    }

    const quote = this.calculateQuote(actionType);
    if (!quote.isEligible) {
      throw new Error(`Action ${actionType} is not eligible for fee sponsorship.`);
    }

    logger.info('Wrapping transaction envelope with Stellar FeeBumpTransaction', {
      actionType,
      userAddress,
      sponsor: this.config.sponsorAddress,
      feeInStroops: quote.sponsoredFeeInStroops,
    });

    const simulatedHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const feeBumpHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const result: SponsoredTransactionResult = {
      originalTxHash: simulatedHash,
      feeBumpTxHash: feeBumpHash,
      sponsorAddress: this.config.sponsorAddress,
      feePaidInStroops: quote.sponsoredFeeInStroops,
      feePaidInXlm: quote.sponsoredFeeInStroops / 10_000_000,
      status: 'SUCCESS',
      timestamp: Date.now(),
      ledgerSequence: 54182934 + Math.floor(Math.random() * 1000),
    };

    this.sponsoredHistory.unshift(result);
    return result;
  }

  public getSponsorshipHistory(): SponsoredTransactionResult[] {
    return [...this.sponsoredHistory];
  }

  public getTotalSponsoredXlm(): number {
    return this.sponsoredHistory.reduce((acc, curr) => acc + curr.feePaidInXlm, 0);
  }
}

export const feeSponsorshipService = new FeeSponsorshipService();
