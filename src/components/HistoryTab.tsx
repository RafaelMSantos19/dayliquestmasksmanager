import React from 'react';
import { QuestLogHistoryItem } from '../utils/storage';
import { Scroll, Zap, Coins, CheckCircle, Trash2, Calendar } from 'lucide-react';
import { sound } from '../utils/audio';

interface Props {
  history: QuestLogHistoryItem[];
  onClearHistory: () => void;
}

export const HistoryTab: React.FC<Props> = ({ history, onClearHistory }) => {
  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      <div className="rounded-2xl bg-[#090314] border border-purple-500/80 p-4 shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📖</span>
          <div>
            <h2 className="font-rpg font-bold text-base text-white tracking-wide">Grimório de Vitórias</h2>
            <p className="text-xs text-purple-300">Crônicas das suas tarefas e desafios conquistados</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              sound.playClick();
              if (confirm('Deseja limpar o histórico de missões arquivadas?')) {
                onClearHistory();
              }
            }}
            className="text-[11px] text-purple-400 hover:text-rose-400 flex items-center gap-1 border border-purple-900/80 px-2 py-1 rounded-lg"
          >
            <Trash2 className="w-3 h-3" /> Limpar
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl bg-black border border-purple-900/60 p-8 text-center space-y-2">
          <span className="text-3xl">📜</span>
          <h3 className="font-semibold text-white text-sm">O Grimório está à espera de lendas</h3>
          <p className="text-xs text-purple-300 max-w-xs mx-auto">
            Complete missões no seu quadro de tarefas para registrar seus feitos heroicos aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {history.map((item) => {
            const dateStr = new Date(item.completedAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="rounded-xl bg-[#080211] border border-purple-800/60 p-3 flex items-center justify-between gap-2 shadow-[0_1px_10px_rgba(147,51,234,0.1)]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-600 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-white truncate">{item.questTitle}</h4>
                    <span className="text-[10px] text-purple-400 font-mono flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 inline" /> {dateStr}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
                  <span className="text-purple-300 text-[11px] bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/60">
                    +{item.xpEarned} XP
                  </span>
                  <span className="text-amber-300 text-[11px] bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-800/60">
                    +{item.goldEarned} G
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
