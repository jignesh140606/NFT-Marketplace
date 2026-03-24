import { WalletButton } from '@/components/wallet-button';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-forge-bg">
      <div className="max-w-5xl w-full text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-node-app to-node-intelligence mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>

          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-node-app to-node-intelligence bg-clip-text text-transparent">
            NSkills Course Completion NFT
          </h1>
          <p className="text-xl text-forge-muted mb-4 max-w-2xl mx-auto">
            Earn blockchain-verified certificates as soulbound NFTs. Complete courses, prove your skills, showcase achievements.
          </p>
          <p className="text-sm text-forge-muted">
            Built with Rust/Stylus, Next.js, IPFS, and Web3
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-forge-surface rounded-lg border border-forge-border p-6">
            <div className="w-12 h-12 rounded-lg bg-node-app/10 flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-node-app" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-forge-text mb-2">Complete Courses</h3>
            <p className="text-sm text-forge-muted">
              Learn from structured courses with lessons, quizzes, and hands-on practice
            </p>
          </div>

          <div className="bg-forge-surface rounded-lg border border-forge-border p-6">
            <div className="w-12 h-12 rounded-lg bg-node-intelligence/10 flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-node-intelligence" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-forge-text mb-2">Earn NFT Certificates</h3>
            <p className="text-sm text-forge-muted">
              Mint verifiable certificates as soulbound NFTs stored permanently on-chain
            </p>
          </div>

          <div className="bg-forge-surface rounded-lg border border-forge-border p-6">
            <div className="w-12 h-12 rounded-lg bg-accent-cyan/10 flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-forge-text mb-2">Showcase Skills</h3>
            <p className="text-sm text-forge-muted">
              Display your certificates in your wallet and share them with employers
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/courses"
            className="px-8 py-4 bg-gradient-to-r from-node-app to-node-intelligence text-white rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-node-app/20 hover:scale-105 transition-all duration-200"
          >
            Browse Courses
          </Link>

          <WalletButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-node-app mb-1">100%</div>
            <div className="text-sm text-forge-muted">On-Chain</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-node-intelligence mb-1">0 Gas</div>
            <div className="text-sm text-forge-muted">Until Mint</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent-cyan mb-1">Forever</div>
            <div className="text-sm text-forge-muted">Permanent</div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-forge-surface rounded-lg border border-forge-border p-6 text-left max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-forge-text mb-3">How It Works</h3>
          <ol className="space-y-3 text-sm text-forge-muted">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-node-app/10 text-node-app flex items-center justify-center font-semibold">1</span>
              <span>Connect your wallet and browse available courses</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-node-app/10 text-node-app flex items-center justify-center font-semibold">2</span>
              <span>Complete all lessons and pass the quizzes (progress saved locally)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-node-app/10 text-node-app flex items-center justify-center font-semibold">3</span>
              <span>Mint your certificate NFT - it's permanently stored on the blockchain</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-node-app/10 text-node-app flex items-center justify-center font-semibold">4</span>
              <span>View your certificates in your profile and share them anywhere</span>
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}
