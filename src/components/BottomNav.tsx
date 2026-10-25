import React from 'react';
import { Sword, Shield, ShoppingBag, BookOpen, Plus } from 'lucide-react';
import { sound } from '../utils/audio';

export type TabType = 'quests' | 'hero' | 'rewards' | 'history';

interface Props {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenCreate: () => void;
  pendingCount: number;
}

export const BottomNav: React.FC<Props> = ({
  activeTab,
  onChangeTab,
  onOpenCreate,
  pendingCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-purple-800/80 pb-safe shadow-[0_-4px_24px_rgba(147,51,234,0.2)]">
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-around relative">
        {/* Tab 1: Quests */}
        <button
          onClick={() => {
            sound.playClick();
            onChangeTab('quests');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            activeTab === 'quests'
              ? 'text-white font-bold'
              : 'text-purple-300/70 hover:text-purple-200'
          }`}
        >
          <div className="relative">
            <Sword className={`w-5 h-5 ${activeTab === 'quests' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]' : ''}`} />
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-purple-600 border border-purple-300 text-[10px] font-mono font-bold text-white flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wide">Missões</span>
        </button>

        {/* Tab 2: Hero Sheet */}
        <button
          onClick={() => {
            sound.playClick();
            onChangeTab('hero');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            activeTab === 'hero'
              ? 'text-white font-bold'
              : 'text-purple-300/70 hover:text-purple-200'
          }`}
        >
          <Shield className={`w-5 h-5 ${activeTab === 'hero' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]' : ''}`} />
          <span className="text-[10px] tracking-wide">Herói</span>
        </button>

        {/* Floating Center Action: Nova Missão */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenCreate();
          }}
          aria-label="Nova Missão"
          className="-mt-5 w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-800 via-purple-600 to-fuchsia-500 border-2 border-purple-300 flex items-center justify-center text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] active:scale-95 transition"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Tab 3: Rewards */}
        <button
          onClick={() => {
            sound.playClick();
            onChangeTab('rewards');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            activeTab === 'rewards'
              ? 'text-white font-bold'
              : 'text-purple-300/70 hover:text-purple-200'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 ${activeTab === 'rewards' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]' : ''}`} />
          <span className="text-[10px] tracking-wide">Taverna</span>
        </button>

        {/* Tab 4: Grimório */}
        <button
          onClick={() => {
            sound.playClick();
            onChangeTab('history');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            activeTab === 'history'
              ? 'text-white font-bold'
              : 'text-purple-300/70 hover:text-purple-200'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${activeTab === 'history' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]' : ''}`} />
          <span className="text-[10px] tracking-wide">Grimório</span>
        </button>
      </div>
    </nav>
  );
};
