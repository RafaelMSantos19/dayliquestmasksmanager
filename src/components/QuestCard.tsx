import React, { useState } from 'react';
import { AttributeType, Quest, QuestCategory, QuestDifficulty } from '../types/rpg';
import { Check, CheckCircle2, ChevronDown, ChevronUp, Trash2, Zap, Repeat, Pill, Clock, Calendar, AlertCircle, Heart } from 'lucide-react';
import { sound } from '../utils/audio';

interface Props {
  quest: Quest;
  onComplete: (questId: string) => void;
  onToggleSubtask: (questId: string, subtaskId: string) => void;
  onTakeMedicationDose?: (questId: string, doseId: string) => void;
  onDelete: (questId: string) => void;
}

const CATEGORY_LABELS: Record<QuestCategory, { label: string; icon: string }> = {
  daily: { label: 'Diária', icon: '⚡' },
  main: { label: 'Principal', icon: '⚔️' },
  side: { label: 'Secundária', icon: '📜' },
  boss: { label: 'Chefe', icon: '👑' },
};

const STAT_LABELS: Record<AttributeType, { name: string; tag: string; color: string }> = {
  str: { name: 'Força', tag: 'FOR', color: 'text-red-400 border-red-500/50' },
  int: { name: 'Inteligência', tag: 'INT', color: 'text-sky-400 border-sky-500/50' },
  wis: { name: 'Sabedoria', tag: 'SAB', color: 'text-teal-400 border-teal-500/50' },
  vit: { name: 'Vitalidade', tag: 'VIT', color: 'text-emerald-400 border-emerald-500/50' },
  cha: { name: 'Carisma', tag: 'CAR', color: 'text-pink-400 border-pink-500/50' },
};

const DIFFICULTY_COLORS: Record<QuestDifficulty, string> = {
  E: 'text-slate-300 border-slate-600 bg-slate-900/60',
  D: 'text-green-300 border-green-600 bg-green-950/40',
  C: 'text-blue-300 border-blue-600 bg-blue-950/40',
  B: 'text-purple-300 border-purple-500 bg-purple-950/50',
  A: 'text-amber-300 border-amber-500 bg-amber-950/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]',
  S: 'text-rose-300 border-rose-500 bg-rose-950/60 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
};

export const QuestCard: React.FC<Props> = ({
  quest,
  onComplete,
  onToggleSubtask,
  onTakeMedicationDose,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const statInfo = STAT_LABELS[quest.statAffinity];
  const catInfo = CATEGORY_LABELS[quest.category];

  const totalSubtasks = quest.subtasks.length;
  const doneSubtasks = quest.subtasks.filter((s) => s.done).length;

  const medPlan = quest.medicationPlan;
  const totalDoses = medPlan?.doses.length || 0;
  const takenDoses = medPlan?.doses.filter((d) => d.taken).length || 0;
  const nextPendingDose = medPlan?.doses.find((d) => !d.taken);

  // Check if current hour is past the next dose
  const isDoseDue = (() => {
    if (!nextPendingDose) return false;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const [h, m] = nextPendingDose.time.split(':').map(Number);
    const targetMins = h * 60 + m;
    return currentMins >= targetMins;
  })();

  return (
    <div
      className={`relative rounded-xl border transition-all duration-200 overflow-hidden ${
        quest.completed
          ? 'bg-black/90 border-purple-950/70 opacity-60'
          : medPlan
          ? 'bg-gradient-to-b from-[#130722] via-[#080212] to-black border-purple-500/90 shadow-[0_0_18px_rgba(168,85,247,0.25)]'
          : quest.category === 'boss'
          ? 'bg-gradient-to-b from-[#140523] to-[#07020d] border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.3)]'
          : 'bg-[#080311] border-purple-600/70 hover:border-purple-400 shadow-[0_2px_14px_rgba(147,51,234,0.15)]'
      }`}
    >
      {/* Top Banner with subtle purple line */}
      <div className="p-3 sm:p-3.5 space-y-2">
        <div className="flex items-start justify-between gap-2.5">
          {/* Completion Checkmark Button */}
          <button
            onClick={() => {
              if (medPlan) {
                sound.playPotion();
              } else {
                sound.playClick();
              }
              onComplete(quest.id);
            }}
            aria-label={quest.completed ? 'Reabrir missão' : 'Completar missão'}
            className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition active:scale-90 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
              quest.completed
                ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                : 'border-purple-500/80 bg-black/60 hover:border-purple-300 text-transparent hover:text-purple-400'
            }`}
          >
            <Check className={`w-3.5 h-3.5 stroke-[3] ${quest.completed ? 'block' : 'opacity-0 hover:opacity-100'}`} />
          </button>

          {/* Title & Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] mb-1">
              {medPlan ? (
                <span className="font-rpg font-semibold text-pink-300 flex items-center gap-1">
                  <span>🧪</span> Prescrição Alquímica
                </span>
              ) : (
                <span className="font-rpg font-semibold text-purple-300 flex items-center gap-1">
                  <span>{catInfo.icon}</span> {catInfo.label}
                </span>
              )}

              <span className="text-purple-600">·</span>
              <span className={`px-1.5 py-0.2 rounded border text-[10px] font-mono font-bold ${DIFFICULTY_COLORS[quest.difficulty]}`}>
                Rank {quest.difficulty}
              </span>

              {medPlan?.intervalHours && (
                <>
                  <span className="text-purple-600">·</span>
                  <span className="text-[10px] text-purple-300 font-mono">
                    {medPlan.intervalHours === 24 ? '1x/dia' : `${medPlan.intervalHours}h em ${medPlan.intervalHours}h`}
                  </span>
                </>
              )}

              {quest.recurring && !medPlan && (
                <>
                  <span className="text-purple-600">·</span>
                  <span className="text-[10px] text-purple-300/80 flex items-center gap-0.5" title="Reseta diariamente">
                    <Repeat className="w-2.5 h-2.5 text-purple-400 inline" /> Diária
                  </span>
                </>
              )}
            </div>

            <h3
              className={`font-semibold text-sm leading-snug tracking-wide flex items-center gap-1.5 ${
                quest.completed ? 'line-through text-slate-400' : 'text-white'
              }`}
            >
              {medPlan && <Pill className="w-3.5 h-3.5 text-purple-400 shrink-0 inline" />}
              <span>{quest.title}</span>
            </h3>

            {quest.description && (
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed line-clamp-2">
                {quest.description}
              </p>
            )}
          </div>

          {/* Actions: Dedicated Concluir button for daily quests + Trash icon */}
          <div className="flex items-center gap-1.5 shrink-0">
            {(quest.category === 'daily' || quest.recurring) && (
              <button
                type="button"
                onClick={() => {
                  if (quest.medicationPlan) {
                    sound.playPotion();
                  } else {
                    sound.playClick();
                  }
                  onComplete(quest.id);
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition active:scale-95 ${
                  quest.completed
                    ? 'bg-purple-950/70 border-purple-600/80 text-purple-300'
                    : 'bg-gradient-to-r from-purple-800 to-purple-600 border-purple-400 hover:border-purple-300 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                }`}
                title={quest.completed ? 'Reabrir missão diária' : 'Concluir missão diária'}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{quest.completed ? 'Concluída' : 'Concluir'}</span>
              </button>
            )}

            {/* Delete Action */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onDelete(quest.id);
              }}
              aria-label="Excluir Missão"
              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg border border-transparent hover:border-rose-900/60 hover:bg-rose-950/20 transition"
              title="Excluir missão"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MEDICATION DOSES SECTION */}
        {medPlan && totalDoses > 0 && (
          <div className="pt-2 pb-1 space-y-2 border-t border-purple-900/60">
            {/* Header info: dosage & treatment days */}
            <div className="flex items-center justify-between text-[11px] text-purple-300 flex-wrap gap-1">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="font-semibold text-white">Dose:</span> {medPlan.dosage}
              </span>
              {medPlan.durationDays ? (
                <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-700 text-[10px] text-purple-200 font-mono">
                  Dia {medPlan.currentDay} de {medPlan.durationDays}
                </span>
              ) : (
                <span className="text-[10px] text-purple-400 font-mono">Uso Diário Contínuo</span>
              )}
            </div>

            {medPlan.instructions && (
              <p className="text-[11px] text-slate-400 italic">
                ℹ️ {medPlan.instructions}
              </p>
            )}

            {/* Dose Tracker Pills */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-purple-300">
                  Doses de hoje: <strong className="text-white font-mono">{takenDoses}/{totalDoses}</strong>
                </span>

                {isDoseDue && nextPendingDose && (
                  <span className="text-[10px] text-amber-300 font-semibold animate-pulse flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-400" /> Hora da dose ({nextPendingDose.time})
                  </span>
                )}
              </div>

              {/* Individual Doses Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                {medPlan.doses.map((dose) => {
                  const isCurrentPending = !dose.taken && nextPendingDose?.id === dose.id;

                  return (
                    <button
                      key={dose.id}
                      type="button"
                      onClick={() => {
                        sound.playPotion();
                        onTakeMedicationDose?.(quest.id, dose.id);
                      }}
                      className={`py-2 px-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 active:scale-95 ${
                        dose.taken
                          ? 'bg-purple-950/40 border-purple-800 text-slate-400'
                          : isCurrentPending
                          ? 'bg-gradient-to-r from-purple-900 to-purple-800 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                          : 'bg-black/70 border-purple-900/60 text-slate-300 hover:border-purple-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 font-mono font-bold text-xs">
                          <Clock className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className={dose.taken ? 'line-through text-slate-400' : 'text-white'}>
                            {dose.time}
                          </span>
                        </div>
                        <span className="text-[10px] text-purple-300/80 block truncate">
                          {dose.label || 'Dose'}
                        </span>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                          dose.taken
                            ? 'bg-emerald-600 border-emerald-400 text-white'
                            : isCurrentPending
                            ? 'border-purple-300 bg-purple-700 text-white animate-pulse'
                            : 'border-purple-800 bg-black text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Standard Subtasks summary bar if any */}
        {!medPlan && totalSubtasks > 0 && (
          <div className="pt-1">
            <button
              onClick={() => {
                sound.playClick();
                setExpanded(!expanded);
              }}
              className="flex items-center justify-between w-full text-[11px] text-purple-300/90 hover:text-purple-200 py-0.5"
            >
              <span className="flex items-center gap-1">
                <span>Objetivos:</span>
                <strong className="text-white font-mono">{doneSubtasks}/{totalSubtasks}</strong>
              </span>
              <span className="flex items-center gap-0.5 text-[10px]">
                {expanded ? (
                  <>Ocultar <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>Ver passos <ChevronDown className="w-3 h-3" /></>
                )}
              </span>
            </button>

            {/* Subtask mini progress bar */}
            <div className="w-full h-1 bg-black rounded-full overflow-hidden border border-purple-900/60 mt-1">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${(doneSubtasks / totalSubtasks) * 100}%` }}
              />
            </div>

            {/* Expanded Subtasks List */}
            {expanded && (
              <div className="mt-2 space-y-1.5 pl-1 border-l-2 border-purple-800/80 my-1">
                {quest.subtasks.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => {
                      sound.playClick();
                      onToggleSubtask(quest.id, st.id);
                    }}
                    className="flex items-center gap-2 text-xs py-1 px-1.5 rounded cursor-pointer hover:bg-purple-950/40 transition"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        st.done
                          ? 'bg-purple-600 border-purple-400 text-white'
                          : 'border-purple-700 bg-black/60 text-transparent'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className={`text-xs ${st.done ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                      {st.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer: Rewards & Affinity */}
        <div className="pt-2 border-t border-purple-900/50 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {/* XP Reward */}
            <span className="flex items-center gap-1 text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/70">
              <Zap className="w-3 h-3 text-purple-400 fill-purple-400" />
              <span>+{quest.xpReward} XP</span>
            </span>

            {/* Gold Reward */}
            <span className="flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-800/60">
              <span>💰</span>
              <span>+{quest.goldReward} Ouro</span>
            </span>
          </div>

          {/* Stat Affinity */}
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${statInfo.color}`}>
            +{statInfo.tag}
          </span>
        </div>
      </div>
    </div>
  );
};
