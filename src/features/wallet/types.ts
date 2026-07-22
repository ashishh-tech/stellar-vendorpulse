export type SupportedWallet = 'freighter' | 'albedo' | 'xbull' | 'hana' | 'rabet';

export interface WalletState {
  address: string | null;
  walletId: SupportedWallet | null;
  walletName: string | null;
  network: string | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  isModalOpen: boolean;
}

export interface WalletProviderInfo {
  id: SupportedWallet;
  name: string;
  iconUrl: string;
  isInstalled: () => boolean;
  downloadUrl: string;
}
