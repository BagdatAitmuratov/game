import React, { useEffect, useState } from 'react';
import { Award, Check, Lock, Medal, Sparkles, Trophy, X } from 'lucide-react';
import { TranslationBundle } from '../i18n/translations';
import { ALL_GAME_IDS, GAME_PALETTES, GameId, MAX_LEVEL, UserProgress } from '../types/game';
import {
  ALL_ACHIEVEMENTS,
  Achievement,
  GAME_ACHIEVEMENTS,
  GAME_MILESTONES,
  GLOBAL_ACHIEVEMENTS,
  TIER_STYLES,
  achievementGroupName,
  achievementName,
  getAchievementProgress,
  getTotalCleared,
  getUnlockedAchievements,
  sumAchievementPoints,
} from '../games/achievements';
import { GameIcon } from './GameIcons';

interface AchievementsModalProps {
  open: boolean;
  t: TranslationBundle;
  progress: UserProgress;
  onClose: () => void;
}

const AchievementCard: React.FC<{
  achievement: Achievement;
  progress: UserProgress;
  t: TranslationBundle;
}> = ({ achievement, progress, t }) => {
  const info = getAchievementProgress(achievement, progress);
  const style = TIER_STYLES[achievement.tier];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-3 transition-colors ${
        info.unlocked ? style.card : 'bg-white border-[#ECE5D9]'
      }`}
    >
      {info.unlocked && (
        <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-white/40" aria-hidden="true" />
      )}
      <div className="relative flex items-start gap-2.5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            info.unlocked ? style.icon : 'bg-[#F4F0E8] text-[#A6A0B2]'
          }`}
        >
          {info.unlocked ? <Medal className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`font-display text-[13px] font-extrabold leading-tight ${
              info.unlocked ? 'text-[#242938]' : 'text-[#5C6478]'
            }`}
          >
            {achievementName(achievement, t)}
          </p>
          <p className="mt-0.5 truncate text-[10px] font-semibold text-[#5C6478]">
            {achievementGroupName(achievement, t)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-extrabold tabular-nums ${
            info.unlocked ? style.chip : 'bg-[#F4F0E8] text-[#8A8696]'
          }`}
        >
          +{achievement.points}
        </span>
      </div>

      <div className="relative mt-2.5">
        <div className="mb-1 flex items-center justify-between text-[9px] font-bold">
          <span className={info.unlocked ? style.text : 'text-[#8A8696]'}>
            {info.unlocked ? (
              <span className="inline-flex items-center gap-1">
                <Check className="h-2.5 w-2.5" />
                {t.unlockedLabel}
              </span>
            ) : (
              `${info.current.toLocaleString()} / ${info.target.toLocaleString()}`
            )}
          </span>
          <span className="font-mono text-[#5C6478] tabular-nums">{info.percent}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#F4F0E8]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              info.unlocked ? style.bar : 'bg-[#C9C2D4]'
            }`}
            style={{ width: `${info.unlocked ? 100 : Math.max(2, info.percent)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  open,
  t,
  progress,
  onClose,
}) => {
  const [tab, setTab] = useState<'overall' | GameId>('overall');

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const unlocked = getUnlockedAchievements(progress);
  const totalPoints = sumAchievementPoints(unlocked);
  const totalCleared = getTotalCleared(progress);
  const unlockedPercent = Math.round((unlocked.length / ALL_ACHIEVEMENTS.length) * 100);
  const gameAchievements =
    tab === 'overall' ? [] : GAME_ACHIEVEMENTS.filter((achievement) => achievement.gameId === tab);
  const gameUnlockedCount = gameAchievements.filter(
    (achievement) => getAchievementProgress(achievement, progress).unlocked,
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#242938]/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievements-title"
    >
      <div className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-[#E6DFD3] bg-[#FAF8F5] shadow-2xl sm:max-w-2xl sm:rounded-3xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#EAE3D6] bg-[#FAF8F5] px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4CC] text-[#B57B14]">
              <Award className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="achievements-title" className="font-display text-lg font-extrabold text-[#242938]">
                {t.achievementsTitle}
              </h2>
              <p className="truncate text-[11px] font-semibold text-[#5C6478]">
                {t.achievementsUnlocked}: {unlocked.length} / {ALL_ACHIEVEMENTS.length}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-2xl border border-[#E6DFD3] bg-white text-[#5C6478] hover:text-[#242938]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* Points hero */}
          <div className="relative mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#242938] via-[#2C344B] to-[#1C2130] p-4 text-white sm:p-5">
            <div
              className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#F2B830]/20 blur-2xl"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-[#4E89E8]/20 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#F2B830]">
                  {t.achievementPoints}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-extrabold tabular-nums text-[#FFE9A8] sm:text-4xl">
                    {totalPoints.toLocaleString()}
                  </span>
                  <Sparkles className="h-4 w-4 text-[#F2B830]" />
                </div>
                <p className="mt-1 max-w-[250px] text-[11px] font-semibold leading-snug text-white/60">
                  {t.achievementsSubtitle}
                </p>
              </div>
              <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-center">
                <Trophy className="mx-auto h-5 w-5 text-[#F2B830]" />
                <p className="mt-1 font-mono text-lg font-extrabold tabular-nums">
                  {unlocked.length}
                  <span className="text-white/40">/{ALL_ACHIEVEMENTS.length}</span>
                </p>
                <p className="text-[9px] font-bold text-white/50">{t.achievementsUnlocked}</p>
              </div>
            </div>
            <div className="relative mt-4">
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-white/50">
                <span>
                  {t.levelsCompleted}:{' '}
                  <span className="font-mono text-white/80">{totalCleared.toLocaleString()}</span>
                </span>
                <span className="font-mono text-[#F2B830]">{unlockedPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#E5A42A] to-[#FFE9A8]"
                  style={{ width: `${Math.max(2, unlockedPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
            <button
              type="button"
              onClick={() => setTab('overall')}
              className={`flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-colors ${
                tab === 'overall'
                  ? 'border-[#242938] bg-[#242938] text-white'
                  : 'border-[#E6DFD3] bg-white text-[#5C6478] hover:text-[#242938]'
              }`}
            >
              <Trophy className="h-4 w-4 text-[#F2B830]" />
              <span>{t.overall}</span>
            </button>
            {ALL_GAME_IDS.map((gameId) => {
              const active = tab === gameId;
              const count = GAME_ACHIEVEMENTS.filter(
                (achievement) =>
                  achievement.gameId === gameId &&
                  getAchievementProgress(achievement, progress).unlocked,
              ).length;
              return (
                <button
                  key={gameId}
                  type="button"
                  onClick={() => setTab(gameId)}
                  className={`flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-colors ${
                    active
                      ? 'border-[#242938] bg-[#242938] text-white'
                      : 'border-[#E6DFD3] bg-white text-[#5C6478] hover:text-[#242938]'
                  }`}
                >
                  <GameIcon gameId={gameId} className="h-4 w-4" />
                  <span>{t.games[gameId].title}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 font-mono text-[9px] tabular-nums ${
                      active ? 'bg-white/15 text-[#FFE9A8]' : 'bg-[#F4F0E8] text-[#5C6478]'
                    }`}
                  >
                    {count}/{GAME_MILESTONES.length}
                  </span>
                </button>
              );
            })}
          </div>

          {tab === 'overall' ? (
            <section>
              <h3 className="mb-2.5 flex items-center gap-2 font-display text-sm font-extrabold text-[#242938]">
                <Trophy className="h-4 w-4 text-[#E5A42A]" />
                {t.globalAchievements}
              </h3>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {GLOBAL_ACHIEVEMENTS.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    progress={progress}
                    t={t}
                  />
                ))}
              </div>
            </section>
          ) : (
            <section>
              <div
                className={`mb-3 flex items-center gap-3 rounded-2xl border p-3 ${GAME_PALETTES[tab].cardBg} ${GAME_PALETTES[tab].cardBorder}`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${GAME_PALETTES[tab].iconBg}`}
                >
                  <GameIcon gameId={tab} className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-display text-sm font-extrabold text-[#242938]">
                      {t.games[tab].title}
                    </p>
                    <span
                      className={`shrink-0 font-mono text-xs font-extrabold tabular-nums ${GAME_PALETTES[tab].accentText}`}
                    >
                      {gameUnlockedCount}/{GAME_MILESTONES.length}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/80">
                    <div
                      className={`h-full rounded-full ${GAME_PALETTES[tab].progressFill}`}
                      style={{
                        width: `${Math.max(
                          2,
                          Math.min(
                            100,
                            Math.round(
                              (Math.max(0, Math.min(MAX_LEVEL, (progress.levels[tab] ?? 1) - 1)) /
                                MAX_LEVEL) *
                                100,
                            ),
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {gameAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    progress={progress}
                    t={t}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
