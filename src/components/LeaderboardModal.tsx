import React, { useEffect, useState } from 'react';
import { Trophy, X, Loader2 } from 'lucide-react';
import { TranslationBundle } from '../i18n/translations';
import { getTopPlayers, LeaderboardEntry } from '../services/firebase';
import { getAvatar } from '../data/avatars';

interface LeaderboardModalProps {
  open: boolean;
  t: TranslationBundle;
  currentUid?: string;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  open,
  t,
  currentUid,
  onClose,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTopPlayers(10)
      .then((data) => {
        if (cancelled) return;
        setEntries(data ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setError(t.leaderboardEmpty);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, t.leaderboardEmpty]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242938]/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E6DFD3] shadow-xl p-6 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF4CC] text-[#D98C00] flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 id="leaderboard-modal-title" className="font-display text-xl font-bold text-[#242938]">
                {t.leaderboardTitle}
              </h2>
              <p className="text-xs text-[#5C6478]">{t.leaderboardSubtitle}</p>
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

        {loading && (
          <div className="flex-1 flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#4E89E8]" />
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-[#5C6478] text-center py-8">{error}</p>
        )}

        {!loading && !error && entries.length === 0 && (
          <p className="text-sm text-[#5C6478] text-center py-8">{t.leaderboardEmpty}</p>
        )}

        {!loading && entries.length > 0 && (
          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              {entries.map((entry, idx) => {
                const isMe = currentUid && entry.uid === currentUid;
                const avatar = getAvatar(entry.selectedAvatar);
                return (
                  <li
                    key={entry.uid}
                    className={`flex items-center gap-3 rounded-2xl border p-3 ${
                      isMe
                        ? 'bg-[#EBF2FE] border-[#4E89E8]/40'
                        : 'bg-[#FAF8F5] border-[#ECE5D9]'
                    }`}
                  >
                    <span className="w-7 text-center font-mono text-sm font-extrabold text-[#5C6478]">
                      {idx + 1}
                    </span>
                    <span className="text-2xl leading-none">{avatar.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-[#242938] truncate">
                        {entry.displayName}
                        {isMe && <span className="ml-1 text-xs text-[#4E89E8]">(you)</span>}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-extrabold tabular-nums text-[#242938]">
                      {entry.totalScore.toLocaleString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};