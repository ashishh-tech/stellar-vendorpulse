import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardPage from '@/app/dashboard/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/features/contracts/hooks/useVendors', () => ({
  useVendors: () => ({
    data: [
      {
        id: 1,
        owner: 'GDQAAJ6RMTU3674NTTHOTLNTZGM6K546QO6J6O33C623CJA6Y7W6XXXX',
        name: 'Apex Global Logistics',
        category: 'Logistics & Shipping',
        contact_email: 'dispatch@apexlogistics.io',
        status: 'Active',
        avg_score: 92,
        review_count: 14,
        created_at: 1720000000,
        updated_at: 1721000000,
      },
    ],
    isLoading: false,
  }),
  useRegisterVendor: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSubmitReview: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateVendorStatus: () => ({ mutate: vi.fn() }),
}));

describe('Dashboard Page Component', () => {
  it('renders procurement KPIs and vendor card', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Vendor Performance Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Apex Global Logistics')).toBeInTheDocument();
    expect(screen.getAllByText('Logistics & Shipping')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/92\/100/)[0]).toBeInTheDocument();
  });
});
