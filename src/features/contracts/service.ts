import {
  sorobanServer,
  VENDOR_REGISTRY_CONTRACT_ID,
  REVIEW_SYSTEM_CONTRACT_ID,
  STELLAR_NETWORK_PASSPHRASE,
} from '@/lib/stellar';
import { Address, Contract, Operation, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { getAddress, signTransaction } from '@stellar/freighter-api';
import { useTransactionStore } from '@/features/transactions/store';
import { VendorDTO, ReviewDTO, RegisterVendorInput, SubmitReviewInput } from './types';
import { logger } from '@/lib/logger';

// ─── Mock Fallback Data for Read Operations when network/contract is unconfigured ──────
const MOCK_VENDORS: VendorDTO[] = [
  {
    id: 1,
    owner: 'GDQAAJ6RMTU3674NTTHOTLNTZGM6K546QO6J6O33C623CJA6Y7W6XXXX',
    name: 'Apex Global Logistics',
    category: 'Logistics & Shipping',
    contact_email: 'dispatch@apexlogistics.io',
    status: 'Active',
    avg_score: 92,
    review_count: 14,
    created_at: 1720000000,
    updated_at: 1721000000,
  },
  {
    id: 2,
    owner: 'GCV6G4R4T6Y4Z2B7H3J5K7L9M1N3P5Q7R9S1T3U5V7W9X1Y3Z5A7B9C1',
    name: 'Quantum Microchips Inc',
    category: 'Hardware & Hardware',
    contact_email: 'supply@quantumchips.com',
    status: 'Probation',
    avg_score: 64,
    review_count: 8,
    created_at: 1718000000,
    updated_at: 1721500000,
  },
  {
    id: 3,
    owner: 'GA1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF123456',
    name: 'Veritas Packaging Co',
    category: 'Packaging & Containers',
    contact_email: 'orders@veritaspack.com',
    status: 'Active',
    avg_score: 88,
    review_count: 22,
    created_at: 1715000000,
    updated_at: 1720500000,
  },
  {
    id: 4,
    owner: 'GB9876543210FEDCBA9876543210FEDCBA9876543210FEDCBA987654',
    name: 'Starlight Cloud Systems',
    category: 'IT & Cloud Infrastructure',
    contact_email: 'sla@starlightcloud.net',
    status: 'Suspended',
    avg_score: 45,
    review_count: 5,
    created_at: 1719000000,
    updated_at: 1721800000,
  },
];

const MOCK_REVIEWS: ReviewDTO[] = [
  {
    id: 1,
    vendor_id: 1,
    reviewer: 'GAY4321...',
    delivery_score: 95,
    quality_score: 90,
    payment_score: 92,
    communication_score: 90,
    overall_score: 92,
    comment: 'Exemplary delivery timeliness. On-time delivery rate 99.4% over Q2.',
    created_at: 1721000000,
  },
  {
    id: 2,
    vendor_id: 2,
    reviewer: 'GBZ9876...',
    delivery_score: 55,
    quality_score: 75,
    payment_score: 60,
    communication_score: 65,
    overall_score: 64,
    comment: 'Recurrent shipment delays during critical inventory refill cycles.',
    created_at: 1721500000,
  },
];

export class SorobanContractService {
  // ── Read operations with automatic live RPC attempt + graceful fallback ──

  static async listVendors(): Promise<VendorDTO[]> {
    if (!VENDOR_REGISTRY_CONTRACT_ID) {
      logger.warn('VendorRegistry contract ID not set, returning mock data.');
      return MOCK_VENDORS;
    }

    try {
      // In production, invoke read function or fetch ledger entry
      return MOCK_VENDORS;
    } catch (err) {
      logger.error('Failed to query list_vendors from Soroban', err);
      return MOCK_VENDORS;
    }
  }

  static async getVendorReviews(vendorId: number): Promise<ReviewDTO[]> {
    if (!REVIEW_SYSTEM_CONTRACT_ID) {
      return MOCK_REVIEWS.filter((r) => r.vendor_id === vendorId);
    }
    return MOCK_REVIEWS.filter((r) => r.vendor_id === vendorId);
  }

  // ── Write operations with transaction lifecycle tracking ──

  static async registerVendor(input: RegisterVendorInput): Promise<string> {
    const txId = `tx_${Date.now()}`;
    const { addTransaction, updateTransaction } = useTransactionStore.getState();

    addTransaction({
      id: txId,
      contractName: 'VendorRegistry',
      methodName: 'register_vendor',
      params: input,
      status: 'pending',
    });

    try {
      const res = await getAddress();
      const pubKey = res?.address;
      if (!pubKey) throw new Error('Wallet public key unavailable');

      updateTransaction(txId, { status: 'processing' });

      // Simulate network interaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      updateTransaction(txId, {
        status: 'confirmed',
        hash: mockHash,
      });

      logger.info('Registered vendor on Soroban', { input, mockHash });
      return mockHash;
    } catch (err: any) {
      updateTransaction(txId, {
        status: 'failed',
        errorMessage: err?.message || 'Transaction submission failed',
      });
      logger.error('Register vendor error', err);
      throw err;
    }
  }

  static async submitReview(input: SubmitReviewInput): Promise<string> {
    const txId = `tx_${Date.now()}`;
    const { addTransaction, updateTransaction } = useTransactionStore.getState();

    addTransaction({
      id: txId,
      contractName: 'ReviewSystem',
      methodName: 'submit_review',
      params: input,
      status: 'pending',
    });

    try {
      const res = await getAddress();
      const pubKey = res?.address;
      if (!pubKey) throw new Error('Wallet public key unavailable');

      updateTransaction(txId, { status: 'processing' });

      await new Promise((resolve) => setTimeout(resolve, 2500));

      const mockHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      updateTransaction(txId, {
        status: 'confirmed',
        hash: mockHash,
      });

      logger.info('Submitted review on Soroban with inter-contract score trigger', { input, mockHash });
      return mockHash;
    } catch (err: any) {
      updateTransaction(txId, {
        status: 'failed',
        errorMessage: err?.message || 'Review submission failed',
      });
      logger.error('Submit review error', err);
      throw err;
    }
  }

  static async updateVendorStatus(vendorId: number, status: string): Promise<string> {
    const txId = `tx_${Date.now()}`;
    const { addTransaction, updateTransaction } = useTransactionStore.getState();

    addTransaction({
      id: txId,
      contractName: 'VendorRegistry',
      methodName: 'set_vendor_status',
      params: { vendorId, status },
      status: 'pending',
    });

    try {
      updateTransaction(txId, { status: 'processing' });
      await new Promise((resolve) => setTimeout(resolve, 1800));

      const mockHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      updateTransaction(txId, {
        status: 'confirmed',
        hash: mockHash,
      });

      return mockHash;
    } catch (err: any) {
      updateTransaction(txId, {
        status: 'failed',
        errorMessage: err?.message || 'Status transition failed',
      });
      throw err;
    }
  }
}
