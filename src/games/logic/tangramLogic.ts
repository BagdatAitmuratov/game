import { clampLevel, mulberry32, seededShuffle } from '../../utils/prng';

export interface GridCoord {
  r: number;
  c: number;
}

export interface TangramPiece {
  id: number;
  color: string;
  cells: GridCoord[]; // normalized relative to (0,0) top-left of bounding box
  initialRotation: number; // 0..3 quarter turns
}

export interface TangramPuzzle {
  rows: number;
  cols: number;
  targetMask: boolean[][]; // true = part of silhouette to fill
  pieces: TangramPiece[];
}

const PIECE_COLORS = [
  '#F2795F',
  '#4E89E8',
  '#2FB479',
  '#F2B830',
  '#8F5EE0',
  '#2CA4BF',
  '#E6609B',
];

export function normalizeCoords(coords: readonly GridCoord[]): GridCoord[] {
  const minR = Math.min(...coords.map((p) => p.r));
  const minC = Math.min(...coords.map((p) => p.c));
  return coords
    .map((p) => ({ r: p.r - minR, c: p.c - minC }))
    .sort((a, b) => (a.r !== b.r ? a.r - b.r : a.c - b.c));
}

export function rotateCoords(coords: readonly GridCoord[], times: number): GridCoord[] {
  const t = ((times % 4) + 4) % 4;
  let curr = coords.map((p) => ({ ...p }));
  for (let i = 0; i < t; i++) {
    curr = curr.map((p) => ({ r: p.c, c: -p.r }));
  }
  return normalizeCoords(curr);
}

export function generateTangram(rawLevel: number): TangramPuzzle {
  const level = clampLevel(rawLevel);
  const rng = mulberry32(800000 + level * 7127);

  let rows = 3;
  let cols = 3;
  let targetPieces = 3;

  if (level <= 15) {
    rows = 3;
    cols = 3;
    targetPieces = 3;
  } else if (level <= 70) {
    rows = 4;
    cols = 4;
    targetPieces = 4;
  } else if (level <= 250) {
    rows = 4;
    cols = 5;
    targetPieces = 5;
  } else if (level <= 600) {
    rows = 5;
    cols = 5;
    targetPieces = 6;
  } else {
    rows = 5;
    cols = 6;
    targetPieces = 7;
  }

  const targetMask = Array.from({ length: rows }, () => Array<boolean>(cols).fill(true));
  // Optionally carve 1-2 corner cutouts at mid/high levels for distinct silhouettes
  if (level >= 10 && rng() < 0.7) {
    const corners: GridCoord[] = [
      { r: 0, c: 0 },
      { r: 0, c: cols - 1 },
      { r: rows - 1, c: 0 },
      { r: rows - 1, c: cols - 1 },
    ];
    const cutout = corners[Math.floor(rng() * corners.length)];
    targetMask[cutout.r][cutout.c] = false;
  }

  const owner = Array.from({ length: rows }, () => Array<number>(cols).fill(-1));
  const activeCells: GridCoord[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (targetMask[r][c]) activeCells.push({ r, c });
    }
  }

  // Seed K distinct starting cells
  const seeds = seededShuffle(activeCells, rng).slice(0, targetPieces);
  const pieceCells: GridCoord[][] = seeds.map((s, idx) => {
    owner[s.r][s.c] = idx;
    return [s];
  });

  // Grow pieces via multi-source randomized BFS until every active cell is assigned
  let unassigned = activeCells.length - seeds.length;
  let safety = 0;
  while (unassigned > 0 && safety < 500) {
    safety++;
    const order = seededShuffle(
      Array.from({ length: targetPieces }, (_, i) => i),
      rng,
    );
    let grewAny = false;
    for (const pIdx of order) {
      const frontier: GridCoord[] = [];
      for (const cell of pieceCells[pIdx]) {
        const dirs = [
          { r: cell.r - 1, c: cell.c },
          { r: cell.r + 1, c: cell.c },
          { r: cell.r, c: cell.c - 1 },
          { r: cell.r, c: cell.c + 1 },
        ];
        for (const d of dirs) {
          if (
            d.r >= 0 &&
            d.r < rows &&
            d.c >= 0 &&
            d.c < cols &&
            targetMask[d.r][d.c] &&
            owner[d.r][d.c] === -1
          ) {
            frontier.push(d);
          }
        }
      }
      if (frontier.length > 0) {
        const pick = frontier[Math.floor(rng() * frontier.length)];
        owner[pick.r][pick.c] = pIdx;
        pieceCells[pIdx].push(pick);
        unassigned--;
        grewAny = true;
      }
    }
    if (!grewAny) break;
  }

  // Fallback for any disconnected leftover cell: attach to adjacent or make simple mask false
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (targetMask[r][c] && owner[r][c] === -1) {
        targetMask[r][c] = false;
      }
    }
  }

  const pieces: TangramPiece[] = pieceCells
    .filter((cells) => cells.length > 0)
    .map((cells, idx) => {
      const rot = level <= 5 ? 0 : Math.floor(rng() * 4);
      const norm = normalizeCoords(cells);
      return {
        id: idx,
        color: PIECE_COLORS[idx % PIECE_COLORS.length],
        cells: norm,
        initialRotation: rot,
      };
    });

  return { rows, cols, targetMask, pieces };
}

export interface PlacedPieceState {
  pieceId: number;
  anchorR: number;
  anchorC: number;
  rotation: number;
}

export function canPlaceTangramPiece(
  puzzle: TangramPuzzle,
  piece: TangramPiece,
  anchorR: number,
  anchorC: number,
  rotation: number,
  placements: Record<number, PlacedPieceState | null>,
): boolean {
  const rotated = rotateCoords(piece.cells, rotation);

  // Build occupied set excluding current pieceId
  const occupied = new Set<string>();
  for (const p of puzzle.pieces) {
    if (p.id === piece.id) continue;
    const pl = placements[p.id];
    if (!pl) continue;
    const pRot = rotateCoords(p.cells, pl.rotation);
    for (const cell of pRot) {
      occupied.add(`${pl.anchorR + cell.r},${pl.anchorC + cell.c}`);
    }
  }

  for (const cell of rotated) {
    const r = anchorR + cell.r;
    const c = anchorC + cell.c;
    if (r < 0 || r >= puzzle.rows || c < 0 || c >= puzzle.cols) return false;
    if (!puzzle.targetMask[r][c]) return false;
    if (occupied.has(`${r},${c}`)) return false;
  }
  return true;
}

export function isTangramSolved(
  puzzle: TangramPuzzle,
  placements: Record<number, PlacedPieceState | null>,
): boolean {
  const covered = new Set<string>();
  for (const piece of puzzle.pieces) {
    const pl = placements[piece.id];
    if (!pl) return false;
    if (!canPlaceTangramPiece(puzzle, piece, pl.anchorR, pl.anchorC, pl.rotation, placements)) {
      return false;
    }
    const rot = rotateCoords(piece.cells, pl.rotation);
    for (const cell of rot) {
      covered.add(`${pl.anchorR + cell.r},${pl.anchorC + cell.c}`);
    }
  }

  for (let r = 0; r < puzzle.rows; r++) {
    for (let c = 0; c < puzzle.cols; c++) {
      if (puzzle.targetMask[r][c] && !covered.has(`${r},${c}`)) {
        return false;
      }
    }
  }
  return true;
}
