import { WalletButton } from '@/components/wallet-button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-4xl font-bold mb-8">
          My DApp
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
          A Web3 application built with Cradle
        </p>
        
        <div className="flex justify-center">
          <WalletButton />
        </div>
      </div>
    </main>
  );
}