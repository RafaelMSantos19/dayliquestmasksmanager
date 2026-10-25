import React, { useState } from 'react';
import { AttributeType, MedicationPlan, Quest, QuestCategory, QuestDifficulty, Subtask } from '../types/rpg';
import { generateDoses } from '../utils/storage';
import { X, Plus, Sparkles, Shield, Sword, Heart, Zap, Trash2, Pill, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (quest: Omit<Quest, 'id' | 'createdAt' | 'completed'>) => void;
}

const HABIT_PRESETS = [
  { title: 'Treino de Força e Mobilidade', cat: 'daily' as QuestCategory, diff: 'C' as QuestDifficulty, stat: 'str' as AttributeType },
  { title: 'Estudo Focado ou Leitura 30min', cat: 'daily' as QuestCategory, diff: 'D' as QuestDifficulty, stat: 'int' as AttributeType },
  { title: 'Hidratação Épica (2L de Água)', cat: 'daily' as QuestCategory, diff: 'E' as QuestDifficulty, stat: 'vit' as AttributeType },
  { title: 'Meditação ou Reflexão Diária', cat: 'daily' as QuestCategory, diff: 'E' as QuestDifficulty, stat: 'wis' as AttributeType },
  { title: 'Conexão Real (Falar com Família)', cat: 'side' as QuestCategory, diff: 'D' as QuestDifficulty, stat: 'cha' as AttributeType },
  { title: 'O Grande Desafio da Semana', cat: 'boss' as QuestCategory, diff: 'A' as QuestDifficulty, stat: 'int' as AttributeType },
];

const MEDICATION_PRESETS = [
  {
    name: 'Antibiótico Alquímico',
    med: 'Amoxicilina 500mg',
    dosage: '1 cápsula com água',
    instructions: 'Tomar após as refeições',
    interval: 8,
    duration: 7,
  },
  {
    name: 'Anti-inflamatório Rúnico',
    med: 'Ibuprofeno 600mg',
    dosage: '1 comprimido',
    instructions: 'Não tomar em jejum',
    interval: 12,
    duration: 5,
  },
  {
    name: 'Elixir de Vitaminas Diárias',
    med: 'Multivitamínico Mineral',
    dosage: '1 dose',
    instructions: 'Pela manhã com o café',
    interval: 24,
    duration: 0, // contínuo
  },
  {
    name: 'Poção Analgésica (6 em 6h)',
    med: 'Dipirona 500mg',
    dosage: '1 comprimido ou 20 gotas',
    instructions: 'Se houver dor ou febre',
    interval: 6,
    duration: 3,
  },
];

const DIFFICULTY_REWARDS: Record<QuestDifficulty, { xp: number; gold: number; label: string }> = {
  E: { xp: 20, gold: 12, label: 'Rank E (Fácil)' },
  D: { xp: 35, gold: 20, label: 'Rank D (Normal)' },
  C: { xp: 55, gold: 35, label: 'Rank C (Média)' },
  B: { xp: 85, gold: 60, label: 'Rank B (Desafiadora)' },
  A: { xp: 140, gold: 100, label: 'Rank A (Difícil / Chefe)' },
  S: { xp: 280, gold: 200, label: 'Rank S (Lendária / Épica)' },
};

export const CreateQuestModal: React.FC<Props> = ({ isOpen, onClose, onCreate }) => {
  const [questType, setQuestType] = useState<'quest' | 'medication'>('quest');

  // Standard Quest State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('daily');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('D');
  const [statAffinity, setStatAffinity] = useState<AttributeType>('str');
  const [recurring, setRecurring] = useState(true);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  // Medication / Prescription State
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('1 comprimido');
  const [medInstructions, setMedInstructions] = useState('Tomar com água após refeição');
  const [intervalHours, setIntervalHours] = useState(8);
  const [startTime, setStartTime] = useState('08:00');
  const [durationDays, setDurationDays] = useState(7); // 0 = contínuo

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([...subtasks, subtaskInput.trim()]);
    setSubtaskInput('');
    sound.playClick();
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
    sound.playClick();
  };

  const applyHabitPreset = (preset: typeof HABIT_PRESETS[0]) => {
    setTitle(preset.title);
    setCategory(preset.cat);
    setDifficulty(preset.diff);
    setStatAffinity(preset.stat);
    setRecurring(preset.cat === 'daily');
    sound.playClick();
  };

  const applyMedicationPreset = (preset: typeof MEDICATION_PRESETS[0]) => {
    setTitle(`Tratamento: ${preset.med}`);
    setMedName(preset.med);
    setMedDosage(preset.dosage);
    setMedInstructions(preset.instructions);
    setIntervalHours(preset.interval);
    setDurationDays(preset.duration);
    setDifficulty(preset.interval <= 8 ? 'C' : 'D');
    setStatAffinity('vit');
    sound.playPotion();
  };

  // Live preview of doses
  const previewDoses = generateDoses(intervalHours, startTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (questType === 'medication') {
      const finalTitle = title.trim() || `Prescrição: ${medName.trim() || 'Medicação Periódica'}`;
      const doses = generateDoses(intervalHours, startTime);

      const medPlan: MedicationPlan = {
        isMedication: true,
        medicineName: medName.trim() || 'Remédio / Prescrição',
        dosage: medDosage.trim() || '1 dose',
        instructions: medInstructions.trim() || undefined,
        intervalHours,
        durationDays: durationDays > 0 ? durationDays : undefined,
        currentDay: 1,
        startDate: new Date().toISOString().split('T')[0],
        doses,
      };

      const rewards = DIFFICULTY_REWARDS[difficulty];

      onCreate({
        title: finalTitle,
        description: `Receita médica (${intervalHours === 24 ? '1x ao dia' : `a cada ${intervalHours}h`}${durationDays > 0 ? ` · ${durationDays} dias` : ' · Uso Contínuo'}) - ${medDosage}`,
        category: 'daily',
        difficulty,
        statAffinity: 'vit', // Vitalidade
        xpReward: rewards.xp + 15, // Bonus XP for consistency
        goldReward: rewards.gold + 10,
        recurring: true,
        subtasks: [],
        medicationPlan: medPlan,
      });

      sound.playPotion();
    } else {
      if (!title.trim()) return;

      const rewards = DIFFICULTY_REWARDS[difficulty];
      const createdSubtasks: Subtask[] = subtasks.map((st, i) => ({
        id: `st-${Date.now()}-${i}`,
        text: st,
        done: false,
      }));

      onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        difficulty,
        statAffinity,
        xpReward: rewards.xp,
        goldReward: rewards.gold,
        recurring: category === 'daily' ? recurring : false,
        subtasks: createdSubtasks,
      });

      sound.playCoin();
    }

    // Reset form
    setTitle('');
    setDescription('');
    setMedName('');
    setSubtasks([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#080210] border-t-2 sm:border-2 border-purple-500/80 p-5 shadow-[0_0_35px_rgba(168,85,247,0.35)] text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/60 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{questType === 'medication' ? '🧪' : '📜'}</span>
            <div>
              <h2 className="font-rpg font-bold text-base sm:text-lg text-white">
                {questType === 'medication' ? 'Prescrever Poção / Remédio' : 'Forjar Nova Missão'}
              </h2>
              <p className="text-xs text-purple-300">
                {questType === 'medication'
                  ? 'Configure doses periódicas e receitas médicas'
                  : 'Defina os objetivos e recompensas da sua jornada'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg border border-purple-800 text-purple-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quest Type Switcher */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl bg-black border border-purple-900/80">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setQuestType('quest');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              questType === 'quest'
                ? 'bg-purple-900 border border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                : 'text-purple-300/80 hover:text-white'
            }`}
          >
            <Sword className="w-3.5 h-3.5" />
            <span>Missão Padrão</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPotion();
              setQuestType('medication');
              setStatAffinity('vit');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              questType === 'medication'
                ? 'bg-purple-900 border border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                : 'text-purple-300/80 hover:text-white'
            }`}
          >
            <Pill className="w-3.5 h-3.5 text-pink-400" />
            <span>Remédio / Prescrição</span>
          </button>
        </div>

        {/* FORM FOR MEDICATION / REMÉDIO */}
        {questType === 'medication' ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Quick Presets for Medication */}
            <div>
              <p className="text-xs font-semibold text-purple-300 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Receitas & Modelos Rápidos:
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                {MEDICATION_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyMedicationPreset(p)}
                    className="shrink-0 px-2.5 py-1.5 rounded-lg border border-purple-800/80 bg-purple-950/40 hover:bg-purple-900/60 hover:border-purple-400 text-[11px] text-purple-200 transition text-left active:scale-95"
                  >
                    <span className="block font-medium text-white">{p.name}</span>
                    <span className="text-[10px] text-purple-400">
                      {p.interval === 24 ? '1x/dia' : `${p.interval}h em ${p.interval}h`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Medicine Name */}
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1">
                Nome do Medicamento ou Tratamento *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Amoxicilina 500mg, Dipirona, Losartana, Vitamina D..."
                value={medName}
                onChange={(e) => {
                  setMedName(e.target.value);
                  if (!title) setTitle(`Tratamento: ${e.target.value}`);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-black border border-purple-700/80 focus:border-purple-400 focus:outline-none text-white text-sm placeholder-slate-500 shadow-inner"
              />
            </div>

            {/* Dosage & Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-purple-200 mb-1">
                  Dosagem / Quantidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1 comprimido, 20 gotas, 1 cápsula..."
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-purple-700/80 focus:border-purple-400 focus:outline-none text-white text-xs placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-purple-200 mb-1">
                  Orientações Médicas
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tomar após as refeições, em jejum..."
                  value={medInstructions}
                  onChange={(e) => setMedInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-purple-700/80 focus:border-purple-400 focus:outline-none text-white text-xs placeholder-slate-500"
                />
              </div>
            </div>

            {/* Interval Selector */}
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Intervalo entre as doses:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {[
                  { hours: 4, label: '4 em 4h', sub: '6x / dia' },
                  { hours: 6, label: '6 em 6h', sub: '4x / dia' },
                  { hours: 8, label: '8 em 8h', sub: '3x / dia' },
                  { hours: 12, label: '12 em 12h', sub: '2x / dia' },
                  { hours: 24, label: '1x ao dia', sub: '24h' },
                ].map((item) => (
                  <button
                    key={item.hours}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIntervalHours(item.hours);
                    }}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                      intervalHours === item.hours
                        ? 'bg-purple-900 border-purple-400 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                        : 'bg-black/80 border-purple-900/60 text-slate-300 hover:border-purple-700'
                    }`}
                  >
                    <span className="text-xs">{item.label}</span>
                    <span className="text-[10px] text-purple-400">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Time & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-purple-200 mb-1">
                  Horário da 1ª dose do dia
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-purple-700/80 focus:border-purple-400 focus:outline-none text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-purple-200 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-purple-400" /> Duração do Tratamento
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-purple-700/80 focus:border-purple-400 focus:outline-none text-white text-xs"
                >
                  <option value={3}>3 dias (Receita curta)</option>
                  <option value={5}>5 dias</option>
                  <option value={7}>7 dias (Padrão antibiótico)</option>
                  <option value={10}>10 dias</option>
                  <option value={14}>14 dias (2 semanas)</option>
                  <option value={30}>30 dias (1 mês)</option>
                  <option value={0}>Uso Contínuo (Sem data de término)</option>
                </select>
              </div>
            </div>

            {/* Live Doses Schedule Preview */}
            <div className="p-3 rounded-xl bg-black/90 border border-purple-800/80 space-y-1.5">
              <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Cronograma Diário Gerado ({previewDoses.length} {previewDoses.length === 1 ? 'dose' : 'doses'}):
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {previewDoses.map((dose, idx) => (
                  <div
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-600/70 text-xs font-mono text-purple-200 flex items-center gap-1.5 shadow-sm"
                  >
                    <span>💊</span>
                    <strong className="text-white">{dose.time}</strong>
                    <span className="text-[10px] text-purple-300">({dose.label?.split(' ')[1] || `Dose ${idx + 1}`})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Medication */}
            <div className="pt-1">
              <button
                type="submit"
                className="w-full py-3 rounded-xl border border-purple-400 bg-gradient-to-r from-purple-800 via-fuchsia-700 to-purple-800 text-white font-rpg font-bold text-sm tracking-wider hover:brightness-110 active:scale-98 transition shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2"
              >
                <span>🧪</span>
                <span>Registrar Prescrição de Remédio (+Vitalidade)</span>
              </button>
            </div>
          </form>
        ) : (
          /* STANDARD QUEST FORM */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Quick Presets Carousel */}
            <div>
              <p className="text-xs font-semibold text-purple-300 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Modelos Rápidos de Hábitos:
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                {HABIT_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyHabitPreset(p)}
                    className="shrink-0 px-2.5 py-1.5 rounded-lg border border-purple-800/80 bg-purple-950/40 hover:bg-purple-900/60 hover:border-purple-400 text-[11px] text-purple-200 transition text-left active:scale-95"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1">
                Nome da Missão *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Treino de Força, Estudar 30min, Terminar Relatório..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black border border-purple-700/80 focus:border-purple-400 focus:outline-none text-white text-sm placeholder-slate-500 shadow-inner"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1">
                Descrição ou Lore (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Detalhes ou motivação heroica..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-purple-700/80 focus:border-purple-400 focus:outline-none text-white text-xs placeholder-slate-500 resize-none"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1">
                Tipo de Missão
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'daily', label: 'Diária', icon: '⚡' },
                    { id: 'main', label: 'Principal', icon: '⚔️' },
                    { id: 'side', label: 'Secundária', icon: '📜' },
                    { id: 'boss', label: 'Chefe', icon: '👑' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCategory(cat.id);
                      if (cat.id === 'daily') setRecurring(true);
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      category === cat.id
                        ? 'bg-purple-900 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                        : 'bg-black/80 border-purple-900/60 text-slate-300 hover:border-purple-700'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="font-semibold text-[11px]">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rank / Difficulty */}
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1">
                Dificuldade & Recompensa
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {(['E', 'D', 'C', 'B', 'A', 'S'] as QuestDifficulty[]).map((diff) => {
                  const info = DIFFICULTY_REWARDS[diff];
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setDifficulty(diff);
                      }}
                      className={`py-2 px-1 rounded-xl border text-center transition ${
                        difficulty === diff
                          ? 'bg-purple-900 border-purple-400 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                          : 'bg-black/80 border-purple-900/60 text-slate-300 hover:border-purple-700'
                      }`}
                    >
                      <div className="font-mono text-sm">Rank {diff}</div>
                      <div className="text-[9px] text-purple-300">+{info.xp}XP</div>
                      <div className="text-[9px] text-amber-300">+{info.gold}G</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Attribute Affinity */}
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1">
                Atributo Evoluído (+1 Ponto de Atributo)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {(
                  [
                    { id: 'str', label: 'Força (Corpo)', icon: '⚔️' },
                    { id: 'int', label: 'Inteligência (Mente)', icon: '🔮' },
                    { id: 'wis', label: 'Sabedoria (Foco)', icon: '🧘' },
                    { id: 'vit', label: 'Vitalidade (Saúde)', icon: '🧪' },
                    { id: 'cha', label: 'Carisma (Social)', icon: '🤝' },
                  ] as const
                ).map((att) => (
                  <button
                    key={att.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setStatAffinity(att.id);
                    }}
                    className={`py-1.5 px-2 rounded-xl border text-center transition flex items-center justify-center gap-1.5 ${
                      statAffinity === att.id
                        ? 'bg-purple-900 border-purple-400 text-white font-semibold shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                        : 'bg-black/80 border-purple-900/60 text-slate-300 hover:border-purple-700'
                    }`}
                  >
                    <span>{att.icon}</span>
                    <span className="text-[11px] truncate">{att.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtasks Builder */}
            <div>
              <label className="block text-xs font-medium text-purple-200 mb-1">
                Sub-Objetivos / Passos (Opcional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Ex: Aquecimento, 15 repetições..."
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-black border border-purple-800 focus:border-purple-400 focus:outline-none text-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-1.5 rounded-lg border border-purple-700 bg-purple-950/60 hover:bg-purple-900 text-purple-200 hover:text-white transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>

              {subtasks.length > 0 && (
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {subtasks.map((st, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-black border border-purple-900/60 text-xs text-slate-200"
                    >
                      <span>• {st}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(idx)}
                        className="text-slate-500 hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Standard */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl border border-purple-400 bg-gradient-to-r from-purple-800 via-purple-600 to-purple-800 text-white font-rpg font-bold text-sm tracking-wider hover:brightness-110 active:scale-98 transition shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              >
                ⚔️ Forjar Missão (+{DIFFICULTY_REWARDS[difficulty].xp} XP / +{DIFFICULTY_REWARDS[difficulty].gold} Ouro)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
