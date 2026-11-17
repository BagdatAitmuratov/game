import React, { useEffect, useState } from 'react';
import { generateMathGrid, isMathGridSolved } from '../../games/logic/mathGridLogic';
import { soundEngine } from '../../utils/audio';

interface MathGridGameProps {
  level: number;
  resetSignal: number;
  onMove: () => void;
  onWin: () => void;
}

export const MathGridGame: React.FC<MathGridGameProps> = ({
  level,
  resetSignal,
  onMove,
  onWin,
}) => {
  const [puzzle, setPuzzle] = useState(() => generateMathGrid(level));
  const [filled, setFilled] = useState<Record<string, number | null>>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [usedChoiceIndices, setUsedChoiceIndices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fresh = generateMathGrid(level);
    setPuzzle(fresh);
    setFilled({});
    setUsedChoiceIndices({});
    const firstBlank = fresh.cells.find((c) => c.isBlank)?.id ?? null;
    setSelectedCell(firstBlank);
  }, [level, resetSignal]);

  const handleBlankClick = (cellId: string) => {
    soundEngine.playTap();
    // If already filled, return choice to tray and select this cell
    if (filled[cellId] !== undefined && filled[cellId] !== null) {
      setFilled((prev) => ({ ...prev, [cellId]: null }));
      setUsedChoiceIndices((prev) => {
        const copy = { ...prev };
        delete copy[cellId];
        return copy;
      });
    }
    setSelectedCell(cellId);
  };

  const handleChoiceTap = (choiceVal: number, choiceIdx: number) => {
    if (!selectedCell) return;
    if (Object.values(usedChoiceIndices).includes(choiceIdx)) return;

    soundEngine.playMove();
    const nextFilled = { ...filled, [selectedCell]: choiceVal };
    const nextUsed = { ...usedChoiceIndices, [selectedCell]: choiceIdx };
    setFilled(nextFilled);
    setUsedChoiceIndices(nextUsed);
    onMove();

    // Advance focus to next empty blank
    const nextBlank = puzzle.cells.find(
      (c) => c.isBlank && c.id !== selectedCell && (nextFilled[c.id] === undefined || nextFilled[c.id] === null),
    );
    setSelectedCell(nextBlank?.id ?? null);

    if (isMathGridSolved(puzzle, nextFilled)) {
      setTimeout(() => onWin(), 240);
    }
  };

  const usedIndicesSet = new Set(Object.values(usedChoiceIndices));

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-5">
      {/* 5x5 Intersecting Equation Grid */}
      <div className="w-full grid grid-cols-5 gap-2 p-3 rounded-3xl bg-[#FCE0EC] border-2 border-[#F5C0D6] shadow-inner">
        {puzzle.cells.map((cell) => {
          if (cell.kind === 'empty') {
            return <div key={cell.id} className="aspect-square" />;
          }
          if (cell.kind === 'op' || cell.kind === 'eq') {
            return (
              <div
                key={cell.id}
                className="aspect-square flex items-center justify-center font-display text-xl sm:text-2xl font-extrabold text-[#BA3B6E]"
              >
                {cell.value}
              </div>
            );
          }
          if (!cell.isBlank) {
            return (
              <div
                key={cell.id}
                className="aspect-square rounded-2xl bg-white/90 border border-[#F5C0D6] flex items-center justify-center font-mono text-lg sm:text-xl font-bold text-[#242938] tabular-nums shadow-sm"
              >
                {cell.value}
              </div>
            );
          }

          const val = filled[cell.id];
          const isSelected = selectedCell === cell.id;

          return (
            <button
              key={cell.id}
              type="button"
              onClick={() => handleBlankClick(cell.id)}
              aria-label={`Blank ${cell.id}${val !== null && val !== undefined ? ` value ${val}` : ''}`}
              className={`aspect-square min-h-[44px] rounded-2xl font-mono text-lg sm:text-xl font-extrabold tabular-nums flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#DE5B8F] text-white ring-4 ring-[#DE5B8F]/30 scale-105'
                  : val !== null && val !== undefined
                  ? 'bg-[#2FB479] text-white border-b-4 border-[#228B5D]'
                  : 'bg-white text-[#DE5B8F] border-2 border-dashed border-[#DE5B8F]'
              }`}
            >
              {val !== null && val !== undefined ? val : '?'}
            </button>
          );
        })}
      </div>

      {/* Number Tile Choices Tray */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {puzzle.choices.map((val, idx) => {
          const isUsed = usedIndicesSet.has(idx);
          return (
            <button
              key={`${idx}-${val}`}
              type="button"
              disabled={isUsed || !selectedCell}
              onClick={() => handleChoiceTap(val, idx)}
              className={`min-h-[48px] min-w-[54px] px-4 rounded-2xl font-mono text-lg font-extrabold tabular-nums border-b-4 transition-all ${
                isUsed
                  ? 'bg-[#EFEAE1] text-[#A2A8B8] border-[#DFD8CB] opacity-50'
                  : 'bg-white text-[#242938] border-[#D8CEBE] hover:bg-[#FFF5F9] active:scale-95 shadow-sm'
              }`}
            >
              {val}
            </button>
          );
        })}
      </div>
    </div>
  );
};
