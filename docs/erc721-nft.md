# ERC-721 NFT Collection

# SuperPositionNFT (SPTNFT)

An ERC-721 NFT collection for Arbitrum Sepolia using Stylus.

## Collection Details

- **Name:** SuperPositionNFT
- **Symbol:** SPTNFT
- **Base URI:** https://api.example.com/metadata/
- **Network:** arbitrum-sepolia
- **Features:** ownable, mintable, burnable, pausable

## Deployment

```bash
pnpm deploy:erc721
```

This will deploy the NFT collection and output the contract address.

## Usage

### Get Collection Info

```typescript
import { fetchCollectionInfo } from '@/lib/erc721-nft';

const info = await fetchCollectionInfo();
console.log(info.name, info.symbol, info.totalSupply);
```

### Mint NFT (Owner Only)

```typescript
import { mintNFT } from '@/lib/erc721-nft';

const { hash, tokenId } = await mintNFT('0x...', privateKey);
console.log('Minted NFT #' + tokenId);
```

### Transfer NFT

```typescript
import { transferNFT } from '@/lib/erc721-nft';

await transferNFT('0x...from', '0x...to', 1n, privateKey);
```

## Contract Features

- **ownable**: Enabled
- **mintable**: Enabled
- **burnable**: Enabled
- **pausable**: Enabled
