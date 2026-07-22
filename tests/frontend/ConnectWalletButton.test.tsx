import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConnectWalletButton } from '@/features/wallet/ui/ConnectWalletButton';
import { useWalletStore } from '@/features/wallet/store';

describe('ConnectWalletButton Component', () => {
  it('renders Connect Wallet button when disconnected', () => {
    useWalletStore.setState({ isConnected: false, address: null });
    render(<ConnectWalletButton />);
    expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
  });

  it('renders truncated address and XLM balance when connected', () => {
    useWalletStore.setState({
      isConnected: true,
      address: 'GDQAAJ6RMTU3674NTTHOTLNTZGM6K546QO6J6O33C623CJA6Y7W6XXXX',
      balance: '150.50',
      walletName: 'Freighter',
    });
    render(<ConnectWalletButton />);
    expect(screen.getByText('150.50')).toBeInTheDocument();
    expect(screen.getByText(/GDQAAJ\.\.\.XXXX/i)).toBeInTheDocument();
  });

  it('triggers modal open state when clicked while disconnected', () => {
    useWalletStore.setState({ isConnected: false, address: null });
    const setModalOpenSpy = vi.fn();
    useWalletStore.setState({ setModalOpen: setModalOpenSpy });

    render(<ConnectWalletButton />);
    const button = screen.getByText(/Connect Wallet/i);
    fireEvent.click(button);

    expect(setModalOpenSpy).toHaveBeenCalledWith(true);
  });
});
