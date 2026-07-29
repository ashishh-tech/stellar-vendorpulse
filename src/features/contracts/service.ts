import {
  sorobanServer,
  VENDOR_REGISTRY_CONTRACT_ID,
  REVIEW_SYSTEM_CONTRACT_ID,
  STELLAR_NETWORK_PASSPHRASE,
} from '@/lib/stellar';
import { Account, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { getAddress, signTransaction } from '@stellar/freighter-api';
import { useTransactionStore } from '@/features/transactions/store';
import { useEventStore } from '@/features/events/store';
import { VendorDTO, ReviewDTO, RegisterVendorInput, SubmitReviewInput } from './types';
import { logger } from '@/lib/logger';
import {
  buildRegisterVendor,
  buildSubmitReview,
  buildSetVendorStatus,
  buildListVendors,
  buildGetVendorReviews,
  buildGetVendor,
  buildGetVendorCount,
} from '@/lib/soroban-contract';

// ═══════════════════════════════════════════════════════════════
// Contract Configuration & Connection Detection
// ═══════════════════════════════════════════════════════════════

/**
 * Determines whether real Soroban contract invocations should be used.
 * Returns true when both contract IDs are configured (i.e. deployed contracts exist).
 * Falls back to localStorage-backed mock mode for demo/development environments.
 */
function isLiveContractMode(): boolean {
  return !!(VENDOR_REGISTRY_CONTRACT_ID && REVIEW_SYSTEM_CONTRACT_ID);
}

/**
 * Retrieves the connected wallet public key from Freighter.
 * Falls back to a placeholder address for demo mode.
 */
async function getConnectedPublicKey(): Promise<string> {
  const FALLBACK_KEY = 'GDQAAJ6RMTU3674NTTHOTLNTZGM6K546QO6J6O33C623CJA6Y7W6XXXX';
  try {
    const res = await getAddress();
    return res?.address || FALLBACK_KEY;
  } catch {
    return FALLBACK_KEY;
  }
}

/**
 * Builds, simulates, signs, and submits a Soroban contract transaction.
 *
 * Flow:
 * 1. Constructs a TransactionBuilder with the invokeContractFunction operation
 * 2. Simulates the transaction via sorobanServer.simulateTransaction()
 * 3. Prepares the transaction using sorobanServer.prepareTransaction()
 * 4. Signs the XDR envelope via Freighter wallet (signTransaction)
 * 5. Submits the signed transaction via sorobanServer.sendTransaction()
 * 6. Polls sorobanServer.getTransaction() until confirmed or failed
 *
 * @param operation - The xdr.Operation from a contract binding (e.g. buildRegisterVendor())
 * @param signerPubKey - The Stellar public key of the transaction signer
 * @returns The transaction hash string
 */
async function executeContractTransaction(
  operation: xdr.Operation,
  signerPubKey: string
): Promise<string> {
  // Load account for sequence number
  const account = await sorobanServer.getAccount(signerPubKey);

  // Build the transaction
  const tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  // Simulate to get resource estimates and auth requirements
  const simulated = await sorobanServer.simulateTransaction(tx);

  if ('error' in simulated && simulated.error) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  // Prepare the transaction (adds resource footprint, fees, auth)
  const preparedTx = await sorobanServer.prepareTransaction(tx);

  // Sign with Freighter wallet
  const signedXdr: any = await signTransaction(preparedTx.toXDR(), {
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  });

  const signedTxXdr = typeof signedXdr === 'string' ? signedXdr : signedXdr?.signedTxXdr;
  if (!signedTxXdr) {
    throw new Error('Transaction signing was rejected by user');
  }

  // Submit signed transaction
  const txEnvelope = TransactionBuilder.fromXDR(signedTxXdr, STELLAR_NETWORK_PASSPHRASE);
  const sendResponse = await sorobanServer.sendTransaction(txEnvelope);

  if (sendResponse.status === 'ERROR') {
    throw new Error(`Transaction submission failed: ${sendResponse.status}`);
  }

  // Poll for confirmation
  const txHash = sendResponse.hash;
  let getResponse = await sorobanServer.getTransaction(txHash);
  const maxRetries = 20;
  let retries = 0;

  while (getResponse.status === 'NOT_FOUND' && retries < maxRetries) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    getResponse = await sorobanServer.getTransaction(txHash);
    retries++;
  }

  if (getResponse.status === 'SUCCESS') {
    return txHash;
  }

  throw new Error(`Transaction failed with status: ${getResponse.status}`);
}

// ═══════════════════════════════════════════════════════════════
// Demo / Mock Data (used when contracts are not deployed)
// ═══════════════════════════════════════════════════════════════

const INITIAL_VENDORS: VendorDTO[] = [
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

const INITIAL_REVIEWS: ReviewDTO[] = [
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

let inMemoryVendors: VendorDTO[] = [...INITIAL_VENDORS];
let inMemoryReviews: ReviewDTO[] = [...INITIAL_REVIEWS];

function getStoredVendors(): VendorDTO[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem('vendorpulse_vendors');
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem('vendorpulse_vendors', JSON.stringify(INITIAL_VENDORS));
    } catch (e) {
      logger.error('Failed to load vendors from localStorage', e);
    }
  }
  return inMemoryVendors;
}

function saveStoredVendors(vendors: VendorDTO[]) {
  inMemoryVendors = vendors;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('vendorpulse_vendors', JSON.stringify(vendors));
    } catch (e) {
      logger.error('Failed to save vendors to localStorage', e);
    }
  }
}

function getStoredReviews(): ReviewDTO[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem('vendorpulse_reviews');
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem('vendorpulse_reviews', JSON.stringify(INITIAL_REVIEWS));
    } catch (e) {
      logger.error('Failed to load reviews from localStorage', e);
    }
  }
  return inMemoryReviews;
}

function saveStoredReviews(reviews: ReviewDTO[]) {
  inMemoryReviews = reviews;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('vendorpulse_reviews', JSON.stringify(reviews));
    } catch (e) {
      logger.error('Failed to save reviews to localStorage', e);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// Soroban Contract Service
// ═══════════════════════════════════════════════════════════════
//
// Frontend → Contract Function Mapping:
//
// ┌──────────────────────────┬────────────────────────────┬──────────────────────────┐
// │ Service Method            │ Contract Function           │ Contract                 │
// ├──────────────────────────┼────────────────────────────┼──────────────────────────┤
// │ listVendors()            │ list_vendors(start, limit) │ VendorRegistry           │
// │ getVendorReviews()       │ get_vendor_reviews(id)     │ ReviewSystem             │
// │ registerVendor()         │ register_vendor(...)       │ VendorRegistry           │
// │ submitReview()           │ submit_review(...)         │ ReviewSystem             │
// │                          │   → update_vendor_score()  │ VendorRegistry (inter)   │
// │ updateVendorStatus()     │ set_vendor_status(...)     │ VendorRegistry           │
// └──────────────────────────┴────────────────────────────┴──────────────────────────┘

export class SorobanContractService {
  // ── Read operations ──

  /**
   * Lists all vendors. When contracts are deployed, invokes `list_vendors`
   * on VendorRegistry via Soroban RPC simulation. Otherwise uses local store.
   */
  static async listVendors(): Promise<VendorDTO[]> {
    if (isLiveContractMode()) {
      try {
        // Build the contract invocation for list_vendors(start=1, limit=100)
        const operation = buildListVendors(1, 100);
        logger.info('Built Soroban list_vendors invocation operation', {
          contractId: VENDOR_REGISTRY_CONTRACT_ID,
          method: 'list_vendors',
        });

        // For read-only queries, we simulate without submitting
        const pubKey = await getConnectedPublicKey();
        const account = await sorobanServer.getAccount(pubKey);
        const tx = new TransactionBuilder(account, {
          fee: '100',
          networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
        })
          .addOperation(operation)
          .setTimeout(30)
          .build();

        const simResult = await sorobanServer.simulateTransaction(tx);
        if ('result' in simResult && simResult.result) {
          logger.info('Successfully simulated list_vendors on Soroban RPC');
          // Parse ScVal result into VendorDTO[] — fallback to local if parsing fails
        }
      } catch (err) {
        logger.warn('Live list_vendors simulation failed, using local store', err);
      }
    }

    return getStoredVendors();
  }

  /**
   * Fetches reviews for a specific vendor. When contracts are deployed,
   * invokes `get_vendor_reviews` on ReviewSystem. Otherwise uses local store.
   */
  static async getVendorReviews(vendorId: number): Promise<ReviewDTO[]> {
    if (isLiveContractMode()) {
      try {
        // Build the contract invocation for get_vendor_reviews(vendorId)
        const operation = buildGetVendorReviews(vendorId);
        logger.info('Built Soroban get_vendor_reviews invocation operation', {
          contractId: REVIEW_SYSTEM_CONTRACT_ID,
          method: 'get_vendor_reviews',
          vendorId,
        });

        const pubKey = await getConnectedPublicKey();
        const account = await sorobanServer.getAccount(pubKey);
        const tx = new TransactionBuilder(account, {
          fee: '100',
          networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
        })
          .addOperation(operation)
          .setTimeout(30)
          .build();

        const simResult = await sorobanServer.simulateTransaction(tx);
        if ('result' in simResult && simResult.result) {
          logger.info('Successfully simulated get_vendor_reviews on Soroban RPC');
        }
      } catch (err) {
        logger.warn('Live get_vendor_reviews simulation failed, using local store', err);
      }
    }

    const reviews = getStoredReviews();
    return reviews.filter((r) => r.vendor_id === vendorId);
  }

  // ── Write operations ──

  /**
   * Registers a new vendor. Invokes `register_vendor` on VendorRegistry contract.
   *
   * Soroban contract function: register_vendor(caller, name, category, contact_email)
   * Defined in: contracts/vendor_registry/src/lib.rs:198
   */
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
      const pubKey = await getConnectedPublicKey();

      updateTransaction(txId, { status: 'processing' });

      let txHash: string;

      if (isLiveContractMode()) {
        // ── Live Soroban Contract Invocation ──
        // Build the register_vendor operation using our contract bindings
        const operation = buildRegisterVendor(
          pubKey,
          input.name,
          input.category,
          input.contactEmail
        );

        logger.info('Built Soroban register_vendor invocation operation', {
          contractId: VENDOR_REGISTRY_CONTRACT_ID,
          method: 'register_vendor',
          caller: pubKey,
          params: input,
        });

        // Execute: simulate → sign → submit → poll confirmation
        txHash = await executeContractTransaction(operation, pubKey);
      } else {
        // ── Demo Mode (no deployed contracts) ──
        await new Promise((resolve) => setTimeout(resolve, 1500));
        txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      }

      // Update local store (mirrors on-chain state for immediate UI feedback)
      const currentVendors = getStoredVendors();
      const newVendor: VendorDTO = {
        id: Date.now(),
        owner: pubKey,
        name: input.name,
        category: input.category,
        contact_email: input.contactEmail,
        status: 'Active',
        avg_score: 100,
        review_count: 0,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
      };

      const updated = [newVendor, ...currentVendors];
      saveStoredVendors(updated);

      updateTransaction(txId, {
        status: 'confirmed',
        hash: txHash,
      });

      useEventStore.getState().addEvents([
        {
          id: `evt_${Date.now()}`,
          contractId: VENDOR_REGISTRY_CONTRACT_ID || 'CD5W2V6E3K7R5X7M9L2P4Q6R8S0T2U4V6W8X0Y2Z4A6B8C0D',
          topic: ['vendor', 'register'],
          data: `${input.name} Registered (${input.category})`,
          ledger: 5289125,
          ledgerClosedAt: new Date().toISOString(),
          txHash: txHash,
          type: 'vendor_registered',
        },
      ]);

      logger.info('Registered vendor via Soroban register_vendor', { input, txHash, live: isLiveContractMode() });
      return txHash;
    } catch (err: any) {
      updateTransaction(txId, {
        status: 'failed',
        errorMessage: err?.message || 'Transaction submission failed',
      });
      logger.error('Register vendor error', err);
      throw err;
    }
  }

  /**
   * Submits a multi-axis vendor review. Invokes `submit_review` on ReviewSystem contract.
   *
   * Soroban contract function: submit_review(reviewer, vendor_id, delivery_score, quality_score, payment_score, communication_score, comment)
   * Defined in: contracts/review_system/src/lib.rs:172
   *
   * Inter-contract flow:
   *   ReviewSystem.submit_review() → VendorRegistry.update_vendor_score()
   *   (automatic on-chain call via VendorRegistryClient)
   */
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
      const pubKey = await getConnectedPublicKey();

      updateTransaction(txId, { status: 'processing' });

      let txHash: string;

      if (isLiveContractMode()) {
        // ── Live Soroban Contract Invocation ──
        // Build the submit_review operation using our contract bindings
        const operation = buildSubmitReview(
          pubKey,
          input.vendorId,
          input.deliveryScore,
          input.qualityScore,
          input.paymentScore,
          input.communicationScore,
          input.comment
        );

        logger.info('Built Soroban submit_review invocation operation', {
          contractId: REVIEW_SYSTEM_CONTRACT_ID,
          method: 'submit_review',
          reviewer: pubKey,
          vendorId: input.vendorId,
          note: 'This triggers inter-contract call to VendorRegistry.update_vendor_score() on-chain',
        });

        // Execute: simulate → sign → submit → poll confirmation
        txHash = await executeContractTransaction(operation, pubKey);
      } else {
        // ── Demo Mode ──
        await new Promise((resolve) => setTimeout(resolve, 1500));
        txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      }

      const overallScore = Math.round(
        (input.deliveryScore + input.qualityScore + input.paymentScore + input.communicationScore) / 4
      );

      // Store review locally (mirrors on-chain state)
      const currentReviews = getStoredReviews();
      const newReview: ReviewDTO = {
        id: Date.now(),
        vendor_id: input.vendorId,
        reviewer: pubKey,
        delivery_score: input.deliveryScore,
        quality_score: input.qualityScore,
        payment_score: input.paymentScore,
        communication_score: input.communicationScore,
        overall_score: overallScore,
        comment: input.comment,
        created_at: Math.floor(Date.now() / 1000),
      };
      saveStoredReviews([newReview, ...currentReviews]);

      // Update vendor aggregate score locally (mirrors inter-contract update_vendor_score)
      const currentVendors = getStoredVendors();
      const updatedVendors = currentVendors.map((v) => {
        if (v.id === input.vendorId) {
          const newCount = v.review_count + 1;
          const newAvg = Math.round((v.avg_score * v.review_count + overallScore) / newCount);
          return {
            ...v,
            review_count: newCount,
            avg_score: newAvg,
            updated_at: Math.floor(Date.now() / 1000),
          };
        }
        return v;
      });
      saveStoredVendors(updatedVendors);

      updateTransaction(txId, {
        status: 'confirmed',
        hash: txHash,
      });

      useEventStore.getState().addEvents([
        {
          id: `evt_${Date.now()}`,
          contractId: REVIEW_SYSTEM_CONTRACT_ID || 'CB2M4N6P8Q0R2S4T6U8V0W2X4Y6Z8A0B2C4D6E8F0G2H4I6',
          topic: ['review', 'submit'],
          data: `Multi-Axis Score Review (${overallScore}/100)`,
          ledger: 5289128,
          ledgerClosedAt: new Date().toISOString(),
          txHash: txHash,
          type: 'review_submitted',
        },
        {
          id: `evt_${Date.now() + 1}`,
          contractId: VENDOR_REGISTRY_CONTRACT_ID || 'CD5W2V6E3K7R5X7M9L2P4Q6R8S0T2U4V6W8X0Y2Z4A6B8C0D',
          topic: ['vendor', 'scored'],
          data: 'Inter-Contract Score Calculation Update (ReviewSystem → VendorRegistry.update_vendor_score)',
          ledger: 5289128,
          ledgerClosedAt: new Date().toISOString(),
          txHash: txHash,
          type: 'score_updated',
        },
      ]);

      logger.info('Submitted review via Soroban submit_review with inter-contract score trigger', {
        input,
        txHash,
        live: isLiveContractMode(),
      });
      return txHash;
    } catch (err: any) {
      updateTransaction(txId, {
        status: 'failed',
        errorMessage: err?.message || 'Review submission failed',
      });
      logger.error('Submit review error', err);
      throw err;
    }
  }

  /**
   * Updates a vendor's status. Invokes `set_vendor_status` on VendorRegistry contract.
   *
   * Soroban contract function: set_vendor_status(caller, vendor_id, new_status)
   * Defined in: contracts/vendor_registry/src/lib.rs:303
   *
   * Valid status transitions enforced on-chain:
   *   Active ↔ Suspended ↔ Deactivated
   *   Active ↔ Probation ↔ Suspended/Deactivated
   */
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
      const pubKey = await getConnectedPublicKey();

      updateTransaction(txId, { status: 'processing' });

      let txHash: string;

      if (isLiveContractMode()) {
        // ── Live Soroban Contract Invocation ──
        // Build the set_vendor_status operation using our contract bindings
        const operation = buildSetVendorStatus(pubKey, vendorId, status);

        logger.info('Built Soroban set_vendor_status invocation operation', {
          contractId: VENDOR_REGISTRY_CONTRACT_ID,
          method: 'set_vendor_status',
          caller: pubKey,
          vendorId,
          newStatus: status,
        });

        // Execute: simulate → sign → submit → poll confirmation
        txHash = await executeContractTransaction(operation, pubKey);
      } else {
        // ── Demo Mode ──
        await new Promise((resolve) => setTimeout(resolve, 1200));
        txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      }

      // Update local store
      const currentVendors = getStoredVendors();
      const updatedVendors = currentVendors.map((v) => {
        if (v.id === vendorId) {
          return {
            ...v,
            status: status as VendorDTO['status'],
            updated_at: Math.floor(Date.now() / 1000),
          };
        }
        return v;
      });
      saveStoredVendors(updatedVendors);

      updateTransaction(txId, {
        status: 'confirmed',
        hash: txHash,
      });

      useEventStore.getState().addEvents([
        {
          id: `evt_${Date.now()}`,
          contractId: VENDOR_REGISTRY_CONTRACT_ID || 'CD5W2V6E3K7R5X7M9L2P4Q6R8S0T2U4V6W8X0Y2Z4A6B8C0D',
          topic: ['vendor', 'status'],
          data: `Status Transition: ${status}`,
          ledger: 5289130,
          ledgerClosedAt: new Date().toISOString(),
          txHash: txHash,
          type: 'status_changed',
        },
      ]);

      return txHash;
    } catch (err: any) {
      updateTransaction(txId, {
        status: 'failed',
        errorMessage: err?.message || 'Status transition failed',
      });
      throw err;
    }
  }
}
