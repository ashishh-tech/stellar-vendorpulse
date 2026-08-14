export type SupportedCurrency = 'USD' | 'EUR' | 'BRL' | 'NGN' | 'INR' | 'USDC' | 'EURC' | 'XLM';

export interface AnchorQuoteRequest {
  fromAsset: SupportedCurrency;
  toAsset: SupportedCurrency;
  amount: number;
  vendorAddress: string;
}

export interface AnchorQuoteResponse {
  quoteId: string;
  fromAsset: SupportedCurrency;
  toAsset: SupportedCurrency;
  inputAmount: number;
  outputAmount: number;
  exchangeRate: number;
  feeAmount: number;
  estimatedDeliverySeconds: number;
  sepProtocol: 'SEP-24' | 'SEP-31';
  anchorName: string;
  anchorDomain: string;
  expiresAt: number;
}

export interface CrossBorderPayoutRecord {
  payoutId: string;
  vendorId: number;
  vendorName: string;
  quote: AnchorQuoteResponse;
  status: 'QUOTE_LOCKED' | 'PENDING_ANCHOR' | 'SETTLED' | 'REFUNDED';
  stellarTxHash?: string;
  fiatReferenceNumber?: string;
  createdAt: number;
  completedAt?: number;
}
