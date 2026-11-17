import React, { useEffect, useState } from 'react';
import { RotateCw, Trash2 } from 'lucide-react';
import {
  canPlaceTangramPiece,
  generateTangram,
  isTangramSolved,
  PlacedPieceState,
  rotateCoords,
} from '../../games/logic/tangramLogic';
import { TranslationBundle } from '../../i18n/translations';
import { soundEngine } from '../../utils/audio';

interface TangramGameProps {
  level: number;
  resetSignal: number;
  t: TranslationBundle;
  onMove: () => void;
  onWin: () => void;
}

export const TangramGame: React.FC<TangramGameProps> = ({
  level,
  resetSignal,
  t,
  onMove,
  onWin,
}) => {
  const [puzzle, setPuzzle] = useState(() => generateTangram(level));
  const [placements, setPlacements] = useState<Record<number, PlacedPieceState | null>>({});
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(0);

  useEffect(() => {
    const fresh = generateTangram(level);
    setPuzzle(fresh);
    setPlacements({});
    const initRots: Record<number, number> = {};
    fresh.pieces.forEach((p) => {
      initRots[p.id] = p.initialRotation;
    });
    setRotations(initRots);
    setSelectedPieceId(fresh.pieces[0]?.id ?? null);
  }, [level, resetSignal]);

  // Build cell -> piece color map from placements
  const boardOwners = new Map<string, { pieceId: number; color: string }>();
  for (const piece of puzzle.pieces) {
    const pl = placements[piece.id];
    if (!pl) continue;
    const rot = rotateCoords(piece.cells, pl.rotation);
    for (const cell of rot) {
      boardOwners.set(`${pl.anchorR + cell.r},${pl.anchorC + cell.c}`, {
        pieceId: piece.id,
        color: piece.color,
      });
    }
  }

  const handleBoardCellTap = (r: number, c: number) => {
    const existingOwner = boardOwners.get(`${r},${c}`);

    // If tapping a placed piece and no unplaced piece is selected, or tapping same piece, pick it up
    if (existingOwner && (selectedPieceId === null || selectedPieceId === existingOwner.pieceId || placements[selectedPieceId])) {
      soundEngine.playTap();
      setPlacements((prev) => ({ ...prev, [existingOwner.pieceId]: null }));
      setSelectedPieceId(existingOwner.pieceId);
      return;
    }

    if (selectedPieceId === null) return;
    const piece = puzzle.pieces.find((p) => p.id === selectedPieceId);
    if (!piece) return;

    const rotIdx = rotations[piece.id] ?? 0;
    const rotated = rotateCoords(piece.cells, rotIdx);

    // Try placing anchored at (r,c) or shifted by piece's first cell so tapping top-left cell snaps intuitively
    const first = rotated[0];
    const candidates = [
      { ar: r - first.r, ac: c - first.c },
      { ar: r, ac: c },
    ];

    for (const cand of candidates) {
      if (canPlaceTangramPiece(puzzle, piece, cand.ar, cand.ac, rotIdx, placements)) {
        soundEngine.playMatch();
        const nextPlacements: Record<number, PlacedPieceState | null> = {
          ...placements,
          [piece.id]: {
            pieceId: piece.id,
            anchorR: cand.ar,
            anchorC: cand.ac,
            rotation: rotIdx,
          },
        };
        setPlacements(nextPlacements);
        onMove();

        // Auto-select next unplaced piece
        const nextUnplaced = puzzle.pieces.find((p) => p.id !== piece.id && !nextPlacements[p.id]);
        setSelectedPieceId(nextUnplaced ? nextUnplaced.id : null);

        if (isTangramSolved(puzzle, nextPlacements)) {
          setTimeout(() => onWin(), 240);
        }
        return;
      }
    }

    soundEngine.playError();
  };

  const handleRotateSelected = () => {
    if (selectedPieceId === null) return;
    soundEngine.playFlip();
    setRotations((prev) => ({
      ...prev,
      [selectedPieceId]: ((prev[selectedPieceId] ?? 0) + 1) % 4,
    }));
  };

  const handleClearSelected = () => {
    if (selectedPieceId === null) return;
    soundEngine.playTap();
    setPlacements((prev) => ({ ...prev, [selectedPieceId]: null }));
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
      {/* Silhouette Board */}
      <div
        className="w-full max-w-[300px] p-3 rounded-3xl bg-[#E1F1D5] border-2 border-[#C3DFAD] shadow-inner grid gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))`,
        }}
      >
        {puzzle.targetMask.flatMap((row, r) =>
          row.map((active, c) => {
            if (!active) {
              return <div key={`${r}-${c}`} className="aspect-square" />;
            }
            const owner = boardOwners.get(`${r},${c}`);
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => handleBoardCellTap(r, c)}
                aria-label={`Board cell ${r + 1},${c + 1}`}
                className="aspect-square min-h-[40px] rounded-xl transition-transform duration-100 active:scale-95 border-2"
                style={{
                  backgroundColor: owner ? owner.color : '#FFFFFF',
                  borderColor: owner ? '#FFFFFF' : '#B7D4A0',
                }}
              />
            );
          }),
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleRotateSelected}
          disabled={selectedPieceId === null}
          className="min-h-[44px] px-4 py-2 rounded-2xl bg-white border border-[#E6DFD3] text-[#242938] font-bold text-xs sm:text-sm flex items-center gap-2 hover:bg-[#F4F0E8] disabled:opacity-40"
        >
          <RotateCw className="w-4 h-4 text-[#4E89E8]" />
          <span>{t.rotatePiece}</span>
        </button>

        <button
          type="button"
          onClick={handleClearSelected}
          disabled={selectedPieceId === null || !placements[selectedPieceId]}
          className="min-h-[44px] px-4 py-2 rounded-2xl bg-white border border-[#E6DFD3] text-[#5C6478] font-bold text-xs sm:text-sm flex items-center gap-2 hover:bg-[#F4F0E8] disabled:opacity-40"
        >
          <Trash2 className="w-4 h-4" />
          <span>{t.clearPiece}</span>
        </button>
      </div>

      {/* Polyomino Piece Tray */}
      <div className="w-full flex flex-wrap items-center justify-center gap-2.5">
        {puzzle.pieces.map((piece) => {
          const isPlaced = Boolean(placements[piece.id]);
          const isSelected = selectedPieceId === piece.id;
          const rot = rotations[piece.id] ?? 0;
          const coords = rotateCoords(piece.cells, rot);
          const maxR = Math.max(...coords.map((p) => p.r)) + 1;
          const maxC = Math.max(...coords.map((p) => p.c)) + 1;

          return (
            <button
              key={piece.id}
              type="button"
              onClick={() => {
                soundEngine.playTap();
                if (isPlaced) {
                  setPlacements((prev) => ({ ...prev, [piece.id]: null }));
                }
                setSelectedPieceId(piece.id);
              }}
              aria-label={`Shape ${piece.id + 1}`}
              className={`min-h-[60px] min-w-[60px] p-2.5 rounded-2xl border-2 flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-white border-[#4E89E8] ring-4 ring-[#4E89E8]/20 scale-105'
                  : isPlaced
                  ? 'bg-[#F4F0E8] border-[#DFD8CB] opacity-45'
                  : 'bg-white border-[#E6DFD3] hover:border-[#C5D4EC]'
              }`}
            >
              <div
                className="grid gap-0.5"
                style={{
                  gridTemplateColumns: `repeat(${maxC}, 12px)`,
                  gridTemplateRows: `repeat(${maxR}, 12px)`,
                }}
              >
                {Array.from({ length: maxR * maxC }, (_, i) => {
                  const rr = Math.floor(i / maxC);
                  const cc = i % maxC;
                  const filled = coords.some((pt) => pt.r === rr && pt.c === cc);
                  return (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-[3px]"
                      style={{ backgroundColor: filled ? piece.color : 'transparent' }}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
