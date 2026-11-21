import React from 'react';
import { Play, Settings, ShoppingBag, Trophy, X } from 'lucide-react';
import { TranslationBundle } from '../i18n/translations';
import { UserProgress } from '../types/game';
import { AvatarSprite } from './AvatarSprite';

interface PostLoginHubModalProps {
  open: boolean;
  t: TranslationBundle;
  progress: UserProgress;
  onPlay: () => void;
  onSettings: () => void;
  onShop: () => void;
  onLeaders: () => void;
  onClose: () => void;
}

export const PostLoginHubModal: React.FC<PostLoginHubModalProps> = ({
  open,
  t,
  progress,
  onPlay,
  onSettings,
  onShop,
  onLeaders,
  onClose,
}) => {
  if (!open) return null;

  const buttons = [
    { label: t.playAsGuest, icon: Play, action: onPlay, color: 'bg-[#2FB479] hover:bg-[#269F69]' },
    { label: t.settingsTitle, icon: Settings, action: onSettings, color: 'bg-[#4E89E8] hover:bg-[#3168C4]' },
    { label: t.shopTitle, icon: ShoppingBag, action: onShop, color: 'bg-[#F2B830] hover:bg-[#E5A42A] text-[#3D2B00]' },
    { label: t.leaderboardTitle, icon: Trophy, action: onLeaders, color: 'bg-[#8F5EE0] hover:bg-[#7344B8]' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242938]/45 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="postlogin-hub-title"
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E6DFD3] shadow-2xl p-6 relative overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="absolute top-4 right-4 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#E6DFD3] text-[#5C6478] hover:text-[#242938]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <AvatarSprite avatarId={progress.selectedAvatar} size="lg" />
          <h2 id="postlogin-hub-title" className="font-display text-2xl font-extrabold text-[#242938] mt-3">
            {t.hubHeading}
          </h2>
          <p className="text-sm text-[#5C6478] mt-1">
            {progress.displayName}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {buttons.map(({ label, icon: Icon, action, color }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                action();
              }}
              className={`min-h-[88px] rounded-2xl text-white font-bold text-base shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform ${color}`}
            >
              <Icon className="w-7 h-7" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};