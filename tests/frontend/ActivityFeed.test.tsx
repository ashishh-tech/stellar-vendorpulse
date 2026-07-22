import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ActivityFeed } from '@/features/events/ui/ActivityFeed';
import { useEventStore } from '@/features/events/store';

describe('ActivityFeed Component', () => {
  it('renders listening state when no events are streamed', () => {
    useEventStore.setState({ events: [], isStreaming: true });
    render(<ActivityFeed />);
    expect(screen.getByText(/Live On-Chain Activity Feed/i)).toBeInTheDocument();
    expect(screen.getByText(/Listening for Soroban contract events/i)).toBeInTheDocument();
  });

  it('renders event list when events exist in store', () => {
    useEventStore.setState({
      events: [
        {
          id: 'evt_1',
          contractId: 'CCONTRACT1234567890',
          topic: ['vendor', 'register'],
          data: {},
          ledger: 123456,
          ledgerClosedAt: '2026-07-22T03:00:00Z',
          txHash: '0x1234567890abcdef',
          type: 'vendor_registered',
        },
      ],
      isStreaming: true,
    });

    render(<ActivityFeed />);
    expect(screen.getByText('Vendor Registered')).toBeInTheDocument();
    expect(screen.getByText('Ledger #123456')).toBeInTheDocument();
  });
});
