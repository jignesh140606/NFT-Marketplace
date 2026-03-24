/**
 * ERC-721 NFT Library
 * 
 * Utilities for interacting with the deployed NFT collection
 */

import { 
  getCollectionInfo, 
  getBalance, 
  getNFTInfo,
  mint, 
  burn,
  transferFrom,
  type CollectionInfo,
  type NFTInfo,
} from '@cradle/erc721-stylus';
import type { Address, Hash } from 'viem';

const NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS as Address;
const RPC_ENDPOINT = 'https://sepolia-rollup.arbitrum.io/rpc';

export async function fetchCollectionInfo(): Promise<CollectionInfo> {
  return getCollectionInfo(NFT_ADDRESS, RPC_ENDPOINT);
}

export async function fetchBalance(account: Address): Promise<bigint> {
  const balance = await getBalance(NFT_ADDRESS, account, RPC_ENDPOINT);
  return balance.balance;
}

export async function fetchNFTInfo(tokenId: bigint): Promise<NFTInfo> {
  return getNFTInfo(NFT_ADDRESS, tokenId, RPC_ENDPOINT);
}

export async function mintNFT(
  to: Address, 
  privateKey: string
): Promise<{ hash: Hash; tokenId: bigint }> {
  return mint(NFT_ADDRESS, to, privateKey, RPC_ENDPOINT);
}

export async function burnNFT(
  tokenId: bigint, 
  privateKey: string
): Promise<Hash> {
  return burn(NFT_ADDRESS, tokenId, privateKey, RPC_ENDPOINT);
}

export async function transferNFT(
  from: Address,
  to: Address, 
  tokenId: bigint, 
  privateKey: string
): Promise<Hash> {
  return transferFrom(NFT_ADDRESS, from, to, tokenId, privateKey, RPC_ENDPOINT);
}

export const NFT_CONFIG = {
  name: 'SuperPositionNFT',
  symbol: 'SPTNFT',
  baseUri: 'https://api.example.com/metadata/',
  network: 'arbitrum-sepolia',
  features: ["ownable","mintable","burnable","pausable"],
} as const;
