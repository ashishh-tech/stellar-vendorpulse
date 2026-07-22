import { useEffect, useCallback } from 'react';
import { isConnected, isAllowed, setAllowed, getAddress, getNetwork } from '@stellar/freighter-api';
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
      const connRes = await isConnected();
      if (!connRes || !connRes.isConnected) {
        throw new Error('Freighter wallet extension is not installed or enabled in browser.');
      }

      await setAllowed();
      const addrRes = await getAddress();
      const pubKey = addrRes?.address;
      if (!pubKey) {
        throw new Error('Failed to retrieve address from Freighter.');
      }

      const netRes = await getNetwork();
      const netName = netRes?.network || STELLAR_NETWORK;

      store.setAddress(pubKey);
      store.setWallet('freighter', 'Freighter');
      store.setNetwork(netName);
      store.setModalOpen(false);

      await updateBalance(pubKey);
      logger.info('Connected to Freighter wallet', { address: pubKey, network: netName });
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
        const allowedRes = await isAllowed();
        if (allowedRes && allowedRes.isAllowed) {
          const addrRes = await getAddress();
          if (addrRes && addrRes.address) {
            store.setAddress(addrRes.address);
            await updateBalance(addrRes.address);
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
