import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ChevronDown, Lightbulb, RotateCcw, Settings } from 'lucide-react';
import { TranslationBundle } from '../i18n/translations';
import { GameId, Language, MAX_LEVEL } from '../types/game';
import { Achievement, CompletionReward } from '../games/achievements';
import { soundEngine } from '../utils/audio';
import { MemoryGame } from './games/MemoryGame';
import { NumberSlideGame } from './games/NumberSlideGame';
import { ColorSortGame } from './games/ColorSortGame';
import { MazeGame } from './games/MazeGame';
import { SimonGame } from './games/SimonGame';
import { ConnectDotsGame } from './games/ConnectDotsGame';
import { MathGridGame } from './games/MathGridGame';
import { TangramGame } from './games/TangramGame';
import { OddOneOutGame } from './games/OddOneOutGame';
import { VictoryModal } from './VictoryModal';
import { AvatarSprite } from './AvatarSprite';

interface GameShellProps {
  gameId: GameId;
  avatarId?: string;
  activeLevel: number;
  maxUnlockedLevel: number;
  language: Language;
  t: TranslationBundle;
  onSelectLevel: (level: number) => void;
  onCompleteLevel: (level: number, scoreEarned: number) => CompletionReward;
  onBackToHub: () => void;
  onOpenSettings: () => void;
  onVictoryStateChange: (isVictory: boolean) => void;
}

export const GameShell: React.FC<GameShellProps> = ({
  gameId,
  avatarId,
  activeLevel,
  maxUnlockedLevel,
  language,
  t,
  onSelectLevel,
  onCompleteLevel,
  onBackToHub,
  onOpenSettings,
  onVictoryStateChange,
}) => {
  const [moves, setMoves] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [won, setWon] = useState(false);
  const [lastScoreEarned, setLastScoreEarned] = useState(0);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [achievementBonus, setAchievementBonus] = useState(0);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  const meta = t.games[gameId];

  useEffect(() => {
    setMoves(0);
    setElapsedSec(0);
    setWon(false);
    setNewAchievements([]);
    setAchievementBonus(0);
    setHintText(null);
    onVictoryStateChange(false);
  }, [gameId, activeLevel, resetSignal, onVictoryStateChange]);

  useEffect(() => {
    if (won) return;
    const timer = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [won, gameId, activeLevel, resetSignal]);

  const handleMove = useCallback(() => {
    setMoves((m) => m + 1);
  }, []);

  const handleWin = useCallback(() => {
    if (won) return;
    soundEngine.playLevelComplete();
    const earned = Math.max(25, 100 + Math.min(200, activeLevel * 2) - Math.min(60, moves));
    setLastScoreEarned(earned);
    setWon(true);
    onVictoryStateChange(true);
    const reward = onCompleteLevel(activeLevel, earned);
    setNewAchievements(reward.achievements);
    setAchievementBonus(reward.bonusPoints);
  }, [won, activeLevel, moves, onCompleteLevel, onVictoryStateChange]);

  const handleRestart = () => {
    soundEngine.playTap();
    setResetSignal((s) => s + 1);
  };

  const handleRequestHint = async () => {
    soundEngine.playTap();
    if (hintLoading) return;
    setHintLoading(true);
    setHintText(null);
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: meta.title,
          level: activeLevel,
          language,
          summary: `${meta.instruction} Moves so far: ${moves}, Time: ${elapsedSec}s.`,
        }),
      });
      if (!res.ok) throw new Error('Hint endpoint unavailable');
      const data = (await res.json()) as { hint?: string };
      setHintText(data.hint?.trim() || t.hintFallback);
    } catch {
      setHintText(t.hintFallback);
    } finally {
      setHintLoading(false);
    }
  };

  const renderGame = () => {
    const common = {
      level: activeLevel,
      resetSignal,
      onMove: handleMove,
      onWin: handleWin,
    };
    switch (gameId) {
      case 'memory':
        return <MemoryGame {...common} t={t} />;
      case 'numberSlide':
        return <NumberSlideGame {...common} />;
      case 'colorSort':
        return <ColorSortGame {...common} t={t} />;
      case 'maze':
        return <MazeGame {...common} />;
      case 'simon':
        return <SimonGame {...common} t={t} />;
      case 'connectDots':
        return <ConnectDotsGame {...common} />;
      case 'mathGrid':
        return <MathGridGame {...common} />;
      case 'tangram':
        return <TangramGame {...common} t={t} />;
      case 'oddOneOut':
        return <OddOneOutGame {...common} />;
    }
  };

  const unlockedCap = Math.min(MAX_LEVEL, Math.max(1, maxUnlockedLevel));

  return (
    <div className="min-h-dvh flex flex-col bg-[#FAF8F5]">
      {/* Compact Sticky Top HUD */}
      <header className="sticky top-0 z-30 h-14 sm:h-16 bg-[#FAF8F5]/95 border-b border-[#EAE3D6] px-3 sm:px-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playTap();
              onBackToHub();
            }}
            aria-label={t.back}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-white border border-[#E6DFD3] text-[#242938] hover:bg-[#F4F0E8] active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <AvatarSprite avatarId={avatarId || 'bunny'} size="sm" animated={false} />
          <div className="min-w-0">
            <h1 className="font-display text-sm sm:text-base font-extrabold text-[#242938] truncate">
              {meta.title}
            </h1>
            <button
              type="button"
              onClick={() => setShowLevelPicker((v) => !v)}
              className="flex items-center gap-1 text-xs font-bold text-[#4E89E8] hover:underline"
            >
              <span>
                {t.levelLabel} <span className="font-mono tabular-nums">{activeLevel}</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRequestHint}
            aria-label={t.hint}
            title={t.hint}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-[#FFF9EB] border border-[#F2D58C] text-[#B57B14] hover:bg-[#FDEEC6] active:scale-95"
          >
            <Lightbulb className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleRestart}
            aria-label={t.restart}
            title={t.restart}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-white border border-[#E6DFD3] text-[#242938] hover:bg-[#F4F0E8] active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label={t.settingsTitle}
            title={t.settingsTitle}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-white border border-[#E6DFD3] text-[#242938] hover:bg-[#F4F0E8] active:scale-95"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Optional Unlocked Level Picker Strip */}
      {showLevelPicker && (
        <div className="bg-white border-b border-[#EAE3D6] px-4 py-3">
          <div className="max-w-lg mx-auto">
            <p className="text-xs font-bold text-[#5C6478] mb-2">
              {t.selectLevel} (1 – {unlockedCap})
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {Array.from({ length: unlockedCap }, (_, i) => i + 1)
                .slice(-20)
                .map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      soundEngine.playTap();
                      onSelectLevel(lvl);
                      setShowLevelPicker(false);
                    }}
                    className={`min-h-[40px] min-w-[44px] px-3 rounded-xl font-mono text-xs font-bold tabular-nums shrink-0 ${
                      lvl === activeLevel
                        ? 'bg-[#4E89E8] text-white'
                        : 'bg-[#F4F0E8] text-[#242938] hover:bg-[#EAE3D6]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Playfield Area (>= 85% Viewport Unobstructed) */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md flex items-center justify-between text-xs sm:text-sm font-semibold text-[#5C6478] mb-3 px-1">
          <span>
            {t.movesLabel}: <strong className="font-mono text-[#242938] tabular-nums">{moves}</strong>
          </span>
          <span>
            {t.timeLabel}: <strong className="font-mono text-[#242938] tabular-nums">{elapsedSec}s</strong>
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#5C6478] text-center max-w-md mb-4">
          {meta.instruction}
        </p>

        {(hintLoading || hintText) && (
          <div className="w-full max-w-md mb-4 rounded-2xl bg-[#FFF9EB] border border-[#F2D58C] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#7A530B] text-center">
            {hintLoading ? t.hintLoading : hintText}
          </div>
        )}

        <div className="w-full flex items-center justify-center">{renderGame()}</div>
      </main>

      <VictoryModal
        open={won}
        t={t}
        level={activeLevel}
        scoreEarned={lastScoreEarned}
        moves={moves}
        elapsedSec={elapsedSec}
        newAchievements={newAchievements}
        achievementBonus={achievementBonus}
        onNextLevel={() => {
          soundEngine.playTap();
          onSelectLevel(Math.min(MAX_LEVEL, activeLevel + 1));
        }}
        onBackToHub={() => {
          soundEngine.playTap();
          onBackToHub();
        }}
      />
    </div>
  );
};
