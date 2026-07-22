export interface ContractEvent {
  id: string;
  contractId: string;
  topic: string[];
  data: any;
  ledger: number;
  ledgerClosedAt: string;
  txHash: string;
  type: 'vendor_registered' | 'vendor_updated' | 'status_changed' | 'review_submitted' | 'score_updated' | 'unknown';
}
