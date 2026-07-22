'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletModal } from '@/features/wallet/ui/WalletModal';
import { TransactionTracker } from '@/features/transactions/ui/TransactionTracker';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <WalletModal />
      <TransactionTracker />
    </QueryClientProvider>
  );
}
