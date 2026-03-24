/**
 * React hook for interacting with Course Completion NFT contract
 * Follows the pattern from useERC721Interactions
 */

import { useState, useCallback } from 'react';
import { usePublicClient, useWalletClient, useAccount } from 'wagmi';
import type { Address, Hash } from 'viem';
import { COURSE_COMPLETION_NFT_ABI, CONTRACT_ADDRESSES, isContractDeployed } from '../constants';
import type {
  Course,
  Certificate,
  AsyncState,
  TransactionState,
} from '../types';

export interface UseCourseCompletionNFTOptions {
  contractAddress?: Address;
  chainId?: number;
}

export function useCourseCompletionNFT(options: UseCourseCompletionNFTOptions = {}) {
  const { address: userAddress, chainId: connectedChainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const chainId = options.chainId || connectedChainId || 421614; // Default to Arbitrum Sepolia
  const contractAddress = options.contractAddress || CONTRACT_ADDRESSES[chainId];

  const [transactionState, setTransactionState] = useState<TransactionState>({ status: 'idle' });

  // ===== Helper Functions =====

  const executeTransaction = useCallback(
    async (fn: () => Promise<Hash>, successMessage?: string) => {
      if (!walletClient || !userAddress) {
        throw new Error('Wallet not connected');
      }

      setTransactionState({ status: 'pending' });

      try {
        const hash = await fn();
        setTransactionState({ status: 'confirming', hash });

        // Wait for transaction confirmation
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash });
        }

        setTransactionState({ status: 'success', hash });
        return hash;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setTransactionState({ status: 'error', error: err });
        throw err;
      }
    },
    [walletClient, userAddress, publicClient]
  );

  // ===== Course Management Functions =====

  const createCourse = useCallback(
    async (name: string, contentCid: string, issuer: Address): Promise<bigint> => {
      if (!walletClient) throw new Error('Wallet not connected');

      const hash = await executeTransaction(async () => {
        return await walletClient.writeContract({
          address: contractAddress,
          abi: COURSE_COMPLETION_NFT_ABI,
          functionName: 'createCourse',
          args: [name, contentCid, issuer],
        });
      });

      // Get the course ID from transaction receipt or return 0
      // In production, parse the CourseCreated event
      return 0n; // Placeholder
    },
    [walletClient, contractAddress, executeTransaction]
  );

  const getCourse = useCallback(
    async (courseId: bigint): Promise<Course> => {
      if (!publicClient) throw new Error('Public client not available');

      const result = await publicClient.readContract({
        address: contractAddress,
        abi: COURSE_COMPLETION_NFT_ABI,
        functionName: 'getCourse',
        args: [courseId],
      }) as [string, string, Address, boolean, bigint, bigint];

      return {
        courseId,
        name: result[0],
        contentCid: result[1],
        issuer: result[2],
        active: result[3],
        createdAt: result[4],
        totalIssued: result[5],
      };
    },
    [publicClient, contractAddress]
  );

  const getTotalCourses = useCallback(
    async (): Promise<bigint> => {
      if (!publicClient) throw new Error('Public client not available');
      if (!isContractDeployed(chainId)) throw new Error('Contract not deployed. Please deploy the smart contract first.');

      return await publicClient.readContract({
        address: contractAddress,
        abi: COURSE_COMPLETION_NFT_ABI,
        functionName: 'getTotalCourses',
      }) as bigint;
    },
    [publicClient, contractAddress, chainId]
  );

  const setCourseActive = useCallback(
    async (courseId: bigint, active: boolean): Promise<Hash> => {
      return await executeTransaction(async () => {
        if (!walletClient) throw new Error('Wallet not connected');
        return await walletClient.writeContract({
          address: contractAddress,
          abi: COURSE_COMPLETION_NFT_ABI,
          functionName: 'setCourseActive',
          args: [courseId, active],
        });
      });
    },
    [walletClient, contractAddress, executeTransaction]
  );

  // ===== Certificate Functions =====

  const mintCertificate = useCallback(
    async (
      student: Address,
      courseId: bigint,
      skillsHash: `0x${string}`,
      metadataCid: string
    ): Promise<bigint> => {
      if (!walletClient) throw new Error('Wallet not connected');

      const hash = await executeTransaction(async () => {
        return await walletClient.writeContract({
          address: contractAddress,
          abi: COURSE_COMPLETION_NFT_ABI,
          functionName: 'mintCertificate',
          args: [student, courseId, skillsHash, metadataCid],
        });
      });

      // Parse events to get token ID
      // For now, return placeholder
      return 0n;
    },
    [walletClient, contractAddress, executeTransaction]
  );

  const getCertificate = useCallback(
    async (tokenId: bigint): Promise<Certificate> => {
      if (!publicClient) throw new Error('Public client not available');

      const result = await publicClient.readContract({
        address: contractAddress,
        abi: COURSE_COMPLETION_NFT_ABI,
        functionName: 'getCertificate',
        args: [tokenId],
      }) as [bigint, bigint, Address, `0x${string}`, string];

      return {
        tokenId,
        courseId: result[0],
        completionDate: result[1],
        student: result[2],
        skillsHash: result[3],
        metadataCid: result[4],
      };
    },
    [publicClient, contractAddress]
  );

  const hasCertificate = useCallback(
    async (student: Address, courseId: bigint): Promise<boolean> => {
      if (!publicClient) throw new Error('Public client not available');

      return await publicClient.readContract({
        address: contractAddress,
        abi: COURSE_COMPLETION_NFT_ABI,
        functionName: 'hasCertificate',
        args: [student, courseId],
      }) as boolean;
    },
    [publicClient, contractAddress]
  );

  const tokenURI = useCallback(
    async (tokenId: bigint): Promise<string> => {
      if (!publicClient) throw new Error('Public client not available');

      return await publicClient.readContract({
        address: contractAddress,
        abi: COURSE_COMPLETION_NFT_ABI,
        functionName: 'tokenURI',
        args: [tokenId],
      }) as string;
    },
    [publicClient, contractAddress]
  );

  const getUserCertificates = useCallback(
    async (address: Address): Promise<Certificate[]> => {
      if (!publicClient) throw new Error('Public client not available');

      // Get user's balance
      const balance = await publicClient.readContract({
        address: contractAddress,
        abi: COURSE_COMPLETION_NFT_ABI,
        functionName: 'balanceOf',
        args: [address],
      }) as bigint;

      // Get total supply to iterate through tokens
      const totalSupply = await publicClient.readContract({
        address: contractAddress,
        abi: COURSE_COMPLETION_NFT_ABI,
        functionName: 'totalSupply',
      }) as bigint;

      const certificates: Certificate[] = [];

      // Check each token to see if user owns it
      for (let i = 0n; i < totalSupply; i++) {
        try {
          const owner = await publicClient.readContract({
            address: contractAddress,
            abi: COURSE_COMPLETION_NFT_ABI,
            functionName: 'ownerOf',
            args: [i],
          }) as Address;

          if (owner.toLowerCase() === address.toLowerCase()) {
            const cert = await getCertificate(i);
            certificates.push(cert);
          }
        } catch (error) {
          // Token doesn't exist or error, skip
          continue;
        }
      }

      return certificates;
    },
    [publicClient, contractAddress, getCertificate]
  );

  // ===== Access Control Functions =====

  const addAdmin = useCallback(
    async (admin: Address): Promise<Hash> => {
      return await executeTransaction(async () => {
        if (!walletClient) throw new Error('Wallet not connected');
        return await walletClient.writeContract({
          address: contractAddress,
          abi: COURSE_COMPLETION_NFT_ABI,
          functionName: 'addAdmin',
          args: [admin],
        });
      });
    },
    [walletClient, contractAddress, executeTransaction]
  );

  const removeAdmin = useCallback(
    async (admin: Address): Promise<Hash> => {
      return await executeTransaction(async () => {
        if (!walletClient) throw new Error('Wallet not connected');
        return await walletClient.writeContract({
          address: contractAddress,
          abi: COURSE_COMPLETION_NFT_ABI,
          functionName: 'removeAdmin',
          args: [admin],
        });
      });
    },
    [walletClient, contractAddress, executeTransaction]
  );

  const isAdmin = useCallback(
    async (address: Address): Promise<boolean> => {
      if (!publicClient) throw new Error('Public client not available');
      if (!address || address === '0x0000000000000000000000000000000000000000') {
        return false;
      }

      try {
        return await publicClient.readContract({
          address: contractAddress,
          abi: COURSE_COMPLETION_NFT_ABI,
          functionName: 'isAdmin',
          args: [address],
        }) as boolean;
      } catch (error) {
        console.warn('isAdmin check failed:', error);
        return false;
      }
    },
    [publicClient, contractAddress]
  );

  const addCourseIssuer = useCallback(
    async (issuer: Address, courseId: bigint): Promise<Hash> => {
      return await executeTransaction(async () => {
        if (!walletClient) throw new Error('Wallet not connected');
        return await walletClient.writeContract({
          address: contractAddress,
          abi: COURSE_COMPLETION_NFT_ABI,
          functionName: 'addCourseIssuer',
          args: [issuer, courseId],
        });
      });
    },
    [walletClient, contractAddress, executeTransaction]
  );

  const removeCourseIssuer = useCallback(
    async (issuer: Address, courseId: bigint): Promise<Hash> => {
      return await executeTransaction(async () => {
        if (!walletClient) throw new Error('Wallet not connected');
        return await walletClient.writeContract({
          address: contractAddress,
          abi: COURSE_COMPLETION_NFT_ABI,
          functionName: 'removeCourseIssuer',
          args: [issuer, courseId],
        });
      });
    },
    [walletClient, contractAddress, executeTransaction]
  );

  const isCourseIssuer = useCallback(
    async (issuer: Address, courseId: bigint): Promise<boolean> => {
      if (!publicClient) throw new Error('Public client not available');

      return await publicClient.readContract({
        address: contractAddress,
        abi: COURSE_COMPLETION_NFT_ABI,
        functionName: 'isCourseIssuer',
        args: [issuer, courseId],
      }) as boolean;
    },
    [publicClient, contractAddress]
  );

  // ===== Configuration Functions =====

  const setBaseURI = useCallback(
    async (baseUri: string): Promise<Hash> => {
      return await executeTransaction(async () => {
        if (!walletClient) throw new Error('Wallet not connected');
        return await walletClient.writeContract({
          address: contractAddress,
          abi: COURSE_COMPLETION_NFT_ABI,
          functionName: 'setBaseURI',
          args: [baseUri],
        });
      });
    },
    [walletClient, contractAddress, executeTransaction]
  );

  const toggleSoulbound = useCallback(
    async (enabled: boolean): Promise<Hash> => {
      return await executeTransaction(async () => {
        if (!walletClient) throw new Error('Wallet not connected');
        return await walletClient.writeContract({
          address: contractAddress,
          abi: COURSE_COMPLETION_NFT_ABI,
          functionName: 'toggleSoulbound',
          args: [enabled],
        });
      });
    },
    [walletClient, contractAddress, executeTransaction]
  );

  const isSoulbound = useCallback(
    async (): Promise<boolean> => {
      if (!publicClient) throw new Error('Public client not available');

      return await publicClient.readContract({
        address: contractAddress,
        abi: COURSE_COMPLETION_NFT_ABI,
        functionName: 'isSoulbound',
      }) as boolean;
    },
    [publicClient, contractAddress]
  );

  // ===== Reset Transaction State =====

  const resetTransactionState = useCallback(() => {
    setTransactionState({ status: 'idle' });
  }, []);

  return {
    // Course functions
    createCourse,
    getCourse,
    getTotalCourses,
    setCourseActive,

    // Certificate functions
    mintCertificate,
    getCertificate,
    hasCertificate,
    getUserCertificates,
    tokenURI,

    // Access control
    addAdmin,
    removeAdmin,
    isAdmin,
    addCourseIssuer,
    removeCourseIssuer,
    isCourseIssuer,

    // Configuration
    setBaseURI,
    toggleSoulbound,
    isSoulbound,

    // State
    transactionState,
    resetTransactionState,

    // Contract info
    contractAddress,
    chainId,
    isConnected: !!walletClient && !!userAddress,
    userAddress,
    isContractDeployed: isContractDeployed(chainId),
  };
}
