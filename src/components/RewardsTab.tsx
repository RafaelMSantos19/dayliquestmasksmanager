import React, { useState } from 'react';
import { ShopReward } from '../types/rpg';
import { Coins, Plus, Trash2, ShoppingBag, Sparkles, Check, Coffee, Gamepad2, Tv, Gift } from 'lucide-react';
import { sound } from '../utils/audio';

interface Props {
  gold: number;
  rewards: ShopReward[];
  onRedeemReward: (rewardId: string) => void;
  onAddReward: (reward: Omit<ShopReward, 'id' | 'redeemedCount'>) => void;
  onDeleteReward: (rewardId: string) => void;
}

const EMOJI_OPTIONS = ['☕', '🎮', '📺', '🍕', '🍿', '🍦', '🎁', '🏖️', '🎧', '📚', '🛌', '🍔'];

export const RewardsTab: React.FC<Props> = ({
  gold,
  rewards,
  onRedeemReward,
  onAddReward,
  onDeleteReward,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(30);
  const [selectedEmoji, setSelectedEmoji] = useState('🎁');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || cost <= 0) return;

    onAddReward({
      title: title.trim(),
      description: description.trim() || 'Recompensa real pelo esforço heroico!',
      cost,
      icon: selectedEmoji,
      category: 'custom',
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
    sound.playCoin();
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Taverna Header & Wallet */}
      <div className="rounded-2xl bg-[#090314] border border-purple-500/80 p-4 shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏪</span>
            <h2 className="font-rpg font-bold text-base text-white tracking-wide">Taverna de Recompensas</h2>
          </div>
          <p className="text-xs text-purple-300 mt-0.5">
            Troque o ouro das suas missões cumpridas por prazeres reais sem culpa!
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-base font-bold text-amber-300">{gold}</span>
        </div>
      </div>

      {/* Action to create new custom reward */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
          Recompensas Disponíveis ({rewards.length})
        </span>
        <button
          onClick={() => {
            sound.playClick();
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/80 bg-purple-950/60 hover:bg-purple-900 text-white text-xs font-semibold shadow-[0_0_10px_rgba(168,85,247,0.3)] transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Recompensa</span>
        </button>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rewards.map((reward) => {
          const canAfford = gold >= reward.cost;

          return (
            <div
              key={reward.id}
              className={`rounded-xl border p-3.5 transition flex flex-col justify-between ${
                canAfford
                  ? 'bg-[#090314] border-purple-600/70 hover:border-purple-400 shadow-[0_2px_14px_rgba(147,51,234,0.15)]'
                  : 'bg-black/80 border-purple-950/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 rounded-lg bg-black border border-purple-900">
                      {reward.icon}
                    </span>
                    <div>
                      <h3 className="font-semibold text-xs text-white leading-tight">{reward.title}</h3>
                      {reward.redeemedCount > 0 && (
                        <span className="text-[10px] text-purple-400 font-mono">
                          Resgatado {reward.redeemedCount}x
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onDeleteReward(reward.id);
                    }}
                    className="text-slate-600 hover:text-rose-400 p-1 transition"
                    title="Excluir recompensa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {reward.description}
                </p>
              </div>

              {/* Purchase action */}
              <div className="mt-3 pt-2.5 border-t border-purple-900/60 flex items-center justify-between">
                <div className="flex items-center gap-1 font-mono font-bold text-amber-300 text-xs">
                  <span>💰</span>
                  <span>{reward.cost} Ouro</span>
                </div>

                <button
                  onClick={() => {
                    if (canAfford) {
                      sound.playPurchase();
                      onRedeemReward(reward.id);
                    } else {
                      sound.playClick();
                      alert(`Ouro insuficiente! Você precisa de ${reward.cost} de ouro (possui ${gold}). Cumpra mais missões!`);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${
                    canAfford
                      ? 'border border-amber-400/80 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                      : 'border border-slate-800 bg-slate-900/40 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Resgatar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to create custom reward */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#090314] border-2 border-purple-500/80 p-5 shadow-[0_0_30px_rgba(168,85,247,0.35)] text-white">
            <h3 className="font-rpg font-bold text-base text-white mb-1">Criar Recompensa Personalizada</h3>
            <p className="text-xs text-purple-300 mb-4">Escolha algo que você adora fazer como prêmio pelo seu foco.</p>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-purple-200 mb-1 font-medium">Nome do Prêmio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Noite da Pizza, 2h de Anime, Comprar HQ..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-purple-700 focus:border-purple-400 focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-purple-200 mb-1 font-medium">Descrição (Opcional)</label>
                <input
                  type="text"
                  placeholder="Detalhes sobre quando e como desfrutar"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-purple-700 focus:border-purple-400 focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-purple-200 mb-1 font-medium">Custo em Ouro (G)</label>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  required
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-purple-700 focus:border-purple-400 focus:outline-none text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-purple-200 mb-1 font-medium">Ícone</label>
                <div className="flex gap-1.5 flex-wrap">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setSelectedEmoji(em)}
                      className={`w-8 h-8 rounded-lg text-base flex items-center justify-center border transition ${
                        selectedEmoji === em
                          ? 'border-purple-400 bg-purple-900 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                          : 'border-purple-900/60 bg-black/60 hover:border-purple-700'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl border border-purple-400 bg-purple-700 hover:bg-purple-600 text-white font-semibold transition"
                >
                  Salvar Recompensa
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl border border-purple-900 text-purple-300 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
