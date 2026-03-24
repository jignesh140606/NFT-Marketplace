'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletButton() {
  return (
    <ConnectButton 
      showBalance={true}
      chainStatus="icon"
      accountStatus="address"
    />
  );
}