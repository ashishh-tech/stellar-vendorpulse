/**
 * Stellar Soroban Wallet Service & API Integration Layer
 * Uses @stellar/freighter-api for wallet detection, permission checks, address retrieval, and transaction signing.
 */
import {
  isConnected,
  isAllowed,
  setAllowed,
  getAddress,
  getNetwork,
  signTransaction,
} from '@stellar/freighter-api';
import { logger } from './logger';

export interface WalletConnectionState {
  isConnected: boolean;
  isAllowed: boolean;
  address: string | null;
  network: string | null;
  error: string | null;
}

/**
 * Checks if the Freighter browser extension is installed and connected.
 */
export async function checkWalletConnection(): Promise<{ isConnected: boolean }> {
  try {
    const result = await isConnected();
    return { isConnected: !!result?.isConnected };
  } catch (err) {
    logger.warn('Freighter wallet detection check failed', err);
    return { isConnected: false };
  }
}

/**
 * Requests permission from user to access their Stellar wallet address.
 */
export async function requestWalletPermission(): Promise<boolean> {
  try {
    const result = await setAllowed();
    return !!result;
  } catch (err) {
    logger.error('Failed to request wallet permissions from Freighter', err);
    return false;
  }
}

/**
 * Retrieves the connected Stellar public key address from Freighter.
 */
export async function retrieveWalletAddress(): Promise<string | null> {
  try {
    const allowed = await isAllowed();
    if (!allowed?.isAllowed) {
      const granted = await requestWalletPermission();
      if (!granted) return null;
    }
    const response = await getAddress();
    return response?.address || null;
  } catch (err) {
    logger.error('Failed to retrieve wallet address from Freighter', err);
    return null;
  }
}

/**
 * Retrieves active Stellar network name (e.g. TESTNET / PUBLIC).
 */
export async function retrieveWalletNetwork(): Promise<string | null> {
  try {
    const response = await getNetwork();
    return response?.network || 'TESTNET';
  } catch (err) {
    logger.warn('Failed to retrieve active network from Freighter', err);
    return 'TESTNET';
  }
}

/**
 * Signs an XDR transaction envelope using the connected Stellar wallet.
 */
export async function signSorobanTransaction(
  xdr: string,
  networkPassphrase = 'Test SDF Network ; September 2015'
): Promise<string> {
  try {
    const res: any = await signTransaction(xdr, {
      networkPassphrase,
    });
    const signedXdr = typeof res === 'string' ? res : res?.signedTxXdr || xdr;
    if (!signedXdr) {
      throw new Error('Transaction signing failed or was rejected by user');
    }
    logger.info('Successfully signed Soroban transaction XDR with wallet');
    return signedXdr;
  } catch (err: any) {
    logger.error('Error signing Soroban transaction with wallet', err);
    throw err;
  }
}
