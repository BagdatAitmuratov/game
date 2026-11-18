import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, Home, Medal, Sparkles, Trophy } from 'lucide-react';
import { TranslationBundle } from '../i18n/translations';
import { MAX_LEVEL } from '../types/game';
import { Achievement, achievementName } from '../games/achievements';

interface VictoryModalProps {
  open: boolean;
  t: TranslationBundle;
  level: number;
  scoreEarned: number;
  moves: number;
  elapsedSec: number;
  newAchievements: Achievement[];
  achievementBonus: number;
  onNextLevel: () => void;
  onBackToHub: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  open,
  t,
  level,
  scoreEarned,
  moves,
  elapsedSec,
  newAchievements,
  achievementBonus,
  onNextLevel,
  onBackToHub,
}) => {
  useEffect(() => {
    if (!open) return;
    try {
      confetti({
        particleCount: 75,
        spread: 68,
        origin: { y: 0.6 },
        colors: ['#F2795F', '#4E89E8', '#2FB479', '#F2B830', '#8F5EE0'],
      });
    } catch {
      // Ignore confetti error in headless environments
    }
  }, [open]);

  if (!open) return null;

  const isFinal = level >= MAX_LEVEL;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242938]/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
    >
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#E6DFD3] shadow-2xl p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FFF4CC] text-[#D98C00] flex items-center justify-center">
          <Trophy className="w-9 h-9" />
        </div>

        <h2 id="victory-title" className="font-display text-2xl font-extrabold text-[#242938] mb-1">
          {isFinal ? t.allLevelsDone : t.victoryTitle}
        </h2>
        <p className="text-sm text-[#5C6478] mb-5">{t.victorySubtitle}</p>

        {newAchievements.length > 0 && (
          <div className="mb-5 rounded-2xl border border-[#F2D58C] bg-gradient-to-br from-[#FFF9EB] to-[#FFF4CC] p-3 text-left">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#9A6810]">
                <Sparkles className="h-3.5 w-3.5" />
                {t.newAchievements}
              </span>
              <span className="rounded-full bg-[#242938] px-2.5 py-1 font-mono text-[11px] font-extrabold text-[#FFE9A8] tabular-nums">
                +{achievementBonus}
              </span>
            </div>
            <div className="space-y-1.5">
              {newAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 rounded-xl bg-white/70 px-2.5 py-2"
                >
                  <Medal className="h-4 w-4 shrink-0 text-[#B57B14]" />
                  <span className="min-w-0 flex-1 truncate text-xs font-bold text-[#242938]">
                    {achievementName(achievement, t)}
                  </span>
                  <span className="font-mono text-[11px] font-extrabold text-[#B57B14] tabular-nums">
                    +{achievement.points}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-right text-[10px] font-bold text-[#9A6810]">
              {t.achievementBonus}: +{achievementBonus}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="rounded-2xl bg-[#F2FBF6] p-3">
            <div className="text-[11px] font-bold text-[#1F8A5B] mb-0.5">{t.scoreEarned}</div>
            <div className="font-mono text-lg font-bold text-[#242938] tabular-nums">+{scoreEarned}</div>
          </div>
          <div className="rounded-2xl bg-[#F2F7FF] p-3">
            <div className="text-[11px] font-bold text-[#3168C4] mb-0.5">{t.movesLabel}</div>
            <div className="font-mono text-lg font-bold text-[#242938] tabular-nums">{moves}</div>
          </div>
          <div className="rounded-2xl bg-[#FFF9EB] p-3">
            <div className="text-[11px] font-bold text-[#B57B14] mb-0.5">{t.timeLabel}</div>
            <div className="font-mono text-lg font-bold text-[#242938] tabular-nums">{elapsedSec}s</div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {!isFinal && (
            <button
              type="button"
              data-start="true"
              onClick={onNextLevel}
              className="min-h-[50px] w-full px-5 py-3 rounded-2xl bg-[#2FB479] hover:bg-[#269F69] active:scale-[0.98] text-white font-bold text-base flex items-center justify-center gap-2 transition-all"
            >
              <span>{t.nextLevel}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={onBackToHub}
            className="min-h-[48px] w-full px-5 py-3 rounded-2xl bg-[#F4F0E8] hover:bg-[#EAE3D6] text-[#242938] font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>{t.backToHub}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
