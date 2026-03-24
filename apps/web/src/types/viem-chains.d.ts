
import type { Chain } from 'viem';

declare module 'viem/chains' {
  export const mainnet: Chain;
  export const sepolia: Chain;
  export const arbitrum: Chain;
  export const arbitrumSepolia: Chain;
  export const polygon: Chain;
  export const polygonMumbai: Chain;
  export const optimism: Chain;
  export const optimismSepolia: Chain;
  export const base: Chain;
  export const baseSepolia: Chain;
}
