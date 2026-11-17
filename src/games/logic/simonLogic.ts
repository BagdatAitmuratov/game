import { clampLevel, mulberry32 } from '../../utils/prng';

export interface SimonPuzzle {
  padCount: number;
  sequence: number[];
  stepDelayMs: number;
}

export const SIMON_PADS = [
  { id: 0, bg: '#F2795F', active: '#FF9E8A', label: 'A' },
  { id: 1, bg: '#4E89E8', active: '#82B1FF', label: 'B' },
  { id: 2, bg: '#2FB479', active: '#66DDA7', label: 'C' },
  { id: 3, bg: '#F2B830', active: '#FFD56B', label: 'D' },
  { id: 4, bg: '#8F5EE0', active: '#B691F5', label: 'E' },
  { id: 5, bg: '#2CA4BF', active: '#67CFE6', label: 'F' },
];

export function generateSimon(rawLevel: number): SimonPuzzle {
  const level = clampLevel(rawLevel);
  const rng = mulberry32(500000 + level * 3571);

  const padCount = level >= 150 ? 6 : 4;
  const seqLength = Math.min(14, 3 + Math.floor((level - 1) / 35) + (level > 10 ? 1 : 0));
  const stepDelayMs = Math.max(320, 620 - Math.floor(level * 0.28));

  const sequence: number[] = [];
  for (let i = 0; i < seqLength; i++) {
    sequence.push(Math.floor(rng() * padCount));
  }

  return { padCount, sequence, stepDelayMs };
}
