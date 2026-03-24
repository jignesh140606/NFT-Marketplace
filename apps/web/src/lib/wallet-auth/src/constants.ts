import { arbitrum, arbitrumSepolia } from 'viem/chains';

export const SUPPORTED_CHAINS = [arbitrum, arbitrumSepolia] as const;

export const CHAIN_IDS = {
    arbitrum: 42161,
    'arbitrum-sepolia': 421614,
} as const;

export type SupportedChainId = typeof CHAIN_IDS[keyof typeof CHAIN_IDS];
export type SupportedNetwork = keyof typeof CHAIN_IDS;

export const DEFAULT_CHAIN = arbitrum;

export const WALLET_PROVIDERS = [
    'metamask',
    'walletconnect',
    'coinbase',
    'rainbow',
] as const;

export type WalletProvider = typeof WALLET_PROVIDERS[number];
