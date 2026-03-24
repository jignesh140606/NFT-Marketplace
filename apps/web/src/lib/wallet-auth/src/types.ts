import type { Address, Chain } from 'viem';

export interface WalletAuthConfig {
    appName: string;
    projectId: string;
    chains?: readonly Chain[];
}

export interface WalletStatus {
    isConnected: boolean;
    isConnecting: boolean;
    isDisconnected: boolean;
    address?: Address;
    chainId?: number;
    chainName?: string;
}

export interface WalletAuthState {
    status: WalletStatus;
    connect: () => void;
    disconnect: () => void;
    switchChain: (chainId: number) => Promise<void>;
}
