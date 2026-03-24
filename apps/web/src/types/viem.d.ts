
declare module 'viem' {
  export interface Chain {
    id: number;
    name: string;
    nativeCurrency: {
      decimals: number;
      name: string;
      symbol: string;
    };
    rpcUrls: {
      default: { http: readonly string[] };
      [key: string]: { http: readonly string[] } | undefined;
    };
    blockExplorers?: {
      default: { name: string; url: string };
      [key: string]: { name: string; url: string } | undefined;
    };
    testnet?: boolean;
  }
}
