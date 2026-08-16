import { rpc, Horizon, Networks } from '@stellar/stellar-sdk';

export const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'mainnet';
export const STELLAR_RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://mainnet.sorobanrpc.com';
export const STELLAR_HORIZON_URL = process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon.stellar.org';
export const STELLAR_NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || Networks.PUBLIC;

export const VENDOR_REGISTRY_CONTRACT_ID = process.env.NEXT_PUBLIC_VENDOR_REGISTRY_CONTRACT_ID || '';
export const REVIEW_SYSTEM_CONTRACT_ID = process.env.NEXT_PUBLIC_REVIEW_SYSTEM_CONTRACT_ID || '';

// Level 6 — Fee Bump Sponsorship Configuration
export const FEE_BUMP_SPONSOR_ADDRESS = process.env.NEXT_PUBLIC_FEE_BUMP_SPONSOR || '';
export const FEE_BUMP_MAX_BASE_FEE = parseInt(process.env.NEXT_PUBLIC_FEE_BUMP_MAX_BASE_FEE || '50000', 10);
export const FEE_BUMP_ENABLED = process.env.NEXT_PUBLIC_FEE_BUMP_ENABLED !== 'false';

// Level 6 — Multi-Sig Governance Configuration
export const MULTISIG_THRESHOLD = parseInt(process.env.NEXT_PUBLIC_MULTISIG_THRESHOLD || '2', 10);

export const sorobanServer = new rpc.Server(STELLAR_RPC_URL, {
  allowHttp: STELLAR_NETWORK === 'local' || STELLAR_NETWORK === 'standalone',
});

export const horizonServer = new Horizon.Server(STELLAR_HORIZON_URL, {
  allowHttp: STELLAR_NETWORK === 'local' || STELLAR_NETWORK === 'standalone',
});

export async function fetchAccountBalance(address: string): Promise<string> {
  try {
    const account = await horizonServer.loadAccount(address);
    const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
    return nativeBalance ? nativeBalance.balance : '0';
  } catch (err) {
    console.error('Failed to fetch balance:', err);
    return '0';
  }
}

/**
 * Level 6 — Network health check for mainnet reliability monitoring.
 * Returns RPC latency in ms and current ledger sequence.
 */
export async function checkNetworkHealth(): Promise<{
  isHealthy: boolean;
  latencyMs: number;
  ledgerSequence: number;
  network: string;
}> {
  const start = Date.now();
  try {
    const health: any = await sorobanServer.getHealth();
    const latencyMs = Date.now() - start;
    return {
      isHealthy: health?.status === 'healthy',
      latencyMs,
      ledgerSequence: health?.latestLedger || health?.latest_ledger || 54182962,
      network: STELLAR_NETWORK,
    };
  } catch (err) {
    return {
      isHealthy: false,
      latencyMs: Date.now() - start,
      ledgerSequence: 0,
      network: STELLAR_NETWORK,
    };
  }
}

