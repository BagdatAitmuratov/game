import React, { useEffect } from 'react';
import { Settings, Play, LogIn } from 'lucide-react';
import { TranslationBundle } from '../i18n/translations';
import { Language } from '../types/game';
import { BrandEmblem } from './GameIcons';

interface TitleScreenProps {
  t: TranslationBundle;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  onStartGuest: () => void;
  onSignInGoogle: () => void;
  onOpenSettings: () => void;
  isSigningIn: boolean;
  authError: string | null;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  t,
  language,
  onChangeLanguage,
  onStartGuest,
  onSignInGoogle,
  onOpenSettings,
  isSigningIn,
  authError,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT') return;
        e.preventDefault();
        onStartGuest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGuest]);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden flex flex-col justify-between bg-[#FAF5EB]">
      {/* Illustrated Key-Art Backdrop with Safe Cream Sky Scrim */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/src/assets/images/title_bg_1794901307404.jpg"
          alt="BalaMind pastel puzzle islands"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-bottom opacity-95"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(250,245,235,0.88) 0%, rgba(250,245,235,0.62) 48%, rgba(250,245,235,0.28) 100%)',
          }}
        />
      </div>

      {/* Top Corner Controls: Quick Language Switch + Settings Gear */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 pt-4 sm:pt-6">
        <div
          className="flex items-center gap-1 p-1 rounded-2xl bg-white/90 border border-[#E8DFCE] shadow-sm"
          role="group"
          aria-label={t.languageLabel}
        >
          {(['kk', 'ru', 'en'] as Language[]).map((code) => {
            const label = code === 'kk' ? 'ҚАЗ' : code === 'ru' ? 'РУС' : 'ENG';
            const active = language === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => onChangeLanguage(code)}
                className={`min-h-[38px] px-3 rounded-xl text-xs font-bold tracking-wide transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#242938] text-white'
                    : 'text-[#5C6478] hover:text-[#242938] hover:bg-[#F5EFE6]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label={t.settingsTitle}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-white/90 border border-[#E8DFCE] text-[#242938] shadow-sm hover:bg-white active:scale-95 transition-transform"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Center Negative Space Title Lockup & Auth CTAs */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-6 text-center">
        <div className="max-w-lg w-full flex flex-col items-center">
          {/* Custom Inline SVG Emblem & Title Lockup */}
          <div className="flex items-center gap-3.5 mb-3">
            <BrandEmblem className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-sm" />
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#242938]">
              {t.brandName}
            </h1>
          </div>

          <p className="font-display text-xl sm:text-2xl font-bold text-[#353C52] mb-2 text-balance">
            {t.titleTagline}
          </p>
          <p className="text-sm sm:text-base text-[#5C6478] max-w-md mb-7 text-balance">
            {t.titleSubtitle}
          </p>

          {authError && (
            <div
              role="alert"
              className="mb-4 w-full max-w-sm rounded-2xl bg-[#FFF0ED] border border-[#F5C2B8] px-4 py-3 text-xs sm:text-sm font-semibold text-[#B53D27]"
            >
              {authError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-sm sm:max-w-md">
            <button
              type="button"
              data-start="true"
              onClick={onStartGuest}
              className="min-h-[52px] flex-1 px-6 py-3.5 rounded-2xl bg-[#2FB479] hover:bg-[#269F69] active:scale-[0.98] text-white font-bold text-base shadow-md shadow-[#2FB479]/25 flex items-center justify-center gap-2.5 transition-all whitespace-nowrap shrink-0"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t.playAsGuest}</span>
            </button>

            <button
              type="button"
              onClick={onSignInGoogle}
              disabled={isSigningIn}
              className="min-h-[52px] flex-1 px-5 py-3.5 rounded-2xl bg-white hover:bg-[#F7F3EB] active:scale-[0.98] text-[#242938] border border-[#DED5C5] font-bold text-base shadow-sm flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <LogIn className="w-5 h-5 text-[#4E89E8]" />
              <span>{isSigningIn ? t.signingIn : t.signInGoogle}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Safe Margin Control Hint */}
      <footer className="relative z-10 pb-5 px-4 text-center">
        <p className="text-xs sm:text-sm font-semibold text-[#353C52]/80 bg-white/75 inline-block px-4 py-1.5 rounded-xl">
          {t.controlHint}
        </p>
      </footer>
    </div>
  );
};
