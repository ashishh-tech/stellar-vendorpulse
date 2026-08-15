# 📐 VendorPulse Technical Specification & Protocol Architecture

> **Complete system architecture, Soroban XDR types, RPC bindings, data structures, and protocol design for Stellar Mainnet.**

---

## 1. System Architecture Diagram

```mermaid
graph TB
    subgraph Frontend Client ["Next.js 15 App Router (Vercel/Netlify)"]
        UI[Procurement Dashboard & L6 Hub]
        WalletHooks[Freighter API & WebAuthn Passkeys]
        SponsorshipEngine[Stellar Fee-Bump Relayer Client]
        AnchorClient[SEP-24 / SEP-31 Quote Service]
    end

    subgraph Stellar Mainnet ["Stellar Mainnet (Soroban Network)"]
        RPC[Soroban RPC Node mainnet.sorobanrpc.com]
        FeeBump[Fee Bump Transaction Envelope]
        
        subgraph Smart Contracts ["Soroban Smart Contracts (Wasm)"]
            VR[VendorRegistry Contract]
            RS[ReviewSystem Contract]
            MS[MultiSig Governance Proposal Store]
        end
    end

    subgraph Anchor Off-Ramps ["Stellar Anchor Network (SEP Rails)"]
        SEPA[SEPA Euro Rails]
        PIX[Brazil PIX Rails]
        ACH[US FedNow / ACH]
    end

    UI --> WalletHooks
    UI --> SponsorshipEngine
    UI --> AnchorClient
    SponsorshipEngine --> FeeBump
    FeeBump --> RPC
    WalletHooks --> RPC
    RPC --> VR
    RPC --> RS
    RS -->|Cross-Contract Invocation| VR
    AnchorClient --> SEPA
    AnchorClient --> PIX
    AnchorClient --> ACH
```

---

## 2. Soroban Data Structures & XDR Types

### 2.1 Vendor Data Key & Struct
```rust
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum VendorStatus {
    Pending = 0,
    Active = 1,
    Suspended = 2,
    Decommissioned = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VendorScores {
    pub delivery: u32,
    pub quality: u32,
    pub payment: u32,
    pub communication: u32,
    pub total_reviews: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VendorRecord {
    pub id: u64,
    pub name: String,
    pub category: String,
    pub contact_email: String,
    pub status: VendorStatus,
    pub scores: VendorScores,
    pub created_at: u64,
    pub updated_at: u64,
}
```

### 2.2 Review Record Struct
```rust
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReviewRecord {
    pub review_id: u64,
    pub vendor_id: u64,
    pub reviewer: Address,
    pub delivery_score: u32,
    pub quality_score: u32,
    pub payment_score: u32,
    pub communication_score: u32,
    pub comment_hash: BytesN<32>,
    pub timestamp: u64,
}
```

---

## 3. Inter-Contract Communication Flow

1. Evaluator calls `ReviewSystem::submit_review(vendor_id, scores, reviewer)`.
2. `ReviewSystem` calculates the incremental moving average for the target vendor.
3. `ReviewSystem` invokes `VendorRegistry::update_vendor_score(vendor_id, updated_scores)`.
4. `VendorRegistry` verifies that `env.invoker() == review_contract_address`.
5. `VendorRegistry` commits the updated scores to Persistent storage and emits `vendor_score_updated` event.

---

## 4. Mainnet Deployment Parameters

- **Soroban Network RPC**: `https://mainnet.sorobanrpc.com`
- **Horizon API**: `https://horizon.stellar.org`
- **Network Passphrase**: `Public Global Stellar Network ; September 2015`
- **Base Fee**: `100 Stroops` (Normal) | `10,000 Stroops` (Fee-bump sponsored)
