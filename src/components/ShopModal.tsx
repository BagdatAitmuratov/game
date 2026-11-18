import React from 'react';
import { Coins, ShoppingBag, X } from 'lucide-react';
import { TranslationBundle } from '../i18n/translations';
import { UserProgress } from '../types/game';
import { AVATARS, getAvatar } from '../data/avatars';

interface ShopModalProps {
  open: boolean;
  t: TranslationBundle;
  progress: UserProgress;
  onBuy: (avatarId: string) => void;
  onEquip: (avatarId: string) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  open,
  t,
  progress,
  onBuy,
  onEquip,
  onClose,
}) => {
  if (!open) return null;

  const owned = new Set(progress.unlockedAvatars ?? ['bunny']);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242938]/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-modal-title"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E6DFD3] shadow-xl p-6 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F4F9F0] text-[#4E8527] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 id="shop-modal-title" className="font-display text-xl font-bold text-[#242938]">
                {t.shopTitle}
              </h2>
              <p className="text-xs text-[#5C6478]">{t.shopSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#E6DFD3] text-[#5C6478] hover:text-[#242938]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 px-3 py-2.5 rounded-2xl bg-[#FFF4CC] border border-[#F2D58C]">
          <div className="flex items-center gap-2 text-sm font-bold text-[#7A530B]">
            <Coins className="w-4 h-4 text-[#D98C00]" />
            <span>{t.coinsLabel}</span>
          </div>
          <span className="font-mono text-sm font-extrabold tabular-nums text-[#7A530B]">
            {progress.coins.toLocaleString()}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3">
          {AVATARS.map((avatar) => {
            const isOwned = owned.has(avatar.id);
            const isEquipped = progress.selectedAvatar === avatar.id;
            const canAfford = progress.coins >= avatar.price;
            return (
              <div
                key={avatar.id}
                className={`rounded-2xl border p-4 flex flex-col items-center text-center ${
                  isEquipped ? 'bg-[#EBF2FE] border-[#4E89E8]/40' : 'bg-[#FAF8F5] border-[#ECE5D9]'
                }`}
              >
                <span className="text-4xl mb-2 leading-none">{avatar.emoji}</span>
                <p className="font-display text-sm font-extrabold text-[#242938] mb-1">
                  {avatar.id.charAt(0).toUpperCase() + avatar.id.slice(1)}
                </p>
                <p className="text-xs text-[#5C6478] mb-3">
                  {avatar.price === 0 ? t.ownedLabel : `${avatar.price} ${t.coinsLabel.toLowerCase()}`}
                </p>

                {isEquipped ? (
                  <span className="w-full min-h-[40px] flex items-center justify-center rounded-xl bg-[#4E89E8] text-white text-xs font-bold">
                    {t.equippedLabel}
                  </span>
                ) : isOwned ? (
                  <button
                    type="button"
                    onClick={() => onEquip(avatar.id)}
                    className="w-full min-h-[40px] rounded-xl bg-[#2FB479] text-white text-xs font-bold hover:bg-[#269F69] active:scale-95 transition-transform"
                  >
                    {t.equipLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onBuy(avatar.id)}
                    disabled={!canAfford}
                    className={`w-full min-h-[40px] rounded-xl text-xs font-bold active:scale-95 transition-transform ${
                      canAfford
                        ? 'bg-[#F2B830] text-[#3D2B00] hover:bg-[#E5A42A]'
                        : 'bg-[#E6DFD3] text-[#A6A0B2] cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? t.buyLabel : t.notEnoughCoins}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};