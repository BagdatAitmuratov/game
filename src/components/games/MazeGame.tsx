import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Star } from 'lucide-react';
import { generateMaze, isMazeSolved, MazePos, moveMazePlayer } from '../../games/logic/mazeLogic';
import { soundEngine } from '../../utils/audio';

interface MazeGameProps {
  level: number;
  resetSignal: number;
  onMove: () => void;
  onWin: () => void;
}

export const MazeGame: React.FC<MazeGameProps> = ({
  level,
  resetSignal,
  onMove,
  onWin,
}) => {
  const [maze, setMaze] = useState(() => generateMaze(level));
  const [pos, setPos] = useState<MazePos>(maze.start);
  const [won, setWon] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const fresh = generateMaze(level);
    setMaze(fresh);
    setPos(fresh.start);
    setWon(false);
  }, [level, resetSignal]);

  const step = useCallback(
    (dr: number, dc: number) => {
      if (won) return;
      setPos((curr) => {
        const next = moveMazePlayer(maze, curr, dr, dc);
        if (next.r === curr.r && next.c === curr.c) {
          soundEngine.playError();
          return curr;
        }
        soundEngine.playMove();
        onMove();
        if (isMazeSolved(maze, next)) {
          setWon(true);
          setTimeout(() => onWin(), 200);
        }
        return next;
      });
    },
    [maze, won, onMove, onWin],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        step(-1, 0);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        step(1, 0);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        step(0, -1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        step(0, 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
      <div
        onTouchStart={(e) => {
          const t = e.touches[0];
          touchStartRef.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          if (!touchStartRef.current) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - touchStartRef.current.x;
          const dy = t.clientY - touchStartRef.current.y;
          touchStartRef.current = null;
          if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
          if (Math.abs(dx) > Math.abs(dy)) {
            step(0, dx > 0 ? 1 : -1);
          } else {
            step(dy > 0 ? 1 : -1, 0);
          }
        }}
        className="w-full max-w-[340px] aspect-square p-2 rounded-3xl bg-[#FDEEC6] border-2 border-[#F2D58C] shadow-inner grid gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${maze.cols}, minmax(0, 1fr))`,
        }}
      >
        {maze.grid.flatMap((row, r) =>
          row.map((cell, c) => {
            const isPlayer = pos.r === r && pos.c === c;
            const isExit = maze.exit.r === r && maze.exit.c === c;
            return (
              <div
                key={`${r}-${c}`}
                className={`rounded-[4px] flex items-center justify-center ${
                  cell === 1 ? 'bg-[#C99124]' : 'bg-[#FFFDF7]'
                }`}
              >
                {isPlayer ? (
                  <div className="w-[78%] h-[78%] rounded-full bg-[#4E89E8] ring-2 ring-white shadow-sm" />
                ) : isExit ? (
                  <Star className="w-[75%] h-[75%] text-[#F2795F] fill-[#F2795F]" />
                ) : null}
              </div>
            );
          }),
        )}
      </div>

      {/* Touch D-Pad Controls */}
      <div className="grid grid-cols-3 gap-2 w-44" role="group" aria-label="Maze controls">
        <div />
        <button
          type="button"
          onClick={() => step(-1, 0)}
          aria-label="Up"
          className="min-h-[48px] min-w-[48px] rounded-2xl bg-white border border-[#E6DFD3] shadow-sm flex items-center justify-center active:scale-95 hover:bg-[#FFF9EB]"
        >
          <ArrowUp className="w-6 h-6 text-[#242938]" />
        </button>
        <div />
        <button
          type="button"
          onClick={() => step(0, -1)}
          aria-label="Left"
          className="min-h-[48px] min-w-[48px] rounded-2xl bg-white border border-[#E6DFD3] shadow-sm flex items-center justify-center active:scale-95 hover:bg-[#FFF9EB]"
        >
          <ArrowLeft className="w-6 h-6 text-[#242938]" />
        </button>
        <button
          type="button"
          onClick={() => step(1, 0)}
          aria-label="Down"
          className="min-h-[48px] min-w-[48px] rounded-2xl bg-white border border-[#E6DFD3] shadow-sm flex items-center justify-center active:scale-95 hover:bg-[#FFF9EB]"
        >
          <ArrowDown className="w-6 h-6 text-[#242938]" />
        </button>
        <button
          type="button"
          onClick={() => step(0, 1)}
          aria-label="Right"
          className="min-h-[48px] min-w-[48px] rounded-2xl bg-white border border-[#E6DFD3] shadow-sm flex items-center justify-center active:scale-95 hover:bg-[#FFF9EB]"
        >
          <ArrowRight className="w-6 h-6 text-[#242938]" />
        </button>
      </div>
    </div>
  );
};
