import React from 'react';
import { ChevronRight, Settings, Sparkles, Trophy } from 'lucide-react';
import { TranslationBundle } from '../i18n/translations';
import { ALL_GAME_IDS, GAME_PALETTES, GameId, MAX_LEVEL, UserProgress } from '../types/game';
import {
  ALL_ACHIEVEMENTS,
  getUnlockedAchievements,
  sumAchievementPoints,
} from '../games/achievements';
import { BrandEmblem, GameIcon } from './GameIcons';

interface GameHubProps {
  t: TranslationBundle;
  progress: UserProgress;
  isSignedIn: boolean;
  onSelectGame: (gameId: GameId) => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
}

export const GameHub: React.FC<GameHubProps> = ({
  t,
  progress,
  isSignedIn,
  onSelectGame,
  onOpenAchievements,
  onOpenSettings,
}) => {
  const totalCleared = ALL_GAME_IDS.reduce(
    (sum, id) => sum + Math.max(0, Math.min(MAX_LEVEL, (progress.levels[id] ?? 1) - 1)),
    0,
  );
  const unlockedAchievements = getUnlockedAchievements(progress);
  const achievementPoints = sumAchievementPoints(unlockedAchievements);
  const achievementPercent = Math.round(
    (unlockedAchievements.length / ALL_ACHIEVEMENTS.length) * 100,
  );

  return (
    <div className="min-h-dvh flex flex-col bg-[#FAF8F5]">
      {/* Compact Sticky Top Bar (<= 15% mobile height) */}
      <header className="sticky top-0 z-30 h-14 sm:h-16 bg-[#FAF8F5]/95 border-b border-[#EAE3D6] px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandEmblem className="w-8 h-8 shrink-0" />
          <span className="font-display text-lg font-extrabold text-[#242938] whitespace-nowrap shrink-0">
            {t.brandName}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div
            title={t.totalScore}
            className="flex h-11 items-center gap-1.5 rounded-2xl border border-[#F2D58C] bg-[#FFF4CC] px-2.5 text-xs font-extrabold text-[#7A530B] sm:px-3 sm:text-sm"
          >
            <Trophy className="h-4 w-4 text-[#D98C00]" />
            <span className="font-mono tabular-nums">{progress.totalScore.toLocaleString()}</span>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label={t.settingsTitle}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-white border border-[#E6DFD3] text-[#242938] hover:bg-[#F4F0E8] active:scale-95 transition-transform"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Hub Grid */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5 sm:mb-7">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#242938]">
              {t.hubHeading}
            </h1>
            <p className="text-sm text-[#5C6478] mt-0.5">{t.hubSubheading}</p>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#5C6478]">
            <span>{isSignedIn ? `${progress.displayName} · ${t.cloudSynced}` : t.guestMode}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-bold text-[#242938]">
              {t.levelsCompleted}: {totalCleared}
            </span>
          </div>
        </div>

        {/* Achievements Banner */}
        <button
          type="button"
          onClick={onOpenAchievements}
          className="group mb-5 flex w-full items-center gap-3 rounded-3xl bg-gradient-to-r from-[#242938] via-[#2C344B] to-[#343D59] p-3.5 text-left shadow-sm transition-transform active:scale-[0.99] sm:mb-7 sm:p-4"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F2B830] text-[#3D2B00] shadow-lg shadow-[#F2B830]/20">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-sm font-extrabold text-white">{t.achievementsTitle}</p>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#F2B830]/15 px-2.5 py-1 font-mono text-xs font-extrabold tabular-nums text-[#FFE9A8]">
                <Sparkles className="h-3 w-3 text-[#F2B830]" />
                {achievementPoints.toLocaleString()}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#E5A42A] to-[#FFE9A8]"
                  style={{ width: `${Math.max(2, achievementPercent)}%` }}
                />
              </div>
              <span className="font-mono text-[10px] font-bold tabular-nums text-white/50">
                {unlockedAchievements.length}/{ALL_ACHIEVEMENTS.length}
              </span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* 9 Puzzle Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
          {ALL_GAME_IDS.map((gameId) => {
            const palette = GAME_PALETTES[gameId];
            const meta = t.games[gameId];
            const currentLevel = Math.min(MAX_LEVEL, progress.levels[gameId] ?? 1);
            const cleared = Math.max(0, (progress.levels[gameId] ?? 1) - 1);
            const pct = Math.min(100, Math.max(2, Math.round((cleared / MAX_LEVEL) * 100)));

            return (
              <button
                key={gameId}
                type="button"
                onClick={() => onSelectGame(gameId)}
                className={`group text-left rounded-3xl border p-4 sm:p-5 transition-transform duration-150 active:scale-[0.98] hover:-translate-y-0.5 shadow-sm flex flex-col justify-between min-h-[156px] sm:min-h-[178px] ${palette.cardBg} ${palette.cardBorder}`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${palette.iconBg}`}>
                    <GameIcon gameId={gameId} className="w-8 h-8" />
                  </div>
                  <h2 className="font-display text-base sm:text-lg font-extrabold text-[#242938] leading-snug mb-1">
                    {meta.title}
                  </h2>
                  <p className="text-xs text-[#5C6478] line-clamp-2 leading-relaxed">
                    {meta.shortDesc}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between text-xs font-bold mb-1.5">
                    <span className={palette.accentText}>
                      {t.levelLabel} <span className="font-mono tabular-nums">{currentLevel}</span>{' '}
                      <span className="text-[#5C6478] font-normal">{t.ofMax}</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${palette.progressFill}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
