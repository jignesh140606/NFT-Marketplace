/**
 * CertificateDisplay component - Beautiful certificate card display
 */

'use client';

import { useState, useEffect } from 'react';
import { Certificate, CertificateMetadata } from '@/lib/course-completion-nft/types';
import { fetchCertificateMetadata, getIPFSUrl } from '@/lib/course-completion-nft/utils/ipfs';
import { cn } from '@/lib/utils';

export interface CertificateDisplayProps {
  certificate: Certificate;
  metadata?: CertificateMetadata;
  showDetails?: boolean;
  className?: string;
}

export function CertificateDisplay({
  certificate,
  metadata: providedMetadata,
  showDetails = true,
  className,
}: CertificateDisplayProps) {
  const [metadata, setMetadata] = useState<CertificateMetadata | null>(providedMetadata || null);
  const [loading, setLoading] = useState(!providedMetadata);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (providedMetadata) {
      setMetadata(providedMetadata);
      setLoading(false);
      return;
    }

    async function loadMetadata() {
      try {
        setLoading(true);
        const data = await fetchCertificateMetadata(certificate.metadataCid);
        setMetadata(data);
      } catch (err) {
        console.error('Failed to load certificate metadata:', err);
        setError('Failed to load certificate details');
      } finally {
        setLoading(false);
      }
    }

    loadMetadata();
  }, [certificate.metadataCid, providedMetadata]);

  const completionDate = new Date(Number(certificate.completionDate) * 1000);

  if (loading) {
    return (
      <div className={cn('bg-forge-surface rounded-lg border border-forge-border p-8', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-forge-elevated rounded" />
          <div className="h-4 bg-forge-elevated rounded w-3/4" />
          <div className="h-4 bg-forge-elevated rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className={cn('bg-forge-surface rounded-lg border border-accent-coral/20 p-8', className)}>
        <p className="text-accent-coral">{error || 'No metadata available'}</p>
      </div>
    );
  }

  return (
    <div className={cn('bg-gradient-to-br from-node-intelligence/10 to-accent-magenta/10 rounded-lg border border-node-intelligence/20 overflow-hidden', className)}>
      {/* Certificate Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-node-intelligence to-accent-magenta p-8">
        {metadata.image && (
          <img
            src={getIPFSUrl(metadata.image.replace('ipfs://', ''))}
            alt={metadata.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Hide image on error
              e.currentTarget.style.display = 'none';
            }}
          />
        )}

        {/* Fallback design if image fails */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mb-4 opacity-20">
              <svg className="w-20 h-20 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Details */}
      <div className="bg-forge-surface p-6 space-y-4">
        {/* Title */}
        <div>
          <h3 className="text-2xl font-bold text-forge-text mb-1">{metadata.name}</h3>
          <p className="text-sm text-forge-muted">{metadata.description}</p>
        </div>

        {/* Completion Info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-forge-muted">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{completionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-2 text-forge-muted">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="font-mono text-xs">#{certificate.tokenId.toString()}</span>
          </div>
        </div>

        {/* Skills */}
        {showDetails && metadata.skills && metadata.skills.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-forge-text mb-2">Skills Acquired</h4>
            <div className="flex flex-wrap gap-2">
              {metadata.skills.map((skill, index) => (
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

        {/* Attributes */}
        {showDetails && metadata.attributes && (
          <div className="pt-4 border-t border-forge-border">
            <div className="grid grid-cols-2 gap-4">
              {metadata.attributes.slice(0, 4).map((attr, index) => (
                <div key={index}>
                  <p className="text-xs text-forge-muted mb-1">{attr.trait_type}</p>
                  <p className="text-sm font-medium text-forge-text">{attr.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification */}
        <div className="pt-4 border-t border-forge-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-forge-muted">
            <svg className="w-4 h-4 text-node-app" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Verified on-chain</span>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(certificate.tokenId.toString());
            }}
            className="px-3 py-1 text-xs rounded bg-forge-elevated hover:bg-forge-border text-forge-text transition-colors"
          >
            Copy Token ID
          </button>
        </div>
      </div>
    </div>
  );
}
