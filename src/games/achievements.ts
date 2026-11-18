import type { TranslationBundle } from '../i18n/translations';
import { ALL_GAME_IDS, GameId, MAX_LEVEL, UserProgress } from '../types/game';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface Achievement {
  id: string;
  scope: 'game' | 'global';
  gameId?: GameId;
  target: number;
  points: number;
  tier: AchievementTier;
}

export interface CompletionReward {
  achievements: Achievement[];
  bonusPoints: number;
}

/** Milestones every game celebrates: 10, then every 100 up to 900. */
export const GAME_MILESTONES = [10, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

/** Overall milestones across all nine games (max 9,000 cleared levels). */
export const GLOBAL_MILESTONES = [100, 500, 1000, 1500, 2000, 3000, 5000, 9000] as const;

const gameTier = (target: number): AchievementTier =>
  target <= 100 ? 'bronze' : target <= 400 ? 'silver' : target <= 700 ? 'gold' : 'diamond';

const globalTier = (target: number): AchievementTier =>
  target < 500 ? 'bronze' : target < 1500 ? 'silver' : target < 5000 ? 'gold' : 'diamond';

const milestonePoints = (target: number): number => (target === 10 ? 50 : target);

export const GAME_ACHIEVEMENTS: Achievement[] = ALL_GAME_IDS.flatMap((gameId) =>
  GAME_MILESTONES.map((target) => ({
    id: `game:${gameId}:${target}`,
    scope: 'game' as const,
    gameId,
    target,
    points: milestonePoints(target),
    tier: gameTier(target),
  })),
);

export const GLOBAL_ACHIEVEMENTS: Achievement[] = GLOBAL_MILESTONES.map((target) => ({
  id: `total:${target}`,
  scope: 'global' as const,
  target,
  points: milestonePoints(target),
  tier: globalTier(target),
}));

export const ALL_ACHIEVEMENTS: Achievement[] = [...GAME_ACHIEVEMENTS, ...GLOBAL_ACHIEVEMENTS];

export function getTotalCleared(progress: UserProgress): number {
  return ALL_GAME_IDS.reduce(
    (sum, id) => sum + Math.max(0, Math.min(MAX_LEVEL, (progress.levels[id] ?? 1) - 1)),
    0,
  );
}

export function getAchievementProgress(achievement: Achievement, progress: UserProgress) {
  const current =
    achievement.scope === 'game' && achievement.gameId
      ? Math.max(0, Math.min(MAX_LEVEL, (progress.levels[achievement.gameId] ?? 1) - 1))
      : getTotalCleared(progress);
  return {
    current,
    target: achievement.target,
    percent: Math.min(100, Math.round((current / achievement.target) * 100)),
    unlocked: current >= achievement.target,
  };
}

function getUnlockedIds(progress: UserProgress): Set<string> {
  return new Set(
    ALL_ACHIEVEMENTS.filter((achievement) => getAchievementProgress(achievement, progress).unlocked).map(
      (achievement) => achievement.id,
    ),
  );
}

export function getUnlockedAchievements(progress: UserProgress): Achievement[] {
  return ALL_ACHIEVEMENTS.filter((achievement) => getAchievementProgress(achievement, progress).unlocked);
}

export function getNewlyUnlockedAchievements(
  previous: UserProgress,
  next: UserProgress,
): Achievement[] {
  const before = getUnlockedIds(previous);
  return ALL_ACHIEVEMENTS.filter(
    (achievement) =>
      !before.has(achievement.id) && getAchievementProgress(achievement, next).unlocked,
  );
}

export function sumAchievementPoints(achievements: Achievement[]): number {
  return achievements.reduce((sum, achievement) => sum + achievement.points, 0);
}

export function achievementName(achievement: Achievement, t: TranslationBundle): string {
  if (achievement.scope === 'global') {
    return t.totalLevelsMilestone.replace('{n}', achievement.target.toLocaleString());
  }
  return t.levelMilestone.replace('{n}', achievement.target.toLocaleString());
}

export function achievementGroupName(achievement: Achievement, t: TranslationBundle): string {
  return achievement.scope === 'game' && achievement.gameId
    ? t.games[achievement.gameId].title
    : t.globalAchievements;
}

export const TIER_STYLES: Record<
  AchievementTier,
  { card: string; icon: string; chip: string; text: string; bar: string }
> = {
  bronze: {
    card: 'bg-gradient-to-br from-[#FFF9F2] to-[#FCEBD9] border-[#F0CDA8]',
    icon: 'bg-[#F7DEC6] text-[#A65B1F]',
    chip: 'bg-[#F7DEC6] text-[#8A4A14]',
    text: 'text-[#A65B1F]',
    bar: 'bg-[#D98C4A]',
  },
  silver: {
    card: 'bg-gradient-to-br from-[#FBFCFE] to-[#EDF1F7] border-[#D3DCE8]',
    icon: 'bg-[#E3E9F2] text-[#5B718E]',
    chip: 'bg-[#E3E9F2] text-[#4C617C]',
    text: 'text-[#5B718E]',
    bar: 'bg-[#8397B0]',
  },
  gold: {
    card: 'bg-gradient-to-br from-[#FFFDF4] to-[#FFF2C9] border-[#F0D48A]',
    icon: 'bg-[#FFE9A8] text-[#9A6810]',
    chip: 'bg-[#FFE9A8] text-[#8A5B08]',
    text: 'text-[#9A6810]',
    bar: 'bg-[#E5A42A]',
  },
  diamond: {
    card: 'bg-gradient-to-br from-[#F5FBFF] to-[#E3F4FB] border-[#BFE4F0]',
    icon: 'bg-[#D6F3FA] text-[#1B7E95]',
    chip: 'bg-[#D6F3FA] text-[#136A7E]',
    text: 'text-[#1B7E95]',
    bar: 'bg-[#2CA4BF]',
  },
};
