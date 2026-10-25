import React, { useState, useEffect } from 'react';
import {
  CharacterProfile,
  Quest,
  ShopReward,
  AttributeType,
} from './types/rpg';
import {
  loadProfile,
  saveProfile,
  loadQuests,
  saveQuests,
  loadRewards,
  saveRewards,
  loadHistory,
  saveHistory,
  getRequiredXpForLevel,
  checkAndApplyDayTransition,
  QuestLogHistoryItem,
} from './utils/storage';
import { sound } from './utils/audio';
import { CharacterHeader } from './components/CharacterHeader';
import { BottomNav, TabType } from './components/BottomNav';
import { QuestsTab } from './components/QuestsTab';
import { HeroSheetTab } from './components/HeroSheetTab';
import { RewardsTab } from './components/RewardsTab';
import { HistoryTab } from './components/HistoryTab';
import { CreateQuestModal } from './components/CreateQuestModal';
import { CelebrationModal } from './components/CelebrationModal';
import { Sparkles, Trophy, CheckCircle, ShieldAlert } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<CharacterProfile>(loadProfile);
  const [quests, setQuests] = useState<Quest[]>(loadQuests);
  const [rewards, setRewards] = useState<ShopReward[]>(loadRewards);
  const [history, setHistory] = useState<QuestLogHistoryItem[]>(loadHistory);

  const [activeTab, setActiveTab] = useState<TabType>('quests');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [celebrationLevel, setCelebrationLevel] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [floatingToast, setFloatingToast] = useState<{ message: string; sub?: string } | null>(null);

  const showNotification = (message: string, sub?: string) => {
    setFloatingToast({ message, sub });
    setTimeout(() => {
      setFloatingToast((curr) => (curr?.message === message ? null : curr));
    }, 2800);
  };

  // Day transition checker (Midnight, iOS wake-up, tab visibility)
  useEffect(() => {
    const evaluateDayChange = () => {
      const today = new Date().toISOString().split('T')[0];
      setProfile((prevProf) => {
        if (prevProf.lastActiveDate === today) {
          return prevProf;
        }

        setQuests((prevQuests) => {
          const result = checkAndApplyDayTransition(prevQuests, prevProf, today);
          if (result.hasDayChanged) {
            sound.playLevelUp();
            showNotification(
              '🌅 Um Novo Dia Despertou!',
              'Suas missões diárias e doses de poções foram renovadas!'
            );
            return result.updatedQuests;
          }
          return prevQuests;
        });

        const res = checkAndApplyDayTransition([], prevProf, today);
        return res.updatedProfile;
      });
    };

    // 1. Run check immediately on mount
    evaluateDayChange();

    // 2. Run whenever user returns to the app / unlocks iPhone Safari
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        evaluateDayChange();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', evaluateDayChange);

    // 3. Periodic check every 30 seconds for live midnight crossing
    const interval = setInterval(evaluateDayChange, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', evaluateDayChange);
      clearInterval(interval);
    };
  }, []);

  // Auto-save state to localStorage
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveQuests(quests);
  }, [quests]);

  useEffect(() => {
    saveRewards(rewards);
  }, [rewards]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Check and award badges
  const checkBadges = (
    currentProf: CharacterProfile,
    newQuestsCompleted: number,
    justCompletedQuest?: Quest
  ): string[] => {
    const unlocked = [...currentProf.badges];

    if (newQuestsCompleted >= 1 && !unlocked.includes('first_quest')) {
      unlocked.push('first_quest');
      showNotification('Nova Insígnia Desbloqueada!', '⚔️ Primeiro Passo no RPG');
    }
    if (currentProf.streak >= 3 && !unlocked.includes('streak_3')) {
      unlocked.push('streak_3');
      showNotification('Nova Insígnia Desbloqueada!', '🔥 Disciplina das Sombras (3 dias)');
    }
    if (newQuestsCompleted >= 10 && !unlocked.includes('veteran_10')) {
      unlocked.push('veteran_10');
      showNotification('Nova Insígnia Desbloqueada!', '🛡️ Guerreiro Calejado (10 missões)');
    }
    if (justCompletedQuest?.category === 'boss' && !unlocked.includes('boss_slayer')) {
      unlocked.push('boss_slayer');
      showNotification('Nova Insígnia Desbloqueada!', '👑 Matador de Chefes');
    }
    if (currentProf.gold >= 200 && !unlocked.includes('gold_hoarder')) {
      unlocked.push('gold_hoarder');
      showNotification('Nova Insígnia Desbloqueada!', '💰 Tesoureiro Real (200+ ouro)');
    }

    return unlocked;
  };

  // Handle Quest completion
  const handleCompleteQuest = (questId: string) => {
    const targetQuest = quests.find((q) => q.id === questId);
    if (!targetQuest) return;

    if (targetQuest.completed) {
      // Reopening quest: toggle off completed
      setQuests(
        quests.map((q) =>
          q.id === questId ? { ...q, completed: false, completedAt: undefined } : q
        )
      );
      showNotification('Missão reaberta', targetQuest.title);
      return;
    }

    // Complete quest!
    sound.playQuestComplete();
    const nowIso = new Date().toISOString();

    // Mark completed in quests
    const updatedQuests = quests.map((q) =>
      q.id === questId
        ? {
            ...q,
            completed: true,
            completedAt: nowIso,
            subtasks: q.subtasks.map((st) => ({ ...st, done: true })),
          }
        : q
    );
    setQuests(updatedQuests);

    // Update character XP, Gold, Stats
    const xpGained = targetQuest.xpReward;
    const goldGained = targetQuest.goldReward;
    const statAffinity = targetQuest.statAffinity;

    setProfile((prev) => {
      let currentXp = prev.currentXp + xpGained;
      let level = prev.level;
      let requiredXp = getRequiredXpForLevel(level);
      let didLevelUp = false;

      // Handle level up (can level multiple times if high rank)
      while (currentXp >= requiredXp) {
        currentXp -= requiredXp;
        level += 1;
        requiredXp = getRequiredXpForLevel(level);
        didLevelUp = true;
      }

      if (didLevelUp) {
        sound.playLevelUp();
        setCelebrationLevel(level);
      }

      const totalCompleted = prev.totalQuestsCompleted + 1;
      const updatedAttributes = {
        ...prev.attributes,
        [statAffinity]: (prev.attributes[statAffinity] || 10) + 1,
      };

      const newProf: CharacterProfile = {
        ...prev,
        level,
        currentXp,
        gold: prev.gold + goldGained,
        totalGoldEarned: prev.totalGoldEarned + goldGained,
        totalQuestsCompleted: totalCompleted,
        attributes: updatedAttributes,
        hp: prev.maxHp, // small heal on success
        badges: prev.badges,
      };

      // Check level 5 badge
      if (level >= 5 && !newProf.badges.includes('level_5')) {
        newProf.badges.push('level_5');
      }

      newProf.badges = checkBadges(newProf, totalCompleted, targetQuest);
      return newProf;
    });

    // Add to history
    const historyItem: QuestLogHistoryItem = {
      id: `hist-${Date.now()}`,
      questTitle: targetQuest.title,
      category: targetQuest.category,
      xpEarned: xpGained,
      goldEarned: goldGained,
      statAffinity,
      completedAt: nowIso,
    };
    setHistory((prev) => [historyItem, ...prev]);

    showNotification(
      `+${xpGained} XP · +${goldGained} Ouro`,
      `Atributo ${statAffinity.toUpperCase()} aumentou!`
    );
  };

  // Toggle single subtask
  const handleToggleSubtask = (questId: string, subtaskId: string) => {
    setQuests(
      quests.map((q) => {
        if (q.id === questId) {
          const updatedSubs = q.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, done: !st.done } : st
          );
          // If all subtasks are done, auto-suggest completion
          const allDone = updatedSubs.length > 0 && updatedSubs.every((st) => st.done);
          return {
            ...q,
            subtasks: updatedSubs,
            completed: allDone ? true : q.completed,
            completedAt: allDone ? new Date().toISOString() : q.completedAt,
          };
        }
        return q;
      })
    );
  };

  // Take single periodic medication dose
  const handleTakeMedicationDose = (questId: string, doseId: string) => {
    let doseTime = '';
    let isAllDosesTakenNow = false;
    let targetQuestTitle = '';

    setQuests((prevQuests) =>
      prevQuests.map((q) => {
        if (q.id === questId && q.medicationPlan) {
          targetQuestTitle = q.title;
          const updatedDoses = q.medicationPlan.doses.map((d) => {
            if (d.id === doseId) {
              doseTime = d.time;
              return {
                ...d,
                taken: !d.taken,
                takenAt: !d.taken ? new Date().toISOString() : undefined,
              };
            }
            return d;
          });

          isAllDosesTakenNow = updatedDoses.every((d) => d.taken);

          return {
            ...q,
            completed: isAllDosesTakenNow,
            completedAt: isAllDosesTakenNow ? new Date().toISOString() : q.completedAt,
            medicationPlan: {
              ...q.medicationPlan,
              doses: updatedDoses,
            },
          };
        }
        return q;
      })
    );

    // Boost Vitality, XP and HP for taking the medicine
    sound.playPotion();
    setProfile((prev) => ({
      ...prev,
      currentXp: prev.currentXp + 15,
      gold: prev.gold + 5,
      hp: Math.min(prev.maxHp, prev.hp + 20), // Healing potion effect
      attributes: {
        ...prev.attributes,
        vit: prev.attributes.vit + 1, // Boost Vitalidade
      },
    }));

    if (isAllDosesTakenNow) {
      sound.playQuestComplete();
      showNotification(
        'Todas as Doses de Hoje Concluídas!',
        `${targetQuestTitle} · +Vitalidade aumentada!`
      );
    } else {
      showNotification(
        `Dose das ${doseTime} Ingerida!`,
        '+15 XP · +Vitalidade · HP Curado'
      );
    }
  };

  // Create quest
  const handleCreateQuest = (questData: Omit<Quest, 'id' | 'createdAt' | 'completed'>) => {
    const newQuest: Quest = {
      ...questData,
      id: `quest-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setQuests([newQuest, ...quests]);
    showNotification('Missão registrada no Grimório!', newQuest.title);
  };

  // Delete quest
  const handleDeleteQuest = (questId: string) => {
    setQuests(quests.filter((q) => q.id !== questId));
    showNotification('Missão removida do quadro');
  };

  // Redeem reward
  const handleRedeemReward = (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return;

    if (profile.gold < reward.cost) return;

    setProfile((prev) => ({
      ...prev,
      gold: prev.gold - reward.cost,
    }));

    setRewards(
      rewards.map((r) =>
        r.id === rewardId ? { ...r, redeemedCount: r.redeemedCount + 1 } : r
      )
    );

    showNotification(`Recompensa Resgatada: ${reward.title}`, `-${reward.cost} Ouro consumido. Aproveite!`);
  };

  // Add reward
  const handleAddReward = (rewardData: Omit<ShopReward, 'id' | 'redeemedCount'>) => {
    const newReward: ShopReward = {
      ...rewardData,
      id: `rew-${Date.now()}`,
      redeemedCount: 0,
    };
    setRewards([...rewards, newReward]);
    showNotification('Nova recompensa cadastrada!', newReward.title);
  };

  // Delete reward
  const handleDeleteReward = (rewardId: string) => {
    setRewards(rewards.filter((r) => r.id !== rewardId));
  };

  // Sound toggle
  const handleToggleSound = () => {
    const newState = sound.toggleSound();
    setSoundEnabled(newState);
  };

  // Reset dailies
  const handleResetDailies = () => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.category === 'daily' || q.recurring) {
          return {
            ...q,
            completed: false,
            completedAt: undefined,
            subtasks: q.subtasks.map((st) => ({ ...st, done: false })),
            medicationPlan: q.medicationPlan
              ? {
                  ...q.medicationPlan,
                  doses: q.medicationPlan.doses.map((d) => ({
                    ...d,
                    taken: false,
                    takenAt: undefined,
                  })),
                }
              : undefined,
          };
        }
        return q;
      })
    );
    sound.playClick();
    showNotification(
      'Novo Dia Iniciado!',
      'Todas as missões diárias, objetivos e poções foram desmarcados!'
    );
  };

  // Export JSON
  const handleExportData = () => {
    const data = {
      profile,
      quests,
      rewards,
      history,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questlog-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Backup salvo com sucesso!');
  };

  // Import JSON
  const handleImportData = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile && Array.isArray(data.quests)) {
        setProfile(data.profile);
        setQuests(data.quests);
        if (data.rewards) setRewards(data.rewards);
        if (data.history) setHistory(data.history);
        showNotification('Dados restaurados com êxito!');
      } else {
        alert('Formato de backup inválido.');
      }
    } catch {
      alert('Erro ao carregar arquivo de backup.');
    }
  };

  const pendingDailies = quests.filter((q) => q.category === 'daily' && !q.completed).length;

  return (
    <div className="min-h-screen bg-black text-white flex justify-center selection:bg-purple-600 selection:text-white">
      {/* Responsive viewport frame for mobile, tablet (Android/iPad), and desktop (Windows/Linux) */}
      <div className="w-full max-w-6xl min-h-screen bg-black border-x border-purple-950/40 flex flex-col relative shadow-[0_0_60px_rgba(147,51,234,0.12)]">
        {/* Character Status & Responsive Navigation */}
        <CharacterHeader
          profile={profile}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onEditProfile={() => setActiveTab('hero')}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onOpenCreate={() => setIsCreateModalOpen(true)}
          pendingCount={pendingDailies}
        />

        {/* Main Content Body */}
        <main className="flex-1 px-3.5 sm:px-6 pt-4 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
          {activeTab === 'quests' && (
            <QuestsTab
              quests={quests}
              onCompleteQuest={handleCompleteQuest}
              onToggleSubtask={handleToggleSubtask}
              onTakeMedicationDose={handleTakeMedicationDose}
              onDeleteQuest={handleDeleteQuest}
              onOpenCreate={() => setIsCreateModalOpen(true)}
            />
          )}

          {activeTab === 'hero' && (
            <HeroSheetTab
              profile={profile}
              onUpdateProfile={(updated) => setProfile((p) => ({ ...p, ...updated }))}
              onResetDailies={handleResetDailies}
              onExportData={handleExportData}
              onImportData={handleImportData}
            />
          )}

          {activeTab === 'rewards' && (
            <RewardsTab
              gold={profile.gold}
              rewards={rewards}
              onRedeemReward={handleRedeemReward}
              onAddReward={handleAddReward}
              onDeleteReward={handleDeleteReward}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab
              history={history}
              onClearHistory={() => setHistory([])}
            />
          )}
        </main>

        {/* Bottom Tab Bar for iOS */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onOpenCreate={() => setIsCreateModalOpen(true)}
          pendingCount={pendingDailies}
        />

        {/* Create Quest Modal */}
        <CreateQuestModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateQuest}
        />

        {/* Level Up Fanfare Modal */}
        <CelebrationModal
          isOpen={celebrationLevel !== null}
          level={celebrationLevel || 1}
          onClose={() => setCelebrationLevel(null)}
        />

        {/* Floating Toast Notification */}
        {floatingToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="rounded-2xl bg-black/95 border-2 border-purple-400 p-3 shadow-[0_0_25px_rgba(168,85,247,0.5)] flex items-center gap-2.5 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-purple-900 border border-purple-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-purple-200" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs text-white leading-tight">{floatingToast.message}</p>
                {floatingToast.sub && (
                  <p className="text-[11px] text-purple-300 font-mono mt-0.5 leading-tight">{floatingToast.sub}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
