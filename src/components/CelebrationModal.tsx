import React from 'react';
import { Sparkles, Trophy, Star, ArrowUpRight, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface Props {
  isOpen: boolean;
  level: number;
  unlockedTitle?: string;
  onClose: () => void;
}

export const CelebrationModal: React.FC<Props> = ({
  isOpen,
  level,
  unlockedTitle,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1a0833] via-[#0d041c] to-black border-2 border-purple-400 p-6 text-center text-white shadow-[0_0_50px_rgba(168,85,247,0.6)]">
        {/* Glow halo */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-amber-300 p-1 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)] animate-bounce">
          <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-3xl">
            👑
          </div>
        </div>

        <span className="inline-block text-xs font-rpg font-bold tracking-widest text-amber-400 uppercase mb-1">
          Ascensão Heroica!
        </span>

        <h2 className="font-rpg font-black text-2xl text-white tracking-wide glow-purple-text">
          SUBIU PARA O NÍVEL {level}!
        </h2>

        <p className="text-xs text-purple-200 mt-2 leading-relaxed">
          Sua determinação e disciplina elevaram o poder do seu herói!
        </p>

        {unlockedTitle && (
          <div className="mt-3 p-2 rounded-xl bg-purple-950/70 border border-purple-400 text-xs text-purple-100 font-semibold">
            Título Desbloqueado: {unlockedTitle}
          </div>
        )}

        <div className="my-4 py-3 border-y border-purple-800/80 flex items-center justify-around text-xs font-mono text-purple-200">
          <div>
            <span className="block text-slate-400 text-[10px]">HP & MANA</span>
            <span className="text-emerald-400 font-bold">100% Restaurados</span>
          </div>
          <div>
            <span className="block text-slate-400 text-[10px]">PODER GERAL</span>
            <span className="text-purple-300 font-bold">+15% Status</span>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-2xl border border-purple-300 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 font-rpg font-bold text-sm tracking-wider hover:brightness-110 active:scale-95 transition shadow-[0_0_20px_rgba(168,85,247,0.5)]"
        >
          Continuar Jornada
        </button>
      </div>
    </div>
  );
};
