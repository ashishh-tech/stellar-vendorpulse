#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# VendorPulse - Contract Upgrade Script
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

NETWORK="${1:-testnet}"
DEPLOYER="${STELLAR_DEPLOYER_ACCOUNT:-vendorpulse-deployer}"
CONTRACT="${2:-vendor_registry}"  # vendor_registry or review_system

echo "═══════════════════════════════════════════════════════════"
echo "  VendorPulse - Upgrade Contract: $CONTRACT"
echo "═══════════════════════════════════════════════════════════"

DEPLOYER_PK=$(stellar keys public-key "$DEPLOYER")

# Build latest
cd "$(dirname "$0")/../contracts"
stellar contract build

WASM_PATH="target/wasm32v1-none/release/${CONTRACT}.wasm"

if [ ! -f "$WASM_PATH" ]; then
  echo "❌ WASM not found at $WASM_PATH"
  exit 1
fi

# Install new WASM and get hash
echo "▸ Installing new WASM..."
NEW_HASH=$(stellar contract install \
  --wasm "$WASM_PATH" \
  --source "$DEPLOYER" \
  --network "$NETWORK" 2>&1 | tail -1)
echo "  New WASM hash: $NEW_HASH"

# Get contract ID from alias
CONTRACT_ID=$(stellar contract alias show "$CONTRACT" --network "$NETWORK" 2>/dev/null || echo "")

if [ -z "$CONTRACT_ID" ]; then
  echo "❌ Contract alias '$CONTRACT' not found. Provide contract ID manually."
  exit 1
fi

# Invoke upgrade
echo "▸ Upgrading contract $CONTRACT_ID..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$DEPLOYER" \
  --network "$NETWORK" \
  -- upgrade \
  --caller "$DEPLOYER_PK" \
  --new_wasm_hash "$NEW_HASH"

# Check new version
VERSION=$(stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$DEPLOYER" \
  --network "$NETWORK" \
  -- version 2>&1 | tail -1)

echo ""
echo "✅ Contract upgraded successfully!"
echo "   Contract: $CONTRACT_ID"
echo "   New version: $VERSION"
echo "   WASM hash: $NEW_HASH"
