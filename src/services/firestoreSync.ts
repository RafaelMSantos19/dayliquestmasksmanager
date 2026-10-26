import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CharacterProfile, Quest, ShopReward } from '../types/rpg';
import { QuestLogHistoryItem, isPresetQuest } from '../utils/storage';

/**
 * Deeply sanitizes objects before passing them to Firestore.
 * Removes any keys with `undefined` values and ensures nested structures
 * (such as medication plans, dose arrays, subtasks) are 100% Firestore-safe.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as unknown as T;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean as T;
}

export async function fetchUserDataFromFirestore(userId: string): Promise<{
  profile: CharacterProfile | null;
  quests: Quest[];
  rewards: ShopReward[];
  history: QuestLogHistoryItem[];
} | null> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const questsCol = collection(db, 'users', userId, 'quests');
    const rewardsCol = collection(db, 'users', userId, 'rewards');
    const historyCol = collection(db, 'users', userId, 'history');

    const [userDocSnap, questsSnap, rewardsSnap, historySnap] = await Promise.all([
      getDoc(userDocRef),
      getDocs(questsCol),
      getDocs(rewardsCol),
      getDocs(historyCol),
    ]);

    const profileData = userDocSnap.exists() ? (userDocSnap.data() as CharacterProfile) : null;

    const quests: Quest[] = [];
    questsSnap.forEach((d) => {
      const q = d.data() as Quest;
      if (q && q.id) {
        quests.push(q);
      }
    });
    quests.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    const rewards: ShopReward[] = [];
    rewardsSnap.forEach((d) => {
      const r = d.data() as ShopReward;
      if (r && r.id) {
        rewards.push(r);
      }
    });

    const history: QuestLogHistoryItem[] = [];
    historySnap.forEach((d) => {
      const h = d.data() as QuestLogHistoryItem;
      if (h && h.id) {
        history.push(h);
      }
    });
    history.sort((a, b) => {
      const timeA = new Date(a.completedAt || 0).getTime();
      const timeB = new Date(b.completedAt || 0).getTime();
      return timeB - timeA;
    });

    // If no remote data exists at all, return null so initial bootstrap can run
    if (!profileData && quests.length === 0 && rewards.length === 0 && history.length === 0) {
      return null;
    }

    return {
      profile: profileData,
      quests,
      rewards,
      history,
    };
  } catch (error) {
    console.warn('Could not fetch user data from Firestore:', error);
    return null;
  }
}

export function subscribeToUserCloudData(
  userId: string,
  callbacks: {
    onProfileChange?: (profile: CharacterProfile) => void;
    onQuestsChange?: (quests: Quest[]) => void;
    onRewardsChange?: (rewards: ShopReward[]) => void;
    onHistoryChange?: (history: QuestLogHistoryItem[]) => void;
    onError?: (error: unknown) => void;
  }
): () => void {
  const userDocRef = doc(db, 'users', userId);
  const questsCol = collection(db, 'users', userId, 'quests');
  const rewardsCol = collection(db, 'users', userId, 'rewards');
  const historyCol = collection(db, 'users', userId, 'history');

  const unsubProfile = onSnapshot(
    userDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callbacks.onProfileChange?.(snapshot.data() as CharacterProfile);
      }
    },
    (err) => {
      console.warn('Profile snapshot subscription warning:', err);
      callbacks.onError?.(err);
    }
  );

  const unsubQuests = onSnapshot(
    questsCol,
    (snapshot) => {
      const quests: Quest[] = [];
      snapshot.forEach((d) => {
        const q = d.data() as Quest;
        if (q && q.id) {
          quests.push(q);
        }
      });
      quests.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      callbacks.onQuestsChange?.(quests);
    },
    (err) => {
      console.warn('Quests snapshot subscription warning:', err);
      callbacks.onError?.(err);
    }
  );

  const unsubRewards = onSnapshot(
    rewardsCol,
    (snapshot) => {
      const rewards: ShopReward[] = [];
      snapshot.forEach((d) => {
        const r = d.data() as ShopReward;
        if (r && r.id) {
          rewards.push(r);
        }
      });
      callbacks.onRewardsChange?.(rewards);
    },
    (err) => {
      console.warn('Rewards snapshot subscription warning:', err);
      callbacks.onError?.(err);
    }
  );

  const unsubHistory = onSnapshot(
    historyCol,
    (snapshot) => {
      const history: QuestLogHistoryItem[] = [];
      snapshot.forEach((d) => {
        const h = d.data() as QuestLogHistoryItem;
        if (h && h.id) {
          history.push(h);
        }
      });
      history.sort((a, b) => {
        const timeA = new Date(a.completedAt || 0).getTime();
        const timeB = new Date(b.completedAt || 0).getTime();
        return timeB - timeA;
      });
      callbacks.onHistoryChange?.(history);
    },
    (err) => {
      console.warn('History snapshot subscription warning:', err);
      callbacks.onError?.(err);
    }
  );

  return () => {
    unsubProfile();
    unsubQuests();
    unsubRewards();
    unsubHistory();
  };
}

export async function saveProfileToFirestore(userId: string, profile: CharacterProfile): Promise<boolean> {
  const path = `users/${userId}`;
  try {
    const cleanProfile = sanitizeForFirestore({
      ...profile,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'users', userId), cleanProfile, { merge: true });
    return true;
  } catch (error) {
    console.error('Failed to save profile to Firestore:', error);
    return false;
  }
}

export async function saveQuestToFirestore(userId: string, quest: Quest): Promise<boolean> {
  // Never upload unauthenticated preset/demo quests to user's personal cloud database
  if (isPresetQuest(quest)) {
    return false;
  }
  const path = `users/${userId}/quests/${quest.id}`;
  try {
    const cleanQuest = sanitizeForFirestore(quest);
    await setDoc(doc(db, 'users', userId, 'quests', quest.id), cleanQuest, { merge: true });
    return true;
  } catch (error) {
    console.error(`Failed to save quest ${quest.id} to Firestore:`, error);
    return false;
  }
}

export async function deleteQuestFromFirestore(userId: string, questId: string): Promise<boolean> {
  const path = `users/${userId}/quests/${questId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'quests', questId));
    return true;
  } catch (error) {
    console.error(`Failed to delete quest ${questId} from Firestore:`, error);
    return false;
  }
}

export async function saveRewardToFirestore(userId: string, reward: ShopReward): Promise<boolean> {
  const path = `users/${userId}/rewards/${reward.id}`;
  try {
    const cleanReward = sanitizeForFirestore(reward);
    await setDoc(doc(db, 'users', userId, 'rewards', reward.id), cleanReward, { merge: true });
    return true;
  } catch (error) {
    console.error(`Failed to save reward ${reward.id} to Firestore:`, error);
    return false;
  }
}

export async function deleteRewardFromFirestore(userId: string, rewardId: string): Promise<boolean> {
  const path = `users/${userId}/rewards/${rewardId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'rewards', rewardId));
    return true;
  } catch (error) {
    console.error(`Failed to delete reward ${rewardId} from Firestore:`, error);
    return false;
  }
}

export async function saveHistoryItemToFirestore(userId: string, item: QuestLogHistoryItem): Promise<boolean> {
  const path = `users/${userId}/history/${item.id}`;
  try {
    const cleanItem = sanitizeForFirestore(item);
    await setDoc(doc(db, 'users', userId, 'history', item.id), cleanItem, { merge: true });
    return true;
  } catch (error) {
    console.error(`Failed to save history item ${item.id} to Firestore:`, error);
    return false;
  }
}

// Upload entire initial dataset on first user login (strictly excluding presets)
export async function bootstrapUserCloudData(
  userId: string,
  profile: CharacterProfile,
  quests: Quest[],
  rewards: ShopReward[],
  history: QuestLogHistoryItem[]
) {
  try {
    await saveProfileToFirestore(userId, profile);
    const nonPresetQuests = quests.filter((q) => !isPresetQuest(q));
    for (const q of nonPresetQuests) {
      await saveQuestToFirestore(userId, q);
    }
    for (const r of rewards) {
      await saveRewardToFirestore(userId, r);
    }
    for (const h of history.slice(0, 30)) {
      await saveHistoryItemToFirestore(userId, h);
    }
  } catch (err) {
    console.error('Error bootstrapping cloud data:', err);
  }
}

export interface GrimorioBackupData {
  version: 1;
  appName: string;
  exportedAt: string;
  userEmail?: string | null;
  profile: CharacterProfile;
  quests: Quest[];
  rewards: ShopReward[];
  history: QuestLogHistoryItem[];
}

/**
 * Downloads a complete JSON snapshot file of the user's RPG Grimório.
 * Useful for backing up to Google Drive, iCloud, local disk, etc.
 */
export function exportGrimorioToJsonFile(
  profile: CharacterProfile,
  quests: Quest[],
  rewards: ShopReward[],
  history: QuestLogHistoryItem[],
  userEmail?: string | null
) {
  const backupData: GrimorioBackupData = {
    version: 1,
    appName: 'QuestLog RPG',
    exportedAt: new Date().toISOString(),
    userEmail: userEmail || null,
    profile,
    quests,
    rewards,
    history,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `grimorio_questlog_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

