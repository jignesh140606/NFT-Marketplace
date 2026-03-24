// Types for Course Completion NFT System

import { Address, Hash } from 'viem';

// ===== Course Types =====

export interface Course {
  courseId: bigint;
  name: string;
  contentCid: string;  // IPFS CID for course content
  issuer: Address;
  active: boolean;
  createdAt: bigint;
  totalIssued: bigint;
}

export interface CourseContent {
  course_id: number;
  title: string;
  description: string;
  modules: Module[];
  skills: string[];
  estimated_duration: string;
  image?: string;  // Course thumbnail
}

export interface Module {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
  quiz?: Quiz;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  content_cid: string;  // IPFS CID for lesson content
  duration?: string;  // e.g., "15 minutes"
}

export interface Quiz {
  id: number;
  title: string;
  questions: Question[];
  passing_score: number;  // e.g., 80 (%)
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer_index: number;
}

// ===== Certificate Types =====

export interface Certificate {
  tokenId: bigint;
  courseId: bigint;
  completionDate: bigint;
  student: Address;
  skillsHash: `0x${string}`;
  metadataCid: string;
}

export interface CertificateMetadata {
  name: string;
  description: string;
  image: string;  // IPFS URL for certificate image
  attributes: CertificateAttribute[];
  course_id: number;
  student: Address;
  skills_hash: string;
  skills: string[];
  completion_date: string;
  issuer: Address;
}

export interface CertificateAttribute {
  trait_type: string;
  value: string | number;
}

// ===== Progress Tracking Types =====

export interface CourseProgress {
  courseId: number;
  enrolledAt: number;  // timestamp
  completedLessons: number[];
  completedQuizzes: QuizResult[];
  lastAccessedLesson?: number;
  progressPercentage: number;
}

export interface QuizResult {
  quizId: number;
  score: number;
  passed: boolean;
  completedAt: number;
}

// ===== State Types =====

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

export type TransactionState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'confirming'; hash: Hash }
  | { status: 'success'; hash: Hash }
  | { status: 'error'; error: Error };

// ===== Hook Return Types =====

export interface UseCourseCompletionNFTReturn {
  // Course functions
  createCourse: (name: string, contentCid: string, issuer: Address) => Promise<bigint>;
  getCourse: (courseId: bigint) => Promise<Course>;
  getTotalCourses: () => Promise<bigint>;

  // Certificate functions
  mintCertificate: (
    student: Address,
    courseId: bigint,
    skillsHash: `0x${string}`,
    metadataCid: string
  ) => Promise<bigint>;
  getCertificate: (tokenId: bigint) => Promise<Certificate>;
  hasCertificate: (student: Address, courseId: bigint) => Promise<boolean>;
  getUserCertificates: (address: Address) => Promise<Certificate[]>;
  tokenURI: (tokenId: bigint) => Promise<string>;

  // Access control functions
  addAdmin: (admin: Address) => Promise<void>;
  removeAdmin: (admin: Address) => Promise<void>;
  isAdmin: (address: Address) => Promise<boolean>;
  addCourseIssuer: (issuer: Address, courseId: bigint) => Promise<void>;
  removeCourseIssuer: (issuer: Address, courseId: bigint) => Promise<void>;
  isCourseIssuer: (issuer: Address, courseId: bigint) => Promise<boolean>;

  // Configuration functions
  setBaseURI: (baseUri: string) => Promise<void>;
  toggleSoulbound: (enabled: boolean) => Promise<void>;
  isSoulbound: () => Promise<boolean>;
  setCourseActive: (courseId: bigint, active: boolean) => Promise<void>;

  // Transaction states
  transactionState: TransactionState;
}

export interface UseCourseProgressReturn {
  // Enrollment
  enrollInCourse: (courseId: number) => void;
  isEnrolled: (courseId: number) => boolean;

  // Progress tracking
  getProgress: (courseId: number) => CourseProgress | null;
  markLessonComplete: (courseId: number, lessonId: number) => void;
  markQuizComplete: (courseId: number, quizId: number, score: number, passed: boolean) => void;

  // Completion checking
  isLessonComplete: (courseId: number, lessonId: number) => boolean;
  isEligibleForCertificate: (courseId: number, totalLessons: number, totalQuizzes: number) => boolean;

  // Utility
  calculateProgress: (courseId: number, totalLessons: number, totalQuizzes: number) => number;
  getAllEnrolledCourses: () => CourseProgress[];
  clearProgress: (courseId: number) => void;

  // Merkle tree for skills verification
  generateSkillsMerkle: (skills: string[]) => { root: `0x${string}`; proof: string[] };
}

export interface UseIPFSReturn {
  // Upload functions
  uploadJSON: <T>(data: T) => Promise<string>;
  uploadFile: (file: File) => Promise<string>;
  uploadCourseContent: (content: CourseContent) => Promise<string>;
  uploadCertificateMetadata: (metadata: CertificateMetadata) => Promise<string>;
  uploadCertificateImage: (tokenId: bigint, studentName: string, courseName: string) => Promise<string>;

  // Fetch functions
  fetchFromIPFS: <T>(cid: string) => Promise<T>;
  fetchCourseContent: (cid: string) => Promise<CourseContent>;
  fetchCertificateMetadata: (cid: string) => Promise<CertificateMetadata>;

  // State
  uploadState: AsyncState<string>;
  fetchState: AsyncState<any>;
}

// ===== Component Props =====

export interface CourseCardProps {
  course: Course;
  content?: CourseContent;
  onEnroll?: () => void;
  progress?: CourseProgress;
}

export interface LessonViewerProps {
  lesson: Lesson;
  onComplete: () => void;
  isCompleted: boolean;
}

export interface QuizComponentProps {
  quiz: Quiz;
  onComplete: (score: number, passed: boolean) => void;
}

export interface ProgressTrackerProps {
  progress: CourseProgress;
  totalLessons: number;
  totalQuizzes: number;
}

export interface CertificateDisplayProps {
  certificate: Certificate;
  metadata?: CertificateMetadata;
  showDetails?: boolean;
}

export interface MintCertificateButtonProps {
  courseId: bigint;
  courseName: string;
  skills: string[];
  onSuccess?: (tokenId: bigint) => void;
}

// ===== Admin Types =====

export interface AdminStats {
  totalCourses: number;
  totalCertificates: number;
  activeCourses: number;
  totalIssuers: number;
}

export interface CreateCourseFormData {
  name: string;
  description: string;
  skills: string[];
  modules: ModuleFormData[];
  estimatedDuration: string;
  thumbnail?: File;
}

export interface ModuleFormData {
  title: string;
  description: string;
  lessons: LessonFormData[];
  quiz?: QuizFormData;
}

export interface LessonFormData {
  title: string;
  description: string;
  content: string;  // Markdown content
  duration?: string;
}

export interface QuizFormData {
  title: string;
  questions: QuestionFormData[];
  passingScore: number;
}

export interface QuestionFormData {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}
