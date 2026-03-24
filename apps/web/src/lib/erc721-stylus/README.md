# @cradle/erc721-stylus

ERC-721 NFT implementation and interaction utilities for Arbitrum Stylus.

## Features

- **Ownable** - Owner-controlled contract management
- **Mintable** - Owner can mint new NFTs
- **Burnable** - Token holders can burn their NFTs
- **Pausable** - Owner can pause/unpause transfers
- **Enumerable** - Track all tokens and owner tokens
- Complete ERC-721 standard implementation with metadata
- React hooks for easy frontend integration

## Installation

```bash
pnpm add @cradle/erc721-stylus
```

## Smart Contract

The smart contract source code is located in the `contract/` directory. This is a Rust-based Stylus contract that can be deployed to Arbitrum.

### Prerequisites

1. Install Rust and Cargo:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. Install cargo-stylus:
   ```bash
   cargo install cargo-stylus
   ```

3. Add the WASM target:
   ```bash
   rustup target add wasm32-unknown-unknown
   ```

### Building the Contract

```bash
cd contract

# Check the contract compiles correctly
cargo stylus check

# Build for deployment
cargo build --release --target wasm32-unknown-unknown
```

### Deploying to Arbitrum

#### Arbitrum Sepolia (Testnet)

```bash
cd contract
cargo stylus deploy \
  --private-key <YOUR_PRIVATE_KEY> \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc
```

#### Arbitrum One (Mainnet)

```bash
cd contract
cargo stylus deploy \
  --private-key <YOUR_PRIVATE_KEY> \
  --endpoint https://arb1.arbitrum.io/rpc
```

### Initializing the Contract

After deployment, call the `initialize` function with your collection parameters:

```rust
// Function signature:
initialize(
    name: String,        // Collection name (e.g., "My NFT Collection")
    symbol: String,      // Collection symbol (e.g., "MNFT")
    base_uri: String,    // Base URI for metadata (e.g., "https://api.example.com/metadata/")
    max_supply: U256,    // Maximum supply (0 = unlimited)
    owner: Address       // Owner address
)
```

### Contract Functions

#### ERC-721 Standard
- `name()` - Returns the collection name
- `symbol()` - Returns the collection symbol
- `balance_of(owner)` - Returns the NFT balance of an address
- `owner_of(token_id)` - Returns the owner of a token
- `token_uri(token_id)` - Returns the metadata URI for a token
- `approve(to, token_id)` - Approve an address to transfer a token
- `get_approved(token_id)` - Get the approved address for a token
- `set_approval_for_all(operator, approved)` - Set operator approval
- `is_approved_for_all(owner, operator)` - Check operator approval
- `transfer_from(from, to, token_id)` - Transfer a token
- `safe_transfer_from(from, to, token_id)` - Safe transfer
- `safe_transfer_from_with_data(from, to, token_id, data)` - Safe transfer with data

#### Collection Info
- `total_supply()` - Returns total minted tokens
- `max_supply()` - Returns maximum supply (0 = unlimited)
- `base_uri()` - Returns the base metadata URI

#### Mintable (Owner Only)
- `mint(to)` - Mint a single NFT, returns token ID
- `mint_batch(to, count)` - Mint multiple NFTs, returns token IDs

#### Burnable
- `burn(token_id)` - Burn a token (must be owner or approved)

#### Pausable (Owner Only)
- `pause()` - Pause transfers
- `unpause()` - Unpause transfers
- `is_paused()` - Check if paused

#### Ownable
- `owner()` - Get current owner
- `set_base_uri(new_base_uri)` - Update base URI
- `transfer_ownership(new_owner)` - Transfer ownership
- `renounce_ownership()` - Renounce ownership

#### Enumerable
- `token_by_index(index)` - Get token ID by global index
- `token_of_owner_by_index(owner, index)` - Get token ID by owner index

#### ERC-165
- `supports_interface(interface_id)` - Check supported interfaces

## Frontend Usage

### Using React Hooks

```tsx
import { useERC721Interactions, CHAIN_IDS } from '@cradle/erc721-stylus';

function NFTDashboard() {
  const nft = useERC721Interactions({
    contractAddress: '0x...', // Your deployed contract address
    rpcEndpoint: 'https://sepolia-rollup.arbitrum.io/rpc',
    privateKey: process.env.PRIVATE_KEY,
  });

  return (
    <div>
      <p>Name: {nft.collectionInfo?.name}</p>
      <p>Symbol: {nft.collectionInfo?.symbol}</p>
      <p>Total Supply: {nft.collectionInfo?.totalSupply}</p>
      <button onClick={() => nft.mint('0x...')}>
        Mint NFT
      </button>
    </div>
  );
}
```

### Using Interaction Functions Directly

```tsx
import { getCollectionInfo, mint, transferFrom } from '@cradle/erc721-stylus';

// Get collection information
const info = await getCollectionInfo({
  contractAddress: '0x...',
  rpcEndpoint: 'https://sepolia-rollup.arbitrum.io/rpc',
});

console.log(info.name, info.symbol, info.totalSupply);

// Mint an NFT
const tokenId = await mint({
  contractAddress: '0x...',
  rpcEndpoint: 'https://sepolia-rollup.arbitrum.io/rpc',
  privateKey: '0x...',
  to: '0x...',
});

console.log('Minted token ID:', tokenId);

// Transfer an NFT
await transferFrom({
  contractAddress: '0x...',
  rpcEndpoint: 'https://sepolia-rollup.arbitrum.io/rpc',
  privateKey: '0x...',
  from: '0x...',
  to: '0x...',
  tokenId: '1',
});
```

## API Reference

### Constants

- `ERC721_ABI` - Full ABI for ERC721 Stylus contract
- `CHAIN_IDS` - Chain IDs for supported networks
- `RPC_ENDPOINTS` - Default RPC endpoints
- `FACTORY_ADDRESSES` - Factory contract addresses

### Hooks

- `useERC721Deploy` - Hook for deploying new NFT collections
- `useERC721Interactions` - Hook for interacting with deployed collections

### Functions

- `deployERC721CollectionViaAPI` - Deploy a new collection via API
- `initializeCollection` - Initialize a deployed collection
- `getCollectionInfo` - Get collection information
- `getBalance` - Get NFT balance
- `getNFTInfo` - Get specific NFT information
- `mint` - Mint a new NFT (owner only)
- `transferFrom` - Transfer an NFT
- `safeTransferFrom` - Safely transfer an NFT
- `approve` - Approve an address to transfer
- `setApprovalForAll` - Set operator approval
- `burn` - Burn an NFT
- `setBaseUri` - Update base URI (owner only)
- `pause` - Pause transfers (owner only)
- `unpause` - Unpause transfers (owner only)
- `transferOwnership` - Transfer contract ownership

## Metadata Structure

Your NFT metadata should follow the standard format. For token ID `1`, the URI would be:
`{base_uri}1`

Example metadata JSON:
```json
{
  "name": "NFT #1",
  "description": "Description of this NFT",
  "image": "https://example.com/images/1.png",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Rare"
    },
    {
      "trait_type": "Power",
      "value": 100
    }
  ]
}
```

## License

MIT OR Apache-2.0
