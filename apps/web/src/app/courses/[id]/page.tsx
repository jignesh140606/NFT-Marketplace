/**
 * Course Detail Page - Shows course information and enrollment
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourseCompletionNFT, useCourseProgress, fetchCourseContent } from '@/lib/course-completion-nft';
import type { CourseContent } from '@/lib/course-completion-nft';
import { WalletButton } from '@/components/wallet-button';

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getCourse, isConnected } = useCourseCompletionNFT();
  const { enrollInCourse, isEnrolled, calculateProgress } = useCourseProgress();

  const [course, setCourse] = useState<any>(null);
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const courseId = Number(id);
  const enrolled = isEnrolled(courseId);

  useEffect(() => {
    async function loadCourse() {
      if (!isConnected || !courseId) return;

      try {
        setLoading(true);
        setError(null);

        // Get course from contract
        const courseData = await getCourse(BigInt(courseId));
        setCourse(courseData);

        // Fetch course content from IPFS
        if (courseData.content_cid) {
          try {
            const content = await fetchCourseContent(courseData.content_cid);
            setCourseContent(content);
          } catch (ipfsError) {
            console.warn('Failed to load course content from IPFS:', ipfsError);
            // Continue without content - we'll handle this gracefully
          }
        }
      } catch (err) {
        console.error('Failed to load course:', err);
        setError('Failed to load course details. Make sure the course ID is valid.');
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [isConnected, courseId, getCourse]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      enrollInCourse(courseId);
      // Redirect to learning interface after enrollment
      router.push(`/courses/${courseId}/learn`);
    } catch (err) {
      console.error('Enrollment failed:', err);
    } finally {
      setEnrolling(false);
    }
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-forge-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-forge-surface rounded-lg border border-forge-border p-8 text-center">
            <h3 className="text-xl font-semibold text-forge-text mb-4">Connect Your Wallet</h3>
            <p className="text-forge-muted mb-6">
              Please connect your wallet to view course details
            </p>
            <WalletButton />
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-forge-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-forge-muted">
              <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Loading course details...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="min-h-screen bg-forge-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-accent-coral/10 border border-accent-coral/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-accent-coral mb-2">Course Not Found</h3>
            <p className="text-forge-muted mb-4">{error}</p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-node-app hover:text-node-app/80"
            >
              ← Back to Courses
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const progress = enrolled ? calculateProgress(courseId, courseContent?.modules.length || 0, 0) : 0;

  return (
    <main className="min-h-screen bg-forge-bg">
      {/* Header */}
      <div className="bg-forge-surface border-b border-forge-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/courses" className="text-2xl font-bold text-forge-text hover:text-node-app transition-colors">
              ← Courses
            </Link>
            <WalletButton />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-forge-text mb-2">{course.name}</h1>
              <div className="flex items-center gap-4 text-sm text-forge-muted">
                <span>Course ID: {courseId}</span>
                <span className={`px-2 py-1 rounded text-xs ${course.active ? 'bg-node-app/10 text-node-app' : 'bg-accent-coral/10 text-accent-coral'}`}>
                  {course.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-forge-muted">Total Certificates Issued</div>
              <div className="text-2xl font-bold text-node-intelligence">{course.total_issued.toString()}</div>
            </div>
          </div>

          {enrolled && (
            <div className="bg-node-app/10 border border-node-app/20 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-node-app">You're Enrolled!</h3>
                  <p className="text-sm text-forge-muted">Progress: {progress}%</p>
                </div>
                <Link
                  href={`/courses/${courseId}/learn`}
                  className="px-6 py-3 bg-node-app text-white rounded-lg font-semibold hover:bg-node-app/90 transition-colors"
                >
                  Continue Learning
                </Link>
              </div>
              <div className="mt-3">
                <div className="w-full bg-forge-elevated rounded-full h-2">
                  <div
                    className="bg-node-app h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-forge-surface rounded-lg border border-forge-border p-6">
              <h2 className="text-xl font-semibold text-forge-text mb-3">About This Course</h2>
              {courseContent ? (
                <div className="prose prose-invert max-w-none">
                  <p className="text-forge-muted mb-4">{courseContent.description}</p>
                  {courseContent.estimated_duration && (
                    <p className="text-sm text-forge-muted">
                      <strong>Duration:</strong> {courseContent.estimated_duration}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-forge-muted">
                  <p>Course content is loading from IPFS...</p>
                  <p className="text-xs mt-2">Content CID: {course.content_cid}</p>
                </div>
              )}
            </div>

            {/* Course Modules */}
            {courseContent?.modules && (
              <div className="bg-forge-surface rounded-lg border border-forge-border p-6">
                <h2 className="text-xl font-semibold text-forge-text mb-4">Course Modules</h2>
                <div className="space-y-3">
                  {courseContent.modules.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="border border-forge-border rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-forge-text mb-2">{module.title}</h3>
                      <p className="text-sm text-forge-muted mb-3">{module.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-node-app" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="text-forge-muted">{module.lessons.length} lessons</span>
                        </div>
                        {module.quiz && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-node-intelligence" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-forge-muted">{module.quiz.questions.length} questions</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enroll Card */}
            {!enrolled && (
              <div className="bg-forge-surface rounded-lg border border-forge-border p-6">
                <h3 className="text-lg font-semibold text-forge-text mb-3">Start Learning</h3>
                <p className="text-sm text-forge-muted mb-4">
                  Enroll now to start learning and track your progress toward a certificate NFT
                </p>
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || !course.active}
                  className="w-full px-4 py-3 bg-gradient-to-r from-node-app to-node-intelligence text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Free'}
                </button>
                {!course.active && (
                  <p className="text-xs text-accent-coral mt-2">This course is currently inactive</p>
                )}
              </div>
            )}

            {/* Skills */}
            {courseContent?.skills && (
              <div className="bg-forge-surface rounded-lg border border-forge-border p-6">
                <h3 className="text-lg font-semibold text-forge-text mb-3">Skills You'll Learn</h3>
                <div className="flex flex-wrap gap-2">
                  {courseContent.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-node-intelligence/10 text-node-intelligence rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Course Info */}
            <div className="bg-forge-surface rounded-lg border border-forge-border p-6">
              <h3 className="text-lg font-semibold text-forge-text mb-3">Course Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-forge-muted">Issuer</span>
                  <span className="text-forge-text font-mono text-xs">{course.issuer.substring(0, 10)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forge-muted">Created</span>
                  <span className="text-forge-text">
                    {new Date(Number(course.created_at) * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forge-muted">Certificate Type</span>
                  <span className="text-node-intelligence font-medium">Soulbound NFT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}