import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  ALL_GAME_IDS,
  createDefaultLevels,
  createDefaultProgress,
  createDefaultScores,
  GameId,
  GameLevelsMap,
  GameScoresMap,
  MAX_LEVEL,
  UserProgress,
} from '../types/game';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOutUser() {
  return signOut(auth);
}

function clampLevel(v: unknown): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.floor(v) : 1;
  return Math.max(1, Math.min(MAX_LEVEL + 1, n));
}

function clampScore(v: unknown): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.floor(v) : 0;
  return Math.max(0, Math.min(1000000, n));
}

export function sanitizeProgressForSchema(raw: Partial<UserProgress>, uid: string, fallbackName: string): UserProgress {
  const defaultLevels = createDefaultLevels();
  const defaultScores = createDefaultScores();
  const levels = { ...defaultLevels } as GameLevelsMap;
  const scores = { ...defaultScores } as GameScoresMap;

  for (const gid of ALL_GAME_IDS) {
    levels[gid] = clampLevel(raw.levels?.[gid as GameId]);
    scores[gid] = clampScore(raw.scores?.[gid as GameId]);
  }

  const safeName = (raw.displayName || fallbackName || 'Player').trim().slice(0, 80) || 'Player';
  const lang = raw.language === 'kk' || raw.language === 'ru' || raw.language === 'en' ? raw.language : 'kk';
  const totalScore = Math.max(0, Math.min(10000000, Math.floor(raw.totalScore ?? 0)));
  const coins = Math.max(0, Math.min(10000000, Math.floor(raw.coins ?? 0)));
  const selectedAvatar = (raw.selectedAvatar || 'bunny').slice(0, 32);
  const unlockedAvatars = Array.isArray(raw.unlockedAvatars)
    ? raw.unlockedAvatars.map((a) => String(a).slice(0, 32)).slice(0, 50)
    : ['bunny'];
  if (!unlockedAvatars.includes(selectedAvatar)) unlockedAvatars.unshift(selectedAvatar);
  if (!unlockedAvatars.includes('bunny')) unlockedAvatars.unshift('bunny');

  return {
    uid: uid.slice(0, 128),
    displayName: safeName,
    language: lang,
    musicEnabled: Boolean(raw.musicEnabled ?? true),
    sfxEnabled: Boolean(raw.sfxEnabled ?? true),
    totalScore,
    coins,
    selectedAvatar,
    unlockedAvatars,
    levels,
    scores,
  };
}

export async function loadOrCreateUserProgress(
  uid: string,
  displayName: string,
  guestSeed?: UserProgress,
): Promise<UserProgress> {
  const path = `users/${uid}`;
  const ref = doc(db, 'users', uid);

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as Partial<UserProgress>;
      return sanitizeProgressForSchema(data, uid, displayName);
    }

    const base = guestSeed
      ? sanitizeProgressForSchema(
          {
            ...guestSeed,
            uid,
            displayName: displayName || guestSeed.displayName,
          },
          uid,
          displayName,
        )
      : createDefaultProgress(uid, displayName || 'Player');

    await setDoc(ref, {
      ...base,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return base;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProgressToFirestore(progress: UserProgress): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== progress.uid) return;
  const path = `users/${progress.uid}`;
  const ref = doc(db, 'users', progress.uid);
  const clean = sanitizeProgressForSchema(progress, progress.uid, progress.displayName);

  try {
    await updateDoc(ref, {
      displayName: clean.displayName,
      language: clean.language,
      musicEnabled: clean.musicEnabled,
      sfxEnabled: clean.sfxEnabled,
      totalScore: clean.totalScore,
      coins: clean.coins,
      selectedAvatar: clean.selectedAvatar,
      unlockedAvatars: clean.unlockedAvatars,
      levels: clean.levels,
      scores: clean.scores,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  totalScore: number;
  selectedAvatar: string;
}

export async function getTopPlayers(limitCount = 10): Promise<LeaderboardEntry[]> {
  const q = query(collection(db, 'users'), orderBy('totalScore', 'desc'), limit(limitCount));
  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as Partial<UserProgress>;
      return {
        uid: d.id,
        displayName: (data.displayName || 'Player').toString().slice(0, 80),
        totalScore: Math.max(0, Math.floor(data.totalScore ?? 0)),
        selectedAvatar: (data.selectedAvatar || 'bunny').toString(),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
  }
}
