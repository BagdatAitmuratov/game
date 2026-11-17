import { clampLevel, mulberry32 } from '../../utils/prng';

export interface NumberSlideBoard {
  size: number;
  tiles: number[]; // 0 represents empty slot
}

export function generateNumberSlide(rawLevel: number): NumberSlideBoard {
  const level = clampLevel(rawLevel);
  const rng = mulberry32(200000 + level * 6173);

  const size = level <= 25 ? 3 : level <= 350 ? 4 : 5;
  const total = size * size;
  const tiles = Array.from({ length: total }, (_, i) => (i + 1) % total);

  let emptyIdx = total - 1;
  let prevEmptyIdx = -1;

  // Scramble by valid blank moves so puzzle is 100% solvable
  const scrambleSteps = Math.min(240, 8 + Math.floor(level * 0.45) + size * 6);

  for (let step = 0; step < scrambleSteps; step++) {
    const r = Math.floor(emptyIdx / size);
    const c = emptyIdx % size;
    const neighbors: number[] = [];
    if (r > 0) neighbors.push((r - 1) * size + c);
    if (r < size - 1) neighbors.push((r + 1) * size + c);
    if (c > 0) neighbors.push(r * size + (c - 1));
    if (c < size - 1) neighbors.push(r * size + (c + 1));

    const filtered = neighbors.filter((n) => n !== prevEmptyIdx);
    const pick = filtered[Math.floor(rng() * filtered.length)] ?? neighbors[0];
    [tiles[emptyIdx], tiles[pick]] = [tiles[pick], tiles[emptyIdx]];
    prevEmptyIdx = emptyIdx;
    emptyIdx = pick;
  }

  // Guarantee it doesn't accidentally land back on solved state
  if (isSlideSolved(tiles)) {
    const swapIdx = emptyIdx === total - 1 ? total - 2 : total - 1;
    [tiles[emptyIdx], tiles[swapIdx]] = [tiles[swapIdx], tiles[emptyIdx]];
    // Make one more legal adjacent move instead to keep parity valid!
    // Reset to solved and do 3 deterministic moves
    for (let i = 0; i < total; i++) tiles[i] = (i + 1) % total;
    const r = size - 1;
    const c = size - 1;
    const seq = [r * size + (c - 1), (r - 1) * size + (c - 1), (r - 1) * size + c];
    let cur = total - 1;
    for (const nxt of seq) {
      [tiles[cur], tiles[nxt]] = [tiles[nxt], tiles[cur]];
      cur = nxt;
    }
  }

  return { size, tiles };
}

export function canSlideTile(tiles: readonly number[], size: number, index: number): boolean {
  const emptyIdx = tiles.indexOf(0);
  if (emptyIdx < 0 || index === emptyIdx) return false;
  const r1 = Math.floor(index / size);
  const c1 = index % size;
  const r2 = Math.floor(emptyIdx / size);
  const c2 = emptyIdx % size;
  return r1 === r2 || c1 === c2;
}

export function slideTile(tiles: readonly number[], size: number, index: number): number[] {
  const emptyIdx = tiles.indexOf(0);
  if (emptyIdx < 0 || index === emptyIdx) return [...tiles];

  const r1 = Math.floor(index / size);
  const c1 = index % size;
  const r2 = Math.floor(emptyIdx / size);
  const c2 = emptyIdx % size;

  if (r1 !== r2 && c1 !== c2) return [...tiles];

  const next = [...tiles];
  if (r1 === r2) {
    const dir = c1 < c2 ? -1 : 1;
    for (let c = c2; c !== c1; c += dir) {
      const target = r2 * size + c;
      const source = r2 * size + (c + dir);
      next[target] = next[source];
    }
    next[index] = 0;
  } else {
    const dir = r1 < r2 ? -1 : 1;
    for (let r = r2; r !== r1; r += dir) {
      const target = r * size + c2;
      const source = (r + dir) * size + c2;
      next[target] = next[source];
    }
    next[index] = 0;
  }
  return next;
}

export function isSlideSolved(tiles: readonly number[]): boolean {
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[tiles.length - 1] === 0;
}
