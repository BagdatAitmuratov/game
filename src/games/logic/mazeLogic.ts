import { clampLevel, mulberry32, seededShuffle } from '../../utils/prng';

export interface MazePos {
  r: number;
  c: number;
}

export interface MazePuzzle {
  rows: number;
  cols: number;
  grid: number[][]; // 1 = wall, 0 = path
  start: MazePos;
  exit: MazePos;
}

export function generateMaze(rawLevel: number): MazePuzzle {
  const level = clampLevel(rawLevel);
  const rng = mulberry32(400000 + level * 4219);

  // Odd dimensions from 5x5 up to 19x19
  const step = Math.min(7, Math.floor((level - 1) / 100));
  const dim = 5 + step * 2 + (level > 20 && step === 0 ? 2 : 0);
  const rows = Math.min(19, dim % 2 === 0 ? dim + 1 : dim);
  const cols = rows;

  const grid = Array.from({ length: rows }, () => Array<number>(cols).fill(1));
  const stack: MazePos[] = [{ r: 1, c: 1 }];
  grid[1][1] = 0;

  const dirs = [
    { dr: -2, dc: 0 },
    { dr: 2, dc: 0 },
    { dr: 0, dc: -2 },
    { dr: 0, dc: 2 },
  ];

  while (stack.length > 0) {
    const curr = stack[stack.length - 1];
    const shuffledDirs = seededShuffle(dirs, rng);
    let carved = false;

    for (const d of shuffledDirs) {
      const nr = curr.r + d.dr;
      const nc = curr.c + d.dc;
      if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && grid[nr][nc] === 1) {
        grid[curr.r + d.dr / 2][curr.c + d.dc / 2] = 0;
        grid[nr][nc] = 0;
        stack.push({ r: nr, c: nc });
        carved = true;
        break;
      }
    }

    if (!carved) {
      stack.pop();
    }
  }

  return {
    rows,
    cols,
    grid,
    start: { r: 1, c: 1 },
    exit: { r: rows - 2, c: cols - 2 },
  };
}

export function moveMazePlayer(maze: MazePuzzle, pos: MazePos, dr: number, dc: number): MazePos {
  const nr = pos.r + dr;
  const nc = pos.c + dc;
  if (nr < 0 || nr >= maze.rows || nc < 0 || nc >= maze.cols) return pos;
  if (maze.grid[nr][nc] === 1) return pos;
  return { r: nr, c: nc };
}

export function isMazeSolved(maze: MazePuzzle, pos: MazePos): boolean {
  return pos.r === maze.exit.r && pos.c === maze.exit.c;
}
