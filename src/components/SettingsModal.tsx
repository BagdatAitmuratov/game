import React from 'react';
import { X, Volume2, VolumeX, Music, LogIn, LogOut, Globe } from 'lucide-react';
import { TranslationBundle } from '../i18n/translations';
import { Language } from '../types/game';
import { getAvatar } from '../data/avatars';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  t: TranslationBundle;
  language: Language;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  isSignedIn: boolean;
  displayName: string;
  selectedAvatar?: string;
  onChangeLanguage: (lang: Language) => void;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  onSignInGoogle: () => void;
  onSignOut: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  t,
  language,
  musicEnabled,
  sfxEnabled,
  isSignedIn,
  displayName,
  selectedAvatar,
  onChangeLanguage,
  onToggleMusic,
  onToggleSfx,
  onSignInGoogle,
  onSignOut,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242938]/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E6DFD3] shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 id="settings-modal-title" className="font-display text-xl font-bold text-[#242938]">
            {t.settingsTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#E6DFD3] text-[#5C6478] hover:text-[#242938]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="mb-5">
          <div className="flex items-center gap-2 text-sm font-bold text-[#353C52] mb-2.5">
            <Globe className="w-4 h-4 text-[#4E89E8]" />
            <span>{t.languageLabel}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#F4F0E8]">
            {(['kk', 'ru', 'en'] as Language[]).map((code) => {
              const label = code === 'kk' ? 'ҚАЗ' : code === 'ru' ? 'РУС' : 'ENG';
              const active = language === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onChangeLanguage(code)}
                  className={`min-h-[44px] rounded-xl text-sm font-bold transition-colors ${
                    active
                      ? 'bg-[#4E89E8] text-white shadow-sm'
                      : 'text-[#5C6478] hover:text-[#242938]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio Toggles */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE5D9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EADFFE] text-[#7344B8] flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-[#242938]">{t.musicLabel}</span>
            </div>
            <button
              type="button"
              onClick={onToggleMusic}
              aria-pressed={musicEnabled}
              className={`min-h-[44px] min-w-[84px] px-4 rounded-xl text-xs font-bold transition-colors ${
                musicEnabled
                  ? 'bg-[#2FB479] text-white'
                  : 'bg-[#E6DFD3] text-[#5C6478]'
              }`}
            >
              {musicEnabled ? t.onLabel : t.offLabel}
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE5D9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE4DC] text-[#C8533B] flex items-center justify-center">
                {sfxEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <span className="font-bold text-sm text-[#242938]">{t.sfxLabel}</span>
            </div>
            <button
              type="button"
              onClick={onToggleSfx}
              aria-pressed={sfxEnabled}
              className={`min-h-[44px] min-w-[84px] px-4 rounded-xl text-xs font-bold transition-colors ${
                sfxEnabled
                  ? 'bg-[#2FB479] text-white'
                  : 'bg-[#E6DFD3] text-[#5C6478]'
              }`}
            >
              {sfxEnabled ? t.onLabel : t.offLabel}
            </button>
          </div>
        </div>

        {/* Account Sync Section */}
        <div className="pt-4 border-t border-[#ECE5D9]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl leading-none shrink-0">
                {getAvatar(selectedAvatar || 'bunny').emoji}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#5C6478]">{t.accountLabel}</p>
                <p className="text-sm font-bold text-[#242938] break-words">
                  {isSignedIn ? displayName : t.guestMode}
                </p>
              </div>
            </div>
            {isSignedIn ? (
              <button
                type="button"
                onClick={onSignOut}
                className="min-h-[44px] w-full sm:w-auto px-4 rounded-xl bg-[#FFF0ED] text-[#C8533B] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#FFE3DD] shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.signOut}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignInGoogle}
                className="min-h-[44px] w-full sm:w-auto px-4 rounded-xl bg-[#EBF2FE] text-[#3168C4] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#DCEAFF] shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.signInGoogle}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
