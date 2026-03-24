/**
 * @cradle/wallet-auth
 *
 * Wallet authentication with RainbowKit and wagmi
 * Provides ready-to-use wallet connection for Web3 applications
 *
 * @example
 * ```tsx
 * import { WalletProvider, createWalletConfig, useWalletAuth } from '@cradle/wallet-auth';
 * import { ConnectButton } from '@rainbow-me/rainbowkit';
 *
 * const config = createWalletConfig({
 *   appName: 'My DApp',
 *   projectId: 'your-walletconnect-project-id',
 * });
 *
 * function App() {
 *   return (
 *     <WalletProvider config={config}>
 *       <ConnectButton />
 *     </WalletProvider>
 *   );
 * }
 *
 * function WalletStatus() {
 *   const { status, connect, disconnect } = useWalletAuth();
 *
 *   if (status.isConnected) {
 *     return (
 *       <div>
 *         <p>Connected: {status.address}</p>
 *         <button onClick={disconnect}>Disconnect</button>
 *       </div>
 *     );
 *   }
 *
 *   return <button onClick={connect}>Connect Wallet</button>;
 * }
 * ```
 */

export {
    SUPPORTED_CHAINS,
    CHAIN_IDS,
    DEFAULT_CHAIN,
    WALLET_PROVIDERS,
    type SupportedChainId,
    type SupportedNetwork,
    type WalletProvider as WalletProviderType,
} from './constants';

export type {
    WalletAuthConfig,
    WalletStatus,
    WalletAuthState,
} from './types';

export {
    createWalletConfig,
    createConfigFromEnv,
} from './config';

export {
    WalletProvider,
    type WalletProviderProps,
} from './providers';

export {
    useWalletAuth,
    type UseWalletAuthReturn,
} from './hooks';

// Re-export commonly used RainbowKit components
export { ConnectButton } from '@rainbow-me/rainbowkit';

// Re-export useful wagmi hooks
export {
    useAccount,
    useBalance,
    useChainId,
    usePublicClient,
    useWalletClient,
} from 'wagmi';
