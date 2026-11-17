import { clampLevel, mulberry32 } from '../../utils/prng';

export interface DotPoint {
  r: number;
  c: number;
}

export interface DotPair {
  colorId: number;
  color: string;
  start: DotPoint;
  end: DotPoint;
  solution: DotPoint[];
}

export interface ConnectDotsPuzzle {
  size: number;
  pairs: DotPair[];
}

export const DOT_COLORS = [
  '#F2795F', // Coral
  '#4E89E8', // Sky Blue
  '#2FB479', // Mint Green
  '#F2B830', // Amber
  '#8F5EE0', // Lavender
  '#2CA4BF', // Teal
  '#E6609B', // Berry
];

function neighbors(r: number, c: number, size: number): DotPoint[] {
  const res: DotPoint[] = [];
  if (r > 0) res.push({ r: r - 1, c });
  if (r < size - 1) res.push({ r: r + 1, c });
  if (c > 0) res.push({ r, c: c - 1 });
  if (c < size - 1) res.push({ r, c: c + 1 });
  return res;
}

function samePoint(a: DotPoint, b: DotPoint): boolean {
  return a.r === b.r && a.c === b.c;
}

export function generateConnectDots(rawLevel: number): ConnectDotsPuzzle {
  const level = clampLevel(rawLevel);
  const rng = mulberry32(600000 + level * 4999);

  let size = 4;
  let pairCount = 3;
  if (level <= 20) {
    size = 4;
    pairCount = 3;
  } else if (level <= 100) {
    size = 5;
    pairCount = 4;
  } else if (level <= 350) {
    size = 5;
    pairCount = 5;
  } else if (level <= 700) {
    size = 6;
    pairCount = 5;
  } else {
    size = 6;
    pairCount = 6;
  }

  // Build initial snake Hamiltonian path across all size*size cells
  let path: DotPoint[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const col = r % 2 === 0 ? c : size - 1 - c;
      path.push({ r, c: col });
    }
  }

  // Apply backbite moves to scramble Hamiltonian path organically
  const backbites = size * size * 8;
  for (let step = 0; step < backbites; step++) {
    const flipEnd = rng() < 0.5;
    if (flipEnd) path.reverse();
    const head = path[0];
    const adj = neighbors(head.r, head.c, size);
    const pick = adj[Math.floor(rng() * adj.length)];
    const idx = path.findIndex((p) => samePoint(p, pick));
    if (idx > 1) {
      // Reverse prefix 0..idx-1 so path remains a valid Hamiltonian path
      const prefix = path.slice(0, idx).reverse();
      path = [...prefix, ...path.slice(idx)];
    }
  }

  // Slice Hamiltonian path into pairCount segments of length >= 3
  const total = path.length;
  const lengths = Array<number>(pairCount).fill(3);
  let remaining = total - pairCount * 3;
  while (remaining > 0) {
    const idx = Math.floor(rng() * pairCount);
    lengths[idx] += 1;
    remaining -= 1;
  }

  const pairs: DotPair[] = [];
  let cursor = 0;
  for (let i = 0; i < pairCount; i++) {
    const seg = path.slice(cursor, cursor + lengths[i]);
    cursor += lengths[i];
    pairs.push({
      colorId: i,
      color: DOT_COLORS[i % DOT_COLORS.length],
      start: seg[0],
      end: seg[seg.length - 1],
      solution: seg,
    });
  }

  return { size, pairs };
}

export function isAdjacentPoint(a: DotPoint, b: DotPoint): boolean {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

export function isConnectDotsSolved(
  puzzle: ConnectDotsPuzzle,
  paths: Record<number, DotPoint[]>,
): boolean {
  const occupied = new Set<string>();
  for (const pair of puzzle.pairs) {
    const p = paths[pair.colorId];
    if (!p || p.length < 2) return false;
    const first = p[0];
    const last = p[p.length - 1];
    const validEnds =
      (samePoint(first, pair.start) && samePoint(last, pair.end)) ||
      (samePoint(first, pair.end) && samePoint(last, pair.start));
    if (!validEnds) return false;

    for (let i = 0; i < p.length; i++) {
      const key = `${p[i].r},${p[i].c}`;
      if (occupied.has(key)) return false;
      occupied.add(key);
      if (i > 0 && !isAdjacentPoint(p[i - 1], p[i])) return false;
    }
  }
  return true;
}
