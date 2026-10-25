import { CharacterBadge, CharacterProfile, Quest, ShopReward } from '../types/rpg';

export const ALL_BADGES: CharacterBadge[] = [
  {
    id: 'first_quest',
    name: 'Primeiro Passo',
    description: 'Completou sua primeiríssima missão no RPG.',
    icon: '⚔️',
  },
  {
    id: 'streak_3',
    name: 'Disciplina das Sombras',
    description: 'Manteve uma sequência ativa de 3 dias seguidos.',
    icon: '🔥',
  },
  {
    id: 'veteran_10',
    name: 'Guerreiro Calejado',
    description: 'Concluiu 10 missões com honra.',
    icon: '🛡️',
  },
  {
    id: 'boss_slayer',
    name: 'Matador de Chefes',
    description: 'Derrotou um desafio difícil ou missão de Chefe.',
    icon: '👑',
  },
  {
    id: 'level_5',
    name: 'Ascensão Arcana',
    description: 'Alcançou o Nível 5 de poder.',
    icon: '⚡',
  },
  {
    id: 'gold_hoarder',
    name: 'Tesoureiro Real',
    description: 'Acumulou mais de 200 moedas de ouro.',
    icon: '💰',
  },
];

export const INITIAL_PROFILE: CharacterProfile = {
  name: 'Aventureiro',
  characterClass: 'Cavaleiro Arcano',
  level: 1,
  currentXp: 0,
  hp: 100,
  maxHp: 100,
  mana: 80,
  maxMana: 100,
  gold: 50,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  attributes: {
    str: 10,
    int: 12,
    wis: 10,
    vit: 11,
    cha: 9,
  },
  totalQuestsCompleted: 0,
  totalGoldEarned: 50,
  badges: [],
};

// Helper to generate periodic doses for medication schedules
export function generateDoses(intervalHours: number, startHour = '08:00'): import('../types/rpg').MedicationDose[] {
  const [startH, startM] = startHour.split(':').map(Number);
  const count = Math.max(1, Math.min(6, Math.floor(24 / intervalHours)));
  const doses: import('../types/rpg').MedicationDose[] = [];

  for (let i = 0; i < count; i++) {
    const totalMinutes = (startH * 60 + startM + i * intervalHours * 60) % (24 * 60);
    const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const m = (totalMinutes % 60).toString().padStart(2, '0');
    const timeStr = `${h}:${m}`;
    const period = totalMinutes < 720 ? 'Manhã' : totalMinutes < 1080 ? 'Tarde' : 'Noite';

    doses.push({
      id: `dose-${Date.now()}-${i}`,
      time: timeStr,
      label: `${i + 1}ª Dose (${period})`,
      taken: false,
    });
  }
  return doses;
}

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest-med-1',
    title: 'Elixir de Cura: Antibiótico Alquímico',
    description: 'Receita médica de 7 dias com doses periódicas a cada 8 horas.',
    category: 'daily',
    difficulty: 'C',
    statAffinity: 'vit',
    xpReward: 60,
    goldReward: 40,
    completed: false,
    recurring: true,
    subtasks: [],
    medicationPlan: {
      isMedication: true,
      medicineName: 'Amoxicilina 500mg',
      dosage: '1 cápsula com bastante água',
      instructions: 'Tomar após as refeições para evitar irritação gástrica',
      intervalHours: 8,
      durationDays: 7,
      currentDay: 2,
      startDate: new Date().toISOString().split('T')[0],
      doses: [
        { id: 'dose-sample-1', time: '08:00', label: '1ª Dose (Manhã)', taken: true, takenAt: '08:05' },
        { id: 'dose-sample-2', time: '16:00', label: '2ª Dose (Tarde)', taken: false },
        { id: 'dose-sample-3', time: '00:00', label: '3ª Dose (Noite)', taken: false },
      ],
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'quest-1',
    title: 'Elixir da Vitalidade',
    description: 'Manter o corpo hidratado bebendo 2L de água pura.',
    category: 'daily',
    difficulty: 'E',
    statAffinity: 'vit',
    xpReward: 25,
    goldReward: 15,
    completed: false,
    recurring: true,
    subtasks: [
      { id: 'sub-1', text: '1L pela manhã', done: false },
      { id: 'sub-2', text: '1L pela tarde', done: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'quest-2',
    title: 'Treino de Força do Guerreiro',
    description: '30 a 45 minutos de exercícios físicos ou treino de combate.',
    category: 'daily',
    difficulty: 'C',
    statAffinity: 'str',
    xpReward: 45,
    goldReward: 30,
    completed: false,
    recurring: true,
    subtasks: [
      { id: 'sub-2-1', text: 'Alongamento e aquecimento', done: false },
      { id: 'sub-2-2', text: 'Sessão principal de exercícios', done: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'quest-3',
    title: 'Grimório do Saber',
    description: 'Dedicar 30 minutos de estudo concentrado ou leitura de livro.',
    category: 'daily',
    difficulty: 'D',
    statAffinity: 'int',
    xpReward: 35,
    goldReward: 20,
    completed: false,
    recurring: true,
    subtasks: [
      { id: 'sub-3-1', text: 'Leitura de 15 páginas ou aula técnica', done: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'quest-4',
    title: 'Fortificação do Santuário',
    description: 'Organizar a estação de batalha (mesa de trabalho e quarto limpo).',
    category: 'side',
    difficulty: 'E',
    statAffinity: 'wis',
    xpReward: 20,
    goldReward: 15,
    completed: false,
    recurring: false,
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'quest-5',
    title: 'O Chefão da Semana',
    description: 'Entregar o grande projeto pendente e zerar pendências urgentes.',
    category: 'boss',
    difficulty: 'A',
    statAffinity: 'int',
    xpReward: 150,
    goldReward: 100,
    completed: false,
    recurring: false,
    subtasks: [
      { id: 'sub-5-1', text: 'Esboço inicial e tarefas críticas', done: false },
      { id: 'sub-5-2', text: 'Revisão final sem distrações', done: false },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_REWARDS: ShopReward[] = [
  {
    id: 'rew-1',
    title: 'Pausa do Café Lendário',
    description: 'Aprecie um café especial ou cappuccino sem pressa.',
    cost: 20,
    icon: '☕',
    redeemedCount: 0,
    category: 'treat',
  },
  {
    id: 'rew-2',
    title: '1h de Videogame Livre',
    description: 'Uma hora de gameplay sem sentimento de culpa.',
    cost: 45,
    icon: '🎮',
    redeemedCount: 0,
    category: 'leisure',
  },
  {
    id: 'rew-3',
    title: 'Episódio de Série ou Anime',
    description: 'Assistir a um episódio de série para descansar a mente.',
    cost: 30,
    icon: '📺',
    redeemedCount: 0,
    category: 'leisure',
  },
  {
    id: 'rew-4',
    title: 'Banquete dos Campeões',
    description: 'Pedir sua comida favorita ou sobremesa especial.',
    cost: 110,
    icon: '🍕',
    redeemedCount: 0,
    category: 'treat',
  },
];

const STORAGE_KEY_PROFILE = 'questlog_rpg_profile';
const STORAGE_KEY_QUESTS = 'questlog_rpg_quests';
const STORAGE_KEY_REWARDS = 'questlog_rpg_rewards';
const STORAGE_KEY_HISTORY = 'questlog_rpg_history';

export interface QuestLogHistoryItem {
  id: string;
  questTitle: string;
  category: string;
  xpEarned: number;
  goldEarned: number;
  statAffinity: string;
  completedAt: string;
}

// Calculate XP required for next level
export function getRequiredXpForLevel(lvl: number): number {
  return Math.round(100 * Math.pow(1.35, lvl - 1));
}

export function checkAndApplyDayTransition(
  quests: Quest[],
  profile: CharacterProfile,
  targetDate?: string
): { updatedQuests: Quest[]; updatedProfile: CharacterProfile; hasDayChanged: boolean } {
  const today = targetDate || new Date().toISOString().split('T')[0];
  const lastDate = profile.lastActiveDate || today;

  if (lastDate === today) {
    return { updatedQuests: quests, updatedProfile: profile, hasDayChanged: false };
  }

  // Calculate days passed between last active day and today
  const last = new Date(lastDate);
  const curr = new Date(today);
  const diffDays = Math.max(1, Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24)));

  // Update streak: if 1 day passed, continue streak; if missed days, restart at 1
  let newStreak = profile.streak;
  if (diffDays === 1) {
    newStreak = (profile.streak || 1) + 1;
  } else if (diffDays > 1) {
    newStreak = 1;
  }

  const updatedProfile: CharacterProfile = {
    ...profile,
    streak: newStreak,
    lastActiveDate: today,
  };

  // Reset all daily quests, subtasks and medication schedules for the new day
  const updatedQuests = quests.map((q) => {
    const isDaily = q.category === 'daily' || q.recurring;

    if (isDaily) {
      let updatedMedPlan = q.medicationPlan;

      if (updatedMedPlan) {
        const nextDayNumber = updatedMedPlan.currentDay + diffDays;
        const isTreatmentDone =
          updatedMedPlan.durationDays && nextDayNumber > updatedMedPlan.durationDays;

        updatedMedPlan = {
          ...updatedMedPlan,
          currentDay: nextDayNumber,
          doses: updatedMedPlan.doses.map((d) => ({
            ...d,
            taken: false,
            takenAt: undefined,
          })),
        };

        return {
          ...q,
          completed: !!isTreatmentDone,
          completedAt: isTreatmentDone ? new Date().toISOString() : undefined,
          subtasks: q.subtasks.map((st) => ({ ...st, done: false })),
          medicationPlan: updatedMedPlan,
        };
      }

      return {
        ...q,
        completed: false,
        completedAt: undefined,
        subtasks: q.subtasks.map((st) => ({ ...st, done: false })),
      };
    }
    return q;
  });

  return {
    updatedQuests,
    updatedProfile,
    hasDayChanged: true,
  };
}

export function loadProfile(): CharacterProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) {
      const data = JSON.parse(raw);
      return { ...INITIAL_PROFILE, ...data };
    }
  } catch {
    // fallback
  }
  return INITIAL_PROFILE;
}

export function saveProfile(profile: CharacterProfile): void {
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
}

export function loadQuests(): Quest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUESTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return INITIAL_QUESTS;
}

export function saveQuests(quests: Quest[]): void {
  localStorage.setItem(STORAGE_KEY_QUESTS, JSON.stringify(quests));
}

export function loadRewards(): ShopReward[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REWARDS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_REWARDS;
}

export function saveRewards(rewards: ShopReward[]): void {
  localStorage.setItem(STORAGE_KEY_REWARDS, JSON.stringify(rewards));
}

export function loadHistory(): QuestLogHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function saveHistory(history: QuestLogHistoryItem[]): void {
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(0, 100)));
}
