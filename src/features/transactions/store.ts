import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TransactionRecord, TransactionStatus } from './types';

interface TransactionStoreState {
  transactions: TransactionRecord[];
  isDrawerOpen: boolean;

  addTransaction: (tx: Omit<TransactionRecord, 'submittedAt' | 'retryCount'>) => void;
  updateTransaction: (id: string, updates: Partial<TransactionRecord>) => void;
  clearTransactions: () => void;
  setDrawerOpen: (isOpen: boolean) => void;
}

export const useTransactionStore = create<TransactionStoreState>()(
  persist(
    (set) => ({
      transactions: [],
      isDrawerOpen: false,

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [
            {
              ...tx,
              submittedAt: Date.now(),
              retryCount: 0,
            },
            ...state.transactions,
          ].slice(0, 50), // Keep latest 50 txs
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...updates,
                  confirmedAt: updates.status === 'confirmed' ? Date.now() : t.confirmedAt,
                }
              : t
          ),
        })),

      clearTransactions: () => set({ transactions: [] }),
      setDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
    }),
    {
      name: 'vendorpulse-transactions',
    }
  )
);
