// Constants for Course Completion NFT System

import { Address } from 'viem';

// ===== Contract ABI =====

export const COURSE_COMPLETION_NFT_ABI = [
  // Initialize
  {
    type: 'function',
    name: 'initialize',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // Course Management
  {
    type: 'function',
    name: 'createCourse',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'content_cid', type: 'string' },
      { name: 'issuer', type: 'address' },
    ],
    outputs: [{ name: 'course_id', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getCourse',
    inputs: [{ name: 'course_id', type: 'uint256' }],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'content_cid', type: 'string' },
      { name: 'issuer', type: 'address' },
      { name: 'active', type: 'bool' },
      { name: 'created_at', type: 'uint256' },
      { name: 'total_issued', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTotalCourses',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setCourseActive',
    inputs: [
      { name: 'course_id', type: 'uint256' },
      { name: 'active', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // Certificate Management
  {
    type: 'function',
    name: 'mintCertificate',
    inputs: [
      { name: 'student', type: 'address' },
      { name: 'course_id', type: 'uint256' },
      { name: 'skills_hash', type: 'bytes32' },
      { name: 'metadata_cid', type: 'string' },
    ],
    outputs: [{ name: 'token_id', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getCertificate',
    inputs: [{ name: 'token_id', type: 'uint256' }],
    outputs: [
      { name: 'course_id', type: 'uint256' },
      { name: 'completion_date', type: 'uint256' },
      { name: 'student', type: 'address' },
      { name: 'skills_hash', type: 'bytes32' },
      { name: 'metadata_cid', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasCertificate',
    inputs: [
      { name: 'student', type: 'address' },
      { name: 'course_id', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ name: 'token_id', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  // Access Control
  {
    type: 'function',
    name: 'addAdmin',
    inputs: [{ name: 'new_admin', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeAdmin',
    inputs: [{ name: 'admin', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isAdmin',
    inputs: [{ name: 'address', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'addCourseIssuer',
    inputs: [
      { name: 'issuer', type: 'address' },
      { name: 'course_id', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeCourseIssuer',
    inputs: [
      { name: 'issuer', type: 'address' },
      { name: 'course_id', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isCourseIssuer',
    inputs: [
      { name: 'issuer', type: 'address' },
      { name: 'course_id', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  // Configuration
  {
    type: 'function',
    name: 'setBaseURI',
    inputs: [{ name: 'new_base_uri', type: 'string' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'toggleSoulbound',
    inputs: [{ name: 'enabled', type: 'bool' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isSoulbound',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  // ERC721 Standard Functions
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'ownerOf',
    inputs: [{ name: 'token_id', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transferFrom',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'token_id', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'safeTransferFrom',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'token_id', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'approved', type: 'address' },
      { name: 'token_id', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setApprovalForAll',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getApproved',
    inputs: [{ name: 'token_id', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isApprovedForAll',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'operator', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  // Events
  {
    type: 'event',
    name: 'CourseCreated',
    inputs: [
      { name: 'course_id', type: 'uint256', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'issuer', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'CertificateMinted',
    inputs: [
      { name: 'token_id', type: 'uint256', indexed: true },
      { name: 'student', type: 'address', indexed: true },
      { name: 'course_id', type: 'uint256', indexed: true },
      { name: 'completion_date', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'AdminAdded',
    inputs: [{ name: 'admin', type: 'address', indexed: true }],
  },
  {
    type: 'event',
    name: 'AdminRemoved',
    inputs: [{ name: 'admin', type: 'address', indexed: true }],
  },
  {
    type: 'event',
    name: 'IssuerAdded',
    inputs: [
      { name: 'issuer', type: 'address', indexed: true },
      { name: 'course_id', type: 'uint256', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'IssuerRemoved',
    inputs: [
      { name: 'issuer', type: 'address', indexed: true },
      { name: 'course_id', type: 'uint256', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'BaseURIUpdated',
    inputs: [{ name: 'new_base_uri', type: 'string', indexed: false }],
  },
  {
    type: 'event',
    name: 'SoulboundToggled',
    inputs: [{ name: 'enabled', type: 'bool', indexed: false }],
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'token_id', type: 'uint256', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'approved', type: 'address', indexed: true },
      { name: 'token_id', type: 'uint256', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'ApprovalForAll',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'operator', type: 'address', indexed: true },
      { name: 'approved', type: 'bool', indexed: false },
    ],
  },
] as const;

// ===== Contract Addresses =====

// Get contract address from environment variable or use placeholder
const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_COURSE_COMPLETION_NFT_ADDRESS || '0x0000000000000000000000000000000000000000') as Address;

export const CONTRACT_ADDRESSES: Record<number, Address> = {
  // Arbitrum Sepolia (testnet) - where our contract is actually deployed
  421614: CONTRACT_ADDRESS,
  // Arbitrum One contracts would go here when deployed to mainnet
  // 42161: CONTRACT_ADDRESS,
};

// Check if contract is deployed
export const isContractDeployed = (chainId: number): boolean => {
  const address = CONTRACT_ADDRESSES[chainId];
  return address && address !== '0x0000000000000000000000000000000000000000';
};

// ===== IPFS Configuration =====

export const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/',
];

export const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || '';
export const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

// ===== Local Storage Keys =====

export const STORAGE_KEYS = {
  COURSE_PROGRESS: 'course_progress',
  ENROLLED_COURSES: 'enrolled_courses',
  QUIZ_RESULTS: 'quiz_results',
} as const;

// ===== Default Values =====

export const DEFAULT_BASE_URI = 'ipfs://';
export const MIN_PASSING_SCORE = 80; // 80%

// ===== Error Messages =====

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INVALID_COURSE: 'Course does not exist or is inactive',
  DUPLICATE_CERTIFICATE: 'You already have a certificate for this course',
  TRANSFERS_DISABLED: 'Certificates are non-transferrable (soulbound)',
  NOT_ENROLLED: 'You must enroll in the course first',
  INCOMPLETE_COURSE: 'Please complete all lessons and quizzes before minting certificate',
  IPFS_UPLOAD_FAILED: 'Failed to upload to IPFS',
  IPFS_FETCH_FAILED: 'Failed to fetch from IPFS',
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
  WRONG_NETWORK: 'Please switch to the correct network',
} as const;

// ===== Success Messages =====

export const SUCCESS_MESSAGES = {
  COURSE_CREATED: 'Course created successfully!',
  CERTIFICATE_MINTED: 'Certificate minted successfully!',
  ADMIN_ADDED: 'Admin added successfully!',
  ISSUER_ADDED: 'Issuer added successfully!',
  COURSE_ENROLLED: 'Successfully enrolled in course!',
  LESSON_COMPLETED: 'Lesson completed!',
  QUIZ_PASSED: 'Quiz passed!',
} as const;
