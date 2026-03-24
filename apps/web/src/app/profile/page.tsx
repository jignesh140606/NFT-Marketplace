/**
 * User Profile Page - Display certificates and course progress
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCourseCompletionNFT, useCourseProgress } from '@/lib/course-completion-nft';
import { CertificateDisplay } from '@/components/certificates';
import { CourseCard, ProgressTracker } from '@/components/courses';
import { WalletButton } from '@/components/wallet-button';

export default function ProfilePage() {
  const { getUserCertificates, isConnected, address, getCourse } = useCourseCompletionNFT();
  const { getAllEnrolledCourses, exportProgress } = useCourseProgress();

  const [certificates, setCertificates] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'certificates' | 'progress'>('certificates');

  useEffect(() => {
    async function loadProfileData() {
      if (!isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load certificates
        const userCertificates = await getUserCertificates();
        setCertificates(userCertificates);

        // Load enrolled courses with course details
        const enrolledProgress = getAllEnrolledCourses();
        const coursesWithDetails = await Promise.all(
          enrolledProgress.map(async (progress) => {
            try {
              const courseData = await getCourse(BigInt(progress.courseId));
              return { ...progress, courseData };
            } catch (err) {
              console.warn(`Failed to load course ${progress.courseId}:`, err);
              return { ...progress, courseData: null };
            }
          })
        );

        setEnrolledCourses(coursesWithDetails.filter(course => course.courseData !== null));
      } catch (err) {
        console.error('Failed to load profile data:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [isConnected, getUserCertificates, getAllEnrolledCourses, getCourse]);

  const handleExportProgress = () => {
    const progressData = exportProgress();
    const blob = new Blob([JSON.stringify(progressData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `course-progress-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-forge-bg">
        {/* Header */}
        <div className="bg-forge-surface border-b border-forge-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-forge-text hover:text-node-app transition-colors">
                NSkills Course NFT
              </Link>
              <WalletButton />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-forge-surface rounded-lg border border-forge-border p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-forge-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-xl font-semibold text-forge-text mb-4">Connect Your Wallet</h3>
            <p className="text-forge-muted mb-6">
              Connect your wallet to view your certificates and course progress
            </p>
            <WalletButton />
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
            <Link href="/" className="text-2xl font-bold text-forge-text hover:text-node-app transition-colors">
              NSkills Course NFT
            </Link>
            <WalletButton />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-forge-surface rounded-lg border border-forge-border p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-forge-text mb-2">My Profile</h1>
              <p className="text-forge-muted font-mono text-sm mb-4">{address}</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-node-intelligence" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className="text-forge-text font-semibold">{certificates.length}</span>
                  <span className="text-forge-muted">Certificates</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-node-app" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-forge-text font-semibold">{enrolledCourses.length}</span>
                  <span className="text-forge-muted">Enrolled Courses</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportProgress}
                className="px-4 py-2 border border-forge-border rounded-lg text-forge-text hover:bg-forge-elevated transition-colors"
                title="Export progress data for backup"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <Link
                href="/courses"
                className="px-4 py-2 bg-gradient-to-r from-node-app to-node-intelligence text-white rounded-lg hover:shadow-lg transition-all"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-forge-muted">
              <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Loading profile data...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-accent-coral/10 border border-accent-coral/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-accent-coral flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-accent-coral mb-1">Error Loading Profile</h3>
                <p className="text-forge-muted text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Tab Navigation */}
            <div className="flex border-b border-forge-border mb-8">
              <button
                onClick={() => setActiveTab('certificates')}
                className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === 'certificates'
                    ? 'border-node-intelligence text-node-intelligence'
                    : 'border-transparent text-forge-muted hover:text-forge-text'
                }`}
              >
                Certificates ({certificates.length})
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === 'progress'
                    ? 'border-node-app text-node-app'
                    : 'border-transparent text-forge-muted hover:text-forge-text'
                }`}
              >
                Enrolled Courses ({enrolledCourses.length})
              </button>
            </div>

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <div>
                {certificates.length === 0 ? (
                  <div className="bg-forge-surface rounded-lg border border-forge-border p-8 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-forge-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-forge-text mb-2">No Certificates Yet</h3>
                    <p className="text-forge-muted mb-6">
                      Complete courses and mint your first certificate NFT to showcase your skills
                    </p>
                    <Link
                      href="/courses"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-node-app to-node-intelligence text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Start Learning
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((certificate) => (
                      <CertificateDisplay
                        key={certificate.tokenId.toString()}
                        certificate={certificate}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Enrolled Courses Tab */}
            {activeTab === 'progress' && (
              <div>
                {enrolledCourses.length === 0 ? (
                  <div className="bg-forge-surface rounded-lg border border-forge-border p-8 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-forge-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="text-xl font-semibold text-forge-text mb-2">No Enrolled Courses</h3>
                    <p className="text-forge-muted mb-6">
                      Start your learning journey by enrolling in courses
                    </p>
                    <Link
                      href="/courses"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-node-app to-node-intelligence text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {enrolledCourses.map((course) => (
                      <div key={course.courseId} className="bg-forge-surface rounded-lg border border-forge-border p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-forge-text mb-1">
                              {course.courseData.name}
                            </h3>
                            <div className="text-sm text-forge-muted">
                              Course ID: {course.courseId}
                            </div>
                          </div>
                          <Link
                            href={`/courses/${course.courseId}/learn`}
                            className="px-4 py-2 bg-node-app text-white rounded-lg text-sm hover:bg-node-app/90 transition-colors"
                          >
                            Continue
                          </Link>
                        </div>

                        <ProgressTracker
                          courseId={course.courseId}
                          totalLessons={10} // Fallback - real data would come from course content
                          totalQuizzes={2}
                          currentProgress={course.overallProgress || 0}
                          compact={true}
                        />

                        <div className="mt-4 pt-4 border-t border-forge-border">
                          <div className="grid grid-cols-3 gap-4 text-center text-sm">
                            <div>
                              <div className="text-lg font-bold text-node-app">
                                {course.completedLessons?.length || 0}
                              </div>
                              <div className="text-forge-muted">Lessons</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-node-intelligence">
                                {course.quizResults?.length || 0}
                              </div>
                              <div className="text-forge-muted">Quizzes</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-accent-lime">
                                {Math.round(course.overallProgress || 0)}%
                              </div>
                              <div className="text-forge-muted">Progress</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}