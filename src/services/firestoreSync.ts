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
import { QuestLogHistoryItem } from '../utils/storage';

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
      quests.push(d.data() as Quest);
    });
    quests.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    const rewards: ShopReward[] = [];
    rewardsSnap.forEach((d) => {
      rewards.push(d.data() as ShopReward);
    });

    const history: QuestLogHistoryItem[] = [];
    historySnap.forEach((d) => {
      history.push(d.data() as QuestLogHistoryItem);
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
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
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
      handleFirestoreError(err, OperationType.GET, `users/${userId}`);
    }
  );

  const unsubQuests = onSnapshot(
    questsCol,
    (snapshot) => {
      const quests: Quest[] = [];
      snapshot.forEach((d) => {
        quests.push(d.data() as Quest);
      });
      quests.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      callbacks.onQuestsChange?.(quests);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${userId}/quests`);
    }
  );

  const unsubRewards = onSnapshot(
    rewardsCol,
    (snapshot) => {
      const rewards: ShopReward[] = [];
      snapshot.forEach((d) => {
        rewards.push(d.data() as ShopReward);
      });
      callbacks.onRewardsChange?.(rewards);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${userId}/rewards`);
    }
  );

  const unsubHistory = onSnapshot(
    historyCol,
    (snapshot) => {
      const history: QuestLogHistoryItem[] = [];
      snapshot.forEach((d) => {
        history.push(d.data() as QuestLogHistoryItem);
      });
      history.sort((a, b) => {
        const timeA = new Date(a.completedAt || 0).getTime();
        const timeB = new Date(b.completedAt || 0).getTime();
        return timeB - timeA;
      });
      callbacks.onHistoryChange?.(history);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${userId}/history`);
    }
  );

  return () => {
    unsubProfile();
    unsubQuests();
    unsubRewards();
    unsubHistory();
  };
}

export async function saveProfileToFirestore(userId: string, profile: CharacterProfile) {
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, 'users', userId), {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveQuestToFirestore(userId: string, quest: Quest) {
  const path = `users/${userId}/quests/${quest.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'quests', quest.id), quest, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteQuestFromFirestore(userId: string, questId: string) {
  const path = `users/${userId}/quests/${questId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'quests', questId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveRewardToFirestore(userId: string, reward: ShopReward) {
  const path = `users/${userId}/rewards/${reward.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'rewards', reward.id), reward, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteRewardFromFirestore(userId: string, rewardId: string) {
  const path = `users/${userId}/rewards/${rewardId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'rewards', rewardId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveHistoryItemToFirestore(userId: string, item: QuestLogHistoryItem) {
  const path = `users/${userId}/history/${item.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'history', item.id), item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Upload entire initial dataset on first user login
export async function bootstrapUserCloudData(
  userId: string,
  profile: CharacterProfile,
  quests: Quest[],
  rewards: ShopReward[],
  history: QuestLogHistoryItem[]
) {
  try {
    await saveProfileToFirestore(userId, profile);
    for (const q of quests) {
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

