export type TransactionStatus = 'pending' | 'processing' | 'confirmed' | 'failed';

export interface TransactionRecord {
  id: string; // unique internal tracking id
  hash?: string;
  contractName: 'VendorRegistry' | 'ReviewSystem';
  methodName: string;
  params: Record<string, any>;
  status: TransactionStatus;
  errorMessage?: string;
  submittedAt: number;
  confirmedAt?: number;
  retryCount: number;
}
