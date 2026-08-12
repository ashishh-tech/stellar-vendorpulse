#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# VendorPulse - Deploy Contracts to Stellar Mainnet
# ═══════════════════════════════════════════════════════════════
#
# Prerequisites:
#   1. Stellar CLI installed: https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli
#   2. Funded Mainnet deployer account (requires real XLM for fees + storage deposit)
#   3. Rust toolchain with wasm32-unknown-unknown target installed
#
# Usage:
#   chmod +x scripts/deploy-mainnet.sh
#   ./scripts/deploy-mainnet.sh
#
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

NETWORK="mainnet"
RPC_URL="https://mainnet.sorobanrpc.com"
NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
DEPLOYER_ACCOUNT="${STELLAR_DEPLOYER_ACCOUNT:-vendorpulse-deployer}"

echo "═══════════════════════════════════════════════════════════"
echo "  VendorPulse - Stellar MAINNET Deployment"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  ⚠  WARNING: This deploys to Stellar MAINNET."
echo "  ⚠  Real XLM will be consumed for transaction fees"
echo "  ⚠  and contract storage deposits."
echo ""

# Step 1: Verify deployer key exists
echo "▸ Step 1: Verifying deployer account..."
if ! stellar keys public-key "$DEPLOYER_ACCOUNT" 2>/dev/null; then
  echo "  ERROR: Deployer account '$DEPLOYER_ACCOUNT' not found."
  echo "  Create it with: stellar keys generate $DEPLOYER_ACCOUNT"
  echo "  Then fund it with real XLM on Mainnet."
  exit 1
fi

DEPLOYER_PK=$(stellar keys public-key "$DEPLOYER_ACCOUNT")
echo "  Deployer public key: $DEPLOYER_PK"
echo ""

# Step 2: Build contracts
echo "▸ Step 2: Building smart contracts..."
cd "$(dirname "$0")/../contracts"
cargo build --workspace --target wasm32-unknown-unknown --release
echo "  Build complete."
echo ""

# Step 3: Deploy VendorRegistry
echo "▸ Step 3: Deploying VendorRegistry contract to MAINNET..."
VENDOR_REGISTRY_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/vendor_registry.wasm \
  --source "$DEPLOYER_ACCOUNT" \
  --network "$NETWORK" \
  --alias vendor_registry_mainnet \
  -- 2>&1 | tail -1)
echo "  ✅ VendorRegistry deployed: $VENDOR_REGISTRY_ID"
echo ""

# Step 4: Deploy ReviewSystem
echo "▸ Step 4: Deploying ReviewSystem contract to MAINNET..."
REVIEW_SYSTEM_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/review_system.wasm \
  --source "$DEPLOYER_ACCOUNT" \
  --network "$NETWORK" \
  --alias review_system_mainnet \
  -- 2>&1 | tail -1)
echo "  ✅ ReviewSystem deployed: $REVIEW_SYSTEM_ID"
echo ""

# Step 5: Initialize VendorRegistry
echo "▸ Step 5: Initializing VendorRegistry on MAINNET..."
stellar contract invoke \
  --id "$VENDOR_REGISTRY_ID" \
  --source "$DEPLOYER_ACCOUNT" \
  --network "$NETWORK" \
  -- initialize \
  --admin "$DEPLOYER_PK"
echo "  ✅ VendorRegistry initialized"
echo ""

# Step 6: Initialize ReviewSystem (with registry address)
echo "▸ Step 6: Initializing ReviewSystem on MAINNET..."
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
echo "▸ Step 7: Linking contracts on MAINNET..."
stellar contract invoke \
  --id "$VENDOR_REGISTRY_ID" \
  --source "$DEPLOYER_ACCOUNT" \
  --network "$NETWORK" \
  -- set_review_contract \
  --caller "$DEPLOYER_PK" \
  --review_contract "$REVIEW_SYSTEM_ID"
echo "  ✅ Contracts linked"
echo ""

# Step 8: Grant deployer Admin role
echo "▸ Step 8: Confirming deployer Admin role on MAINNET..."
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
echo "  ✅ MAINNET DEPLOYMENT COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  VendorRegistry Contract ID: $VENDOR_REGISTRY_ID"
echo "  ReviewSystem Contract ID:   $REVIEW_SYSTEM_ID"
echo "  Deployer Public Key:        $DEPLOYER_PK"
echo ""
echo "  Explorer Links (Mainnet):"
echo "    VendorRegistry: https://stellar.expert/explorer/public/contract/$VENDOR_REGISTRY_ID"
echo "    ReviewSystem:   https://stellar.expert/explorer/public/contract/$REVIEW_SYSTEM_ID"
echo ""
echo "  Update your .env file:"
echo "    NEXT_PUBLIC_VENDOR_REGISTRY_CONTRACT_ID=$VENDOR_REGISTRY_ID"
echo "    NEXT_PUBLIC_REVIEW_SYSTEM_CONTRACT_ID=$REVIEW_SYSTEM_ID"
echo ""
echo "  Update your README.md with these contract IDs and explorer links"
echo "  for Level 6 Black Belt mainnet proof submission."
echo "═══════════════════════════════════════════════════════════"
