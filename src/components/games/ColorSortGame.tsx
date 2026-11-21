import React, { useEffect, useState } from 'react';
import { Undo2 } from 'lucide-react';
import {
  canPour,
  generateColorSort,
  isColorSortSolved,
  pourTube,
  SORT_COLORS,
  TUBE_CAPACITY,
} from '../../games/logic/colorSortLogic';
import { TranslationBundle } from '../../i18n/translations';
import { soundEngine } from '../../utils/audio';

interface ColorSortGameProps {
  level: number;
  resetSignal: number;
  t: TranslationBundle;
  onMove: () => void;
  onWin: () => void;
}

export const ColorSortGame: React.FC<ColorSortGameProps> = ({
  level,
  resetSignal,
  t,
  onMove,
  onWin,
}) => {
  const [tubes, setTubes] = useState<number[][]>(() => generateColorSort(level).tubes);
  const [history, setHistory] = useState<number[][][]>([]);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);

  useEffect(() => {
    setTubes(generateColorSort(level).tubes);
    setHistory([]);
    setSelectedTube(null);
  }, [level, resetSignal]);

  const handleTubeTap = (idx: number) => {
    if (selectedTube === null) {
      if (tubes[idx].length === 0) return;
      soundEngine.playTap();
      setSelectedTube(idx);
      return;
    }

    if (selectedTube === idx) {
      soundEngine.playTap();
      setSelectedTube(null);
      return;
    }

    if (canPour(tubes, selectedTube, idx)) {
      const next = pourTube(tubes, selectedTube, idx);
      if (next) {
        soundEngine.playCorrect();
        setHistory((prev) => [...prev.slice(-20), tubes]);
        setTubes(next);
        setSelectedTube(null);
        onMove();
        if (isColorSortSolved(next)) {
          setTimeout(() => onWin(), 280);
        }
        return;
      }
    }

    soundEngine.playWrong();
    setSelectedTube(tubes[idx].length > 0 ? idx : null);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    soundEngine.playMove();
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setTubes(prev);
    setSelectedTube(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-5 py-4">
        {tubes.map((tube, idx) => {
          const isSelected = selectedTube === idx;
          const isTargetValid = selectedTube !== null && selectedTube !== idx && canPour(tubes, selectedTube, idx);
          const isComplete =
            tube.length === TUBE_CAPACITY && tube.every((c) => c === tube[0]);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleTubeTap(idx)}
              aria-label={`Tube ${idx + 1} (${tube.length} layers)`}
              className={`relative w-16 sm:w-20 h-44 sm:h-52 rounded-b-[2rem] rounded-t-2xl border-2 bg-gradient-to-b from-white/70 to-white/30 backdrop-blur-sm overflow-hidden transition-transform duration-200 ${
                isSelected
                  ? '-translate-y-4 border-[#4E89E8] ring-4 ring-[#4E89E8]/25 shadow-lg'
                  : isTargetValid
                  ? 'border-[#2FB479] ring-2 ring-[#2FB479]/30'
                  : isComplete
                  ? 'border-[#2FB479]'
                  : 'border-white/60'
              }`}
            >
              {/* Glass shine */}
              <div className="pointer-events-none absolute inset-y-0 left-1.5 w-2 rounded-full bg-white/40" />
              <div className="pointer-events-none absolute inset-y-0 right-2 w-1 rounded-full bg-white/20" />

              {/* Liquid column */}
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-300 ease-out"
                style={{ height: `${tube.length * 2.75}rem` }}
              >
                {tube.map((colorIdx, layerIdx) => (
                  <div
                    key={layerIdx}
                    className="w-full transition-all duration-300 ease-out"
                    style={{
                      height: '2.75rem',
                      backgroundColor: SORT_COLORS[colorIdx % SORT_COLORS.length],
                      boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.35)',
                    }}
                  />
                ))}
              </div>

              {/* Tube rim */}
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-3 rounded-t-2xl bg-white/50 border-b border-white/60" />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleUndo}
        disabled={history.length === 0}
        className="mt-3 min-h-[44px] px-5 py-2 rounded-2xl bg-white border border-[#E6DFD3] text-[#242938] font-bold text-sm flex items-center gap-2 hover:bg-[#F4F0E8] disabled:opacity-40 transition-colors"
      >
        <Undo2 className="w-4 h-4" />
        <span>{t.undo}</span>
      </button>
    </div>
  );
};
