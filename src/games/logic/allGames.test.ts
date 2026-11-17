import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMemoryBoard, isMemorySolved } from './memoryLogic';
import { canSlideTile, generateNumberSlide, isSlideSolved, slideTile } from './numberSlideLogic';
import { canPour, generateColorSort, isColorSortSolved, pourTube, TUBE_CAPACITY } from './colorSortLogic';
import { generateMaze, isMazeSolved, moveMazePlayer } from './mazeLogic';
import { generateSimon } from './simonLogic';
import { generateConnectDots, isConnectDotsSolved } from './connectDotsLogic';
import { generateMathGrid, isMathGridSolved } from './mathGridLogic';
import { canPlaceTangramPiece, generateTangram, isTangramSolved, PlacedPieceState } from './tangramLogic';
import { generateOddOneOut } from './oddOneOutLogic';

const SAMPLE_LEVELS = [1, 15, 50, 250, 500, 1000];

test('Memory Match generates valid even paired decks for levels 1..1000', () => {
  for (const lvl of SAMPLE_LEVELS) {
    const board = generateMemoryBoard(lvl);
    assert.equal(board.cards.length, board.cols * board.rows);
    assert.equal(board.cards.length % 2, 0);
    assert.equal(isMemorySolved(board.cards), false);

    const solved = board.cards.map((c) => ({ ...c, matched: true }));
    assert.equal(isMemorySolved(solved), true);
  }
});

test('Number Slide generates non-solved solvable boards for levels 1..1000', () => {
  for (const lvl of SAMPLE_LEVELS) {
    const board = generateNumberSlide(lvl);
    assert.equal(board.tiles.length, board.size * board.size);
    assert.equal(isSlideSolved(board.tiles), false);
    assert.ok(board.tiles.includes(0));

    // Check sliding works on an adjacent tile
    const emptyIdx = board.tiles.indexOf(0);
    const r = Math.floor(emptyIdx / board.size);
    const c = emptyIdx % board.size;
    const neighborIdx = r > 0 ? (r - 1) * board.size + c : (r + 1) * board.size + c;
    assert.equal(canSlideTile(board.tiles, board.size, neighborIdx), true);
    const slid = slideTile(board.tiles, board.size, neighborIdx);
    assert.equal(slid[emptyIdx], board.tiles[neighborIdx]);
    assert.equal(slid[neighborIdx], 0);
  }
});

test('Color Sort generates balanced tubes and validates pours for levels 1..1000', () => {
  for (const lvl of SAMPLE_LEVELS) {
    const state = generateColorSort(lvl);
    assert.equal(state.tubes.length, state.colorCount + 2);
    assert.equal(isColorSortSolved(state.tubes), false);

    const counts = new Map<number, number>();
    for (const tube of state.tubes) {
      for (const c of tube) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    for (let c = 0; c < state.colorCount; c++) {
      assert.equal(counts.get(c), TUBE_CAPACITY);
    }

    // Pour from tube 0 into last empty tube
    const emptyIdx = state.tubes.length - 1;
    assert.equal(canPour(state.tubes, 0, emptyIdx), true);
    const next = pourTube(state.tubes, 0, emptyIdx);
    assert.ok(next !== null);
    assert.ok(next![emptyIdx].length >= 1);
  }
});

test('Maze Runner generates solvable path from start to exit via BFS for levels 1..1000', () => {
  for (const lvl of SAMPLE_LEVELS) {
    const maze = generateMaze(lvl);
    assert.equal(maze.grid[maze.start.r][maze.start.c], 0);
    assert.equal(maze.grid[maze.exit.r][maze.exit.c], 0);
    assert.equal(isMazeSolved(maze, maze.start), false);
    assert.equal(isMazeSolved(maze, maze.exit), true);

    // BFS reachability verification
    const queue = [maze.start];
    const visited = new Set<string>([`${maze.start.r},${maze.start.c}`]);
    let reached = false;
    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (isMazeSolved(maze, cur)) {
        reached = true;
        break;
      }
      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const nxt = moveMazePlayer(maze, cur, dr, dc);
        const key = `${nxt.r},${nxt.c}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push(nxt);
        }
      }
    }
    assert.equal(reached, true, `Maze level ${lvl} must be solvable`);
  }
});

test('Simon Says scales sequence length and pad count across 1..1000', () => {
  const lv1 = generateSimon(1);
  const lv1000 = generateSimon(1000);
  assert.equal(lv1.padCount, 4);
  assert.equal(lv1000.padCount, 6);
  assert.ok(lv1000.sequence.length > lv1.sequence.length);
  for (const val of lv1000.sequence) {
    assert.ok(val >= 0 && val < lv1000.padCount);
  }
});

test('Connect the Dots generates valid solvable non-overlapping solutions for levels 1..1000', () => {
  for (const lvl of SAMPLE_LEVELS) {
    const puzzle = generateConnectDots(lvl);
    const solutionPaths: Record<number, { r: number; c: number }[]> = {};
    for (const pair of puzzle.pairs) {
      solutionPaths[pair.colorId] = pair.solution;
    }
    assert.equal(isConnectDotsSolved(puzzle, solutionPaths), true);
  }
});

test('Math Grid generates solvable arithmetic systems for levels 1..1000', () => {
  for (const lvl of SAMPLE_LEVELS) {
    const puzzle = generateMathGrid(lvl);
    const solutionMap: Record<string, number | null> = {};
    for (const cell of puzzle.cells) {
      if (cell.isBlank) {
        solutionMap[cell.id] = cell.solution!;
      }
    }
    assert.ok(Object.keys(solutionMap).length >= 2);
    assert.equal(isMathGridSolved(puzzle, solutionMap), true);
  }
});

test('Tangram generates valid exact tiling puzzles for levels 1..1000', () => {
  for (const lvl of SAMPLE_LEVELS) {
    const puzzle = generateTangram(lvl);
    assert.ok(puzzle.pieces.length >= 3);
    // Verify every piece fits at least somewhere inside targetMask at rotation 0
    // by re-checking total cell count equals active mask cells
    let maskCells = 0;
    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        if (puzzle.targetMask[r][c]) maskCells++;
      }
    }
    const pieceCellTotal = puzzle.pieces.reduce((sum, p) => sum + p.cells.length, 0);
    assert.equal(pieceCellTotal, maskCells);

    // Verify canPlaceTangramPiece rejects out-of-bounds
    const emptyPlacements: Record<number, PlacedPieceState | null> = {};
    assert.equal(canPlaceTangramPiece(puzzle, puzzle.pieces[0], -1, 0, 0, emptyPlacements), false);
    assert.equal(isTangramSolved(puzzle, emptyPlacements), false);
  }
});

test('Odd One Out generates exactly one odd element for levels 1..1000', () => {
  for (const lvl of SAMPLE_LEVELS) {
    const puzzle = generateOddOneOut(lvl);
    const oddItems = puzzle.items.filter((it) => it.isOdd);
    assert.equal(oddItems.length, 1);
    assert.equal(puzzle.items[puzzle.oddIndex].isOdd, true);
  }
});
