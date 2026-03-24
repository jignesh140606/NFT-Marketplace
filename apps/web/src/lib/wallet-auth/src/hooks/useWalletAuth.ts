'use client';

import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import type { WalletStatus, WalletAuthState } from '../types';

export interface UseWalletAuthReturn extends WalletAuthState { }

export function useWalletAuth(): UseWalletAuthReturn {
    const { address, isConnected, isConnecting, isDisconnected, chain } = useAccount();
    const { disconnect } = useDisconnect();
    const { openConnectModal } = useConnectModal();
    const { switchChainAsync } = useSwitchChain();

    const status: WalletStatus = {
        isConnected,
        isConnecting,
        isDisconnected,
        address,
        chainId: chain?.id,
        chainName: chain?.name,
    };

    const connect = () => {
        if (openConnectModal) {
            openConnectModal();
        }
    };

    const switchChain = async (chainId: number) => {
        await switchChainAsync({ chainId });
    };

    return {
        status,
        connect,
        disconnect,
        switchChain,
    };
}
