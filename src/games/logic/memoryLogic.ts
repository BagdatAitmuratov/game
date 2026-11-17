import { clampLevel, mulberry32, seededShuffle } from '../../utils/prng';

export interface MemoryCardItem {
  id: number;
  symbolId: number;
  emoji: string;
  tint: string;
  flipped: boolean;
  matched: boolean;
}

export interface MemoryBoardConfig {
  cols: number;
  rows: number;
  cards: MemoryCardItem[];
}

const SYMBOLS: Array<{ emoji: string; tint: string }> = [
  { emoji: '🦊', tint: '#FFE2D6' },
  { emoji: '🐼', tint: '#E6F0FA' },
  { emoji: '🦋', tint: '#E9E2FF' },
  { emoji: '🌻', tint: '#FFF1C7' },
  { emoji: '🍉', tint: '#FFE0E8' },
  { emoji: '🐳', tint: '#D9F4FA' },
  { emoji: '🐸', tint: '#DFF7E2' },
  { emoji: '🚀', tint: '#E2E8FF' },
  { emoji: '🎈', tint: '#FFE1D9' },
  { emoji: '🐙', tint: '#F5E1FF' },
  { emoji: '🍎', tint: '#FFDCD8' },
  { emoji: '🐝', tint: '#FFF4C2' },
  { emoji: '🦄', tint: '#FDE2F3' },
  { emoji: '🐢', tint: '#DCF5E6' },
  { emoji: '⭐', tint: '#FFF2BD' },
  { emoji: '🍓', tint: '#FFDCE5' },
  { emoji: '🦉', tint: '#EFE4D8' },
  { emoji: '🌈', tint: '#E0F3FF' },
];

export function generateMemoryBoard(rawLevel: number): MemoryBoardConfig {
  const level = clampLevel(rawLevel);
  const rng = mulberry32(100000 + level * 7919);

  let cols = 2;
  let rows = 2;
  if (level <= 5) {
    cols = 2;
    rows = 2;
  } else if (level <= 20) {
    cols = 3;
    rows = 2;
  } else if (level <= 60) {
    cols = 4;
    rows = 3;
  } else if (level <= 180) {
    cols = 4;
    rows = 4;
  } else if (level <= 450) {
    cols = 4;
    rows = 5;
  } else {
    cols = 6;
    rows = 6;
  }

  const pairCount = (cols * rows) / 2;
  const chosen = seededShuffle(SYMBOLS, rng).slice(0, pairCount);
  const deck: MemoryCardItem[] = [];

  chosen.forEach((sym, idx) => {
    deck.push({ id: idx * 2, symbolId: idx, emoji: sym.emoji, tint: sym.tint, flipped: false, matched: false });
    deck.push({ id: idx * 2 + 1, symbolId: idx, emoji: sym.emoji, tint: sym.tint, flipped: false, matched: false });
  });

  return {
    cols,
    rows,
    cards: seededShuffle(deck, rng).map((c, index) => ({ ...c, id: index })),
  };
}

export function isMemorySolved(cards: readonly MemoryCardItem[]): boolean {
  return cards.length > 0 && cards.every((c) => c.matched);
}
