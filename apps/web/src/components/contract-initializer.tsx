/**
 * Contract Initialization Component
 * Handles initializing the deployed smart contract
 */

'use client';

import { useState } from 'react';
import { useWalletClient } from 'wagmi';
import { COURSE_COMPLETION_NFT_ABI } from '@/lib/course-completion-nft/constants';
import { useCourseCompletionNFT } from '@/lib/course-completion-nft';

// Extend window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function ContractInitializer() {
  const {
    isConnected,
    userAddress,
    contractAddress,
    transactionState,
    resetTransactionState,
    chainId,
    isContractDeployed
  } = useCourseCompletionNFT();

  const { data: walletClient } = useWalletClient();

  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [initSuccess, setInitSuccess] = useState(false);

  const switchToArbitrumSepolia = async () => {
    if (!window.ethereum) {
      setInitError('MetaMask not found');
      return;
    }

    try {
      // Try to switch to Arbitrum Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x66eee' }], // 421614 in hex
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x66eee', // 421614 in hex
              chainName: 'Arbitrum Sepolia',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
              blockExplorerUrls: ['https://sepolia.arbiscan.io'],
            }],
          });
        } catch (addError) {
          setInitError('Failed to add Arbitrum Sepolia network');
        }
      } else {
        setInitError('Failed to switch to Arbitrum Sepolia network');
      }
    }
  };

  // Check if we're on the wrong network
  console.log('ContractInitializer debug:', { isConnected, chainId, expectedChainId: 421614 });

  if (isConnected && chainId !== 421614) {
    return (
      <div className="bg-forge-surface rounded-lg border border-forge-border p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent-coral/20 to-accent-coral/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-accent-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-forge-text mb-2">Wrong Network</h3>
        <p className="text-forge-muted mb-6">
          The contract is deployed on <strong>Arbitrum Sepolia</strong>, but you're connected to the wrong network.
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-forge-elevated rounded-lg text-left">
            <span className="text-sm text-forge-muted">Current Network:</span>
            <span className="text-sm font-semibold text-accent-coral">Chain ID {chainId}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-forge-elevated rounded-lg text-left">
            <span className="text-sm text-forge-muted">Required Network:</span>
            <span className="text-sm font-semibold text-node-app">Arbitrum Sepolia (421614)</span>
          </div>
        </div>

        {initError && (
          <div className="bg-accent-coral/10 border border-accent-coral/20 rounded-lg p-4 mb-4">
            <p className="text-accent-coral text-sm">{initError}</p>
          </div>
        )}

        <button
          onClick={switchToArbitrumSepolia}
          className="w-full px-6 py-3 bg-gradient-to-r from-accent-coral to-accent-coral/80 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-accent-coral/20 transition-all duration-200"
        >
          Switch to Arbitrum Sepolia
        </button>
      </div>
    );
  }

  const initializeContract = async () => {
    if (!isConnected || !walletClient) {
      setInitError('Please connect your wallet first');
      return;
    }

    try {
      setIsInitializing(true);
      setInitError(null);
      resetTransactionState();

      // Call the initialize function on the contract with low gas price
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: COURSE_COMPLETION_NFT_ABI,
        functionName: 'initialize',
        args: [],
        maxFeePerGas: 1000000000n, // 1 GWei (very low)
        maxPriorityFeePerGas: 1000000000n, // 1 GWei
        gasLimit: 100000n, // Conservative gas limit
      });

      console.log('Initialize transaction sent:', hash);

      setInitSuccess(true);
      // Refresh the page after 3 seconds to show updated admin state
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error('Contract initialization failed:', error);
      setInitError(error instanceof Error ? error.message : 'Initialization failed');
    } finally {
      setIsInitializing(false);
    }
  };

  if (initSuccess) {
    return (
      <div className="bg-node-app/10 border border-node-app/20 rounded-lg p-6 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-node-app" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-xl font-semibold text-node-app mb-2">Contract Initialized!</h3>
        <p className="text-forge-muted mb-4">
          Smart contract has been successfully initialized. You are now the admin!
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-forge-muted">
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refreshing page...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-forge-surface rounded-lg border border-forge-border p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent-cyan/20 to-accent-cyan/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-forge-text mb-2">Contract Initialization Required</h3>
      <p className="text-forge-muted mb-6">
        The smart contract has been deployed successfully but needs to be initialized to set up admin permissions and activate the system.
      </p>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-forge-elevated rounded-lg text-left">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-cyan/10 text-accent-cyan flex items-center justify-center font-semibold text-sm">1</span>
          <span className="text-sm text-forge-text">Connect your wallet (deployment wallet)</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-forge-elevated rounded-lg text-left">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-cyan/10 text-accent-cyan flex items-center justify-center font-semibold text-sm">2</span>
          <span className="text-sm text-forge-text">Initialize contract to set admin permissions</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-forge-elevated rounded-lg text-left">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-cyan/10 text-accent-cyan flex items-center justify-center font-semibold text-sm">3</span>
          <span className="text-sm text-forge-text">Start creating courses and managing the platform</span>
        </div>
      </div>

      {!isConnected && (
        <p className="text-accent-coral text-sm mb-4">Please connect your wallet first</p>
      )}

      {initError && (
        <div className="bg-accent-coral/10 border border-accent-coral/20 rounded-lg p-4 mb-4">
          <p className="text-accent-coral text-sm">{initError}</p>
        </div>
      )}

      <div className="space-y-3">
        <div className="text-xs text-forge-muted space-y-1">
          <p>Contract: <code className="font-mono">{contractAddress}</code></p>
          <p>Your Address: <code className="font-mono">{userAddress}</code></p>
        </div>

        <button
          onClick={initializeContract}
          disabled={!isConnected || isInitializing}
          className="w-full px-6 py-3 bg-gradient-to-r from-accent-cyan to-node-app text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-accent-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isInitializing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Initializing Contract...
            </span>
          ) : (
            'Initialize Smart Contract'
          )}
        </button>
      </div>
    </div>
  );
}