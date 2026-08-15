# 🛠️ VendorPulse Stellar Mainnet Operations Runbook

> **Operational runbook for contract deployment, key rotation, incident response, and storage maintenance on Stellar Mainnet.**

---

## 1. Production Deployment Procedure

To deploy new contract versions to Stellar Mainnet:

```bash
# 1. Build optimized release Wasm binaries
cargo build --target wasm32-unknown-unknown --release --package vendor_registry --package review_system

# 2. Optimize Wasm footprint
soroban contract optimize --wasm target/wasm32-unknown-unknown/release/vendor_registry.wasm
soroban contract optimize --wasm target/wasm32-unknown-unknown/release/review_system.wasm

# 3. Deploy to Stellar Mainnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/vendor_registry.optimized.wasm \
  --source-account MAINNET_ADMIN_KEY \
  --network mainnet

# 4. Initialize and set cross-contract authorization
soroban contract invoke \
  --id <VENDOR_REGISTRY_CONTRACT_ID> \
  --source-account MAINNET_ADMIN_KEY \
  --network mainnet \
  -- initialize --admin <ADMIN_ADDRESS>
```

---

## 2. Key Rotation & Governance Signer Updates

- Administrative keys are managed via a **2-of-3 Multi-Signature** threshold scheme.
- Key rotation requires a governance proposal (`grant_role` / `revoke_role`) signed by at least 2 authorized signers.

---

## 3. Storage TTL Extension Routine

Soroban state must be maintained above minimum ledger lifetimes. Run the periodic cron job:

```bash
# Extend persistent storage lifetime by 500,000 ledgers (~30 days)
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source-account SPONSOR_KEY \
  --network mainnet \
  -- extend_persistent_ttl
```

---

## 4. Incident Response & Emergency Pause

In case of abnormal telemetry or exploit attempts:
1. Multi-Sig signers broadcast `pause_contract` transaction.
2. Review mutations are temporarily rejected with error code `SystemPaused`.
3. Read queries (`get_vendor`, `get_review`) remain fully accessible.
