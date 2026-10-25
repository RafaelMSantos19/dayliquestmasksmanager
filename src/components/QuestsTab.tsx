import React, { useState } from 'react';
import { Quest, QuestCategory } from '../types/rpg';
import { QuestCard } from './QuestCard';
import { Plus, Search, Sparkles, CheckCheck, Trophy, RotateCcw, Calendar, Zap, Trash2, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';

interface Props {
  quests: Quest[];
  onCompleteQuest: (questId: string) => void;
  onToggleSubtask: (questId: string, subtaskId: string) => void;
  onTakeMedicationDose: (questId: string, doseId: string) => void;
  onDeleteQuest: (questId: string) => void;
  onOpenCreate: () => void;
}

type FilterCategory = 'all' | QuestCategory | 'medication';
type ViewMode = 'active' | 'completed';

export const QuestsTab: React.FC<Props> = ({
  quests,
  onCompleteQuest,
  onToggleSubtask,
  onTakeMedicationDose,
  onDeleteQuest,
  onOpenCreate,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [filterCat, setFilterCat] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed);

  // Filter based on active vs completed view mode
  const currentList = viewMode === 'active' ? pendingQuests : completedQuests;

  const filteredQuests = currentList.filter((q) => {
    if (filterCat === 'medication') {
      if (!q.medicationPlan) return false;
    } else if (filterCat !== 'all' && q.category !== filterCat) {
      return false;
    }

    if (searchQuery.trim()) {
      const qText = searchQuery.toLowerCase();
      const matchTitle = q.title.toLowerCase().includes(qText);
      const matchDesc = q.description?.toLowerCase().includes(qText) ?? false;
      const matchMed = q.medicationPlan?.medicineName?.toLowerCase().includes(qText) ?? false;
      return matchTitle || matchDesc || matchMed;
    }
    return true;
  });

  return (
    <div className="space-y-3 pb-24 animate-in fade-in duration-200">
      {/* Top Main View Mode Switcher: Ativas vs Finalizadas */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black border border-purple-800/80 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setViewMode('active');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 ${
            viewMode === 'active'
              ? 'bg-purple-900 border border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
              : 'text-purple-300/80 hover:text-white'
          }`}
        >
          <span>⚔️</span>
          <span>Missões Ativas</span>
          <span className="px-1.5 py-0.2 rounded-full bg-purple-950 border border-purple-700 text-[10px] font-mono font-bold text-purple-200">
            {pendingQuests.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setViewMode('completed');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 ${
            viewMode === 'completed'
              ? 'bg-purple-900 border border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
              : 'text-purple-300/80 hover:text-white'
          }`}
        >
          <span>🏆</span>
          <span>Finalizadas</span>
          <span className="px-1.5 py-0.2 rounded-full bg-purple-950 border border-purple-700 text-[10px] font-mono font-bold text-amber-300">
            {completedQuests.length}
          </span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
        <input
          type="text"
          placeholder={viewMode === 'active' ? 'Buscar missões ativas...' : 'Buscar missões finalizadas...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black border border-purple-800/80 focus:border-purple-400 focus:outline-none text-xs text-white placeholder-slate-500 shadow-inner"
        />
      </div>

      {/* Category Segmented Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { id: 'all', label: 'Todas' },
            { id: 'daily', label: 'Diárias' },
            { id: 'medication', label: 'Remédios 🧪' },
            { id: 'main', label: 'Principais' },
            { id: 'side', label: 'Secundárias' },
            { id: 'boss', label: 'Chefes' },
          ] as const
        ).map((tab) => {
          const count =
            tab.id === 'all'
              ? currentList.length
              : tab.id === 'medication'
              ? currentList.filter((q) => q.medicationPlan).length
              : currentList.filter((q) => q.category === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setFilterCat(tab.id);
              }}
              className={`shrink-0 px-3 py-1.5 rounded-xl border text-xs transition active:scale-95 flex items-center gap-1.5 ${
                filterCat === tab.id
                  ? 'bg-purple-950/80 border-purple-400 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                  : 'bg-black/80 border-purple-900/60 text-purple-300/80 hover:border-purple-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono text-purple-400">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Header Info Bar */}
      <div className="flex items-center justify-between text-[11px] text-purple-300 px-1">
        <span>
          {viewMode === 'active' ? (
            <>
              Em aberto: <strong className="text-white font-mono">{pendingQuests.length}</strong> missões a cumprir
            </>
          ) : (
            <>
              Histórico: <strong className="text-amber-300 font-mono">{completedQuests.length}</strong> missões concluídas com vitória
            </>
          )}
        </span>

        {viewMode === 'active' && pendingQuests.length === 0 && quests.length > 0 && (
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCheck className="w-3.5 h-3.5" /> Todas finalizadas!
          </span>
        )}
      </div>

      {/* Quests List */}
      {filteredQuests.length === 0 ? (
        <div className="rounded-2xl bg-black border border-purple-900/70 p-8 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-950/80 border border-purple-600 flex items-center justify-center text-2xl">
            {viewMode === 'completed' ? '🏆' : filterCat === 'medication' ? '🧪' : '⚔️'}
          </div>
          <div>
            <h3 className="font-rpg font-bold text-white text-sm">
              {viewMode === 'completed'
                ? 'Nenhuma missão finalizada encontrada'
                : filterCat === 'medication'
                ? 'Nenhuma prescrição pendente'
                : 'Nenhuma missão ativa'}
            </h3>
            <p className="text-xs text-purple-300 mt-1 max-w-xs mx-auto">
              {viewMode === 'completed'
                ? 'Conclua suas missões pelo checkbox ou pelo botão Concluir para arquivá-las nesta aba de histórico!'
                : filterCat === 'medication'
                ? 'Todas as doses e remédios foram tomados ou não há prescrições ativas.'
                : 'Você cumpriu todas as missões deste filtro ou ainda não forjou novas quests!'}
            </p>
          </div>

          {viewMode === 'active' && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenCreate();
              }}
              className="px-4 py-2 rounded-xl border border-purple-400 bg-purple-700 hover:bg-purple-600 text-white font-rpg font-bold text-xs tracking-wide shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95 transition"
            >
              + {filterCat === 'medication' ? 'Cadastrar Remédio' : 'Criar Nova Missão'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredQuests.map((quest) => (
            <div key={quest.id} className="relative flex flex-col justify-between">
              <QuestCard
                quest={quest}
                onComplete={onCompleteQuest}
                onToggleSubtask={onToggleSubtask}
                onTakeMedicationDose={onTakeMedicationDose}
                onDelete={onDeleteQuest}
              />

              {/* Extra helper in Completed tab: 1-tap restore / reopen button */}
              {viewMode === 'completed' && (
                <div className="mt-1 px-2 flex items-center justify-between text-[11px] text-purple-400">
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    <span>Concluída com êxito!</span>
                    {quest.completedAt && (
                      <span className="text-slate-500">
                        ({new Date(quest.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    )}
                  </span>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onCompleteQuest(quest.id);
                    }}
                    className="text-[11px] text-purple-300 hover:text-white flex items-center gap-1 underline underline-offset-2 decoration-purple-600 transition"
                  >
                    <RotateCcw className="w-3 h-3" /> Reabrir Missão
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
