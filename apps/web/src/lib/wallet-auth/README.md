# @cradle/wallet-auth

Wallet authentication with RainbowKit and wagmi for Web3 applications.

## Features

- 🌈 RainbowKit integration for beautiful wallet UI
- ⛓️ Multi-chain support (Arbitrum, Arbitrum Sepolia)
- 🔗 WalletConnect v2 support
- ⚛️ React hooks for wallet state
- 🎨 Dark theme pre-configured

## Installation

```bash
pnpm add @cradle/wallet-auth
```

## Setup

### 1. Get a WalletConnect Project ID

Get your project ID from [WalletConnect Cloud](https://dashboard.reown.com/).

### 2. Set Environment Variable

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

### 3. Create Config and Wrap Your App

```tsx
import { WalletProvider, createWalletConfig, ConnectButton } from '@cradle/wallet-auth';

const config = createWalletConfig({
  appName: 'My DApp',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
});

function App({ children }) {
  return (
    <WalletProvider config={config}>
      <nav>
        <ConnectButton />
      </nav>
      {children}
    </WalletProvider>
  );
}
```

## Usage

### Using the Hook

```tsx
import { useWalletAuth } from '@cradle/wallet-auth';

function WalletStatus() {
  const { status, connect, disconnect, switchChain } = useWalletAuth();

  if (status.isConnected) {
    return (
      <div>
        <p>Address: {status.address}</p>
        <p>Chain: {status.chainName}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return <button onClick={connect}>Connect Wallet</button>;
}
```

### Using wagmi Hooks

```tsx
import { useAccount, useBalance, usePublicClient } from '@cradle/wallet-auth';

function Balance() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  return <p>Balance: {balance?.formatted} {balance?.symbol}</p>;
}
```

## API Reference

### `createWalletConfig(config)`

Creates a wagmi config for use with `WalletProvider`.

**Options:**
- `appName` - Your application name
- `projectId` - WalletConnect project ID
- `chains` - Optional array of chains (defaults to Arbitrum chains)

### `WalletProvider`

React component that wraps your app with wallet providers.

**Props:**
- `config` - Config from `createWalletConfig()`
- `children` - Your app content

### `useWalletAuth()`

Hook for wallet connection state and actions.

**Returns:**
- `status.isConnected` - Whether wallet is connected
- `status.address` - Connected wallet address
- `status.chainId` - Current chain ID
- `connect()` - Open connect modal
- `disconnect()` - Disconnect wallet
- `switchChain(chainId)` - Switch to a different chain

### `ConnectButton`

Pre-styled RainbowKit connect button component.
