/**
 * CourseCard component - Displays course preview in catalog
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Course, CourseContent, CourseProgress } from '@/lib/course-completion-nft/types';
import { fetchCourseContent } from '@/lib/course-completion-nft/utils/ipfs';
import { cn } from '@/lib/utils';

export interface CourseCardProps {
  course: Course;
  progress?: CourseProgress;
  showProgress?: boolean;
}

export function CourseCard({ course, progress, showProgress = false }: CourseCardProps) {
  const [content, setContent] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        const data = await fetchCourseContent(course.contentCid);
        setContent(data);
      } catch (err) {
        console.error('Failed to load course content:', err);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    }

    if (course.contentCid) {
      loadContent();
    }
  }, [course.contentCid]);

  const progressPercentage = progress?.progressPercentage || 0;
  const isEnrolled = !!progress;
  const totalLessons = content?.modules.reduce((sum, m) => sum + m.lessons.length, 0) || 0;
  const totalQuizzes = content?.modules.filter(m => m.quiz).length || 0;

  return (
    <Link
      href={`/courses/${course.courseId}`}
      className={cn(
        'block group relative overflow-hidden',
        'bg-forge-surface rounded-lg border border-forge-border',
        'hover:border-node-app transition-all duration-200',
        'hover:shadow-lg hover:shadow-node-app/20',
        !course.active && 'opacity-60 pointer-events-none'
      )}
    >
      {/* Course Header */}
      <div className="p-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-3">
          {isEnrolled ? (
            <span className="px-2 py-1 text-xs font-medium rounded bg-node-app/10 text-node-app border border-node-app/20">
              Enrolled
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium rounded bg-forge-border text-forge-muted">
              Available
            </span>
          )}

          {!course.active && (
            <span className="px-2 py-1 text-xs font-medium rounded bg-accent-coral/10 text-accent-coral border border-accent-coral/20">
              Inactive
            </span>
          )}
        </div>

        {/* Course Title */}
        <h3 className="text-xl font-bold text-forge-text mb-2 group-hover:text-node-app transition-colors">
          {loading ? 'Loading...' : content?.title || course.name}
        </h3>

        {/* Course Description */}
        {!loading && content && (
          <p className="text-sm text-forge-muted line-clamp-2 mb-4">
            {content.description}
          </p>
        )}

        {error && (
          <p className="text-sm text-accent-coral mb-4">{error}</p>
        )}

        {/* Course Info */}
        {!loading && content && (
          <div className="flex items-center gap-4 text-xs text-forge-muted mb-4">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>{totalLessons} lessons</span>
            </div>

            {totalQuizzes > 0 && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{totalQuizzes} quizzes</span>
              </div>
            )}

            {content.estimated_duration && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{content.estimated_duration}</span>
              </div>
            )}
          </div>
        )}

        {/* Skills Tags */}
        {!loading && content && content.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {content.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded bg-node-intelligence/10 text-node-intelligence border border-node-intelligence/20"
              >
                {skill}
              </span>
            ))}
            {content.skills.length > 3 && (
              <span className="px-2 py-1 text-xs rounded bg-forge-border text-forge-muted">
                +{content.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {showProgress && isEnrolled && (
          <div className="mt-4 pt-4 border-t border-forge-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-forge-muted">Progress</span>
              <span className="text-xs font-semibold text-node-app">{progressPercentage}%</span>
            </div>
            <div className="h-2 bg-forge-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-node-app rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Certificates Issued */}
        <div className="mt-4 flex items-center justify-between text-xs text-forge-muted">
          <span>{course.totalIssued.toString()} certificates issued</span>

          <div className="flex items-center gap-1 text-node-app group-hover:translate-x-1 transition-transform">
            <span className="font-medium">View Course</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
