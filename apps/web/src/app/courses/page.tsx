/**
 * Courses Catalog Page - Demo/Preview
 * This is a demo page showing the course components
 */

'use client';

import { useState, useEffect } from 'react';
import { CourseCard } from '@/components/courses';
import { useCourseCompletionNFT, useCourseProgress } from '@/lib/course-completion-nft';
import { WalletButton } from '@/components/wallet-button';
import Link from 'next/link';

export default function CoursesPage() {
  const { getTotalCourses, getCourse, isConnected, isContractDeployed } = useCourseCompletionNFT();
  const { getAllEnrolledCourses } = useCourseProgress();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const enrolledCourses = getAllEnrolledCourses();
  const enrollmentMap = new Map(enrolledCourses.map(p => [p.courseId, p]));

  useEffect(() => {
    async function loadCourses() {
      if (!isConnected) return;

      // Check if contract is deployed
      if (!isContractDeployed) {
        setError('Smart contract not deployed yet. Please deploy the contract first.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const total = await getTotalCourses();
        const coursePromises = [];

        for (let i = 1n; i <= total; i++) {
          coursePromises.push(getCourse(i));
        }

        const loadedCourses = await Promise.all(coursePromises);
        setCourses(loadedCourses);
      } catch (err) {
        console.error('Failed to load courses:', err);
        setError('Failed to load courses. Please check that the smart contract is deployed correctly.');
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, [isConnected, getTotalCourses, getCourse, isContractDeployed]);

  return (
    <main className="min-h-screen bg-forge-bg">
      {/* Header */}
      <div className="bg-forge-surface border-b border-forge-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-2xl font-bold text-forge-text hover:text-node-app transition-colors">
                NSkills Course Completion NFT
              </Link>
              <p className="text-forge-muted mt-1">Earn verifiable certificates as NFTs</p>
            </div>
            <WalletButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-forge-text mb-4">
            Explore Courses
          </h1>
          <p className="text-xl text-forge-muted max-w-2xl mx-auto">
            Complete courses, pass quizzes, and earn blockchain-verified certificate NFTs that prove your skills
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected ? (
          <div className="max-w-md mx-auto bg-forge-surface rounded-lg border border-forge-border p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-forge-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-xl font-semibold text-forge-text mb-2">Connect Your Wallet</h3>
            <p className="text-forge-muted mb-6">
              Connect your wallet to view available courses and track your progress
            </p>
            <WalletButton />
          </div>
        ) : (
          <>
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-forge-muted">
                  <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Loading courses...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="max-w-2xl mx-auto bg-accent-coral/10 border border-accent-coral/20 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-accent-coral flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-accent-coral mb-1">Smart Contract Not Deployed</h3>
                    <p className="text-forge-muted text-sm mb-4">{error}</p>

                    {!isContractDeployed ? (
                      <div className="text-forge-muted text-sm space-y-2">
                        <p><strong>To deploy the contract:</strong></p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Install Rust and Stylus CLI</li>
                          <li>Get Arbitrum Sepolia ETH from faucet</li>
                          <li>Run deployment command from <code className="px-1 py-0.5 bg-forge-elevated rounded text-xs">contracts/course-completion-nft/</code></li>
                          <li>Update contract address in <code className="px-1 py-0.5 bg-forge-elevated rounded text-xs">.env.local</code></li>
                        </ol>
                        <p className="mt-3">
                          <strong>Deployment command:</strong>
                        </p>
                        <code className="block bg-forge-bg p-3 rounded text-xs mt-2">
                          cargo stylus deploy --private-key=YOUR_PRIVATE_KEY --endpoint=https://sepolia-rollup.arbitrum.io/rpc
                        </code>
                      </div>
                    ) : (
                      <p className="text-forge-muted text-sm">
                        Check the documentation in <code className="px-2 py-1 bg-forge-elevated rounded text-xs">docs/COURSE_COMPLETION_NFT_IMPLEMENTATION.md</code>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Courses Grid */}
            {!loading && !error && courses.length === 0 && (
              <div className="max-w-2xl mx-auto bg-forge-surface rounded-lg border border-forge-border p-8 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-forge-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-xl font-semibold text-forge-text mb-2">No Courses Yet</h3>
                <p className="text-forge-muted">
                  Courses will appear here once admins create them. Check back soon!
                </p>
              </div>
            )}

            {!loading && !error && courses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={course.courseId.toString()}
                    course={course}
                    progress={enrollmentMap.get(Number(course.courseId))}
                    showProgress={true}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Demo Info */}
        <div className="mt-16 bg-gradient-to-br from-node-app/5 to-node-intelligence/5 rounded-lg border border-node-app/20 p-8">
          <h2 className="text-2xl font-bold text-forge-text mb-4">🚀 Getting Started</h2>
          <div className="space-y-4 text-forge-muted">
            <p>
              <strong className="text-forge-text">Step 1:</strong> Deploy the smart contract to Arbitrum Sepolia (see <code className="px-2 py-1 bg-forge-elevated rounded text-xs">docs/COURSE_COMPLETION_NFT_IMPLEMENTATION.md</code>)
            </p>
            <p>
              <strong className="text-forge-text">Step 2:</strong> Update <code className="px-2 py-1 bg-forge-elevated rounded text-xs">NEXT_PUBLIC_COURSE_COMPLETION_NFT_ADDRESS</code> in <code className="px-2 py-1 bg-forge-elevated rounded text-xs">.env.local</code>
            </p>
            <p>
              <strong className="text-forge-text">Step 3:</strong> Get a Pinata JWT from <a href="https://pinata.cloud" target="_blank" rel="noopener noreferrer" className="text-node-app hover:underline">pinata.cloud</a> and add it to <code className="px-2 py-1 bg-forge-elevated rounded text-xs">.env.local</code>
            </p>
            <p>
              <strong className="text-forge-text">Step 4:</strong> Create courses via the admin interface (coming soon) or use the contract directly
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-forge-border">
            <h3 className="font-semibold text-forge-text mb-2">✅ What's Working Now:</h3>
            <ul className="space-y-2 text-sm text-forge-muted">
              <li>✓ Smart contract fully implemented (Rust/Stylus)</li>
              <li>✓ All React hooks and components ready</li>
              <li>✓ IPFS integration complete</li>
              <li>✓ Progress tracking system</li>
              <li>✓ Certificate minting flow</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
