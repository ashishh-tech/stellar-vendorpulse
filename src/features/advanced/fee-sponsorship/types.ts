export interface FeeSponsorshipConfig {
  sponsorAddress: string;
  maxBaseFeeInStroops: number;
  isEnabled: boolean;
  networkPassphrase: string;
  sponsoredTxTypes: string[];
}

export interface SponsorshipQuote {
  originalFeeInStroops: number;
  sponsoredFeeInStroops: number;
  sponsorAccount: string;
  isEligible: boolean;
  savingsUsd: number;
  validUntil: number;
}

export interface SponsoredTransactionResult {
  originalTxHash: string;
  feeBumpTxHash: string;
  sponsorAddress: string;
  feePaidInStroops: number;
  feePaidInXlm: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  timestamp: number;
  ledgerSequence?: number;
}
