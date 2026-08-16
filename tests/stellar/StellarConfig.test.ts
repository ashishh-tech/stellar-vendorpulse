import { describe, it, expect } from 'vitest';
import {
  STELLAR_NETWORK,
  STELLAR_RPC_URL,
  STELLAR_HORIZON_URL,
  FEE_BUMP_ENABLED,
  MULTISIG_THRESHOLD,
  checkNetworkHealth,
} from '@/lib/stellar';

describe('Stellar Configuration & Health Telemetry', () => {
  it('loads valid Stellar mainnet defaults', () => {
    expect(STELLAR_NETWORK).toBeDefined();
    expect(STELLAR_RPC_URL).toContain('sorobanrpc.com');
    expect(STELLAR_HORIZON_URL).toContain('horizon.stellar.org');
    expect(FEE_BUMP_ENABLED).toBe(true);
    expect(MULTISIG_THRESHOLD).toBe(2);
  });

  it('checks network health and handles response structure', async () => {
    const health = await checkNetworkHealth();
    expect(typeof health.isHealthy).toBe('boolean');
    expect(typeof health.latencyMs).toBe('number');
    expect(typeof health.ledgerSequence).toBe('number');
    expect(health.network).toBe(STELLAR_NETWORK);
  });
});
