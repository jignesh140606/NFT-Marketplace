/**
 * ERC721 NFT Deployment Functions
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import { 
  FACTORY_ADDRESSES, 
  RPC_ENDPOINTS, 
  NFT_FACTORY_ABI, 
  ERC721_ABI,
  type SupportedNetwork,
} from './constants';
import type { DeployCollectionParams, DeployCollectionResult } from './types';

/**
 * Deploy an ERC721 collection via the deployment API
 * This calls the backend service which handles cargo-stylus deployment
 */
export async function deployERC721CollectionViaAPI(
  params: DeployCollectionParams & {
    privateKey: string;
    rpcEndpoint: string;
    deploymentApiUrl: string;
  }
): Promise<DeployCollectionResult> {
  const { name, symbol, baseUri, factoryAddress, privateKey, rpcEndpoint, deploymentApiUrl } = params;

  const response = await fetch(`${deploymentApiUrl}/deploy-nft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      symbol,
      baseUri,
      factoryAddress,
      privateKey,
      rpcEndpoint,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Deployment failed with status ${response.status}`);
  }

  const result = await response.json();
  
  return {
    collectionAddress: result.collectionAddress as Address,
    txHash: result.txHash || '0x',
    success: result.success,
    deployOutput: result.deployOutput,
    initOutput: result.initOutput,
    registerOutput: result.registerOutput,
  };
}

/**
 * Initialize an already deployed ERC721 collection
 */
export async function initializeCollection(
  contractAddress: Address,
  name: string,
  symbol: string,
  baseUri: string,
  privateKey: string,
  rpcEndpoint: string
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(rpcEndpoint);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, ERC721_ABI, wallet);

  const tx = await contract.init(name, symbol, baseUri);
  const receipt = await tx.wait();
  
  return receipt.hash;
}

/**
 * Register collection in factory
 */
export async function registerCollectionInFactory(
  collectionAddress: Address,
  name: string,
  symbol: string,
  baseUri: string,
  factoryAddress: Address,
  privateKey: string,
  rpcEndpoint: string
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(rpcEndpoint);
  const wallet = new ethers.Wallet(privateKey, provider);
  const factory = new ethers.Contract(factoryAddress, NFT_FACTORY_ABI, wallet);

  const tx = await factory.registerCollection(collectionAddress, name, symbol, baseUri);
  const receipt = await tx.wait();
  
  return receipt.hash;
}

/**
 * Check if collection is already registered in factory
 */
export async function isCollectionRegistered(
  collectionAddress: Address,
  factoryAddress: Address,
  rpcEndpoint: string
): Promise<boolean> {
  const provider = new ethers.JsonRpcProvider(rpcEndpoint);
  const factory = new ethers.Contract(factoryAddress, NFT_FACTORY_ABI, provider);

  try {
    const allCollections = await factory.getAllDeployedCollections();
    return allCollections.some(
      (addr: string) => addr.toLowerCase() === collectionAddress.toLowerCase()
    );
  } catch {
    return false;
  }
}

/**
 * Get factory address for network
 */
export function getFactoryAddress(network: SupportedNetwork): Address {
  return FACTORY_ADDRESSES[network];
}

/**
 * Get RPC endpoint for network
 */
export function getRpcEndpoint(network: SupportedNetwork): string {
  return RPC_ENDPOINTS[network];
}
