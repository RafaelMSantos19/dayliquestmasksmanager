export type AttributeType = 'str' | 'int' | 'wis' | 'vit' | 'cha';

export type QuestCategory = 'daily' | 'main' | 'side' | 'boss';

export type QuestDifficulty = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface MedicationDose {
  id: string;
  time: string; // e.g. "08:00"
  label?: string; // e.g. "1ª Dose - Manhã"
  taken: boolean;
  takenAt?: string;
}

export interface MedicationPlan {
  isMedication: boolean;
  medicineName: string; // e.g. "Amoxicilina 500mg"
  dosage: string; // e.g. "1 comprimido"
  instructions?: string; // e.g. "Tomar após o café"
  intervalHours?: number; // e.g. 8 (de 8 em 8 horas)
  doses: MedicationDose[];
  durationDays?: number; // e.g. 7 (Tratamento de 7 dias) ou undefined para contínuo
  currentDay: number; // e.g. 1
  startDate: string; // YYYY-MM-DD
}

export interface Quest {
  id: string;
  title: string;
  description?: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  statAffinity: AttributeType;
  xpReward: number;
  goldReward: number;
  completed: boolean;
  completedAt?: string;
  dueDate?: string;
  recurring: boolean; // Daily auto-reset
  subtasks: Subtask[];
  medicationPlan?: MedicationPlan;
  createdAt: string;
}

export interface CharacterAttributes {
  str: number; // Força (Treinos, Corpo, Atividade)
  int: number; // Inteligência (Trabalho, Estudo, Livros)
  wis: number; // Sabedoria (Meditação, Foco, Disciplina)
  vit: number; // Vitalidade (Sono, Água, Alimentação)
  cha: number; // Carisma (Comunicação, Social, Empatia)
}

export interface CharacterBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface CharacterProfile {
  name: string;
  characterClass: string;
  level: number;
  currentXp: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  gold: number;
  streak: number;
  lastActiveDate: string;
  attributes: CharacterAttributes;
  totalQuestsCompleted: number;
  totalGoldEarned: number;
  badges: string[]; // Badge IDs
}

export interface ShopReward {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
  redeemedCount: number;
  category: 'leisure' | 'treat' | 'break' | 'custom';
}
