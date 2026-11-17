import { clampLevel, mulberry32, seededShuffle } from '../../utils/prng';

export const TUBE_CAPACITY = 4;

export interface ColorSortState {
  tubes: number[][]; // bottom-to-top color indices
  colorCount: number;
}

export const SORT_COLORS = [
  '#F2795F', // Coral
  '#4E89E8', // Sky Blue
  '#2FB479', // Mint Green
  '#F2B830', // Sunny Amber
  '#9A6BE8', // Lavender
  '#2CA4BF', // Teal
  '#E6609B', // Berry Pink
  '#8B6854', // Cocoa
];

export function generateColorSort(rawLevel: number): ColorSortState {
  const level = clampLevel(rawLevel);
  const rng = mulberry32(300000 + level * 5437);

  let colorCount = 3;
  if (level <= 15) colorCount = 3;
  else if (level <= 60) colorCount = 4;
  else if (level <= 180) colorCount = 5;
  else if (level <= 450) colorCount = 6;
  else if (level <= 750) colorCount = 7;
  else colorCount = 8;

  // Build flat pool of 4 tokens per color and shuffle deterministically.
  // With 2 empty tubes of capacity 4 alongside colorCount filled tubes,
  // any distribution of 4 tokens per color is solvable (2 buffer tubes provide full sorting freedom).
  const pool: number[] = [];
  for (let c = 0; c < colorCount; c++) {
    for (let k = 0; k < TUBE_CAPACITY; k++) pool.push(c);
  }

  let tubes: number[][] = [];
  for (let attempt = 0; attempt < 10; attempt++) {
    const mixed = seededShuffle(pool, rng);
    tubes = [];
    for (let t = 0; t < colorCount; t++) {
      tubes.push(mixed.slice(t * TUBE_CAPACITY, (t + 1) * TUBE_CAPACITY));
    }
    const anyAlreadyPure = tubes.some((tube) => tube.every((x) => x === tube[0]));
    if (!anyAlreadyPure) break;
  }

  // Add 2 empty tubes
  tubes.push([], []);
  return { tubes, colorCount };
}

export function canPour(tubes: readonly (readonly number[])[], from: number, to: number): boolean {
  if (from === to) return false;
  const src = tubes[from];
  const dst = tubes[to];
  if (!src || !dst || src.length === 0 || dst.length >= TUBE_CAPACITY) return false;
  if (dst.length === 0) return true;
  return src[src.length - 1] === dst[dst.length - 1];
}

export function pourTube(tubes: readonly (readonly number[])[], from: number, to: number): number[][] | null {
  if (!canPour(tubes, from, to)) return null;
  const next = tubes.map((t) => [...t]);
  const src = next[from];
  const dst = next[to];
  const topColor = src[src.length - 1];

  while (
    src.length > 0 &&
    dst.length < TUBE_CAPACITY &&
    src[src.length - 1] === topColor
  ) {
    dst.push(src.pop()!);
  }
  return next;
}

export function isColorSortSolved(tubes: readonly (readonly number[])[]): boolean {
  return tubes.every(
    (tube) =>
      tube.length === 0 ||
      (tube.length === TUBE_CAPACITY && tube.every((c) => c === tube[0])),
  );
}
