import React, { useEffect, useState } from 'react';
import { getAvatar } from '../data/avatars';

const MOTIONS = ['avatar-jump', 'avatar-wave', 'avatar-spin', 'avatar-bounce', 'avatar-dance', 'avatar-walk'];

interface AvatarSpriteProps {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const AvatarSprite: React.FC<AvatarSpriteProps> = ({ avatarId, size = 'md', animated = true }) => {
  const avatar = getAvatar(avatarId);
  const [motion, setMotion] = useState<string>('');

  useEffect(() => {
    if (!animated) return;
    const interval = window.setInterval(() => {
      const next = MOTIONS[Math.floor(Math.random() * MOTIONS.length)];
      setMotion(next);
      window.setTimeout(() => setMotion(''), 1200);
    }, 120000 + Math.floor(Math.random() * 60000));
    return () => window.clearInterval(interval);
  }, [animated]);

  const sizeClass =
    size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-5xl' : 'text-3xl';

  const effectClass =
    animated && avatar.effect === 'fire'
      ? 'avatar-effect-fire'
      : animated && avatar.effect === 'bubbles'
      ? 'avatar-effect-bubbles'
      : animated && avatar.effect === 'stars'
      ? 'avatar-effect-stars'
      : animated && avatar.effect === 'glow'
      ? 'avatar-effect-glow'
      : animated && avatar.effect === 'sparkle'
      ? 'avatar-effect-sparkle'
      : '';

  return (
    <span
      className={`relative inline-flex items-center justify-center ${sizeClass} ${motion} ${effectClass}`}
      aria-label={avatar.id}
    >
      {avatar.emoji}
    </span>
  );
};