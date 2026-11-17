import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, Home, Trophy } from 'lucide-react';
import { TranslationBundle } from '../i18n/translations';
import { MAX_LEVEL } from '../types/game';

interface VictoryModalProps {
  open: boolean;
  t: TranslationBundle;
  level: number;
  scoreEarned: number;
  moves: number;
  elapsedSec: number;
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
