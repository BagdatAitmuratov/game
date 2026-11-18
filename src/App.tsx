import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TitleScreen } from './components/TitleScreen';
import { GameHub } from './components/GameHub';
import { GameShell } from './components/GameShell';
import { SettingsModal } from './components/SettingsModal';
import { AchievementsModal } from './components/AchievementsModal';
import {
  CompletionReward,
  getNewlyUnlockedAchievements,
  sumAchievementPoints,
} from './games/achievements';
import { TRANSLATIONS } from './i18n/translations';
import {
  auth,
  loadOrCreateUserProgress,
  saveUserProgressToFirestore,
  signInWithGoogle,
  signOutUser,
  testConnection,
} from './services/firebase';
import { ALL_GAME_IDS, AppScreen, GameId, Language, MAX_LEVEL, UserProgress } from './types/game';
import { soundEngine } from './utils/audio';
import { loadGuestProgress, saveGuestProgress } from './utils/storage';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(() => loadGuestProgress());
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [screen, setScreen] = useState<AppScreen>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        const g = params.get('game') as GameId | null;
        if (g && ALL_GAME_IDS.includes(g)) return 'playing';
        return 'hub';
      }
    }
    return 'title';
  });
  const [activeGame, setActiveGame] = useState<GameId>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const g = params.get('game') as GameId | null;
      if (g && ALL_GAME_IDS.includes(g)) return g;
    }
    return 'memory';
  });
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [isVictoryOverlay, setIsVictoryOverlay] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);

  const t = TRANSLATIONS[progress.language];

  // Test Firestore connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Sync body state attribute for accessibility & verification
  useEffect(() => {
    if (screen === 'playing' && isVictoryOverlay) {
      document.body.dataset.state = 'gameover';
    } else {
      document.body.dataset.state = screen;
    }
  }, [screen, isVictoryOverlay]);

  // Sync audio preferences & unlock Web Audio on first user interaction
  useEffect(() => {
    soundEngine.setPreferences(progress.musicEnabled, progress.sfxEnabled);
  }, [progress.musicEnabled, progress.sfxEnabled]);

  useEffect(() => {
    const unlockAudio = () => {
      soundEngine.unlock();
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsSignedIn(true);
        try {
          const guestSeed = loadGuestProgress();
          const cloudProgress = await loadOrCreateUserProgress(
            user.uid,
            user.displayName || user.email?.split('@')[0] || 'Player',
            guestSeed,
          );
          setProgress(cloudProgress);
          setAuthError(null);
        } catch (err) {
          console.error('Failed loading user progress:', err);
        }
      } else {
        setIsSignedIn(false);
        setProgress(loadGuestProgress());
      }
    });
    return () => unsub();
  }, []);

  const persistProgress = useCallback(
    (next: UserProgress) => {
      setProgress(next);
      if (isSignedIn) {
        saveUserProgressToFirestore(next).catch((err) => {
          console.error('Failed saving cloud progress:', err);
        });
      } else {
        saveGuestProgress(next);
      }
    },
    [isSignedIn],
  );

  const handleChangeLanguage = (lang: Language) => {
    soundEngine.playTap();
    persistProgress({ ...progress, language: lang });
  };

  const handleToggleMusic = () => {
    soundEngine.playTap();
    persistProgress({ ...progress, musicEnabled: !progress.musicEnabled });
  };

  const handleToggleSfx = () => {
    const nextSfx = !progress.sfxEnabled;
    persistProgress({ ...progress, sfxEnabled: nextSfx });
    if (nextSfx) soundEngine.playTap();
  };

  const handleSignInGoogle = async () => {
    soundEngine.playTap();
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
      setScreen('hub');
    } catch {
      setAuthError(t.authErrorPopup);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    soundEngine.playTap();
    await signOutUser();
    setSettingsOpen(false);
    setScreen('title');
  };

  const handleSelectGame = (gameId: GameId) => {
    soundEngine.playTap();
    const unlocked = Math.min(MAX_LEVEL, progress.levels[gameId] ?? 1);
    setActiveGame(gameId);
    setActiveLevel(unlocked);
    setIsVictoryOverlay(false);
    setScreen('playing');
  };

  const handleCompleteLevel = useCallback(
    (completedLevel: number, scoreEarned: number): CompletionReward => {
      const currentReached = progress.levels[activeGame] ?? 1;
      const nextReached = Math.max(currentReached, Math.min(MAX_LEVEL + 1, completedLevel + 1));
      const base: UserProgress = {
        ...progress,
        totalScore: progress.totalScore + scoreEarned,
        levels: {
          ...progress.levels,
          [activeGame]: nextReached,
        },
        scores: {
          ...progress.scores,
          [activeGame]: (progress.scores[activeGame] ?? 0) + scoreEarned,
        },
      };

      const achievements = getNewlyUnlockedAchievements(progress, base);
      const bonusPoints = sumAchievementPoints(achievements);
      const next: UserProgress =
        bonusPoints > 0 ? { ...base, totalScore: base.totalScore + bonusPoints } : base;

      persistProgress(next);
      return { achievements, bonusPoints };
    },
    [activeGame, persistProgress, progress],
  );

  return (
    <ErrorBoundary>
      {screen === 'title' && (
        <TitleScreen
          t={t}
          language={progress.language}
          onChangeLanguage={handleChangeLanguage}
          onStartGuest={() => {
            soundEngine.unlock();
            soundEngine.playTap();
            setScreen('hub');
          }}
          onSignInGoogle={handleSignInGoogle}
          onOpenSettings={() => {
            soundEngine.playTap();
            setSettingsOpen(true);
          }}
          isSigningIn={isSigningIn}
          authError={authError}
        />
      )}

      {screen === 'hub' && (
        <GameHub
          t={t}
          progress={progress}
          isSignedIn={isSignedIn}
          onSelectGame={handleSelectGame}
          onOpenAchievements={() => {
            soundEngine.playTap();
            setAchievementsOpen(true);
          }}
          onOpenSettings={() => {
            soundEngine.playTap();
            setSettingsOpen(true);
          }}
        />
      )}

      {screen === 'playing' && (
        <GameShell
          gameId={activeGame}
          activeLevel={activeLevel}
          maxUnlockedLevel={progress.levels[activeGame] ?? 1}
          language={progress.language}
          t={t}
          onSelectLevel={(lvl) => setActiveLevel(lvl)}
          onCompleteLevel={handleCompleteLevel}
          onBackToHub={() => {
            setIsVictoryOverlay(false);
            setScreen('hub');
          }}
          onOpenSettings={() => {
            soundEngine.playTap();
            setSettingsOpen(true);
          }}
          onVictoryStateChange={setIsVictoryOverlay}
        />
      )}

      <AchievementsModal
        open={achievementsOpen}
        t={t}
        progress={progress}
        onClose={() => {
          soundEngine.playTap();
          setAchievementsOpen(false);
        }}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => {
          soundEngine.playTap();
          setSettingsOpen(false);
        }}
        t={t}
        language={progress.language}
        musicEnabled={progress.musicEnabled}
        sfxEnabled={progress.sfxEnabled}
        isSignedIn={isSignedIn}
        displayName={progress.displayName}
        onChangeLanguage={handleChangeLanguage}
        onToggleMusic={handleToggleMusic}
        onToggleSfx={handleToggleSfx}
        onSignInGoogle={handleSignInGoogle}
        onSignOut={handleSignOut}
      />
    </ErrorBoundary>
  );
}
