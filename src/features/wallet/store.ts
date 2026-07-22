import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WalletState, SupportedWallet } from './types';

interface WalletActions {
  setAddress: (address: string | null) => void;
  setWallet: (walletId: SupportedWallet | null, walletName: string | null) => void;
  setNetwork: (network: string | null) => void;
  setBalance: (balance: string) => void;
  setConnecting: (isConnecting: boolean) => void;
  setError: (error: string | null) => void;
  setModalOpen: (isOpen: boolean) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState & WalletActions>()(
  persist(
    (set) => ({
      address: null,
      walletId: null,
      walletName: null,
      network: null,
      balance: '0',
      isConnected: false,
      isConnecting: false,
      error: null,
      isModalOpen: false,

      setAddress: (address) => set({ address, isConnected: !!address }),
      setWallet: (walletId, walletName) => set({ walletId, walletName }),
      setNetwork: (network) => set({ network }),
      setBalance: (balance) => set({ balance }),
      setConnecting: (isConnecting) => set({ isConnecting }),
      setError: (error) => set({ error }),
      setModalOpen: (isModalOpen) => set({ isModalOpen }),
      disconnect: () =>
        set({
          address: null,
          walletId: null,
          walletName: null,
          network: null,
          balance: '0',
          isConnected: false,
          error: null,
        }),
    }),
    {
      name: 'vendorpulse-wallet',
      partialize: (state) => ({
        address: state.address,
        walletId: state.walletId,
        walletName: state.walletName,
        isConnected: state.isConnected,
      }),
    }
  )
);
