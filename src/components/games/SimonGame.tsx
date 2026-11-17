import React, { useCallback, useEffect, useRef, useState } from 'react';
import { generateSimon, SIMON_PADS } from '../../games/logic/simonLogic';
import { TranslationBundle } from '../../i18n/translations';
import { soundEngine } from '../../utils/audio';

interface SimonGameProps {
  level: number;
  resetSignal: number;
  t: TranslationBundle;
  onMove: () => void;
  onWin: () => void;
}

export const SimonGame: React.FC<SimonGameProps> = ({
  level,
  resetSignal,
  t,
  onMove,
  onWin,
}) => {
  const [puzzle, setPuzzle] = useState(() => generateSimon(level));
  const [phase, setPhase] = useState<'watching' | 'input'>('watching');
  const [litPad, setLitPad] = useState<number | null>(null);
  const [inputIdx, setInputIdx] = useState(0);
  const [errorFlash, setErrorFlash] = useState(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const playSequence = useCallback((seq: number[], delayMs: number) => {
    clearTimers();
    setPhase('watching');
    setInputIdx(0);
    setLitPad(null);

    seq.forEach((padId, step) => {
      const startAt = 360 + step * delayMs;
      const tOn = window.setTimeout(() => {
        setLitPad(padId);
        soundEngine.playSimonTone(padId);
      }, startAt);
      const tOff = window.setTimeout(() => {
        setLitPad(null);
      }, startAt + Math.floor(delayMs * 0.65));
      timersRef.current.push(tOn, tOff);
    });

    const tDone = window.setTimeout(() => {
      setPhase('input');
    }, 360 + seq.length * delayMs);
    timersRef.current.push(tDone);
  }, []);

  useEffect(() => {
    const fresh = generateSimon(level);
    setPuzzle(fresh);
    setErrorFlash(false);
    playSequence(fresh.sequence, fresh.stepDelayMs);
    return () => clearTimers();
  }, [level, resetSignal, playSequence]);

  const handlePadTap = (padId: number) => {
    if (phase !== 'input') return;

    setLitPad(padId);
    soundEngine.playSimonTone(padId);
    window.setTimeout(() => setLitPad((prev) => (prev === padId ? null : prev)), 180);
    onMove();

    if (puzzle.sequence[inputIdx] === padId) {
      const nextIdx = inputIdx + 1;
      setInputIdx(nextIdx);
      if (nextIdx >= puzzle.sequence.length) {
        setPhase('watching');
        window.setTimeout(() => onWin(), 280);
      }
    } else {
      soundEngine.playError();
      setErrorFlash(true);
      window.setTimeout(() => {
        setErrorFlash(false);
        playSequence(puzzle.sequence, puzzle.stepDelayMs);
      }, 650);
    }
  };

  const pads = SIMON_PADS.slice(0, puzzle.padCount);

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      <div className="mb-4 text-center">
        <p className={`text-base font-extrabold ${phase === 'watching' ? 'text-[#7344B8]' : 'text-[#1F8A5B]'}`}>
          {phase === 'watching' ? t.watchTurn : t.yourTurn}
        </p>
        <p className="text-xs font-bold text-[#5C6478] mt-1 tabular-nums">
          {inputIdx} / {puzzle.sequence.length}
        </p>
      </div>

      <div
        className={`w-full grid gap-3 p-4 rounded-3xl bg-white border-2 transition-colors ${
          errorFlash ? 'border-[#F2795F] bg-[#FFF2EF]' : 'border-[#E2D4FA]'
        } ${puzzle.padCount === 6 ? 'grid-cols-3' : 'grid-cols-2'}`}
      >
        {pads.map((pad) => {
          const isLit = litPad === pad.id;
          return (
            <button
              key={pad.id}
              type="button"
              onClick={() => handlePadTap(pad.id)}
              disabled={phase !== 'input'}
              aria-label={`Pad ${pad.label}`}
              className="aspect-square min-h-[84px] rounded-3xl transition-transform duration-100 active:scale-95 shadow-sm flex items-center justify-center font-display font-extrabold text-white text-xl"
              style={{
                backgroundColor: isLit ? pad.active : pad.bg,
                transform: isLit ? 'scale(1.05)' : undefined,
                boxShadow: isLit ? `0 0 0 6px ${pad.bg}33` : undefined,
              }}
            >
              {pad.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
