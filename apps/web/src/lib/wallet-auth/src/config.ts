import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { arbitrum, arbitrumSepolia } from 'viem/chains';
import type { WalletAuthConfig } from './types';
import { SUPPORTED_CHAINS } from './constants';

export function createWalletConfig(config: WalletAuthConfig) {
    const chains = config.chains ?? SUPPORTED_CHAINS;

    return getDefaultConfig({
        appName: config.appName,
        projectId: config.projectId,
        chains: chains as any,
        transports: {
            [arbitrum.id]: http(),
            [arbitrumSepolia.id]: http(),
        },
        ssr: true,
    });
}

export function createConfigFromEnv(appName?: string) {
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

    if (!projectId) {
        throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable is required');
    }

    return createWalletConfig({
        appName: appName ?? process.env.NEXT_PUBLIC_APP_NAME ?? 'My DApp',
        projectId,
    });
}
