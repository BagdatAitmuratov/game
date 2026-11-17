import React, { useEffect, useRef, useState } from 'react';
import {
  DotPoint,
  generateConnectDots,
  isAdjacentPoint,
  isConnectDotsSolved,
} from '../../games/logic/connectDotsLogic';
import { soundEngine } from '../../utils/audio';

interface ConnectDotsGameProps {
  level: number;
  resetSignal: number;
  onMove: () => void;
  onWin: () => void;
}

export const ConnectDotsGame: React.FC<ConnectDotsGameProps> = ({
  level,
  resetSignal,
  onMove,
  onWin,
}) => {
  const [puzzle, setPuzzle] = useState(() => generateConnectDots(level));
  const [paths, setPaths] = useState<Record<number, DotPoint[]>>({});
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPuzzle(generateConnectDots(level));
    setPaths({});
    setActiveColor(null);
    setDragging(false);
  }, [level, resetSignal]);

  const findEndpointAt = (r: number, c: number) =>
    puzzle.pairs.find(
      (p) => (p.start.r === r && p.start.c === c) || (p.end.r === r && p.end.c === c),
    );

  const findPathOwnerAt = (r: number, c: number, currentPaths: Record<number, DotPoint[]>) => {
    for (const [cidStr, pts] of Object.entries(currentPaths)) {
      if (pts.some((pt) => pt.r === r && pt.c === c)) {
        return Number(cidStr);
      }
    }
    return null;
  };

  const extendToCell = (r: number, c: number, colorId: number) => {
    setPaths((prev) => {
      const curr = prev[colorId] ?? [];
      if (curr.length === 0) return prev;
      const last = curr[curr.length - 1];
      if (last.r === r && last.c === c) return prev;

      // Backtrack if stepping onto previous cell in same path
      const existingIdx = curr.findIndex((pt) => pt.r === r && pt.c === c);
      if (existingIdx !== -1) {
        const trimmed = curr.slice(0, existingIdx + 1);
        soundEngine.playMove();
        return { ...prev, [colorId]: trimmed };
      }

      if (!isAdjacentPoint(last, { r, c })) return prev;

      // Do not cross another color's endpoint
      const endpointHere = findEndpointAt(r, c);
      if (endpointHere && endpointHere.colorId !== colorId) return prev;

      // Stop extending if current path already reached both endpoints
      const pair = puzzle.pairs[colorId];
      const hasStart = curr.some((pt) => pt.r === pair.start.r && pt.c === pair.start.c);
      const hasEnd = curr.some((pt) => pt.r === pair.end.r && pt.c === pair.end.c);
      if (hasStart && hasEnd) return prev;

      // Clear any conflicting other color path if we overwrite a non-endpoint cell
      const nextPaths = { ...prev };
      const owner = findPathOwnerAt(r, c, nextPaths);
      if (owner !== null && owner !== colorId) {
        const ownerPts = nextPaths[owner] ?? [];
        const cutIdx = ownerPts.findIndex((pt) => pt.r === r && pt.c === c);
        if (cutIdx >= 0) {
          nextPaths[owner] = ownerPts.slice(0, cutIdx);
        }
      }

      const updated = [...curr, { r, c }];
      nextPaths[colorId] = updated;
      soundEngine.playMove();
      onMove();

      if (isConnectDotsSolved(puzzle, nextPaths)) {
        setTimeout(() => onWin(), 220);
      }
      return nextPaths;
    });
  };

  const handleCellDown = (r: number, c: number) => {
    const endpoint = findEndpointAt(r, c);
    if (endpoint) {
      soundEngine.playTap();
      setActiveColor(endpoint.colorId);
      setDragging(true);
      setPaths((prev) => ({ ...prev, [endpoint.colorId]: [{ r, c }] }));
      return;
    }

    const owner = findPathOwnerAt(r, c, paths);
    if (owner !== null) {
      soundEngine.playTap();
      const pts = paths[owner] ?? [];
      const idx = pts.findIndex((pt) => pt.r === r && pt.c === c);
      setActiveColor(owner);
      setDragging(true);
      setPaths((prev) => ({ ...prev, [owner]: pts.slice(0, idx + 1) }));
      return;
    }

    if (activeColor !== null) {
      extendToCell(r, c, activeColor);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || activeColor === null || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return;
    const c = Math.floor((x / rect.width) * puzzle.size);
    const r = Math.floor((y / rect.height) * puzzle.size);
    if (r >= 0 && r < puzzle.size && c >= 0 && c < puzzle.size) {
      extendToCell(r, c, activeColor);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      <div
        ref={gridRef}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
        className="relative w-full aspect-square bg-[#E8F6FA] border-2 border-[#BCE5F0] rounded-3xl p-2 touch-none select-none shadow-inner"
      >
        {/* SVG Connecting Pipes Layer */}
        <svg
          viewBox={`0 0 ${puzzle.size * 100} ${puzzle.size * 100}`}
          className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] pointer-events-none"
        >
          {puzzle.pairs.map((pair) => {
            const pts = paths[pair.colorId] ?? [];
            if (pts.length < 2) return null;
            const d = pts
              .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.c * 100 + 50} ${pt.r * 100 + 50}`)
              .join(' ');
            return (
              <path
                key={pair.colorId}
                d={d}
                fill="none"
                stroke={pair.color}
                strokeWidth="28"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.72"
              />
            );
          })}
        </svg>

        {/* Interactive Grid Cells */}
        <div
          className="relative z-10 w-full h-full grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: puzzle.size * puzzle.size }, (_, idx) => {
            const r = Math.floor(idx / puzzle.size);
            const c = idx % puzzle.size;
            const endpoint = findEndpointAt(r, c);
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onPointerDown={() => handleCellDown(r, c)}
                aria-label={`Dot cell ${r + 1},${c + 1}`}
                className="w-full h-full rounded-xl bg-white/75 border border-[#D4EDF4] flex items-center justify-center focus:outline-none"
              >
                {endpoint && (
                  <span
                    className="w-[62%] h-[62%] rounded-full shadow-sm ring-2 ring-white flex items-center justify-center text-white font-mono font-bold text-xs sm:text-sm"
                    style={{ backgroundColor: endpoint.color }}
                  >
                    {endpoint.colorId + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
