export type Language = 'kk' | 'ru' | 'en';

export type GameId =
  | 'memory'
  | 'numberSlide'
  | 'colorSort'
  | 'maze'
  | 'simon'
  | 'connectDots'
  | 'mathGrid'
  | 'tangram'
  | 'oddOneOut';

export const ALL_GAME_IDS: GameId[] = [
  'memory',
  'numberSlide',
  'colorSort',
  'maze',
  'simon',
  'connectDots',
  'mathGrid',
  'tangram',
  'oddOneOut',
];

export const MAX_LEVEL = 1000;

export type GameLevelsMap = Record<GameId, number>;
export type GameScoresMap = Record<GameId, number>;

export interface UserProgress {
  uid: string;
  displayName: string;
  language: Language;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  totalScore: number;
  levels: GameLevelsMap;
  scores: GameScoresMap;
}

export type AppScreen = 'title' | 'hub' | 'playing';

export interface GamePaletteMeta {
  id: GameId;
  cardBg: string;
  cardBorder: string;
  iconBg: string;
  accentText: string;
  progressFill: string;
}

export const GAME_PALETTES: Record<GameId, GamePaletteMeta> = {
  memory: {
    id: 'memory',
    cardBg: 'bg-[#FFF5F2]',
    cardBorder: 'border-[#FADCD3]',
    iconBg: 'bg-[#FFE4DC]',
    accentText: 'text-[#C8533B]',
    progressFill: 'bg-[#F2795F]',
  },
  numberSlide: {
    id: 'numberSlide',
    cardBg: 'bg-[#F2F7FF]',
    cardBorder: 'border-[#D5E4FF]',
    iconBg: 'bg-[#DCEAFF]',
    accentText: 'text-[#3168C4]',
    progressFill: 'bg-[#4E89E8]',
  },
  colorSort: {
    id: 'colorSort',
    cardBg: 'bg-[#F2FBF6]',
    cardBorder: 'border-[#CCEEDD]',
    iconBg: 'bg-[#D7F5E5]',
    accentText: 'text-[#1F8A5B]',
    progressFill: 'bg-[#2FB479]',
  },
  maze: {
    id: 'maze',
    cardBg: 'bg-[#FFF9EB]',
    cardBorder: 'border-[#F7E4B2]',
    iconBg: 'bg-[#FDEEC6]',
    accentText: 'text-[#B57B14]',
    progressFill: 'bg-[#E5A42A]',
  },
  simon: {
    id: 'simon',
    cardBg: 'bg-[#F8F3FF]',
    cardBorder: 'border-[#E2D4FA]',
    iconBg: 'bg-[#EADFFE]',
    accentText: 'text-[#7344B8]',
    progressFill: 'bg-[#8F5EE0]',
  },
  connectDots: {
    id: 'connectDots',
    cardBg: 'bg-[#F0FAFC]',
    cardBorder: 'border-[#C9ECF4]',
    iconBg: 'bg-[#D6F3FA]',
    accentText: 'text-[#1B7E95]',
    progressFill: 'bg-[#2CA4BF]',
  },
  mathGrid: {
    id: 'mathGrid',
    cardBg: 'bg-[#FFF3F8]',
    cardBorder: 'border-[#F7D1E1]',
    iconBg: 'bg-[#FCE0EC]',
    accentText: 'text-[#BA3B6E]',
    progressFill: 'bg-[#DE5B8F]',
  },
  tangram: {
    id: 'tangram',
    cardBg: 'bg-[#F4F9F0]',
    cardBorder: 'border-[#D6E8C8]',
    iconBg: 'bg-[#E1F1D5]',
    accentText: 'text-[#4E8527]',
    progressFill: 'bg-[#69A83B]',
  },
  oddOneOut: {
    id: 'oddOneOut',
    cardBg: 'bg-[#FFF6EE]',
    cardBorder: 'border-[#F7DEC6]',
    iconBg: 'bg-[#FDE9D4]',
    accentText: 'text-[#C2651C]',
    progressFill: 'bg-[#E88435]',
  },
};

export function createDefaultLevels(): GameLevelsMap {
  return {
    memory: 1,
    numberSlide: 1,
    colorSort: 1,
    maze: 1,
    simon: 1,
    connectDots: 1,
    mathGrid: 1,
    tangram: 1,
    oddOneOut: 1,
  };
}

export function createDefaultScores(): GameScoresMap {
  return {
    memory: 0,
    numberSlide: 0,
    colorSort: 0,
    maze: 0,
    simon: 0,
    connectDots: 0,
    mathGrid: 0,
    tangram: 0,
    oddOneOut: 0,
  };
}

export function createDefaultProgress(uid = 'guest', displayName = 'Guest'): UserProgress {
  return {
    uid,
    displayName,
    language: 'kk',
    musicEnabled: true,
    sfxEnabled: true,
    totalScore: 0,
    levels: createDefaultLevels(),
    scores: createDefaultScores(),
  };
}
