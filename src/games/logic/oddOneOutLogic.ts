import { clampLevel, mulberry32 } from '../../utils/prng';

export type MotifShape = 'circle' | 'roundedSquare' | 'triangle' | 'diamond' | 'hexagon' | 'star';

export interface OddItemSpec {
  shape: MotifShape;
  color: string;
  rotation: number; // degrees
  hasInnerDot: boolean;
  eyeOffset: number; // -2, 0, 2
  isOdd: boolean;
}

export interface OddOneOutPuzzle {
  gridSize: number;
  oddIndex: number;
  items: OddItemSpec[];
}

const MOTIF_COLORS = ['#F2795F', '#4E89E8', '#2FB479', '#E5A42A', '#8F5EE0', '#2CA4BF', '#DE5B8F'];
const SHAPES: MotifShape[] = ['circle', 'roundedSquare', 'triangle', 'diamond', 'hexagon', 'star'];

export function generateOddOneOut(rawLevel: number): OddOneOutPuzzle {
  const level = clampLevel(rawLevel);
  const rng = mulberry32(900000 + level * 9311);

  let gridSize = 2;
  if (level <= 5) gridSize = 2;
  else if (level <= 25) gridSize = 3;
  else if (level <= 100) gridSize = 4;
  else if (level <= 400) gridSize = 5;
  else gridSize = 6;

  const total = gridSize * gridSize;
  const oddIndex = Math.floor(rng() * total);

  const baseShape = SHAPES[Math.floor(rng() * SHAPES.length)];
  const baseColorIdx = Math.floor(rng() * MOTIF_COLORS.length);
  const baseColor = MOTIF_COLORS[baseColorIdx];
  const baseRotation = level >= 30 && baseShape !== 'circle' ? Math.floor(rng() * 4) * 90 : 0;
  const baseInnerDot = rng() < 0.5;
  const baseEyeOffset = level >= 60 ? (rng() < 0.5 ? -2 : 2) : 0;

  const baseItem: OddItemSpec = {
    shape: baseShape,
    color: baseColor,
    rotation: baseRotation,
    hasInnerDot: baseInnerDot,
    eyeOffset: baseEyeOffset,
    isOdd: false,
  };

  // Pick difference mode scaled by level
  const oddItem: OddItemSpec = { ...baseItem, isOdd: true };

  if (level <= 20) {
    // Clear shape + color difference
    const altShape = SHAPES[(SHAPES.indexOf(baseShape) + 1 + Math.floor(rng() * (SHAPES.length - 1))) % SHAPES.length];
    const altColor = MOTIF_COLORS[(baseColorIdx + 1) % MOTIF_COLORS.length];
    oddItem.shape = altShape;
    oddItem.color = altColor;
  } else if (level <= 80) {
    // Shape difference or inner dot toggle
    if (rng() < 0.6) {
      oddItem.shape = SHAPES[(SHAPES.indexOf(baseShape) + 1) % SHAPES.length];
    } else {
      oddItem.hasInnerDot = !baseInnerDot;
    }
  } else if (level <= 300) {
    // Rotation or inner dot difference
    if (baseShape !== 'circle' && baseShape !== 'hexagon' && rng() < 0.5) {
      oddItem.rotation = (baseRotation + 180) % 360;
    } else {
      oddItem.hasInnerDot = !baseInnerDot;
    }
  } else {
    // Subtle eye direction or inner dot
    if (rng() < 0.5) {
      oddItem.eyeOffset = baseEyeOffset === 0 ? 3 : -baseEyeOffset;
    } else {
      oddItem.hasInnerDot = !baseInnerDot;
    }
  }

  const items: OddItemSpec[] = Array.from({ length: total }, (_, idx) =>
    idx === oddIndex ? { ...oddItem } : { ...baseItem },
  );

  return { gridSize, oddIndex, items };
}
