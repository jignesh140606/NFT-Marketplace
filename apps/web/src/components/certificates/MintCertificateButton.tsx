/**
 * MintCertificateButton component - Handles certificate minting flow
 */

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import {
  useCourseCompletionNFT,
  useCourseProgress,
  uploadCertificateImage,
  uploadCertificateMetadata,
  createCertificateMetadata,
} from '@/lib/course-completion-nft';
import { cn } from '@/lib/utils';

export interface MintCertificateButtonProps {
  courseId: bigint;
  courseName: string;
  skills: string[];
  issuerAddress: string;
  onSuccess?: (tokenId: bigint) => void;
  className?: string;
}

export function MintCertificateButton({
  courseId,
  courseName,
  skills,
  issuerAddress,
  onSuccess,
  className,
}: MintCertificateButtonProps) {
  const { address } = useAccount();
  const { mintCertificate, transactionState, userAddress } = useCourseCompletionNFT();
  const { generateSkillsMerkle } = useCourseProgress();

  const [minting, setMinting] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null);

  const handleMint = async () => {
    if (!userAddress || !address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setMinting(true);

      // Step 1: Generate skills Merkle root
      const { root: skillsHash } = generateSkillsMerkle(skills);

      // Step 2: Generate and upload certificate image
      const imageCid = await uploadCertificateImage(
        0n, // Placeholder, will be updated
        'Student',
        courseName
      );

      // Step 3: Create and upload certificate metadata
      const metadata = createCertificateMetadata(
        courseName,
        Number(courseId),
        address,
        skills,
        skillsHash,
        issuerAddress,
        imageCid
      );

      const metadataCid = await uploadCertificateMetadata(metadata);

      // Step 4: Mint certificate NFT
      const tokenId = await mintCertificate(
        address,
        courseId,
        skillsHash,
        metadataCid
      );

      setMintedTokenId(tokenId);

      if (onSuccess) {
        onSuccess(tokenId);
      }
    } catch (error) {
      console.error('Failed to mint certificate:', error);
      alert(`Failed to mint certificate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setMinting(false);
    }
  };

  if (mintedTokenId !== null) {
    return (
      <div className={cn('bg-forge-surface rounded-lg border border-node-app/20 p-8 text-center', className)}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-node-app/10 mb-4">
          <svg className="w-8 h-8 text-node-app" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>

        <h3 className="text-2xl font-bold text-forge-text mb-2">Certificate Minted!</h3>
        <p className="text-forge-muted mb-6">
          Your certificate has been successfully minted as NFT #{mintedTokenId.toString()}
        </p>

        <button
          onClick={() => window.location.href = '/profile'}
          className="px-6 py-3 bg-node-app text-white rounded-lg font-medium hover:bg-node-app/90 transition-colors"
        >
          View in Profile
        </button>
      </div>
    );
  }

  const isProcessing = minting || transactionState.status === 'pending' || transactionState.status === 'confirming';

  return (
    <div className={cn('bg-forge-surface rounded-lg border border-forge-border p-6', className)}>
      {/* Mint Certificate Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-node-app/10 mb-4">
          <svg className="w-8 h-8 text-node-app" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>

        <h3 className="text-2xl font-bold text-forge-text mb-2">Claim Your Certificate</h3>
        <p className="text-forge-muted mb-6">
          Congratulations! You've completed all requirements for <strong className="text-forge-text">{courseName}</strong>.
          Mint your NFT certificate to prove your achievement on-chain.
        </p>

        {/* Skills Preview */}
        {skills.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-forge-muted mb-3">Skills you'll certify:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm rounded-full bg-node-intelligence/10 text-node-intelligence border border-node-intelligence/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mint Button */}
        <button
          onClick={handleMint}
          disabled={isProcessing}
          className={cn(
            'w-full px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200',
            isProcessing
              ? 'bg-forge-border text-forge-muted cursor-not-allowed'
              : 'bg-gradient-to-r from-node-app to-node-intelligence text-white hover:shadow-lg hover:shadow-node-app/20 hover:scale-105'
          )}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {minting ? 'Preparing Certificate...' :
               transactionState.status === 'pending' ? 'Confirm in Wallet...' :
               transactionState.status === 'confirming' ? 'Minting...' :
               'Processing...'}
            </span>
          ) : (
            <span>🎉 Mint Certificate NFT</span>
          )}
        </button>

        {/* Transaction State Info */}
        {transactionState.status === 'confirming' && (
          <div className="mt-4 p-3 rounded-lg bg-node-app/10 border border-node-app/20">
            <p className="text-sm text-node-app">
              Transaction submitted! Waiting for confirmation...
            </p>
            {transactionState.hash && (
              <p className="text-xs text-forge-muted mt-1 font-mono">
                {transactionState.hash.slice(0, 10)}...{transactionState.hash.slice(-8)}
              </p>
            )}
          </div>
        )}

        {transactionState.status === 'error' && (
          <div className="mt-4 p-3 rounded-lg bg-accent-coral/10 border border-accent-coral/20">
            <p className="text-sm text-accent-coral">
              {transactionState.error?.message || 'Transaction failed. Please try again.'}
            </p>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-forge-border text-xs text-forge-muted space-y-2">
          <p>✓ Your certificate will be permanently stored on the blockchain</p>
          <p>✓ This is a soulbound NFT and cannot be transferred</p>
          <p>✓ You can view and share it anytime from your profile</p>
        </div>
      </div>
    </div>
  );
}
