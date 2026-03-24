/**
 * LessonViewer component - Displays lesson content with markdown support
 */

'use client';

import { useState, useEffect } from 'react';
import { Lesson } from '@/lib/course-completion-nft/types';
import { fetchLessonContent } from '@/lib/course-completion-nft/utils/ipfs';
import { cn } from '@/lib/utils';

export interface LessonViewerProps {
  lesson: Lesson;
  onComplete: () => void;
  isCompleted: boolean;
  className?: string;
}

export function LessonViewer({
  lesson,
  onComplete,
  isCompleted,
  className,
}: LessonViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchLessonContent(lesson.content_cid);
        setContent(data.content);
      } catch (err) {
        console.error('Failed to load lesson content:', err);
        setError('Failed to load lesson content. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (lesson.content_cid) {
      loadContent();
    }
  }, [lesson.content_cid]);

  return (
    <div className={cn('bg-forge-surface rounded-lg border border-forge-border', className)}>
      {/* Lesson Header */}
      <div className="p-6 border-b border-forge-border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-forge-text">{lesson.title}</h2>
              {isCompleted && (
                <span className="px-2 py-1 text-xs font-medium rounded bg-node-app/10 text-node-app border border-node-app/20">
                  ✓ Completed
                </span>
              )}
            </div>
            {lesson.description && (
              <p className="text-forge-muted">{lesson.description}</p>
            )}
          </div>
          {lesson.duration && (
            <div className="flex items-center gap-2 text-sm text-forge-muted ml-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{lesson.duration}</span>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-forge-muted">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Loading lesson...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-accent-coral/10 border border-accent-coral/20 text-accent-coral">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && content && (
          <div className="prose prose-invert prose-forge max-w-none">
            {/* Simple markdown rendering - in production, use a markdown library like react-markdown */}
            <div
              className="lesson-content space-y-4"
              dangerouslySetInnerHTML={{
                __html: content
                  .split('\n\n')
                  .map(paragraph => {
                    // Simple markdown parsing (headers, bold, code)
                    let html = paragraph
                      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-forge-text mb-2 mt-6">$1</h3>')
                      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-forge-text mb-3 mt-8">$1</h2>')
                      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-forge-text mb-4 mt-10">$1</h1>')
                      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-forge-text">$1</strong>')
                      .replace(/`(.+?)`/g, '<code class="px-2 py-1 bg-forge-elevated rounded text-sm font-mono text-node-app">$1</code>')
                      .replace(/^- (.+)$/gm, '<li class="text-forge-muted">$1</li>');

                    // Wrap list items
                    if (html.includes('<li')) {
                      html = '<ul class="list-disc list-inside space-y-2 text-forge-muted">' + html + '</ul>';
                    }

                    // Regular paragraph
                    if (!html.includes('<h') && !html.includes('<ul') && !html.includes('<code')) {
                      html = '<p class="text-forge-muted leading-relaxed">' + html + '</p>';
                    }

                    return html;
                  })
                  .join(''),
              }}
            />
          </div>
        )}
      </div>

      {/* Complete Button */}
      {!loading && !error && (
        <div className="p-6 border-t border-forge-border">
          <button
            onClick={onComplete}
            disabled={isCompleted}
            className={cn(
              'w-full px-6 py-3 rounded-lg font-medium transition-all duration-200',
              isCompleted
                ? 'bg-forge-elevated text-forge-muted cursor-not-allowed'
                : 'bg-node-app text-white hover:bg-node-app/90 hover:shadow-lg hover:shadow-node-app/20'
            )}
          >
            {isCompleted ? '✓ Lesson Completed' : 'Mark as Complete'}
          </button>
        </div>
      )}
    </div>
  );
}
