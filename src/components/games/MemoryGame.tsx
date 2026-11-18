import React, { useEffect, useState } from 'react';
import { generateMemoryBoard, isMemorySolved, MemoryCardItem } from '../../games/logic/memoryLogic';
import { TranslationBundle } from '../../i18n/translations';
import { soundEngine } from '../../utils/audio';

interface MemoryGameProps {
  level: number;
  resetSignal: number;
  t: TranslationBundle;
  onMove: () => void;
  onWin: () => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({
  level,
  resetSignal,
  t,
  onMove,
  onWin,
}) => {
  const [board, setBoard] = useState(() => generateMemoryBoard(level));
  const [selected, setSelected] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setBoard(generateMemoryBoard(level));
    setSelected([]);
    setLocked(false);
  }, [level, resetSignal]);

  const handleCardTap = (idx: number) => {
    if (locked) return;
    const card = board.cards[idx];
    if (!card || card.flipped || card.matched) return;

    soundEngine.playFlip();

    const updatedCards: MemoryCardItem[] = board.cards.map((c, i) =>
      i === idx ? { ...c, flipped: true } : c,
    );
    const nextSelected = [...selected, idx];
    setBoard({ ...board, cards: updatedCards });
    setSelected(nextSelected);

    if (nextSelected.length === 2) {
      onMove();
      const [firstIdx, secondIdx] = nextSelected;
      const first = updatedCards[firstIdx];
      const second = updatedCards[secondIdx];

      if (first.symbolId === second.symbolId) {
        soundEngine.playCorrect();
        const matchedCards = updatedCards.map((c, i) =>
          i === firstIdx || i === secondIdx ? { ...c, matched: true } : c,
        );
        setBoard({ ...board, cards: matchedCards });
        setSelected([]);
        if (isMemorySolved(matchedCards)) {
          setTimeout(() => onWin(), 280);
        }
      } else {
        setLocked(true);
        setTimeout(() => {
          soundEngine.playWrong();
          setBoard((prev) => ({
            ...prev,
            cards: prev.cards.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, flipped: false } : c,
            ),
          }));
          setSelected([]);
          setLocked(false);
        }, 650);
      }
    }
  };

  const matchedPairs = board.cards.filter((c) => c.matched).length / 2;
  const totalPairs = board.cards.length / 2;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      <p className="text-xs sm:text-sm font-semibold text-[#5C6478] mb-3 text-center">
        {t.pairsLabel}: <span className="font-mono font-bold text-[#242938] tabular-nums">{matchedPairs} / {totalPairs}</span>
      </p>

      <div
        className="w-full grid gap-1.5 sm:gap-2"
        style={{
          gridTemplateColumns: `repeat(${board.cols}, minmax(0, 1fr))`,
          width: '100%',
        }}
      >
        {board.cards.map((card, idx) => {
          const revealed = card.flipped || card.matched;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardTap(idx)}
              aria-label={`Card ${idx + 1}${revealed ? ` ${card.emoji}` : ''}`}
              className="perspective-800 aspect-square min-h-[48px] w-full focus:outline-none"
            >
              <div
                className={`relative w-full h-full preserve-3d transition-transform duration-200 ${
                  revealed ? 'rotate-y-180' : ''
                }`}
              >
                {/* Card Back */}
                <div className="absolute inset-0 backface-hidden rounded-2xl bg-[#FFE4DC] border-2 border-[#FADCD3] flex items-center justify-center shadow-sm hover:bg-[#FFD8CD]">
                  <span className="w-4 h-4 rounded-full bg-[#F2795F]/40" />
                </div>

                {/* Card Front */}
                <div
                  className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-2 flex items-center justify-center shadow-sm ${
                    card.matched ? 'border-[#2FB479] ring-2 ring-[#2FB479]/25' : 'border-white'
                  }`}
                  style={{ backgroundColor: card.tint }}
                >
                  <span className={board.cols >= 6 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}>
                    {card.emoji}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
