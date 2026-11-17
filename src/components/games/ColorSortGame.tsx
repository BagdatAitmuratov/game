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
        soundEngine.playMatch();
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

    soundEngine.playError();
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
      <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-4 py-4">
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
              className={`relative w-14 sm:w-16 h-40 sm:h-44 rounded-b-3xl rounded-t-xl border-2 bg-white/85 p-1.5 flex flex-col-reverse gap-1 transition-transform duration-150 ${
                isSelected
                  ? '-translate-y-3 border-[#4E89E8] ring-4 ring-[#4E89E8]/20'
                  : isTargetValid
                  ? 'border-[#2FB479] ring-2 ring-[#2FB479]/25'
                  : isComplete
                  ? 'border-[#2FB479]'
                  : 'border-[#C9D3E0]'
              }`}
            >
              {tube.map((colorIdx, layerIdx) => (
                <div
                  key={layerIdx}
                  className="w-full h-8 rounded-lg shadow-inner transition-all duration-150"
                  style={{ backgroundColor: SORT_COLORS[colorIdx % SORT_COLORS.length] }}
                />
              ))}
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
