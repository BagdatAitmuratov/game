import { clampLevel, mulberry32, seededShuffle } from '../../utils/prng';

export type MathOp = '+' | '-' | '×' | '÷';

export interface MathCell {
  id: string;
  row: number;
  col: number;
  kind: 'number' | 'op' | 'eq' | 'empty';
  value: string; // display for fixed cells, or solution string for blankable number cells
  isBlank: boolean;
  solution?: number;
}

export interface MathEquationCheck {
  cells: [string, string, string, string, string]; // [a, op, b, '=', c] cell ids
}

export interface MathGridPuzzle {
  rows: number;
  cols: number;
  cells: MathCell[];
  equations: MathEquationCheck[];
  choices: number[];
}

export function generateMathGrid(rawLevel: number): MathGridPuzzle {
  const level = clampLevel(rawLevel);
  const rng = mulberry32(700000 + level * 8831);

  // Build 2x2 or 3x3 intersecting equation system (5x5 grid: num op num = res)
  // Row 0: a op1 b = c
  // Row 2: d op2 e = f
  // Col 0: a + d = g  (using + keeps row/col consistency guaranteed!)
  // Col 2: b + e = h
  // Col 4: c + f = i  and Row 4: g + h = i!
  // Let's also allow multiplication/division at higher levels using an L-shaped + full cross mix!

  const maxOperand = level <= 20 ? 9 : level <= 100 ? 18 : level <= 350 ? 30 : 50;
  const allowMul = level >= 25;

  const cells: MathCell[] = [];
  const cellMap = new Map<string, MathCell>();
  const addCell = (cell: MathCell) => {
    cells.push(cell);
    cellMap.set(cell.id, cell);
  };

  const rows = 5;
  const cols = 5;

  let a = 1 + Math.floor(rng() * maxOperand);
  let b = 1 + Math.floor(rng() * maxOperand);
  let d = 1 + Math.floor(rng() * maxOperand);
  let e = 1 + Math.floor(rng() * maxOperand);

  const opRow0: MathOp = allowMul && rng() < 0.35 ? '×' : rng() < 0.5 ? '+' : '-';
  const opRow2: MathOp = allowMul && rng() < 0.35 ? '×' : rng() < 0.5 ? '+' : '-';

  if (opRow0 === '×') {
    a = 2 + Math.floor(rng() * Math.min(12, Math.max(4, Math.floor(maxOperand / 3))));
    b = 2 + Math.floor(rng() * Math.min(12, Math.max(4, Math.floor(maxOperand / 3))));
  } else if (opRow0 === '-' && a <= b) {
    const sum = a + b;
    a = sum;
  }

  if (opRow2 === '×') {
    d = 2 + Math.floor(rng() * Math.min(12, Math.max(4, Math.floor(maxOperand / 3))));
    e = 2 + Math.floor(rng() * Math.min(12, Math.max(4, Math.floor(maxOperand / 3))));
  } else if (opRow2 === '-' && d <= e) {
    const sum = d + e;
    d = sum;
  }

  const c = opRow0 === '+' ? a + b : opRow0 === '-' ? a - b : a * b;
  const f = opRow2 === '+' ? d + e : opRow2 === '-' ? d - e : d * e;
  const g = a + d;
  const h = b + e;
  const i = c + f;

  // Notice: when opRow0 and opRow2 are both '+' or '-', row4 g + h = i holds!
  // If either is '×', row4 (a+d) + (b+e) != (a*b)+(d*e), so we omit row4 equation and keep Col 0, Col 2, Col 4 + Row 0, Row 2!
  const includeBottomRow = opRow0 !== '×' && opRow2 !== '×';

  const layout: Array<Array<{ kind: MathCell['kind']; value: string; num?: number }>> = [
    [
      { kind: 'number', value: String(a), num: a },
      { kind: 'op', value: opRow0 },
      { kind: 'number', value: String(b), num: b },
      { kind: 'eq', value: '=' },
      { kind: 'number', value: String(c), num: c },
    ],
    [
      { kind: 'op', value: '+' },
      { kind: 'empty', value: '' },
      { kind: 'op', value: '+' },
      { kind: 'empty', value: '' },
      { kind: 'op', value: '+' },
    ],
    [
      { kind: 'number', value: String(d), num: d },
      { kind: 'op', value: opRow2 },
      { kind: 'number', value: String(e), num: e },
      { kind: 'eq', value: '=' },
      { kind: 'number', value: String(f), num: f },
    ],
    [
      { kind: 'eq', value: '=' },
      { kind: 'empty', value: '' },
      { kind: 'eq', value: '=' },
      { kind: 'empty', value: '' },
      { kind: 'eq', value: '=' },
    ],
    [
      { kind: 'number', value: String(g), num: g },
      includeBottomRow ? { kind: 'op', value: opRow0 === '+' && opRow2 === '+' ? '+' : '' } : { kind: 'empty', value: '' },
      { kind: 'number', value: String(h), num: h },
      includeBottomRow && opRow0 === '+' && opRow2 === '+' ? { kind: 'eq', value: '=' } : { kind: 'empty', value: '' },
      { kind: 'number', value: String(i), num: i },
    ],
  ];

  // Clear bottom row ops unless both rows are '+' (where (a+d)+(b+e) === (a+b)+(d+e))
  const purePlusCross = opRow0 === '+' && opRow2 === '+';
  if (!purePlusCross) {
    layout[4][1] = { kind: 'empty', value: '' };
    layout[4][3] = { kind: 'empty', value: '' };
  }

  for (let r = 0; r < rows; r++) {
    for (let cIdx = 0; cIdx < cols; cIdx++) {
      const item = layout[r][cIdx];
      addCell({
        id: `r${r}c${cIdx}`,
        row: r,
        col: cIdx,
        kind: item.kind,
        value: item.value,
        isBlank: false,
        solution: item.num,
      });
    }
  }

  // Choose how many number slots to blank out based on level
  const numberCells = cells.filter((cell) => cell.kind === 'number');
  const blankCount = Math.min(6, 2 + Math.floor(level / 40));
  const toBlank = seededShuffle(numberCells, rng).slice(0, blankCount);
  const blankValues: number[] = [];

  for (const bCell of toBlank) {
    bCell.isBlank = true;
    blankValues.push(bCell.solution!);
  }

  // Add 2-4 distractor choices at higher levels
  const distractorCount = level <= 15 ? 1 : level <= 100 ? 2 : 3;
  const distractors: number[] = [];
  for (let k = 0; k < distractorCount; k++) {
    const base = blankValues[k % blankValues.length];
    const delta = (Math.floor(rng() * 5) + 1) * (rng() < 0.5 ? 1 : -1);
    const candidate = Math.max(0, base + delta);
    distractors.push(candidate);
  }

  const choices = seededShuffle([...blankValues, ...distractors], rng);

  const equations: MathEquationCheck[] = [
    { cells: ['r0c0', 'r0c1', 'r0c2', 'r0c3', 'r0c4'] },
    { cells: ['r2c0', 'r2c1', 'r2c2', 'r2c3', 'r2c4'] },
    { cells: ['r0c0', 'r1c0', 'r2c0', 'r3c0', 'r4c0'] },
    { cells: ['r0c2', 'r1c2', 'r2c2', 'r3c2', 'r4c2'] },
    { cells: ['r0c4', 'r1c4', 'r2c4', 'r3c4', 'r4c4'] },
  ];
  if (purePlusCross) {
    equations.push({ cells: ['r4c0', 'r4c1', 'r4c2', 'r4c3', 'r4c4'] });
  }

  return { rows, cols, cells, equations, choices };
}

function evalOp(a: number, op: string, b: number): number {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '×') return a * b;
  if (op === '÷') return b !== 0 ? a / b : NaN;
  return NaN;
}

export function isMathGridSolved(
  puzzle: MathGridPuzzle,
  filled: Record<string, number | null>,
): boolean {
  const byId = new Map(puzzle.cells.map((c) => [c.id, c]));

  // All blank cells must be filled
  for (const cell of puzzle.cells) {
    if (cell.isBlank && (filled[cell.id] === null || filled[cell.id] === undefined)) {
      return false;
    }
  }

  // Every equation must evaluate accurately
  for (const eq of puzzle.equations) {
    const [idA, idOp, idB, , idC] = eq.cells;
    const cA = byId.get(idA)!;
    const cOp = byId.get(idOp)!;
    const cB = byId.get(idB)!;
    const cC = byId.get(idC)!;

    const valA = cA.isBlank ? filled[idA]! : cA.solution!;
    const valB = cB.isBlank ? filled[idB]! : cB.solution!;
    const valC = cC.isBlank ? filled[idC]! : cC.solution!;

    if (evalOp(valA, cOp.value, valB) !== valC) {
      return false;
    }
  }
  return true;
}
