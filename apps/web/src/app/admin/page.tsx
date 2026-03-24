/**
 * Admin Dashboard Page - Course management and statistics
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCourseCompletionNFT } from '@/lib/course-completion-nft';
import { WalletButton } from '@/components/wallet-button';
import { ContractInitializer } from '@/components/contract-initializer';
import { CONTRACT_ADDRESSES } from '@/lib/course-completion-nft/constants';

export default function AdminDashboardPage() {
  const {
    isAdmin,
    getTotalCourses,
    getCourse,
    setCourseActive,
    isConnected,
    userAddress,
    transactionState,
    chainId,
    isContractDeployed
  } = useCourseCompletionNFT();

  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalCertificates: 0
  });
  const [error, setError] = useState<string | null>(null);

  // Check admin status and load data
  useEffect(() => {
    async function checkAdminAndLoadData() {
      if (!isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setAdminStatus(null); // Reset admin status

        console.log('Debug info:', {
          chainId,
          isContractDeployed,
          userAddress,
          contractAddress: CONTRACT_ADDRESSES[chainId],
          expectedChain: 421614
        });

        // Check if contract is deployed on current network
        if (!isContractDeployed || chainId !== 421614) {
          console.log('Contract not deployed on chain:', chainId);
          setError(`Contract not deployed on this network. Please switch to Arbitrum Sepolia (Chain ID: 421614). Current chain: ${chainId}`);
          setLoading(false);
          return;
        }

        // Check if user is admin
        if (!userAddress) {
          setError('Wallet address not available. Please reconnect your wallet.');
          setLoading(false);
          return;
        }

        // First, check if contract needs initialization by testing basic functionality
        try {
          console.log('Testing contract functionality with getTotalCourses...');
          const totalCourses = await getTotalCourses();
          console.log('getTotalCourses succeeded, result:', totalCourses);

          // Contract is working, now check admin status
          console.log('Checking admin status for:', userAddress);
          const isUserAdmin = await isAdmin(userAddress);
          console.log('isAdmin result:', isUserAdmin);
          setAdminStatus(isUserAdmin);

          // If not admin and no courses exist, the deployer might need to initialize
          if (!isUserAdmin && totalCourses === 0n) {
            console.log('User not admin and no courses exist - might need initialization');
            setError('Contract needs initialization. If you deployed this contract, please initialize it to set admin permissions.');
            setLoading(false);
            return;
          }

          // If not admin but courses exist, show access denied
          if (!isUserAdmin) {
            console.log('User not admin but contract is initialized - show access denied');
            setLoading(false);
            return;
          }

        } catch (err) {
          console.log('Contract functionality test failed - contract needs initialization:', err);
          // Contract call failed - definitely needs initialization
          setError('Contract needs initialization. Please initialize the contract first.');
          setAdminStatus(null); // Clear admin status
          setLoading(false);
          return;
        }

        // Load courses and calculate stats
        const total = await getTotalCourses();
        const coursePromises = [];

        for (let i = 1n; i <= total; i++) {
          coursePromises.push(getCourse(i));
        }

        const loadedCourses = await Promise.all(coursePromises);
        setCourses(loadedCourses);

        // Calculate stats
        const activeCourses = loadedCourses.filter(course => course.active).length;
        const totalCertificates = loadedCourses.reduce(
          (sum, course) => sum + Number(course.total_issued),
          0
        );

        setStats({
          totalCourses: Number(total),
          activeCourses,
          totalCertificates
        });

      } catch (err) {
        console.error('Failed to load admin data:', err);
        setError('Failed to load admin dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndLoadData();
  }, [isConnected, userAddress, isAdmin, getTotalCourses, getCourse, chainId, isContractDeployed]);

  const handleToggleCourseActive = async (courseId: bigint, currentActive: boolean) => {
    try {
      await setCourseActive(courseId, !currentActive);

      // Refresh courses list
      const updatedCourse = await getCourse(courseId);
      setCourses(prev => prev.map(course =>
        course.courseId === courseId ? updatedCourse : course
      ));

      // Update stats
      const newActiveCourses = currentActive ? stats.activeCourses - 1 : stats.activeCourses + 1;
      setStats(prev => ({ ...prev, activeCourses: newActiveCourses }));

    } catch (err) {
      console.error('Failed to toggle course status:', err);
    }
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-forge-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-forge-surface rounded-lg border border-forge-border p-8 text-center">
            <h3 className="text-xl font-semibold text-forge-text mb-4">Connect Your Wallet</h3>
            <p className="text-forge-muted mb-6">Please connect your wallet to access the admin dashboard</p>
            <WalletButton />
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-forge-bg">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-forge-muted">
              <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Loading admin dashboard...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Check if we need to show ContractInitializer (prioritize this over access denied)
  if (error && (error.includes('needs initialization') || error.includes('Contract not deployed'))) {
    return (
      <main className="min-h-screen bg-forge-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Admin Debug Info:</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <div>Error: {error}</div>
              <div>Chain ID: {chainId}</div>
              <div>Contract Deployed: {isContractDeployed ? 'Yes' : 'No'}</div>
              <div>User Address: {userAddress || 'Not connected'}</div>
              <div>Admin Status: {adminStatus === null ? 'Unknown' : adminStatus ? 'Yes' : 'No'}</div>
              <div>Expected Chain: 421614 (Arbitrum Sepolia)</div>
            </div>
          </div>
          <ContractInitializer />
        </div>
      </main>
    );
  }

  if (adminStatus === false) {
    return (
      <main className="min-h-screen bg-forge-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-accent-coral/10 border border-accent-coral/20 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-accent-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-xl font-semibold text-accent-coral mb-4">Access Denied</h3>
            <p className="text-forge-muted mb-6">
              You don't have admin permissions. Only contract admins can access this dashboard.
            </p>
            <div className="space-y-2 text-sm text-forge-muted">
              <p>Your address: <span className="font-mono">{userAddress}</span></p>
              <p>Contact the contract owner if you believe this is an error.</p>
            </div>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-node-app text-white rounded-lg hover:bg-node-app/90"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-forge-bg">
      {/* Header */}
      <div className="bg-forge-surface border-b border-forge-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-2xl font-bold text-forge-text hover:text-accent-cyan transition-colors">
                NSkills Admin Dashboard
              </Link>
              <p className="text-forge-muted mt-1">Course management and analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-accent-cyan/10 text-accent-cyan rounded-full text-sm font-medium">
                Admin
              </span>
              <WalletButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-8">
            <div className="bg-accent-coral/10 border border-accent-coral/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-accent-coral flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-accent-coral mb-1">Error Loading Dashboard</h3>
                  <p className="text-forge-muted text-sm">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!error && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link
                href="/admin/courses/create"
                className="bg-gradient-to-br from-accent-cyan/10 to-accent-cyan/5 border border-accent-cyan/20 rounded-lg p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <svg className="w-5 h-5 text-forge-muted group-hover:text-accent-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-forge-text mb-2">Create Course</h3>
                <p className="text-sm text-forge-muted">Add a new course with lessons and quizzes</p>
              </Link>

              <div className="bg-forge-surface border border-forge-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <svg className="w-8 h-8 text-node-app" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-2xl font-bold text-node-app">{stats.totalCourses}</span>
                </div>
                <h3 className="text-lg font-semibold text-forge-text mb-1">Total Courses</h3>
                <p className="text-sm text-forge-muted">{stats.activeCourses} active</p>
              </div>

              <div className="bg-forge-surface border border-forge-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <svg className="w-8 h-8 text-node-intelligence" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className="text-2xl font-bold text-node-intelligence">{stats.totalCertificates}</span>
                </div>
                <h3 className="text-lg font-semibold text-forge-text mb-1">Certificates Issued</h3>
                <p className="text-sm text-forge-muted">Across all courses</p>
              </div>

              <div className="bg-forge-surface border border-forge-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <svg className="w-8 h-8 text-accent-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-2xl font-bold text-accent-lime">
                    {stats.totalCourses > 0 ? Math.round((stats.totalCertificates / stats.totalCourses) * 10) / 10 : 0}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-forge-text mb-1">Avg Completion</h3>
                <p className="text-sm text-forge-muted">Certificates per course</p>
              </div>
            </div>

            {/* Courses Management */}
            <div className="bg-forge-surface rounded-lg border border-forge-border">
              <div className="px-6 py-4 border-b border-forge-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-forge-text">Course Management</h2>
                  <Link
                    href="/admin/courses/create"
                    className="px-4 py-2 bg-accent-cyan text-white rounded-lg hover:bg-accent-cyan/90 transition-colors"
                  >
                    + New Course
                  </Link>
                </div>
              </div>

              {courses.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-forge-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="text-lg font-semibold text-forge-text mb-2">No Courses Created</h3>
                  <p className="text-forge-muted mb-4">Create your first course to get started</p>
                  <Link
                    href="/admin/courses/create"
                    className="px-6 py-3 bg-accent-cyan text-white rounded-lg hover:bg-accent-cyan/90 transition-colors"
                  >
                    Create First Course
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-forge-elevated">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-forge-muted uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-forge-muted uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-forge-muted uppercase tracking-wider">Certificates</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-forge-muted uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-forge-muted uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forge-border">
                      {courses.map((course) => (
                        <tr key={course.courseId.toString()} className="hover:bg-forge-elevated/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-forge-text">{course.name}</div>
                                <div className="text-sm text-forge-muted">ID: {course.courseId.toString()}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              course.active
                                ? 'bg-node-app/10 text-node-app'
                                : 'bg-accent-coral/10 text-accent-coral'
                            }`}>
                              {course.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-forge-text">
                            {course.total_issued.toString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-forge-muted">
                            {new Date(Number(course.created_at) * 1000).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleCourseActive(course.courseId, course.active)}
                                disabled={transactionState.status === 'pending' || transactionState.status === 'confirming'}
                                className={`px-3 py-1 text-xs rounded transition-colors ${
                                  course.active
                                    ? 'bg-accent-coral/10 text-accent-coral hover:bg-accent-coral/20'
                                    : 'bg-node-app/10 text-node-app hover:bg-node-app/20'
                                } disabled:opacity-50`}
                              >
                                {course.active ? 'Deactivate' : 'Activate'}
                              </button>
                              <Link
                                href={`/courses/${course.courseId.toString()}`}
                                className="px-3 py-1 text-xs bg-forge-border text-forge-text rounded hover:bg-forge-elevated transition-colors"
                              >
                                View
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Transaction Status */}
            {transactionState.status !== 'idle' && (
              <div className="fixed bottom-4 right-4 bg-forge-surface border border-forge-border rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  {transactionState.status === 'pending' && (
                    <>
                      <svg className="w-5 h-5 text-amber-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-sm text-forge-text">Processing transaction...</span>
                    </>
                  )}
                  {transactionState.status === 'confirming' && (
                    <>
                      <svg className="w-5 h-5 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-forge-text">Confirming...</span>
                    </>
                  )}
                  {transactionState.status === 'success' && (
                    <>
                      <svg className="w-5 h-5 text-node-app" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-forge-text">Transaction successful!</span>
                    </>
                  )}
                  {transactionState.status === 'error' && (
                    <>
                      <svg className="w-5 h-5 text-accent-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm text-forge-text">Transaction failed</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}