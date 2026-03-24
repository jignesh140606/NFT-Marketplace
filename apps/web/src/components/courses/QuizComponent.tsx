/**
 * QuizComponent - Interactive quiz interface
 */

'use client';

import { useState } from 'react';
import { Quiz, QuizResult } from '@/lib/course-completion-nft/types';
import { cn } from '@/lib/utils';
import { MIN_PASSING_SCORE } from '@/lib/course-completion-nft/constants';

export interface QuizComponentProps {
  quiz: Quiz;
  onComplete: (score: number, passed: boolean) => void;
  existingResult?: QuizResult;
  className?: string;
}

export function QuizComponent({
  quiz,
  onComplete,
  existingResult,
  className,
}: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    const correctAnswers = quiz.questions.filter((q, i) =>
      answers[i] === q.correct_answer_index
    ).length;

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = score >= (quiz.passing_score || MIN_PASSING_SCORE);

    setShowResults(true);
    setSubmitted(true);
    onComplete(score, passed);
  };

  const canSubmit = answers.length === quiz.questions.length && !submitted;
  const question = quiz.questions[currentQuestion];

  if (existingResult) {
    return (
      <div className={cn('bg-forge-surface rounded-lg border border-forge-border p-6', className)}>
        <div className="text-center py-8">
          <div className={cn(
            'inline-flex items-center justify-center w-16 h-16 rounded-full mb-4',
            existingResult.passed
              ? 'bg-node-app/10 text-node-app'
              : 'bg-accent-coral/10 text-accent-coral'
          )}>
            {existingResult.passed ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          <h3 className="text-2xl font-bold text-forge-text mb-2">
            {existingResult.passed ? 'Quiz Passed!' : 'Quiz Failed'}
          </h3>
          <p className="text-4xl font-bold mb-4" style={{ color: existingResult.passed ? 'var(--node-app)' : 'var(--accent-coral)' }}>
            {existingResult.score}%
          </p>
          <p className="text-forge-muted">
            {existingResult.passed
              ? `Great job! You passed with ${existingResult.score}%.`
              : `You need ${quiz.passing_score || MIN_PASSING_SCORE}% to pass. Try again!`}
          </p>

          {!existingResult.passed && (
            <button
              onClick={() => {
                setAnswers([]);
                setCurrentQuestion(0);
                setShowResults(false);
                setSubmitted(false);
              }}
              className="mt-6 px-6 py-3 bg-node-app text-white rounded-lg font-medium hover:bg-node-app/90 transition-colors"
            >
              Retake Quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-forge-surface rounded-lg border border-forge-border', className)}>
      {/* Quiz Header */}
      <div className="p-6 border-b border-forge-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-forge-text">{quiz.title}</h3>
          <span className="text-sm text-forge-muted">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-forge-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-purple rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <h4 className="text-lg font-semibold text-forge-text mb-6">
          {question.question}
        </h4>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = answers[currentQuestion] === index;
            const isCorrect = showResults && index === question.correct_answer_index;
            const isWrong = showResults && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => !submitted && handleAnswer(index)}
                disabled={submitted}
                className={cn(
                  'w-full p-4 text-left rounded-lg border-2 transition-all duration-200',
                  !submitted && !isSelected && 'border-forge-border hover:border-node-app hover:bg-forge-elevated',
                  !submitted && isSelected && 'border-node-app bg-node-app/10',
                  submitted && isCorrect && 'border-node-app bg-node-app/10',
                  submitted && isWrong && 'border-accent-coral bg-accent-coral/10',
                  submitted && !isSelected && !isCorrect && 'border-forge-border opacity-50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-forge-text">{option}</span>
                  <div className="flex items-center gap-2">
                    {!submitted && isSelected && (
                      <div className="w-5 h-5 rounded-full bg-node-app flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    {submitted && isCorrect && (
                      <svg className="w-6 h-6 text-node-app" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {submitted && isWrong && (
                      <svg className="w-6 h-6 text-accent-coral" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-forge-border flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0 || submitted}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            currentQuestion === 0 || submitted
              ? 'text-forge-muted cursor-not-allowed'
              : 'text-forge-text hover:bg-forge-elevated'
          )}
        >
          Previous
        </button>

        <div className="flex gap-2">
          {quiz.questions.map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                answers[index] !== undefined
                  ? 'bg-node-app'
                  : 'bg-forge-border'
              )}
            />
          ))}
        </div>

        {currentQuestion < quiz.questions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined || submitted}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              answers[currentQuestion] === undefined || submitted
                ? 'text-forge-muted cursor-not-allowed'
                : 'bg-node-app text-white hover:bg-node-app/90'
            )}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'px-6 py-2 rounded-lg font-medium transition-colors',
              !canSubmit
                ? 'bg-forge-border text-forge-muted cursor-not-allowed'
                : 'bg-accent-purple text-white hover:bg-accent-purple/90'
            )}
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}
