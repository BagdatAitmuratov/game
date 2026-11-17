import React from 'react';
import { GameId } from '../types/game';

export const BrandEmblem: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
    <rect x="4" y="4" width="18" height="18" rx="6" fill="#F2795F" />
    <rect x="26" y="4" width="18" height="18" rx="6" fill="#4E89E8" />
    <rect x="4" y="26" width="18" height="18" rx="6" fill="#2FB479" />
    <circle cx="35" cy="35" r="9" fill="#F2B830" />
    <circle cx="13" cy="13" r="3.5" fill="#FFF8F3" />
    <path d="M31 13h8M35 9v8" stroke="#FFF8F3" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M9.5 35.5l2.5 2.5 4.5-5" stroke="#FFF8F3" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const GameIcon: React.FC<{ gameId: GameId; className?: string }> = ({
  gameId,
  className = 'w-8 h-8',
}) => {
  switch (gameId) {
    case 'memory':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="7" width="14" height="20" rx="4" fill="#F2795F" />
          <rect x="18" y="9" width="14" height="20" rx="4" fill="#FFAA96" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="25" cy="19" r="3.5" fill="#FFFFFF" />
        </svg>
      );
    case 'numberSlide':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="4" width="13" height="13" rx="3.5" fill="#4E89E8" />
          <rect x="19" y="4" width="13" height="13" rx="3.5" fill="#82B1FF" />
          <rect x="4" y="19" width="13" height="13" rx="3.5" fill="#82B1FF" />
          <rect x="19" y="19" width="13" height="13" rx="3.5" stroke="#4E89E8" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );
    case 'colorSort':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <rect x="7" y="5" width="9" height="26" rx="4.5" fill="#FFFFFF" stroke="#1F8A5B" strokeWidth="2" />
          <rect x="8.5" y="18" width="6" height="11" rx="3" fill="#2FB479" />
          <rect x="20" y="5" width="9" height="26" rx="4.5" fill="#FFFFFF" stroke="#1F8A5B" strokeWidth="2" />
          <rect x="21.5" y="12" width="6" height="17" rx="3" fill="#F2B830" />
        </svg>
      );
    case 'maze':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="4" width="28" height="28" rx="6" fill="#FDEEC6" stroke="#E5A42A" strokeWidth="2.4" />
          <path d="M12 4v14h10v6H10M24 12h8" stroke="#B57B14" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="25" cy="25" r="3" fill="#F2795F" />
        </svg>
      );
    case 'simon':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path d="M18 4a14 14 0 0 1 14 14H18V4Z" fill="#4E89E8" />
          <path d="M18 4v14H4A14 14 0 0 1 18 4Z" fill="#F2795F" />
          <path d="M4 18h14v14A14 14 0 0 1 4 18Z" fill="#F2B830" />
          <path d="M18 18h14a14 14 0 0 1-14 14V18Z" fill="#2FB479" />
          <circle cx="18" cy="18" r="5" fill="#FFFFFF" />
        </svg>
      );
    case 'connectDots':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path d="M9 10h10v16h8" stroke="#2CA4BF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="10" r="4.5" fill="#F2795F" />
          <circle cx="27" cy="26" r="4.5" fill="#F2795F" />
          <circle cx="27" cy="10" r="4" fill="#4E89E8" />
          <circle cx="9" cy="26" r="4" fill="#4E89E8" />
        </svg>
      );
    case 'mathGrid':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="4" width="12" height="12" rx="3" fill="#DE5B8F" />
          <rect x="20" y="4" width="12" height="12" rx="3" fill="#F7B2CD" />
          <rect x="4" y="20" width="12" height="12" rx="3" fill="#F7B2CD" />
          <rect x="20" y="20" width="12" height="12" rx="3" fill="#DE5B8F" />
          <path d="M10 7.5v5M7.5 10h5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M23.5 26h5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'tangram':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <polygon points="5,30 5,6 29,30" fill="#69A83B" />
          <polygon points="8,5 31,5 31,28" fill="#F2B830" />
          <polygon points="18,17 29,6 29,17" fill="#4E89E8" />
        </svg>
      );
    case 'oddOneOut':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="11" cy="11" r="5" fill="#E88435" />
          <circle cx="25" cy="11" r="5" fill="#E88435" />
          <circle cx="11" cy="25" r="5" fill="#E88435" />
          <rect x="20" y="20" width="10" height="10" rx="2.5" fill="#4E89E8" />
        </svg>
      );
  }
};
