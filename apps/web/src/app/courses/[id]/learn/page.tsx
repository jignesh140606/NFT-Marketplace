/**
 * Course Learning Interface - Interactive lesson and quiz interface
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCourseCompletionNFT, useCourseProgress, fetchCourseContent } from '@/lib/course-completion-nft';
import { LessonViewer, QuizComponent, ProgressTracker } from '@/components/courses';
import { CertificateDisplay, MintCertificateButton } from '@/components/certificates';
import type { CourseContent, Module } from '@/lib/course-completion-nft';
import { WalletButton } from '@/components/wallet-button';

export default function CourseLearningPage() {
  const { id } = useParams();
  const { getCourse, isConnected, getUserCertificates } = useCourseCompletionNFT();
  const {
    isEnrolled,
    calculateProgress,
    isEligibleForCertificate,
    markLessonComplete,
    submitQuizResult,
    isLessonComplete,
    getQuizResult
  } = useCourseProgress();

  const [course, setCourse] = useState<any>(null);
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'lesson' | 'quiz' | 'complete'>('lesson');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCertificates, setUserCertificates] = useState<any[]>([]);

  const courseId = Number(id);
  const enrolled = isEnrolled(courseId);

  // Load course and check for existing certificates
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
            setError('Failed to load course content. Please try again.');
            return;
          }
        }

        // Check for existing certificates
        try {
          const certificates = await getUserCertificates();
          const courseCertificates = certificates.filter(cert =>
            Number(cert.courseId) === courseId
          );
          setUserCertificates(courseCertificates);
        } catch (certError) {
          console.warn('Failed to load certificates:', certError);
        }

      } catch (err) {
        console.error('Failed to load course:', err);
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [isConnected, courseId, getCourse, getUserCertificates]);

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-forge-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-forge-surface rounded-lg border border-forge-border p-8 text-center">
            <h3 className="text-xl font-semibold text-forge-text mb-4">Connect Your Wallet</h3>
            <p className="text-forge-muted mb-6">Please connect your wallet to access the learning interface</p>
            <WalletButton />
          </div>
        </div>
      </main>
    );
  }

  if (!enrolled) {
    return (
      <main className="min-h-screen bg-forge-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-accent-coral/10 border border-accent-coral/20 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-accent-coral mb-2">Not Enrolled</h3>
            <p className="text-forge-muted mb-4">You need to enroll in this course first.</p>
            <Link
              href={`/courses/${courseId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-node-app text-white rounded-lg hover:bg-node-app/90"
            >
              ← Go to Course Details
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-forge-bg">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-forge-muted">
              <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Loading course content...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !course || !courseContent) {
    return (
      <main className="min-h-screen bg-forge-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-accent-coral/10 border border-accent-coral/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-accent-coral mb-2">Course Not Available</h3>
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

  const currentModule = courseContent.modules[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];
  const totalModules = courseContent.modules.length;
  const totalLessons = courseContent.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
  const totalQuizzes = courseContent.modules.filter(mod => mod.quiz).length;

  const progress = calculateProgress(courseId, totalLessons, totalQuizzes);
  const eligibleForCertificate = isEligibleForCertificate(courseId, totalLessons, totalQuizzes);
  const hasCertificate = userCertificates.length > 0;

  const handleLessonComplete = () => {
    const lessonId = currentModuleIndex * 100 + currentLessonIndex; // Simple ID scheme
    markLessonComplete(courseId, lessonId);

    // Move to next lesson or quiz
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentModule.quiz) {
      setViewMode('quiz');
    } else if (currentModuleIndex < totalModules - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
      setViewMode('lesson');
    } else {
      setViewMode('complete');
    }
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    const quizId = currentModuleIndex;
    submitQuizResult(courseId, quizId, score, passed);

    // Move to next module or completion
    if (currentModuleIndex < totalModules - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
      setViewMode('lesson');
    } else {
      setViewMode('complete');
    }
  };

  const navigateToLesson = (moduleIndex: number, lessonIndex: number) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);
    setViewMode('lesson');
  };

  return (
    <main className="min-h-screen bg-forge-bg">
      {/* Header */}
      <div className="bg-forge-surface border-b border-forge-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/courses/${courseId}`} className="text-forge-text hover:text-node-app transition-colors">
                ← Course Details
              </Link>
              <div className="h-6 w-px bg-forge-border" />
              <h1 className="text-xl font-bold text-forge-text">{course.name}</h1>
            </div>
            <WalletButton />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Progress & Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Progress Tracker */}
              <ProgressTracker
                courseId={courseId}
                totalLessons={totalLessons}
                totalQuizzes={totalQuizzes}
                currentProgress={progress}
              />

              {/* Module Navigation */}
              <div className="bg-forge-surface rounded-lg border border-forge-border p-4">
                <h3 className="font-semibold text-forge-text mb-3">Course Modules</h3>
                <div className="space-y-2">
                  {courseContent.modules.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="space-y-1">
                      <div className={`text-sm font-medium p-2 rounded ${
                        moduleIndex === currentModuleIndex ? 'bg-node-app/10 text-node-app' : 'text-forge-muted'
                      }`}>
                        Module {moduleIndex + 1}: {module.title}
                      </div>
                      <div className="ml-2 space-y-1">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const lessonId = moduleIndex * 100 + lessonIndex;
                          const completed = isLessonComplete(courseId, lessonId);
                          const isCurrent = moduleIndex === currentModuleIndex && lessonIndex === currentLessonIndex;

                          return (
                            <button
                              key={lessonIndex}
                              onClick={() => navigateToLesson(moduleIndex, lessonIndex)}
                              className={`w-full text-left text-xs p-2 rounded flex items-center gap-2 transition-colors ${
                                isCurrent ? 'bg-node-app/10 text-node-app' :
                                completed ? 'text-forge-muted hover:text-forge-text' :
                                'text-forge-muted hover:text-forge-text'
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${
                                completed ? 'bg-node-app' : 'bg-forge-border'
                              }`} />
                              {lesson.title}
                            </button>
                          );
                        })}
                        {module.quiz && (
                          <div className={`text-xs p-2 rounded flex items-center gap-2 ${
                            moduleIndex === currentModuleIndex && viewMode === 'quiz' ? 'bg-node-intelligence/10 text-node-intelligence' :
                            getQuizResult(courseId, moduleIndex) ? 'text-forge-muted' : 'text-forge-muted'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              getQuizResult(courseId, moduleIndex) ? 'bg-node-intelligence' : 'bg-forge-border'
                            }`} />
                            Module Quiz
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate Status */}
              {eligibleForCertificate && (
                <div className="bg-gradient-to-br from-node-intelligence/5 to-node-app/5 border border-node-intelligence/20 rounded-lg p-4">
                  <h3 className="font-semibold text-node-intelligence mb-2">🎉 Certificate Ready!</h3>
                  <p className="text-sm text-forge-muted mb-3">
                    You've completed all requirements. Mint your certificate NFT!
                  </p>
                  {hasCertificate ? (
                    <p className="text-xs text-node-app">✓ Certificate already minted</p>
                  ) : (
                    <MintCertificateButton
                      courseId={courseId}
                      courseName={course.name}
                      skills={courseContent.skills}
                      onSuccess={() => {
                        // Refresh certificates
                        getUserCertificates().then(certs => {
                          const courseCerts = certs.filter(cert => Number(cert.courseId) === courseId);
                          setUserCertificates(courseCerts);
                        });
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-forge-surface rounded-lg border border-forge-border">
              {viewMode === 'lesson' && currentLesson && (
                <LessonViewer
                  lesson={currentLesson}
                  moduleTitle={currentModule.title}
                  onComplete={handleLessonComplete}
                  isCompleted={isLessonComplete(courseId, currentModuleIndex * 100 + currentLessonIndex)}
                />
              )}

              {viewMode === 'quiz' && currentModule.quiz && (
                <QuizComponent
                  quiz={currentModule.quiz}
                  moduleTitle={currentModule.title}
                  onComplete={handleQuizComplete}
                  existingResult={getQuizResult(courseId, currentModuleIndex)}
                />
              )}

              {viewMode === 'complete' && (
                <div className="p-8 text-center">
                  <div className="max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-gradient-to-r from-node-app to-node-intelligence rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-forge-text mb-4">Congratulations! 🎉</h2>
                    <p className="text-lg text-forge-muted mb-6">
                      You've successfully completed <strong className="text-forge-text">{course.name}</strong>!
                    </p>

                    {eligibleForCertificate && !hasCertificate && (
                      <div className="bg-gradient-to-r from-node-intelligence/10 to-node-app/10 border border-node-intelligence/20 rounded-lg p-6 mb-6">
                        <h3 className="text-xl font-semibold text-node-intelligence mb-3">Claim Your Certificate NFT</h3>
                        <p className="text-forge-muted mb-4">
                          Mint a permanent, verifiable certificate as an NFT to prove your completion and skills.
                        </p>
                        <MintCertificateButton
                          courseId={courseId}
                          courseName={course.name}
                          skills={courseContent.skills}
                          onSuccess={() => {
                            getUserCertificates().then(certs => {
                              const courseCerts = certs.filter(cert => Number(cert.courseId) === courseId);
                              setUserCertificates(courseCerts);
                            });
                          }}
                        />
                      </div>
                    )}

                    {hasCertificate && (
                      <div className="bg-node-app/10 border border-node-app/20 rounded-lg p-6 mb-6">
                        <h3 className="text-xl font-semibold text-node-app mb-3">Certificate Earned! 🏆</h3>
                        <p className="text-forge-muted mb-4">Your certificate NFT has been minted successfully.</p>
                        <CertificateDisplay certificate={userCertificates[0]} />
                      </div>
                    )}

                    <div className="flex gap-4 justify-center">
                      <Link
                        href="/courses"
                        className="px-6 py-3 border border-forge-border rounded-lg text-forge-text hover:bg-forge-elevated transition-colors"
                      >
                        Browse More Courses
                      </Link>
                      <Link
                        href="/profile"
                        className="px-6 py-3 bg-gradient-to-r from-node-app to-node-intelligence text-white rounded-lg hover:shadow-lg transition-all"
                      >
                        View My Certificates
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}