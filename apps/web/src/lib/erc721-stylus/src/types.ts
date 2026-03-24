/**
 * ERC721 Stylus Types
 */

import type { Address, Hash, PublicClient, WalletClient } from 'viem';
import type { SupportedNetwork } from './constants';

/**
 * Collection deployment parameters
 */
export interface DeployCollectionParams {
  name: string;
  symbol: string;
  baseUri: string;
  factoryAddress?: Address;
}

/**
 * Collection deployment result
 */
export interface DeployCollectionResult {
  collectionAddress: Address;
  txHash: Hash;
  success: boolean;
  deployOutput?: string;
  initOutput?: string;
  registerOutput?: string;
}

/**
 * Collection information
 */
export interface CollectionInfo {
  address: Address;
  name: string;
  symbol: string;
  baseUri: string;
  totalSupply: bigint;
  formattedTotalSupply: string;
  owner: Address;
  paused: boolean;
}

/**
 * NFT information
 */
export interface NFTInfo {
  tokenId: bigint;
  owner: Address;
  tokenUri: string;
  approved: Address;
}

/**
 * Balance information
 */
export interface BalanceInfo {
  balance: bigint;
}

/**
 * Transaction state
 */
export type TransactionState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'confirming'; hash: Hash }
  | { status: 'success'; hash: Hash }
  | { status: 'error'; error: Error };

/**
 * Deployment state
 */
export type DeploymentState =
  | { status: 'idle' }
  | { status: 'deploying' }
  | { status: 'activating' }
  | { status: 'initializing' }
  | { status: 'registering' }
  | { status: 'success'; result: DeployCollectionResult }
  | { status: 'error'; error: Error };

/**
 * Async state for data fetching
 */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

/**
 * Configuration for deployment hook (uses wagmi)
 */
export interface UseERC721DeployOptions {
  network: SupportedNetwork;
  privateKey?: string;
  rpcEndpoint?: string;
  publicClient?: PublicClient;
  walletClient?: WalletClient;
  userAddress?: Address;
  deploymentApiUrl?: string;
}

/**
 * Configuration for interactions hook (uses wagmi)
 */
export interface UseERC721InteractionsOptions {
  contractAddress: Address;
  network: SupportedNetwork;
  publicClient?: PublicClient;
  walletClient?: WalletClient;
  userAddress?: Address;
}

/**
 * Return type for deployment hook
 */
export interface UseERC721DeployReturn {
  deployCollection: (params: DeployCollectionParams) => Promise<DeployCollectionResult>;
  deploymentState: DeploymentState;
  isDeploying: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Return type for interactions hook
 */
export interface UseERC721InteractionsReturn {
  // Collection info
  collectionInfo: AsyncState<CollectionInfo>;
  refetchCollectionInfo: () => Promise<void>;
  
  // Balance
  balance: AsyncState<BalanceInfo>;
  refetchBalance: () => Promise<void>;
  
  // NFT info
  getNFTInfo: (tokenId: bigint) => Promise<NFTInfo>;
  
  // Transactions (uses wallet popup)
  mint: (to: Address) => Promise<{ hash: Hash; tokenId: bigint }>;
  transferFrom: (from: Address, to: Address, tokenId: bigint) => Promise<Hash>;
  safeTransferFrom: (from: Address, to: Address, tokenId: bigint) => Promise<Hash>;
  approve: (approved: Address, tokenId: bigint) => Promise<Hash>;
  setApprovalForAll: (operator: Address, approved: boolean) => Promise<Hash>;
  burn: (tokenId: bigint) => Promise<Hash>;
  setBaseUri: (baseUri: string) => Promise<Hash>;
  pause: () => Promise<Hash>;
  unpause: () => Promise<Hash>;
  transferOwnership: (newOwner: Address) => Promise<Hash>;
  
  // Transaction state
  txState: TransactionState;
  isLoading: boolean;
  error: Error | null;
}
