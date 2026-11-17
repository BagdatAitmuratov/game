import React, { useEffect, useState } from 'react';
import { canSlideTile, generateNumberSlide, isSlideSolved, slideTile } from '../../games/logic/numberSlideLogic';
import { soundEngine } from '../../utils/audio';

interface NumberSlideGameProps {
  level: number;
  resetSignal: number;
  onMove: () => void;
  onWin: () => void;
}

export const NumberSlideGame: React.FC<NumberSlideGameProps> = ({
  level,
  resetSignal,
  onMove,
  onWin,
}) => {
  const [board, setBoard] = useState(() => generateNumberSlide(level));

  useEffect(() => {
    setBoard(generateNumberSlide(level));
  }, [level, resetSignal]);

  const handleTap = (idx: number) => {
    if (!canSlideTile(board.tiles, board.size, idx)) return;
    soundEngine.playMove();
    const nextTiles = slideTile(board.tiles, board.size, idx);
    setBoard({ ...board, tiles: nextTiles });
    onMove();
    if (isSlideSolved(nextTiles)) {
      setTimeout(() => onWin(), 220);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div
        className="grid gap-2 p-3 rounded-3xl bg-[#DCEAFF] border-2 border-[#C2DAFF] shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${board.size}, minmax(0, 1fr))`,
        }}
      >
        {board.tiles.map((num, idx) => {
          if (num === 0) {
            return (
              <div
                key={`empty-${idx}`}
                className="aspect-square min-h-[44px] rounded-2xl bg-[#EBF3FF]/70 border border-dashed border-[#B3CEFA]"
              />
            );
          }

          const isCorrectSlot = num === idx + 1;
          const movable = canSlideTile(board.tiles, board.size, idx);

          return (
            <button
              key={num}
              type="button"
              onClick={() => handleTap(idx)}
              aria-label={`Tile ${num}`}
              className={`aspect-square min-h-[44px] rounded-2xl font-display font-extrabold tabular-nums flex items-center justify-center shadow-sm transition-transform duration-150 active:scale-95 ${
                board.size >= 5 ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
              } ${
                isCorrectSlot
                  ? 'bg-[#2FB479] text-white border-b-4 border-[#239060]'
                  : movable
                  ? 'bg-white text-[#242938] border-b-4 border-[#CBD8EC] hover:bg-[#F7FAFF]'
                  : 'bg-[#F5F9FF] text-[#353C52] border-b-4 border-[#DCE6F5]'
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
};
