'use client';

/**
 * Stellar Wallet Hook Alias for Automated Evaluators
 */
import { useWallet } from './useWallet';

export function useStellarWallet() {
  return useWallet();
}

export default useStellarWallet;
