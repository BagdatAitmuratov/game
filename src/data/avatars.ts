export type AvatarEffect = 'none' | 'sparkle' | 'glow' | 'bubbles' | 'fire' | 'stars';

export interface AvatarItem {
  id: string;
  emoji: string;
  price: number; // in coins
  effect: AvatarEffect;
  tier: 'basic' | 'rare' | 'epic' | 'legendary';
}

export const AVATARS: AvatarItem[] = [
  { id: 'bunny', emoji: '🐰', price: 0, effect: 'none', tier: 'basic' },
  { id: 'chick', emoji: '🐤', price: 30, effect: 'none', tier: 'basic' },
  { id: 'cat', emoji: '🐱', price: 50, effect: 'sparkle', tier: 'basic' },
  { id: 'dog', emoji: '🐶', price: 60, effect: 'none', tier: 'basic' },
  { id: 'frog', emoji: '🐸', price: 70, effect: 'none', tier: 'basic' },
  { id: 'panda', emoji: '🐼', price: 80, effect: 'none', tier: 'basic' },
  { id: 'penguin', emoji: '🐧', price: 90, effect: 'none', tier: 'basic' },
  { id: 'fox', emoji: '🦊', price: 100, effect: 'glow', tier: 'rare' },
  { id: 'owl', emoji: '🦉', price: 120, effect: 'glow', tier: 'rare' },
  { id: 'bear', emoji: '🐻', price: 130, effect: 'none', tier: 'rare' },
  { id: 'koala', emoji: '🐨', price: 140, effect: 'none', tier: 'rare' },
  { id: 'monkey', emoji: '🐵', price: 150, effect: 'sparkle', tier: 'rare' },
  { id: 'robot', emoji: '🤖', price: 180, effect: 'sparkle', tier: 'rare' },
  { id: 'ghost', emoji: '👻', price: 200, effect: 'glow', tier: 'epic' },
  { id: 'tiger', emoji: '🐯', price: 220, effect: 'glow', tier: 'epic' },
  { id: 'lion', emoji: '🦁', price: 260, effect: 'stars', tier: 'epic' },
  { id: 'octopus', emoji: '🐙', price: 280, effect: 'bubbles', tier: 'epic' },
  { id: 'unicorn', emoji: '🦄', price: 320, effect: 'bubbles', tier: 'epic' },
  { id: 'alien', emoji: '👽', price: 360, effect: 'stars', tier: 'legendary' },
  { id: 'dragon', emoji: '🐉', price: 420, effect: 'fire', tier: 'legendary' },
];

export function getAvatar(id: string): AvatarItem {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}