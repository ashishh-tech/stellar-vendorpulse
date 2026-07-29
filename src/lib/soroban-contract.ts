/**
 * ═══════════════════════════════════════════════════════════════
 * Soroban Smart Contract Bindings — Frontend ↔ Contract Function Mapping
 * ═══════════════════════════════════════════════════════════════
 *
 * This module provides explicit TypeScript bindings for every public function
 * defined in the Soroban Rust smart contracts:
 *
 *   - VendorRegistry  (contracts/vendor_registry/src/lib.rs)
 *   - ReviewSystem     (contracts/review_system/src/lib.rs)
 *
 * Each binding constructs a real Soroban contract invocation operation using
 * the Stellar SDK's `Contract.call()`, which maps 1:1 to the on-chain
 * contract method names.
 *
 * Inter-Contract Communication:
 *   ReviewSystem.submit_review() → VendorRegistry.update_vendor_score()
 *   (handled on-chain via VendorRegistryClient in review_system/src/lib.rs)
 */

import {
  Contract,
  Address,
  nativeToScVal,
  xdr,
} from '@stellar/stellar-sdk';

import {
  VENDOR_REGISTRY_CONTRACT_ID,
  REVIEW_SYSTEM_CONTRACT_ID,
} from './stellar';

// ═══════════════════════════════════════════════════════════════
// VendorRegistry Contract Bindings
// Maps to: contracts/vendor_registry/src/lib.rs
// ═══════════════════════════════════════════════════════════════

/**
 * Creates a Contract instance for VendorRegistry.
 * Contract ID sourced from NEXT_PUBLIC_VENDOR_REGISTRY_CONTRACT_ID env var.
 */
export function getVendorRegistryContract(): Contract {
  const contractId = VENDOR_REGISTRY_CONTRACT_ID;
  if (!contractId) {
    throw new Error('VENDOR_REGISTRY_CONTRACT_ID is not configured');
  }
  return new Contract(contractId);
}

/**
 * Build `initialize` invocation operation.
 * Rust signature: pub fn initialize(env: Env, admin: Address) -> Result<(), VendorError>
 */
export function buildInitializeVendorRegistry(admin: string): xdr.Operation {
  const contract = getVendorRegistryContract();
  return contract.call(
    'initialize',
    new Address(admin).toScVal()
  );
}

/**
 * Build `set_review_contract` invocation operation.
 * Rust signature: pub fn set_review_contract(env: Env, caller: Address, review_contract: Address) -> Result<(), VendorError>
 */
export function buildSetReviewContract(caller: string, reviewContractAddress: string): xdr.Operation {
  const contract = getVendorRegistryContract();
  return contract.call(
    'set_review_contract',
    new Address(caller).toScVal(),
    new Address(reviewContractAddress).toScVal()
  );
}

/**
 * Build `register_vendor` invocation operation.
 * Rust signature: pub fn register_vendor(env: Env, caller: Address, name: String, category: String, contact_email: String) -> Result<u64, VendorError>
 */
export function buildRegisterVendor(
  caller: string,
  name: string,
  category: string,
  contactEmail: string
): xdr.Operation {
  const contract = getVendorRegistryContract();
  return contract.call(
    'register_vendor',
    new Address(caller).toScVal(),
    nativeToScVal(name, { type: 'string' }),
    nativeToScVal(category, { type: 'string' }),
    nativeToScVal(contactEmail, { type: 'string' })
  );
}

/**
 * Build `update_vendor` invocation operation.
 * Rust signature: pub fn update_vendor(env: Env, caller: Address, vendor_id: u64, name: Option<String>, category: Option<String>, contact_email: Option<String>) -> Result<(), VendorError>
 */
export function buildUpdateVendor(
  caller: string,
  vendorId: number,
  name?: string,
  category?: string,
  contactEmail?: string
): xdr.Operation {
  const contract = getVendorRegistryContract();
  return contract.call(
    'update_vendor',
    new Address(caller).toScVal(),
    nativeToScVal(vendorId, { type: 'u64' }),
    name ? nativeToScVal(name, { type: 'string' }) : xdr.ScVal.scvVoid(),
    category ? nativeToScVal(category, { type: 'string' }) : xdr.ScVal.scvVoid(),
    contactEmail ? nativeToScVal(contactEmail, { type: 'string' }) : xdr.ScVal.scvVoid()
  );
}

/**
 * Build `set_vendor_status` invocation operation.
 * Rust signature: pub fn set_vendor_status(env: Env, caller: Address, vendor_id: u64, new_status: VendorStatus) -> Result<(), VendorError>
 */
export function buildSetVendorStatus(
  caller: string,
  vendorId: number,
  newStatus: string
): xdr.Operation {
  const contract = getVendorRegistryContract();
  return contract.call(
    'set_vendor_status',
    new Address(caller).toScVal(),
    nativeToScVal(vendorId, { type: 'u64' }),
    nativeToScVal(newStatus, { type: 'string' })
  );
}

/**
 * Build `update_vendor_score` invocation operation.
 * Rust signature: pub fn update_vendor_score(env: Env, vendor_id: u64, new_avg_score: u32, total_reviews: u32) -> Result<(), VendorError>
 * NOTE: This is the inter-contract call entrypoint, invoked by ReviewSystem on-chain.
 */
export function buildUpdateVendorScore(
  vendorId: number,
  newAvgScore: number,
  totalReviews: number
): xdr.Operation {
  const contract = getVendorRegistryContract();
  return contract.call(
    'update_vendor_score',
    nativeToScVal(vendorId, { type: 'u64' }),
    nativeToScVal(newAvgScore, { type: 'u32' }),
    nativeToScVal(totalReviews, { type: 'u32' })
  );
}

/**
 * Build `get_vendor` invocation operation (read-only query).
 * Rust signature: pub fn get_vendor(env: Env, vendor_id: u64) -> Result<Vendor, VendorError>
 */
export function buildGetVendor(vendorId: number): xdr.Operation {
  const contract = getVendorRegistryContract();
  return contract.call(
    'get_vendor',
    nativeToScVal(vendorId, { type: 'u64' })
  );
}

/**
 * Build `get_vendor_by_address` invocation operation (read-only query).
 * Rust signature: pub fn get_vendor_by_address(env: Env, address: Address) -> Result<Vendor, VendorError>
 */
export function buildGetVendorByAddress(address: string): xdr.Operation {
  const contract = getVendorRegistryContract();
  return contract.call(
    'get_vendor_by_address',
    new Address(address).toScVal()
  );
}

/**
 * Build `get_vendor_count` invocation operation (read-only query).
 * Rust signature: pub fn get_vendor_count(env: Env) -> u64
 */
export function buildGetVendorCount(): xdr.Operation {
  const contract = getVendorRegistryContract();
  return contract.call('get_vendor_count');
}

/**
 * Build `list_vendors` invocation operation (read-only query with pagination).
 * Rust signature: pub fn list_vendors(env: Env, start: u64, limit: u64) -> Vec<Vendor>
 */
export function buildListVendors(start: number, limit: number): xdr.Operation {
  const contract = getVendorRegistryContract();
  return contract.call(
    'list_vendors',
    nativeToScVal(start, { type: 'u64' }),
    nativeToScVal(limit, { type: 'u64' })
  );
}

/**
 * Build `grant_role` invocation operation.
 * Rust signature: pub fn grant_role(env: Env, caller: Address, account: Address, role: Role) -> Result<(), VendorError>
 */
export function buildGrantRole(
  caller: string,
  account: string,
  role: string
): xdr.Operation {
  const contract = getVendorRegistryContract();
  return contract.call(
    'grant_role',
    new Address(caller).toScVal(),
    new Address(account).toScVal(),
    nativeToScVal(role, { type: 'string' })
  );
}

/**
 * Build `revoke_role` invocation operation.
 * Rust signature: pub fn revoke_role(env: Env, caller: Address, account: Address) -> Result<(), VendorError>
 */
export function buildRevokeRole(caller: string, account: string): xdr.Operation {
  const contract = getVendorRegistryContract();
  return contract.call(
    'revoke_role',
    new Address(caller).toScVal(),
    new Address(account).toScVal()
  );
}

/**
 * Build `get_role` invocation operation (read-only query).
 * Rust signature: pub fn get_role(env: Env, account: Address) -> Option<Role>
 */
export function buildGetRole(account: string): xdr.Operation {
  const contract = getVendorRegistryContract();
  return contract.call(
    'get_role',
    new Address(account).toScVal()
  );
}

/**
 * Build `upgrade` invocation operation.
 * Rust signature: pub fn upgrade(env: Env, caller: Address, new_wasm_hash: BytesN<32>) -> Result<(), VendorError>
 */
export function buildUpgradeVendorRegistry(caller: string, wasmHash: Buffer): xdr.Operation {
  const contract = getVendorRegistryContract();
  return contract.call(
    'upgrade',
    new Address(caller).toScVal(),
    nativeToScVal(wasmHash, { type: 'bytes' })
  );
}

/**
 * Build `version` invocation operation (read-only query).
 * Rust signature: pub fn version(env: Env) -> u32
 */
export function buildVersionVendorRegistry(): xdr.Operation {
  const contract = getVendorRegistryContract();
  return contract.call('version');
}

// ═══════════════════════════════════════════════════════════════
// ReviewSystem Contract Bindings
// Maps to: contracts/review_system/src/lib.rs
// ═══════════════════════════════════════════════════════════════

/**
 * Creates a Contract instance for ReviewSystem.
 * Contract ID sourced from NEXT_PUBLIC_REVIEW_SYSTEM_CONTRACT_ID env var.
 */
export function getReviewSystemContract(): Contract {
  const contractId = REVIEW_SYSTEM_CONTRACT_ID;
  if (!contractId) {
    throw new Error('REVIEW_SYSTEM_CONTRACT_ID is not configured');
  }
  return new Contract(contractId);
}

/**
 * Build `initialize` invocation operation for ReviewSystem.
 * Rust signature: pub fn initialize(env: Env, admin: Address, vendor_registry: Address) -> Result<(), ReviewError>
 */
export function buildInitializeReviewSystem(admin: string, vendorRegistry: string): xdr.Operation {
  const contract = getReviewSystemContract();
  return contract.call(
    'initialize',
    new Address(admin).toScVal(),
    new Address(vendorRegistry).toScVal()
  );
}

/**
 * Build `set_registry` invocation operation.
 * Rust signature: pub fn set_registry(env: Env, caller: Address, registry: Address) -> Result<(), ReviewError>
 */
export function buildSetRegistry(caller: string, registry: string): xdr.Operation {
  const contract = getReviewSystemContract();
  return contract.call(
    'set_registry',
    new Address(caller).toScVal(),
    new Address(registry).toScVal()
  );
}

/**
 * Build `submit_review` invocation operation.
 * Rust signature: pub fn submit_review(env: Env, reviewer: Address, vendor_id: u64, delivery_score: u32, quality_score: u32, payment_score: u32, communication_score: u32, comment: String) -> Result<u64, ReviewError>
 *
 * NOTE: On-chain, this function triggers an inter-contract call to
 * VendorRegistry.update_vendor_score() to update the vendor's aggregate score.
 */
export function buildSubmitReview(
  reviewer: string,
  vendorId: number,
  deliveryScore: number,
  qualityScore: number,
  paymentScore: number,
  communicationScore: number,
  comment: string
): xdr.Operation {
  const contract = getReviewSystemContract();
  return contract.call(
    'submit_review',
    new Address(reviewer).toScVal(),
    nativeToScVal(vendorId, { type: 'u64' }),
    nativeToScVal(deliveryScore, { type: 'u32' }),
    nativeToScVal(qualityScore, { type: 'u32' }),
    nativeToScVal(paymentScore, { type: 'u32' }),
    nativeToScVal(communicationScore, { type: 'u32' }),
    nativeToScVal(comment, { type: 'string' })
  );
}

/**
 * Build `get_review` invocation operation (read-only query).
 * Rust signature: pub fn get_review(env: Env, review_id: u64) -> Result<Review, ReviewError>
 */
export function buildGetReview(reviewId: number): xdr.Operation {
  const contract = getReviewSystemContract();
  return contract.call(
    'get_review',
    nativeToScVal(reviewId, { type: 'u64' })
  );
}

/**
 * Build `get_vendor_reviews` invocation operation (read-only query).
 * Rust signature: pub fn get_vendor_reviews(env: Env, vendor_id: u64) -> Vec<Review>
 */
export function buildGetVendorReviews(vendorId: number): xdr.Operation {
  const contract = getReviewSystemContract();
  return contract.call(
    'get_vendor_reviews',
    nativeToScVal(vendorId, { type: 'u64' })
  );
}

/**
 * Build `get_vendor_score_aggregate` invocation operation (read-only query).
 * Rust signature: pub fn get_vendor_score_aggregate(env: Env, vendor_id: u64) -> ScoreAggregate
 */
export function buildGetVendorScoreAggregate(vendorId: number): xdr.Operation {
  const contract = getReviewSystemContract();
  return contract.call(
    'get_vendor_score_aggregate',
    nativeToScVal(vendorId, { type: 'u64' })
  );
}

/**
 * Build `get_review_count` invocation operation (read-only query).
 * Rust signature: pub fn get_review_count(env: Env) -> u64
 */
export function buildGetReviewCount(): xdr.Operation {
  const contract = getReviewSystemContract();
  return contract.call('get_review_count');
}

/**
 * Build `upgrade` invocation operation for ReviewSystem.
 * Rust signature: pub fn upgrade(env: Env, caller: Address, new_wasm_hash: BytesN<32>) -> Result<(), ReviewError>
 */
export function buildUpgradeReviewSystem(caller: string, wasmHash: Buffer): xdr.Operation {
  const contract = getReviewSystemContract();
  return contract.call(
    'upgrade',
    new Address(caller).toScVal(),
    nativeToScVal(wasmHash, { type: 'bytes' })
  );
}

/**
 * Build `version` invocation operation for ReviewSystem (read-only query).
 * Rust signature: pub fn version(env: Env) -> u32
 */
export function buildVersionReviewSystem(): xdr.Operation {
  const contract = getReviewSystemContract();
  return contract.call('version');
}

// ═══════════════════════════════════════════════════════════════
// Frontend ↔ Contract Function Mapping Reference
// ═══════════════════════════════════════════════════════════════
//
// VendorRegistry Contract (contracts/vendor_registry/src/lib.rs):
// ┌─────────────────────────────┬──────────────────────────────────────────┐
// │ Rust Function Name          │ TypeScript Binding Function              │
// ├─────────────────────────────┼──────────────────────────────────────────┤
// │ initialize                  │ buildInitializeVendorRegistry()         │
// │ set_review_contract         │ buildSetReviewContract()                │
// │ register_vendor             │ buildRegisterVendor()                   │
// │ update_vendor               │ buildUpdateVendor()                     │
// │ set_vendor_status           │ buildSetVendorStatus()                  │
// │ update_vendor_score         │ buildUpdateVendorScore()                │
// │ get_vendor                  │ buildGetVendor()                        │
// │ get_vendor_by_address       │ buildGetVendorByAddress()               │
// │ get_vendor_count            │ buildGetVendorCount()                   │
// │ list_vendors                │ buildListVendors()                      │
// │ grant_role                  │ buildGrantRole()                        │
// │ revoke_role                 │ buildRevokeRole()                       │
// │ get_role                    │ buildGetRole()                          │
// │ upgrade                     │ buildUpgradeVendorRegistry()            │
// │ version                     │ buildVersionVendorRegistry()            │
// └─────────────────────────────┴──────────────────────────────────────────┘
//
// ReviewSystem Contract (contracts/review_system/src/lib.rs):
// ┌─────────────────────────────┬──────────────────────────────────────────┐
// │ Rust Function Name          │ TypeScript Binding Function              │
// ├─────────────────────────────┼──────────────────────────────────────────┤
// │ initialize                  │ buildInitializeReviewSystem()            │
// │ set_registry                │ buildSetRegistry()                      │
// │ submit_review               │ buildSubmitReview()                     │
// │ get_review                  │ buildGetReview()                        │
// │ get_vendor_reviews          │ buildGetVendorReviews()                 │
// │ get_vendor_score_aggregate  │ buildGetVendorScoreAggregate()          │
// │ get_review_count            │ buildGetReviewCount()                   │
// │ upgrade                     │ buildUpgradeReviewSystem()              │
// │ version                     │ buildVersionReviewSystem()              │
// └─────────────────────────────┴──────────────────────────────────────────┘
