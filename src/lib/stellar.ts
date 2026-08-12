import { rpc, Horizon, Networks } from '@stellar/stellar-sdk';

export const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'mainnet';
export const STELLAR_RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://mainnet.sorobanrpc.com';
export const STELLAR_HORIZON_URL = process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon.stellar.org';
export const STELLAR_NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || Networks.PUBLIC;

export const VENDOR_REGISTRY_CONTRACT_ID = process.env.NEXT_PUBLIC_VENDOR_REGISTRY_CONTRACT_ID || '';
export const REVIEW_SYSTEM_CONTRACT_ID = process.env.NEXT_PUBLIC_REVIEW_SYSTEM_CONTRACT_ID || '';

export const sorobanServer = new rpc.Server(STELLAR_RPC_URL, {
  allowHttp: STELLAR_NETWORK === 'local' || STELLAR_NETWORK === 'standalone',
});

export const horizonServer = new Horizon.Server(STELLAR_HORIZON_URL, {
  allowHttp: STELLAR_NETWORK === 'local' || STELLAR_NETWORK === 'standalone',
});

export async function fetchAccountBalance(address: string): Promise<string> {
  try {
    const account = await horizonServer.loadAccount(address);
    const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
    return nativeBalance ? nativeBalance.balance : '0';
  } catch (err) {
    console.error('Failed to fetch balance:', err);
    return '0';
  }
}
