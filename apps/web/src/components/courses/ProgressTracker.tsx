/**
 * ProgressTracker component - Displays visual progress of course completion
 */

'use client';

import { CourseProgress } from '@/lib/course-completion-nft/types';
import { cn } from '@/lib/utils';

export interface ProgressTrackerProps {
  progress: CourseProgress;
  totalLessons: number;
  totalQuizzes: number;
  className?: string;
}

export function ProgressTracker({
  progress,
  totalLessons,
  totalQuizzes,
  className,
}: ProgressTrackerProps) {
  const completedLessons = progress.completedLessons.length;
  const passedQuizzes = progress.completedQuizzes.filter(q => q.passed).length;

  const lessonProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const quizProgress = totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0;
  const overallProgress = progress.progressPercentage || 0;

  const isComplete = overallProgress === 100;

  return (
    <div className={cn('bg-forge-surface rounded-lg border border-forge-border p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-forge-text">Your Progress</h3>
        <div className="flex items-center gap-2">
          {isComplete ? (
            <span className="px-3 py-1 text-sm font-medium rounded bg-node-app/10 text-node-app border border-node-app/20">
              ✓ Completed
            </span>
          ) : (
            <span className="text-2xl font-bold text-node-app">{overallProgress}%</span>
          )}
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-forge-elevated rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isComplete ? 'bg-node-app' : 'bg-gradient-to-r from-node-app to-node-intelligence'
            )}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lessons */}
        <div className="bg-forge-elevated rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-node-app" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-medium text-forge-text">Lessons</span>
            </div>
            <span className="text-sm text-forge-muted">
              {completedLessons}/{totalLessons}
            </span>
          </div>
          <div className="h-2 bg-forge-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-node-app rounded-full transition-all duration-300"
              style={{ width: `${lessonProgress}%` }}
            />
          </div>
        </div>

        {/* Quizzes */}
        {totalQuizzes > 0 && (
          <div className="bg-forge-elevated rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium text-forge-text">Quizzes</span>
              </div>
              <span className="text-sm text-forge-muted">
                {passedQuizzes}/{totalQuizzes}
              </span>
            </div>
            <div className="h-2 bg-forge-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-purple rounded-full transition-all duration-300"
                style={{ width: `${quizProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quiz Scores */}
      {progress.completedQuizzes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-forge-border">
          <h4 className="text-sm font-medium text-forge-text mb-3">Quiz Results</h4>
          <div className="space-y-2">
            {progress.completedQuizzes.map((quiz, index) => (
              <div
                key={quiz.quizId}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-forge-muted">Quiz {index + 1}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'font-medium',
                      quiz.passed ? 'text-node-app' : 'text-accent-coral'
                    )}
                  >
                    {quiz.score}%
                  </span>
                  {quiz.passed ? (
                    <svg className="w-4 h-4 text-node-app" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-accent-coral" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrollment Date */}
      <div className="mt-4 pt-4 border-t border-forge-border text-xs text-forge-muted">
        Enrolled on {new Date(progress.enrolledAt).toLocaleDateString()}
      </div>
    </div>
  );
}
