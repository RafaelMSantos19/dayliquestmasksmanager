import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  writeBatch,
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
  const userDocRef = doc(db, 'users', userId);
  try {
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      return null;
    }

    const profileData = userDocSnap.data() as CharacterProfile;

    // Fetch quests
    const questsCol = collection(db, 'users', userId, 'quests');
    const questsSnap = await getDocs(questsCol);
    const quests: Quest[] = [];
    questsSnap.forEach((d) => {
      quests.push(d.data() as Quest);
    });

    // Fetch rewards
    const rewardsCol = collection(db, 'users', userId, 'rewards');
    const rewardsSnap = await getDocs(rewardsCol);
    const rewards: ShopReward[] = [];
    rewardsSnap.forEach((d) => {
      rewards.push(d.data() as ShopReward);
    });

    // Fetch history
    const historyCol = collection(db, 'users', userId, 'history');
    const historySnap = await getDocs(historyCol);
    const history: QuestLogHistoryItem[] = [];
    historySnap.forEach((d) => {
      history.push(d.data() as QuestLogHistoryItem);
    });

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
