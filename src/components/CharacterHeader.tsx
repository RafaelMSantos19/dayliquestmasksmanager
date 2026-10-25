import React from 'react';
import { CharacterProfile } from '../types/rpg';
import { getRequiredXpForLevel } from '../utils/storage';
import { PWAInstallButton } from './PWAInstallButton';
import { UserAuthBadge } from './UserAuthBadge';
import { TabType } from './BottomNav';
import { Volume2, VolumeX, Flame, Coins, Heart, Plus, Sword, Shield, ShoppingBag, BookOpen } from 'lucide-react';
import { sound } from '../utils/audio';

interface Props {
  profile: CharacterProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onEditProfile: () => void;
  activeTab?: TabType;
  onChangeTab?: (tab: TabType) => void;
  onOpenCreate?: () => void;
  pendingCount?: number;
}

export const CharacterHeader: React.FC<Props> = ({
  profile,
  soundEnabled,
  onToggleSound,
  onEditProfile,
  activeTab = 'quests',
  onChangeTab,
  onOpenCreate,
  pendingCount = 0,
}) => {
  const nextXp = getRequiredXpForLevel(profile.level);
  const xpPercent = Math.min(100, Math.round((profile.currentXp / nextXp) * 100));
  const hpPercent = Math.round((profile.hp / profile.maxHp) * 100);

  return (
    <header className="pt-safe px-4 pb-3 bg-black/95 backdrop-blur-md border-b border-purple-800/80 shadow-[0_4px_24px_rgba(147,51,234,0.18)] sticky top-0 z-40">
      {/* Top action row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
        {/* Left: Avatar & Identity */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/80 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.3)] shrink-0">
              <span className="text-xl">⚔️</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-rpg font-bold text-sm sm:text-base text-white tracking-wide">{profile.name}</span>
                <button
                  onClick={() => {
                    sound.playClick();
                    onEditProfile();
                  }}
                  aria-label="Editar nome e classe do herói"
                  className="text-[10px] text-purple-400 hover:text-purple-200 underline decoration-purple-600/60 focus-visible:ring-1 focus-visible:ring-purple-400 focus-visible:outline-none rounded"
                >
                  editar
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-purple-300 font-medium leading-none">{profile.characterClass}</p>
            </div>
          </div>

          {/* Mobile Right Quick Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <UserAuthBadge />
            <PWAInstallButton />
            <button
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
              className="p-2 rounded-lg border border-purple-800 bg-purple-950/50 hover:bg-purple-900 text-purple-300 hover:text-white transition active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
              title={soundEnabled ? 'Som Ativado' : 'Som Desativado'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-300" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs (visible on tablets & computers >= 768px) */}
        {onChangeTab && (
          <nav aria-label="Navegação Principal" className="hidden md:flex items-center gap-1.5 p-1 bg-black/80 rounded-xl border border-purple-900/80">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onChangeTab('quests');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
                activeTab === 'quests'
                  ? 'bg-purple-900 border border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <Sword className="w-3.5 h-3.5 text-purple-400" />
              <span>Missões</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-950 border border-purple-600 text-[10px] font-mono text-purple-200">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onChangeTab('hero');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
                activeTab === 'hero'
                  ? 'bg-purple-900 border border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Herói</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onChangeTab('rewards');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
                activeTab === 'rewards'
                  ? 'bg-purple-900 border border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
              <span>Taverna</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onChangeTab('history');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
                activeTab === 'history'
                  ? 'bg-purple-900 border border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Grimório</span>
            </button>
          </nav>
        )}

        {/* Right: Desktop Action buttons */}
        <div className="hidden md:flex items-center gap-2">
          {onOpenCreate && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenCreate();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-400 bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] transition active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:outline-none"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nova Missão</span>
            </button>
          )}

          <PWAInstallButton />
          <UserAuthBadge />

          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
            className="p-2 rounded-xl border border-purple-800 bg-purple-950/50 hover:bg-purple-900 text-purple-300 hover:text-white transition active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
            title={soundEnabled ? 'Som Ativado' : 'Som Desativado'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-300" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Stats bar: Level, XP, Gold, Streak, HP (Responsive flex on desktop) */}
      <div className="bg-[#0b0517] rounded-xl border border-purple-700/60 p-2.5 sm:p-3 shadow-[inset_0_1px_6px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* XP Bar Component */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-rpg font-extrabold text-xs px-2 py-0.5 rounded bg-purple-900/90 border border-purple-400 text-purple-100 shadow-[0_0_8px_rgba(192,132,252,0.4)]">
                  NV. {profile.level}
                </span>
                <span className="text-[11px] text-purple-200">
                  XP: <strong className="text-white">{profile.currentXp}</strong> / {nextXp}
                </span>
              </div>
              <span className="text-[11px] font-bold text-purple-300 font-mono">{xpPercent}%</span>
            </div>

            {/* XP Progress Bar */}
            <div className="w-full h-2.5 bg-black/80 rounded-full border border-purple-900/80 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(192,132,252,0.7)]"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Metrics (HP, Gold, Streak) */}
          <div className="grid grid-cols-3 md:flex md:items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-purple-900/40 md:pl-3 text-xs">
            {/* Health */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 border border-purple-900/60 md:min-w-[110px]">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center text-[10px] text-slate-300">
                  <span>HP</span>
                  <span className="font-mono text-white">{profile.hp}/{profile.maxHp}</span>
                </div>
                <div className="w-full h-1 bg-black rounded-full overflow-hidden mt-0.5">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${hpPercent}%` }} />
                </div>
              </div>
            </div>

            {/* Gold */}
            <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 border border-purple-900/60 md:min-w-[90px]">
              <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-amber-300 font-mono tracking-tight">{profile.gold}</span>
              <span className="text-[10px] text-slate-400">ouro</span>
            </div>

            {/* Streak */}
            <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 border border-purple-900/60 md:min-w-[90px]">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20 animate-pulse shrink-0" />
              <span className="text-xs font-bold text-orange-300 font-mono">{profile.streak}</span>
              <span className="text-[10px] text-slate-400">dias</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
