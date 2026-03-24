// IPFS Utilities for Course Completion NFT System

import { IPFS_GATEWAYS, PINATA_JWT, PINATA_GATEWAY } from '../constants';
import type { CourseContent, CertificateMetadata } from '../types';

// ===== Upload Functions =====

/**
 * Upload JSON data to IPFS using Pinata
 */
export async function uploadJSON<T>(data: T): Promise<string> {
  if (!PINATA_JWT) {
    throw new Error('Pinata JWT is not configured. Set NEXT_PUBLIC_PINATA_JWT environment variable.');
  }

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: {
          name: `course-nft-${Date.now()}.json`,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinata upload failed: ${error}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload a file to IPFS using Pinata
 */
export async function uploadFile(file: File): Promise<string> {
  if (!PINATA_JWT) {
    throw new Error('Pinata JWT is not configured.');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({
      name: file.name,
    }));

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinata file upload failed: ${error}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error('IPFS file upload error:', error);
    throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload course content to IPFS
 */
export async function uploadCourseContent(content: CourseContent): Promise<string> {
  // First, upload lessons content if they're inline
  const processedModules = await Promise.all(
    content.modules.map(async (module) => {
      const processedLessons = await Promise.all(
        module.lessons.map(async (lesson) => {
          // If lesson has inline content, upload it and get CID
          if (lesson.content_cid.startsWith('inline:')) {
            const lessonContent = lesson.content_cid.replace('inline:', '');
            const cid = await uploadJSON({ content: lessonContent });
            return { ...lesson, content_cid: cid };
          }
          return lesson;
        })
      );
      return { ...module, lessons: processedLessons };
    })
  );

  const processedContent = { ...content, modules: processedModules };
  return uploadJSON(processedContent);
}

/**
 * Upload certificate metadata to IPFS
 */
export async function uploadCertificateMetadata(metadata: CertificateMetadata): Promise<string> {
  return uploadJSON(metadata);
}

/**
 * Generate and upload certificate image to IPFS
 * This is a simplified version - in production, you'd use canvas or a service to generate the image
 */
export async function uploadCertificateImage(
  tokenId: bigint,
  studentName: string,
  courseName: string
): Promise<string> {
  try {
    // For now, we'll create an SVG certificate
    // In production, you might use html2canvas or generate a PNG
    const svg = generateCertificateSVG(tokenId, studentName, courseName);

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const file = new File([blob], `certificate-${tokenId}.svg`, { type: 'image/svg+xml' });

    return await uploadFile(file);
  } catch (error) {
    console.error('Certificate image upload error:', error);
    // Return a placeholder or throw
    throw error;
  }
}

/**
 * Generate a simple SVG certificate
 */
function generateCertificateSVG(tokenId: bigint, studentName: string, courseName: string): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#c026d3;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="800" height="600" fill="url(#grad1)"/>

      <!-- Border -->
      <rect x="20" y="20" width="760" height="560" fill="none" stroke="#ffffff" stroke-width="3" rx="10"/>

      <!-- Content -->
      <text x="400" y="100" font-family="serif" font-size="48" fill="#ffffff" text-anchor="middle" font-weight="bold">
        Certificate of Completion
      </text>

      <text x="400" y="180" font-family="sans-serif" font-size="20" fill="#e4e4ef" text-anchor="middle">
        This certifies that
      </text>

      <text x="400" y="250" font-family="serif" font-size="36" fill="#ffffff" text-anchor="middle" font-weight="bold">
        ${escapeXML(studentName)}
      </text>

      <text x="400" y="320" font-family="sans-serif" font-size="20" fill="#e4e4ef" text-anchor="middle">
        has successfully completed
      </text>

      <text x="400" y="390" font-family="serif" font-size="32" fill="#ffffff" text-anchor="middle" font-weight="bold">
        ${escapeXML(courseName)}
      </text>

      <text x="400" y="480" font-family="sans-serif" font-size="16" fill="#e4e4ef" text-anchor="middle">
        ${date}
      </text>

      <text x="400" y="540" font-family="monospace" font-size="12" fill="#e4e4ef" text-anchor="middle" opacity="0.7">
        Token ID: #${tokenId.toString()}
      </text>
    </svg>
  `;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ===== Fetch Functions =====

/**
 * Fetch data from IPFS with fallback to multiple gateways
 */
export async function fetchFromIPFS<T>(cid: string): Promise<T> {
  // Remove any ipfs:// prefix
  const cleanCid = cid.replace('ipfs://', '');

  let lastError: Error | null = null;

  // Try each gateway
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = `${gateway}${cleanCid}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.warn(`Failed to fetch from ${gateway}:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      // Continue to next gateway
    }
  }

  // If all gateways failed
  throw new Error(
    `Failed to fetch CID ${cleanCid} from all gateways. Last error: ${lastError?.message || 'Unknown'}`
  );
}

/**
 * Fetch course content from IPFS
 */
export async function fetchCourseContent(cid: string): Promise<CourseContent> {
  return fetchFromIPFS<CourseContent>(cid);
}

/**
 * Fetch certificate metadata from IPFS
 */
export async function fetchCertificateMetadata(cid: string): Promise<CertificateMetadata> {
  return fetchFromIPFS<CertificateMetadata>(cid);
}

/**
 * Fetch lesson content from IPFS
 */
export async function fetchLessonContent(cid: string): Promise<{ content: string }> {
  return fetchFromIPFS<{ content: string}>(cid);
}

// ===== Validation Functions =====

/**
 * Validate CID format
 */
export function isValidCID(cid: string): boolean {
  // Basic CID validation (simplified)
  const cleanCid = cid.replace('ipfs://', '');
  // CIDv0: Qm... (46 chars base58)
  // CIDv1: b... or z... (variable length)
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,})$/i.test(cleanCid);
}

/**
 * Get IPFS URL from CID
 */
export function getIPFSUrl(cid: string, gateway: string = PINATA_GATEWAY): string {
  const cleanCid = cid.replace('ipfs://', '');
  return `${gateway}${cleanCid}`;
}

// ===== Helper Functions =====

/**
 * Create certificate metadata object
 */
export function createCertificateMetadata(
  courseName: string,
  courseId: number,
  student: string,
  skills: string[],
  skillsHash: string,
  issuer: string,
  imageCid: string
): CertificateMetadata {
  const completionDate = new Date().toISOString();

  return {
    name: `${courseName} - Course Completion Certificate`,
    description: `This certificate verifies that the holder has successfully completed the ${courseName} course and demonstrated proficiency in the associated skills.`,
    image: `ipfs://${imageCid}`,
    attributes: [
      {
        trait_type: 'Course',
        value: courseName,
      },
      {
        trait_type: 'Course ID',
        value: courseId,
      },
      {
        trait_type: 'Completion Date',
        value: completionDate,
      },
      {
        trait_type: 'Skills Count',
        value: skills.length,
      },
      ...skills.map((skill, index) => ({
        trait_type: `Skill ${index + 1}`,
        value: skill,
      })),
    ],
    course_id: courseId,
    student: student as `0x${string}`,
    skills_hash: skillsHash,
    skills,
    completion_date: completionDate,
    issuer: issuer as `0x${string}`,
  };
}

/**
 * Estimate gas for IPFS pinning (for user feedback)
 */
export function estimateUploadTime(sizeInBytes: number): string {
  // Rough estimates
  if (sizeInBytes < 100_000) return 'a few seconds';
  if (sizeInBytes < 1_000_000) return '10-30 seconds';
  return '30-60 seconds';
}
