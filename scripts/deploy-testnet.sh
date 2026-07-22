#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# VendorPulse - Deploy Contracts to Stellar Testnet
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
DEPLOYER_ACCOUNT="${STELLAR_DEPLOYER_ACCOUNT:-vendorpulse-deployer}"

echo "═══════════════════════════════════════════════════════════"
echo "  VendorPulse - Stellar Testnet Deployment"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Step 1: Generate deployer key (if needed)
echo "▸ Step 1: Setting up deployer account..."
stellar keys generate --fund "$DEPLOYER_ACCOUNT" --network "$NETWORK" 2>/dev/null || \
  echo "  Account '$DEPLOYER_ACCOUNT' already exists, reusing."

DEPLOYER_PK=$(stellar keys public-key "$DEPLOYER_ACCOUNT")
echo "  Deployer public key: $DEPLOYER_PK"
echo ""

# Step 2: Build contracts
echo "▸ Step 2: Building smart contracts..."
cd "$(dirname "$0")/../contracts"
stellar contract build
echo "  Build complete."
echo ""

# Step 3: Deploy VendorRegistry
echo "▸ Step 3: Deploying VendorRegistry contract..."
VENDOR_REGISTRY_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/vendor_registry.wasm \
  --source "$DEPLOYER_ACCOUNT" \
  --network "$NETWORK" \
  --alias vendor_registry \
  -- 2>&1 | tail -1)
echo "  ✅ VendorRegistry deployed: $VENDOR_REGISTRY_ID"
echo ""

# Step 4: Deploy ReviewSystem
echo "▸ Step 4: Deploying ReviewSystem contract..."
REVIEW_SYSTEM_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/review_system.wasm \
  --source "$DEPLOYER_ACCOUNT" \
  --network "$NETWORK" \
  --alias review_system \
  -- 2>&1 | tail -1)
echo "  ✅ ReviewSystem deployed: $REVIEW_SYSTEM_ID"
echo ""

# Step 5: Initialize VendorRegistry
echo "▸ Step 5: Initializing VendorRegistry..."
stellar contract invoke \
  --id "$VENDOR_REGISTRY_ID" \
  --source "$DEPLOYER_ACCOUNT" \
  --network "$NETWORK" \
  -- initialize \
  --admin "$DEPLOYER_PK"
echo "  ✅ VendorRegistry initialized"
echo ""

# Step 6: Initialize ReviewSystem (with registry address)
echo "▸ Step 6: Initializing ReviewSystem..."
stellar contract invoke \
  --id "$REVIEW_SYSTEM_ID" \
  --source "$DEPLOYER_ACCOUNT" \
  --network "$NETWORK" \
  -- initialize \
  --admin "$DEPLOYER_PK" \
  --vendor_registry "$VENDOR_REGISTRY_ID"
echo "  ✅ ReviewSystem initialized"
echo ""

# Step 7: Link contracts (set review contract on registry)
echo "▸ Step 7: Linking contracts..."
stellar contract invoke \
  --id "$VENDOR_REGISTRY_ID" \
  --source "$DEPLOYER_ACCOUNT" \
  --network "$NETWORK" \
  -- set_review_contract \
  --caller "$DEPLOYER_PK" \
  --review_contract "$REVIEW_SYSTEM_ID"
echo "  ✅ Contracts linked"
echo ""

# Step 8: Grant deployer Manager role
echo "▸ Step 8: Granting deployer Manager role..."
stellar contract invoke \
  --id "$VENDOR_REGISTRY_ID" \
  --source "$DEPLOYER_ACCOUNT" \
  --network "$NETWORK" \
  -- grant_role \
  --caller "$DEPLOYER_PK" \
  --account "$DEPLOYER_PK" \
  --role "Admin"
echo "  ✅ Admin role confirmed"
echo ""

# ── Output ────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════"
echo "  DEPLOYMENT COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  VendorRegistry Contract ID: $VENDOR_REGISTRY_ID"
echo "  ReviewSystem Contract ID:   $REVIEW_SYSTEM_ID"
echo "  Deployer Public Key:        $DEPLOYER_PK"
echo ""
echo "  Explorer Links:"
echo "    VendorRegistry: https://stellar.expert/explorer/testnet/contract/$VENDOR_REGISTRY_ID"
echo "    ReviewSystem:   https://stellar.expert/explorer/testnet/contract/$REVIEW_SYSTEM_ID"
echo ""
echo "  Update your .env file:"
echo "    NEXT_PUBLIC_VENDOR_REGISTRY_CONTRACT_ID=$VENDOR_REGISTRY_ID"
echo "    NEXT_PUBLIC_REVIEW_SYSTEM_CONTRACT_ID=$REVIEW_SYSTEM_ID"
echo "═══════════════════════════════════════════════════════════"
