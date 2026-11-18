import React, { useEffect, useState } from 'react';
import { generateOddOneOut, OddItemSpec } from '../../games/logic/oddOneOutLogic';
import { soundEngine } from '../../utils/audio';

interface OddOneOutGameProps {
  level: number;
  resetSignal: number;
  onMove: () => void;
  onWin: () => void;
}

const MotifSvg: React.FC<{ item: OddItemSpec }> = ({ item }) => {
  const renderShape = () => {
    switch (item.shape) {
      case 'circle':
        return <circle cx="24" cy="24" r="18" fill={item.color} />;
      case 'roundedSquare':
        return <rect x="6" y="6" width="36" height="36" rx="10" fill={item.color} />;
      case 'triangle':
        return <polygon points="24,5 43,40 5,40" fill={item.color} />;
      case 'diamond':
        return <polygon points="24,4 44,24 24,44 4,24" fill={item.color} />;
      case 'hexagon':
        return <polygon points="24,4 41,14 41,34 24,44 7,34 7,14" fill={item.color} />;
      case 'star':
        return (
          <polygon
            points="24,4 29,16 43,17 32,26 35,40 24,33 13,40 16,26 5,17 19,16"
            fill={item.color}
          />
        );
    }
  };

  return (
    <svg
      viewBox="0 0 48 48"
      className="w-[74%] h-[74%]"
      style={{ transform: `rotate(${item.rotation}deg)` }}
      aria-hidden="true"
    >
      {renderShape()}
      {item.hasInnerDot ? (
        <circle cx="24" cy="26" r="4" fill="#FFFFFF" opacity="0.9" />
      ) : (
        <>
          <circle cx={19 + item.eyeOffset} cy="22" r="2.4" fill="#FFFFFF" />
          <circle cx={29 + item.eyeOffset} cy="22" r="2.4" fill="#FFFFFF" />
        </>
      )}
    </svg>
  );
};

export const OddOneOutGame: React.FC<OddOneOutGameProps> = ({
  level,
  resetSignal,
  onMove,
  onWin,
}) => {
  const [puzzle, setPuzzle] = useState(() => generateOddOneOut(level));
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);

  useEffect(() => {
    setPuzzle(generateOddOneOut(level));
    setWrongIdx(null);
  }, [level, resetSignal]);

  const handleTap = (idx: number) => {
    onMove();
    if (idx === puzzle.oddIndex) {
      soundEngine.playCorrect();
      onWin();
    } else {
      soundEngine.playWrong();
      setWrongIdx(idx);
      setTimeout(() => setWrongIdx(null), 350);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div
        className="w-full grid gap-2 sm:gap-2.5 p-3 rounded-3xl bg-[#FDE9D4] border-2 border-[#F5CEAA] shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${puzzle.gridSize}, minmax(0, 1fr))`,
        }}
      >
        {puzzle.items.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleTap(idx)}
            aria-label={`Item ${idx + 1}${item.isOdd ? ' odd' : ''}`}
            data-odd={item.isOdd ? 'true' : undefined}
            className={`aspect-square min-h-[44px] rounded-2xl bg-white border-2 flex items-center justify-center transition-transform duration-100 active:scale-95 shadow-sm ${
              wrongIdx === idx ? 'border-[#F2795F] bg-[#FFF0ED]' : 'border-white hover:border-[#F5CEAA]'
            }`}
          >
            <MotifSvg item={item} />
          </button>
        ))}
      </div>
    </div>
  );
};
