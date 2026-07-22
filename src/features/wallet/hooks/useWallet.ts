import { useEffect, useCallback } from 'react';
import { isConnected, isAllowed, setAllowed, getPublicKey, getNetwork } from '@stellar/freighter-api';
import { useWalletStore } from '../store';
import { SupportedWallet } from '../types';
import { fetchAccountBalance, STELLAR_NETWORK } from '@/lib/stellar';
import { logger } from '@/lib/logger';

export function useWallet() {
  const store = useWalletStore();

  const updateBalance = useCallback(async (address: string) => {
    try {
      const bal = await fetchAccountBalance(address);
      store.setBalance(bal);
    } catch (err) {
      logger.error('Failed to update balance', err);
    }
  }, [store]);

  const connectFreighter = useCallback(async () => {
    store.setConnecting(true);
    store.setError(null);
    try {
      const connected = await isConnected();
      if (!connected) {
        throw new Error('Freighter wallet extension is not installed or enabled in browser.');
      }

      await setAllowed();
      const pubKey = await getPublicKey();
      if (!pubKey) {
        throw new Error('Failed to retrieve public key from Freighter.');
      }

      const network = await getNetwork();
      store.setAddress(pubKey);
      store.setWallet('freighter', 'Freighter');
      store.setNetwork(network || STELLAR_NETWORK);
      store.setModalOpen(false);

      await updateBalance(pubKey);
      logger.info('Connected to Freighter wallet', { address: pubKey, network });
    } catch (err: any) {
      const msg = err.message || 'Failed to connect wallet';
      store.setError(msg);
      logger.error('Wallet connection error', err);
    } finally {
      store.setConnecting(false);
    }
  }, [store, updateBalance]);

  const connectWallet = useCallback(
    async (walletId: SupportedWallet) => {
      switch (walletId) {
        case 'freighter':
          await connectFreighter();
          break;
        default:
          store.setError(`${walletId} wallet support is coming soon. Please use Freighter.`);
      }
    },
    [connectFreighter, store]
  );

  const autoReconnect = useCallback(async () => {
    if (store.isConnected && store.walletId === 'freighter') {
      try {
        const allowed = await isAllowed();
        if (allowed) {
          const pubKey = await getPublicKey();
          if (pubKey) {
            store.setAddress(pubKey);
            await updateBalance(pubKey);
          }
        }
      } catch (err) {
        logger.warn('Auto-reconnect check failed', err);
      }
    }
  }, [store, updateBalance]);

  useEffect(() => {
    autoReconnect();
  }, []);

  return {
    ...store,
    connectWallet,
    connectFreighter,
    refreshBalance: () => store.address && updateBalance(store.address),
  };
}
