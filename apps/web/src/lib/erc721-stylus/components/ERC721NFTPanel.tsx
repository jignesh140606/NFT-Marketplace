'use client';

/**
 * ERC-721 NFT Interaction Panel
 */

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useERC721Interactions } from '@cradle/erc721-stylus';
import type { Address } from 'viem';

const NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS as Address;

export function ERC721NFTPanel() {
  const { address: userAddress } = useAccount();
  const [mintTo, setMintTo] = useState('');

  const nft = useERC721Interactions({
    contractAddress: NFT_ADDRESS,
    network: 'arbitrum-sepolia',
    userAddress,
  });

  const collectionInfo = nft.collectionInfo.status === 'success' ? nft.collectionInfo.data : null;
  const balance = nft.balance.status === 'success' ? nft.balance.data : null;

  const handleMint = async () => {
    if (!mintTo) return;
    try {
      const result = await nft.mint(mintTo as Address);
      console.log('Minted NFT #' + result.tokenId.toString());
      setMintTo('');
    } catch (error) {
      console.error('Mint failed:', error);
    }
  };

  if (!NFT_ADDRESS) {
    return (
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-sm text-yellow-400">
          NFT collection not deployed yet. Run <code>pnpm deploy:erc721</code> to deploy.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          {collectionInfo?.name || 'SuperPositionNFT'} ({collectionInfo?.symbol || 'SPTNFT'})
        </h3>
        <div className="space-y-1 text-sm text-gray-400">
          <p>Total Supply: {collectionInfo?.formattedTotalSupply || '0'}</p>
          <p>Your NFTs: {balance?.balance?.toString() || '0'}</p>
          <p className="text-xs font-mono truncate">{NFT_ADDRESS}</p>
        </div>
      </div>

      <div className="p-4 bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-3">Mint NFT</h4>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Recipient address (0x...)"
            value={mintTo}
            onChange={(e) => setMintTo(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded text-white"
          />
          <button
            onClick={handleMint}
            disabled={nft.isLoading || !mintTo}
            className="w-full px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50"
          >
            {nft.isLoading ? 'Minting...' : 'Mint NFT'}
          </button>
        </div>
      </div>

      {nft.txState.status === 'success' && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-400">
            Transaction successful: {nft.txState.hash.slice(0, 10)}...
          </p>
        </div>
      )}

      {nft.error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{nft.error.message}</p>
        </div>
      )}
    </div>
  );
}
