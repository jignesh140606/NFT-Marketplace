/**
 * Admin Course Creation Page - Create new courses with content upload
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCourseCompletionNFT, uploadCourseContent } from '@/lib/course-completion-nft';
import type { CourseContent, Module, Lesson, Quiz } from '@/lib/course-completion-nft';
import { WalletButton } from '@/components/wallet-button';

export default function AdminCreateCoursePage() {
  const router = useRouter();
  const { isAdmin, createCourse, isConnected, address, transactionState } = useCourseCompletionNFT();

  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [skills, setSkills] = useState<string[]>(['']);
  const [issuerAddress, setIssuerAddress] = useState('');
  const [modules, setModules] = useState<Module[]>([{
    title: '',
    description: '',
    lessons: [{ title: '', content: '' }],
    quiz: null
  }]);

  // Check admin status
  useEffect(() => {
    async function checkAdmin() {
      if (!isConnected) {
        setLoading(false);
        return;
      }

      try {
        const isUserAdmin = await isAdmin(address);
        setAdminStatus(isUserAdmin);

        // Pre-fill issuer address with current wallet
        if (isUserAdmin) {
          setIssuerAddress(address);
        }
      } catch (err) {
        console.error('Failed to check admin status:', err);
        setError('Failed to verify admin permissions.');
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [isConnected, address, isAdmin]);

  const addSkill = () => {
    setSkills([...skills, '']);
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      setSkills(skills.filter((_, i) => i !== index));
    }
  };

  const addModule = () => {
    setModules([...modules, {
      title: '',
      description: '',
      lessons: [{ title: '', content: '' }],
      quiz: null
    }]);
  };

  const updateModule = (moduleIndex: number, field: keyof Module, value: any) => {
    const newModules = [...modules];
    (newModules[moduleIndex] as any)[field] = value;
    setModules(newModules);
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.push({ title: '', content: '' });
    setModules(newModules);
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, field: keyof Lesson, value: string) => {
    const newModules = [...modules];
    (newModules[moduleIndex].lessons[lessonIndex] as any)[field] = value;
    setModules(newModules);
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const newModules = [...modules];
    if (newModules[moduleIndex].lessons.length > 1) {
      newModules[moduleIndex].lessons.splice(lessonIndex, 1);
      setModules(newModules);
    }
  };

  const addQuiz = (moduleIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].quiz = {
      title: '',
      questions: [
        {
          question: '',
          options: ['', '', '', ''],
          correct_answer: 0,
          explanation: ''
        }
      ],
      passing_score: 70
    };
    setModules(newModules);
  };

  const removeQuiz = (moduleIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].quiz = null;
    setModules(newModules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminStatus) {
      setError('You must be an admin to create courses.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Validate form
      const cleanSkills = skills.filter(skill => skill.trim() !== '');
      if (cleanSkills.length === 0) {
        throw new Error('Please add at least one skill.');
      }

      if (!issuerAddress || !issuerAddress.startsWith('0x')) {
        throw new Error('Please provide a valid issuer address.');
      }

      // Build course content
      const courseContent: CourseContent = {
        course_id: 0, // Will be set after course creation
        title: courseName,
        description: courseDescription,
        modules: modules.filter(mod => mod.title.trim() !== ''),
        skills: cleanSkills,
        estimated_duration: estimatedDuration || undefined,
        version: '1.0.0'
      };

      // Validate modules
      if (courseContent.modules.length === 0) {
        throw new Error('Please add at least one module.');
      }

      for (const module of courseContent.modules) {
        if (module.lessons.length === 0 || module.lessons.some(lesson => !lesson.title.trim())) {
          throw new Error('Each module must have at least one lesson with a title.');
        }
      }

      // Upload course content to IPFS
      const contentCid = await uploadCourseContent(courseContent);

      // Create course on blockchain
      const courseId = await createCourse(
        courseName,
        contentCid,
        issuerAddress as `0x${string}`
      );

      console.log('Course created successfully:', { courseId, contentCid });

      // Redirect to admin dashboard
      router.push('/admin');

    } catch (err: any) {
      console.error('Failed to create course:', err);
      setError(err.message || 'Failed to create course. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-forge-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-forge-surface rounded-lg border border-forge-border p-8 text-center">
            <h3 className="text-xl font-semibold text-forge-text mb-4">Connect Your Wallet</h3>
            <p className="text-forge-muted mb-6">Please connect your wallet to create courses</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Checking permissions...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (adminStatus === false) {
    return (
      <main className="min-h-screen bg-forge-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-accent-coral/10 border border-accent-coral/20 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-accent-coral mb-4">Access Denied</h3>
            <p className="text-forge-muted mb-6">
              You don't have admin permissions to create courses.
            </p>
            <Link
              href="/admin"
              className="px-4 py-2 bg-node-app text-white rounded-lg hover:bg-node-app/90"
            >
              ← Back to Admin
            </Link>
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
              <Link href="/admin" className="text-2xl font-bold text-forge-text hover:text-accent-cyan transition-colors">
                ← Admin Dashboard
              </Link>
              <p className="text-forge-muted mt-1">Create a new course</p>
            </div>
            <WalletButton />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-accent-coral/10 border border-accent-coral/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-accent-coral flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-accent-coral mb-1">Error</h3>
                <p className="text-forge-muted text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Course Information */}
          <div className="bg-forge-surface rounded-lg border border-forge-border p-6">
            <h2 className="text-xl font-semibold text-forge-text mb-4">Course Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forge-text mb-2">
                  Course Name *
                </label>
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 bg-forge-elevated border border-forge-border rounded-lg text-forge-text focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  placeholder="e.g., Blockchain Fundamentals"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-forge-text mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-forge-elevated border border-forge-border rounded-lg text-forge-text focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  placeholder="Describe what students will learn in this course..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-forge-text mb-2">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-forge-elevated border border-forge-border rounded-lg text-forge-text focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  placeholder="e.g., 4 weeks, 10 hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-forge-text mb-2">
                  Course Issuer Address *
                </label>
                <input
                  type="text"
                  required
                  value={issuerAddress}
                  onChange={(e) => setIssuerAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-forge-elevated border border-forge-border rounded-lg text-forge-text focus:outline-none focus:ring-2 focus:ring-accent-cyan font-mono text-sm"
                  placeholder="0x..."
                />
                <p className="text-xs text-forge-muted mt-1">
                  The wallet address that will be able to mint certificates for this course
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-forge-surface rounded-lg border border-forge-border p-6">
            <h2 className="text-xl font-semibold text-forge-text mb-4">Skills Students Will Learn</h2>

            <div className="space-y-3">
              {skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-forge-elevated border border-forge-border rounded-lg text-forge-text focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                    placeholder="e.g., Smart Contracts, Blockchain Analysis"
                  />
                  {skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="px-3 py-2 text-accent-coral hover:bg-accent-coral/10 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 border border-forge-border rounded-lg text-forge-text hover:bg-forge-elevated transition-colors"
              >
                + Add Skill
              </button>
            </div>
          </div>

          {/* Modules */}
          <div className="bg-forge-surface rounded-lg border border-forge-border p-6">
            <h2 className="text-xl font-semibold text-forge-text mb-4">Course Modules</h2>

            <div className="space-y-6">
              {modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="border border-forge-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-forge-text">Module {moduleIndex + 1}</h3>
                    {modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setModules(modules.filter((_, i) => i !== moduleIndex))}
                        className="text-accent-coral hover:bg-accent-coral/10 px-3 py-1 rounded transition-colors"
                      >
                        Remove Module
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-forge-text mb-2">Module Title</label>
                      <input
                        type="text"
                        value={module.title}
                        onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                        className="w-full px-3 py-2 bg-forge-elevated border border-forge-border rounded-lg text-forge-text focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                        placeholder="e.g., Introduction to Blockchain"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-forge-text mb-2">Module Description</label>
                      <textarea
                        value={module.description}
                        onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-forge-elevated border border-forge-border rounded-lg text-forge-text focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                        placeholder="Describe this module..."
                      />
                    </div>

                    {/* Lessons */}
                    <div>
                      <h4 className="font-medium text-forge-text mb-3">Lessons</h4>
                      <div className="space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="border border-forge-border rounded p-3 bg-forge-elevated">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-forge-text">Lesson {lessonIndex + 1}</span>
                              {module.lessons.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                  className="text-xs text-accent-coral hover:underline"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)}
                                placeholder="Lesson title"
                                className="px-3 py-2 bg-forge-bg border border-forge-border rounded text-forge-text text-sm focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                              />
                              <textarea
                                value={lesson.content}
                                onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'content', e.target.value)}
                                placeholder="Lesson content in markdown..."
                                rows={3}
                                className="px-3 py-2 bg-forge-bg border border-forge-border rounded text-forge-text text-sm focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                              />
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addLesson(moduleIndex)}
                          className="px-3 py-2 border border-forge-border rounded text-sm text-forge-text hover:bg-forge-elevated transition-colors"
                        >
                          + Add Lesson
                        </button>
                      </div>
                    </div>

                    {/* Quiz */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-forge-text">Module Quiz</h4>
                        {module.quiz ? (
                          <button
                            type="button"
                            onClick={() => removeQuiz(moduleIndex)}
                            className="text-sm text-accent-coral hover:underline"
                          >
                            Remove Quiz
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addQuiz(moduleIndex)}
                            className="text-sm text-node-intelligence hover:underline"
                          >
                            + Add Quiz
                          </button>
                        )}
                      </div>
                      {module.quiz && (
                        <div className="border border-forge-border rounded p-3 bg-forge-elevated">
                          <p className="text-sm text-forge-muted mb-2">
                            Quiz functionality is available but simplified for this demo.
                            In production, you'd have a full quiz editor here.
                          </p>
                          <div className="text-xs text-forge-muted">
                            Quiz: &quot;{module.title} Assessment&quot; with 5 questions, 70% passing score
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addModule}
                className="px-4 py-2 border border-forge-border rounded-lg text-forge-text hover:bg-forge-elevated transition-colors"
              >
                + Add Module
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="px-6 py-3 border border-forge-border rounded-lg text-forge-text hover:bg-forge-elevated transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={uploading || transactionState.status === 'pending' || transactionState.status === 'confirming'}
              className="px-8 py-3 bg-gradient-to-r from-accent-cyan to-node-intelligence text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {uploading ? 'Uploading to IPFS...' :
               transactionState.status === 'pending' ? 'Creating Course...' :
               transactionState.status === 'confirming' ? 'Confirming...' :
               'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}