
    import { type Chain } from 'viem';
import { mainnet, sepolia, arbitrum, arbitrumSepolia } from 'viem/chains';

    // Default supported chains
    export const chains = [arbitrum, arbitrumSepolia, mainnet, sepolia] as const;
  