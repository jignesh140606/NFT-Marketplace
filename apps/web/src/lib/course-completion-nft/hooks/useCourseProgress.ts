/**
 * React hook for tracking course progress in localStorage
 * Progress is stored locally until course completion, then committed on-chain
 */

import { useState, useCallback, useEffect } from 'react';
import { keccak256, encodePacked } from 'viem';
import { STORAGE_KEYS, MIN_PASSING_SCORE } from '../constants';
import type { CourseProgress, QuizResult } from '../types';

export function useCourseProgress() {
  const [progressMap, setProgressMap] = useState<Map<number, CourseProgress>>(new Map());

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COURSE_PROGRESS);
      if (stored) {
        const parsed = JSON.parse(stored);
        const map = new Map<number, CourseProgress>(
          Object.entries(parsed).map(([key, value]) => [
            parseInt(key),
            value as CourseProgress,
          ])
        );
        setProgressMap(map);
      }
    } catch (error) {
      console.error('Failed to load course progress:', error);
    }
  }, []);

  // Save progress to localStorage whenever it changes
  const saveProgress = useCallback((map: Map<number, CourseProgress>) => {
    try {
      const obj = Object.fromEntries(map);
      localStorage.setItem(STORAGE_KEYS.COURSE_PROGRESS, JSON.stringify(obj));
      setProgressMap(map);
    } catch (error) {
      console.error('Failed to save course progress:', error);
    }
  }, []);

  // ===== Enrollment Functions =====

  const enrollInCourse = useCallback(
    (courseId: number) => {
      const newMap = new Map(progressMap);

      // Don't overwrite existing progress
      if (!newMap.has(courseId)) {
        const progress: CourseProgress = {
          courseId,
          enrolledAt: Date.now(),
          completedLessons: [],
          completedQuizzes: [],
          progressPercentage: 0,
        };
        newMap.set(courseId, progress);
        saveProgress(newMap);
      }
    },
    [progressMap, saveProgress]
  );

  const isEnrolled = useCallback(
    (courseId: number): boolean => {
      return progressMap.has(courseId);
    },
    [progressMap]
  );

  // ===== Progress Tracking Functions =====

  const getProgress = useCallback(
    (courseId: number): CourseProgress | null => {
      return progressMap.get(courseId) || null;
    },
    [progressMap]
  );

  const markLessonComplete = useCallback(
    (courseId: number, lessonId: number) => {
      const progress = progressMap.get(courseId);
      if (!progress) {
        console.warn(`Course ${courseId} not enrolled`);
        return;
      }

      // Don't add if already completed
      if (progress.completedLessons.includes(lessonId)) {
        return;
      }

      const newMap = new Map(progressMap);
      const updated: CourseProgress = {
        ...progress,
        completedLessons: [...progress.completedLessons, lessonId].sort((a, b) => a - b),
        lastAccessedLesson: lessonId,
      };

      newMap.set(courseId, updated);
      saveProgress(newMap);
    },
    [progressMap, saveProgress]
  );

  const markQuizComplete = useCallback(
    (courseId: number, quizId: number, score: number, passed: boolean) => {
      const progress = progressMap.get(courseId);
      if (!progress) {
        console.warn(`Course ${courseId} not enrolled`);
        return;
      }

      const newMap = new Map(progressMap);

      // Remove previous attempt if exists
      const filteredQuizzes = progress.completedQuizzes.filter(q => q.quizId !== quizId);

      const quizResult: QuizResult = {
        quizId,
        score,
        passed,
        completedAt: Date.now(),
      };

      const updated: CourseProgress = {
        ...progress,
        completedQuizzes: [...filteredQuizzes, quizResult],
      };

      newMap.set(courseId, updated);
      saveProgress(newMap);
    },
    [progressMap, saveProgress]
  );

  // ===== Completion Checking Functions =====

  const isLessonComplete = useCallback(
    (courseId: number, lessonId: number): boolean => {
      const progress = progressMap.get(courseId);
      return progress?.completedLessons.includes(lessonId) || false;
    },
    [progressMap]
  );

  const isEligibleForCertificate = useCallback(
    (courseId: number, totalLessons: number, totalQuizzes: number): boolean => {
      const progress = progressMap.get(courseId);
      if (!progress) return false;

      // Check all lessons completed
      const allLessonsComplete = progress.completedLessons.length >= totalLessons;

      // Check all quizzes passed
      const passedQuizzes = progress.completedQuizzes.filter(q => q.passed);
      const allQuizzesPassed = passedQuizzes.length >= totalQuizzes;

      return allLessonsComplete && allQuizzesPassed;
    },
    [progressMap]
  );

  const calculateProgress = useCallback(
    (courseId: number, totalLessons: number, totalQuizzes: number): number => {
      const progress = progressMap.get(courseId);
      if (!progress) return 0;

      const totalItems = totalLessons + totalQuizzes;
      if (totalItems === 0) return 100;

      const completedLessons = progress.completedLessons.length;
      const passedQuizzes = progress.completedQuizzes.filter(q => q.passed).length;

      const percentage = ((completedLessons + passedQuizzes) / totalItems) * 100;
      return Math.round(percentage);
    },
    [progressMap]
  );

  // ===== Utility Functions =====

  const getAllEnrolledCourses = useCallback((): CourseProgress[] => {
    return Array.from(progressMap.values());
  }, [progressMap]);

  const clearProgress = useCallback(
    (courseId: number) => {
      const newMap = new Map(progressMap);
      newMap.delete(courseId);
      saveProgress(newMap);
    },
    [progressMap, saveProgress]
  );

  // ===== Merkle Tree Generation =====

  /**
   * Generate Merkle root for skills verification
   * Simple implementation - in production, use a proper Merkle tree library
   */
  const generateSkillsMerkle = useCallback(
    (skills: string[]): { root: `0x${string}`; proof: string[] } => {
      if (skills.length === 0) {
        return { root: '0x' + '0'.repeat(64), proof: [] };
      }

      // Hash each skill
      const leaves = skills.map(skill =>
        keccak256(encodePacked(['string'], [skill]))
      );

      // For simplicity, just hash all skills together as root
      // In production, build a proper Merkle tree
      const combined = skills.join('');
      const root = keccak256(encodePacked(['string'], [combined]));

      return {
        root: root as `0x${string}`,
        proof: leaves, // In production, generate proper Merkle proofs
      };
    },
    []
  );

  // ===== Export/Import Functions =====

  /**
   * Export progress for backup or cross-device sync
   */
  const exportProgress = useCallback(
    (courseId: number): string | null => {
      const progress = progressMap.get(courseId);
      if (!progress) return null;

      return JSON.stringify(progress);
    },
    [progressMap]
  );

  /**
   * Import progress from backup
   */
  const importProgress = useCallback(
    (courseId: number, progressJson: string): boolean => {
      try {
        const progress = JSON.parse(progressJson) as CourseProgress;

        // Validate the structure
        if (
          typeof progress.courseId !== 'number' ||
          !Array.isArray(progress.completedLessons) ||
          !Array.isArray(progress.completedQuizzes)
        ) {
          throw new Error('Invalid progress format');
        }

        const newMap = new Map(progressMap);
        newMap.set(courseId, progress);
        saveProgress(newMap);

        return true;
      } catch (error) {
        console.error('Failed to import progress:', error);
        return false;
      }
    },
    [progressMap, saveProgress]
  );

  // ===== Statistics =====

  const getStatistics = useCallback(() => {
    const courses = Array.from(progressMap.values());

    const totalEnrolled = courses.length;
    const totalLessonsCompleted = courses.reduce(
      (sum, c) => sum + c.completedLessons.length,
      0
    );
    const totalQuizzesPassed = courses.reduce(
      (sum, c) => sum + c.completedQuizzes.filter(q => q.passed).length,
      0
    );

    const avgScore =
      courses.reduce((sum, c) => {
        const quizzes = c.completedQuizzes;
        if (quizzes.length === 0) return sum;
        const courseAvg =
          quizzes.reduce((s, q) => s + q.score, 0) / quizzes.length;
        return sum + courseAvg;
      }, 0) / (totalEnrolled || 1);

    return {
      totalEnrolled,
      totalLessonsCompleted,
      totalQuizzesPassed,
      averageQuizScore: Math.round(avgScore),
    };
  }, [progressMap]);

  return {
    // Enrollment
    enrollInCourse,
    isEnrolled,

    // Progress tracking
    getProgress,
    markLessonComplete,
    markQuizComplete,

    // Completion checking
    isLessonComplete,
    isEligibleForCertificate,

    // Utility
    calculateProgress,
    getAllEnrolledCourses,
    clearProgress,

    // Merkle tree
    generateSkillsMerkle,

    // Export/Import
    exportProgress,
    importProgress,

    // Statistics
    getStatistics,
  };
}
