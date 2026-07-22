#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# VendorPulse - Local Development Setup (Standalone Network)
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

echo "═══════════════════════════════════════════════════════════"
echo "  VendorPulse - Local Development Deployment"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check prerequisites
command -v stellar >/dev/null 2>&1 || { echo "❌ Stellar CLI not installed. Run: cargo install stellar-cli"; exit 1; }

NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
DEPLOYER="vendorpulse-local"

echo "▸ Creating local deployer identity..."
stellar keys generate --fund "$DEPLOYER" --network "$NETWORK" 2>/dev/null || \
  echo "  Account already exists."

DEPLOYER_PK=$(stellar keys public-key "$DEPLOYER")
echo "  Deployer: $DEPLOYER_PK"

echo "▸ Building contracts..."
cd "$(dirname "$0")/../contracts"
stellar contract build

echo "▸ Deploying VendorRegistry..."
VR_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/vendor_registry.wasm \
  --source "$DEPLOYER" \
  --network "$NETWORK" \
  --alias vendor_registry_local \
  -- 2>&1 | tail -1)

echo "▸ Deploying ReviewSystem..."
RS_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/review_system.wasm \
  --source "$DEPLOYER" \
  --network "$NETWORK" \
  --alias review_system_local \
  -- 2>&1 | tail -1)

echo "▸ Initializing contracts..."
stellar contract invoke --id "$VR_ID" --source "$DEPLOYER" --network "$NETWORK" -- initialize --admin "$DEPLOYER_PK"
stellar contract invoke --id "$RS_ID" --source "$DEPLOYER" --network "$NETWORK" -- initialize --admin "$DEPLOYER_PK" --vendor_registry "$VR_ID"
stellar contract invoke --id "$VR_ID" --source "$DEPLOYER" --network "$NETWORK" -- set_review_contract --caller "$DEPLOYER_PK" --review_contract "$RS_ID"

echo ""
echo "▸ Creating .env.local for frontend..."
cd "$(dirname "$0")/.."
cat > .env.local <<EOF
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_STELLAR_EXPLORER_URL=https://stellar.expert/explorer/testnet
NEXT_PUBLIC_VENDOR_REGISTRY_CONTRACT_ID=$VR_ID
NEXT_PUBLIC_REVIEW_SYSTEM_CONTRACT_ID=$RS_ID
NEXT_PUBLIC_APP_NAME=VendorPulse
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_LOGGING=true
NEXT_PUBLIC_LOG_LEVEL=debug
EOF

echo ""
echo "✅ Local development environment ready!"
echo "   VendorRegistry: $VR_ID"
echo "   ReviewSystem:   $RS_ID"
echo ""
echo "   Run: npm run dev"
