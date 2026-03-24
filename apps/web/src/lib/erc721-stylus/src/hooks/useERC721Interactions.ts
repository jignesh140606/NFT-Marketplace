/**
 * React hook for interacting with ERC721 NFT collections using wagmi
 */

import { useState, useCallback, useEffect } from 'react';
import type { Address, Hash } from 'viem';
import { ERC721_ABI } from '../constants';
import type { 
  UseERC721InteractionsOptions, 
  UseERC721InteractionsReturn,
  AsyncState,
  TransactionState,
  CollectionInfo,
  BalanceInfo,
  NFTInfo,
} from '../types';

export function useERC721Interactions(options: UseERC721InteractionsOptions): UseERC721InteractionsReturn {
  const { 
    contractAddress, 
    network,
    publicClient,
    walletClient,
    userAddress,
  } = options;

  const [collectionInfo, setCollectionInfo] = useState<AsyncState<CollectionInfo>>({ status: 'idle' });
  const [balance, setBalance] = useState<AsyncState<BalanceInfo>>({ status: 'idle' });
  const [txState, setTxState] = useState<TransactionState>({ status: 'idle' });
  const [error, setError] = useState<Error | null>(null);

  // Fetch collection info
  const refetchCollectionInfo = useCallback(async () => {
    if (!publicClient) return;
    
    setCollectionInfo({ status: 'loading' });
    try {
      const [name, symbol, baseUri, totalSupply, owner, paused] = await Promise.all([
        publicClient.readContract({
          address: contractAddress,
          abi: ERC721_ABI,
          functionName: 'name',
        }) as Promise<string>,
        publicClient.readContract({
          address: contractAddress,
          abi: ERC721_ABI,
          functionName: 'symbol',
        }) as Promise<string>,
        publicClient.readContract({
          address: contractAddress,
          abi: ERC721_ABI,
          functionName: 'baseUri',
        }) as Promise<string>,
        publicClient.readContract({
          address: contractAddress,
          abi: ERC721_ABI,
          functionName: 'totalSupply',
        }) as Promise<bigint>,
        publicClient.readContract({
          address: contractAddress,
          abi: ERC721_ABI,
          functionName: 'owner',
        }) as Promise<Address>,
        publicClient.readContract({
          address: contractAddress,
          abi: ERC721_ABI,
          functionName: 'paused',
        }) as Promise<boolean>,
      ]);

      setCollectionInfo({
        status: 'success',
        data: {
          address: contractAddress,
          name,
          symbol,
          baseUri,
          totalSupply,
          formattedTotalSupply: totalSupply.toString(),
          owner,
          paused,
        },
      });
    } catch (err) {
      setCollectionInfo({ status: 'error', error: err instanceof Error ? err : new Error(String(err)) });
    }
  }, [publicClient, contractAddress]);

  // Fetch balance
  const refetchBalance = useCallback(async () => {
    if (!publicClient || !userAddress) {
      setBalance({ status: 'idle' });
      return;
    }
    setBalance({ status: 'loading' });
    try {
      const balanceValue = await publicClient.readContract({
        address: contractAddress,
        abi: ERC721_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
      }) as bigint;
      
      setBalance({
        status: 'success',
        data: { balance: balanceValue },
      });
    } catch (err) {
      setBalance({ status: 'error', error: err instanceof Error ? err : new Error(String(err)) });
    }
  }, [publicClient, contractAddress, userAddress]);

  // Fetch on mount
  useEffect(() => {
    refetchCollectionInfo();
    refetchBalance();
  }, [refetchCollectionInfo, refetchBalance]);

  // Get NFT info
  const getNFTInfo = useCallback(async (tokenId: bigint): Promise<NFTInfo> => {
    if (!publicClient) {
      throw new Error('Public client is required');
    }
    
    const [owner, tokenUri, approved] = await Promise.all([
      publicClient.readContract({
        address: contractAddress,
        abi: ERC721_ABI,
        functionName: 'ownerOf',
        args: [tokenId],
      }) as Promise<Address>,
      publicClient.readContract({
        address: contractAddress,
        abi: ERC721_ABI,
        functionName: 'tokenURI',
        args: [tokenId],
      }) as Promise<string>,
      publicClient.readContract({
        address: contractAddress,
        abi: ERC721_ABI,
        functionName: 'getApproved',
        args: [tokenId],
      }) as Promise<Address>,
    ]);

    return { tokenId, owner, tokenUri, approved };
  }, [publicClient, contractAddress]);

  // Helper to execute a write transaction
  const executeTransaction = useCallback(async (
    functionName: string,
    args: unknown[]
  ): Promise<Hash> => {
    if (!walletClient || !publicClient) {
      throw new Error('Wallet client is required for transactions');
    }

    setError(null);
    setTxState({ status: 'pending' });

    try {
      // Use any type assertion for dynamic contract calls
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: ERC721_ABI,
        functionName: functionName as any,
        args: args as any,
        account: walletClient.account,
      } as any);

      const hash = await walletClient.writeContract(request as any);
      setTxState({ status: 'confirming', hash });

      await publicClient.waitForTransactionReceipt({ hash });
      setTxState({ status: 'success', hash });

      return hash;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setTxState({ status: 'error', error });
      throw error;
    }
  }, [walletClient, publicClient, contractAddress]);

  // Mint
  const mint = useCallback(async (to: Address): Promise<{ hash: Hash; tokenId: bigint }> => {
    if (!publicClient) {
      throw new Error('Public client is required');
    }

    // Get current total supply to estimate token ID
    const totalSupplyBefore = await publicClient.readContract({
      address: contractAddress,
      abi: ERC721_ABI,
      functionName: 'totalSupply',
    }) as bigint;

    const hash = await executeTransaction('mint', [to]);
    
    // Token ID is typically totalSupply + 1 or next token ID
    const tokenId = totalSupplyBefore + 1n;
    
    refetchCollectionInfo();
    refetchBalance();
    
    return { hash, tokenId };
  }, [executeTransaction, publicClient, contractAddress, refetchCollectionInfo, refetchBalance]);

  // Transfer from
  const transferFrom = useCallback(async (from: Address, to: Address, tokenId: bigint): Promise<Hash> => {
    const hash = await executeTransaction('transferFrom', [from, to, tokenId]);
    refetchBalance();
    return hash;
  }, [executeTransaction, refetchBalance]);

  // Safe transfer from
  const safeTransferFrom = useCallback(async (from: Address, to: Address, tokenId: bigint): Promise<Hash> => {
    const hash = await executeTransaction('safeTransferFrom', [from, to, tokenId]);
    refetchBalance();
    return hash;
  }, [executeTransaction, refetchBalance]);

  // Approve
  const approve = useCallback(async (approved: Address, tokenId: bigint): Promise<Hash> => {
    return executeTransaction('approve', [approved, tokenId]);
  }, [executeTransaction]);

  // Set approval for all
  const setApprovalForAll = useCallback(async (operator: Address, approved: boolean): Promise<Hash> => {
    return executeTransaction('setApprovalForAll', [operator, approved]);
  }, [executeTransaction]);

  // Burn
  const burn = useCallback(async (tokenId: bigint): Promise<Hash> => {
    const hash = await executeTransaction('burn', [tokenId]);
    refetchCollectionInfo();
    refetchBalance();
    return hash;
  }, [executeTransaction, refetchCollectionInfo, refetchBalance]);

  // Set base URI
  const setBaseUri = useCallback(async (baseUri: string): Promise<Hash> => {
    const hash = await executeTransaction('setBaseUri', [baseUri]);
    refetchCollectionInfo();
    return hash;
  }, [executeTransaction, refetchCollectionInfo]);

  // Pause
  const pause = useCallback(async (): Promise<Hash> => {
    const hash = await executeTransaction('pause', []);
    refetchCollectionInfo();
    return hash;
  }, [executeTransaction, refetchCollectionInfo]);

  // Unpause
  const unpause = useCallback(async (): Promise<Hash> => {
    const hash = await executeTransaction('unpause', []);
    refetchCollectionInfo();
    return hash;
  }, [executeTransaction, refetchCollectionInfo]);

  // Transfer ownership
  const transferOwnership = useCallback(async (newOwner: Address): Promise<Hash> => {
    const hash = await executeTransaction('transferOwnership', [newOwner]);
    refetchCollectionInfo();
    return hash;
  }, [executeTransaction, refetchCollectionInfo]);

  return {
    collectionInfo,
    refetchCollectionInfo,
    balance,
    refetchBalance,
    getNFTInfo,
    mint,
    transferFrom,
    safeTransferFrom,
    approve,
    setApprovalForAll,
    burn,
    setBaseUri,
    pause,
    unpause,
    transferOwnership,
    txState,
    isLoading: txState.status === 'pending' || txState.status === 'confirming',
    error,
  };
}
