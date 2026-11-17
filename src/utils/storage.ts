import { createDefaultProgress, UserProgress } from '../types/game';
import { sanitizeProgressForSchema } from '../services/firebase';

const STORAGE_KEY = 'balamind_guest_progress_v1';

export function loadGuestProgress(): UserProgress {
  if (typeof window === 'undefined') return createDefaultProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return sanitizeProgressForSchema(parsed, 'guest', 'Guest');
  } catch {
    return createDefaultProgress();
  }
}

export function saveGuestProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}
