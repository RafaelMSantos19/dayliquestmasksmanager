import React, { useState } from 'react';
import { CharacterProfile } from '../types/rpg';
import { ALL_BADGES } from '../utils/storage';
import { Shield, Sparkles, Trophy, Award, Flame, Coins, CheckCircle, RefreshCw, Download, Upload, Info } from 'lucide-react';
import { sound } from '../utils/audio';

interface Props {
  profile: CharacterProfile;
  onUpdateProfile: (updated: Partial<CharacterProfile>) => void;
  onResetDailies: () => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
}

const ATTRIBUTE_CONFIG = [
  { key: 'str' as const, name: 'Força (FOR)', desc: 'Treinos, postura e esforço físico', icon: '⚔️', color: 'from-rose-600 to-red-500' },
  { key: 'int' as const, name: 'Inteligência (INT)', desc: 'Estudos, leitura e raciocínio técnico', icon: '🔮', color: 'from-blue-600 to-cyan-500' },
  { key: 'wis' as const, name: 'Sabedoria (SAB)', desc: 'Meditação, foco e serenidade mental', icon: '🧘', color: 'from-teal-600 to-emerald-400' },
  { key: 'vit' as const, name: 'Vitalidade (VIT)', desc: 'Hidratação, sono de qualidade e saúde', icon: '🧪', color: 'from-emerald-600 to-green-400' },
  { key: 'cha' as const, name: 'Carisma (CAR)', desc: 'Comunicação, conexões e presença social', icon: '🤝', color: 'from-pink-600 to-purple-400' },
];

export const HeroSheetTab: React.FC<Props> = ({
  profile,
  onUpdateProfile,
  onResetDailies,
  onExportData,
  onImportData,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [classInput, setClassInput] = useState(profile.characterClass);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: nameInput.trim() || 'Aventureiro',
      characterClass: classInput.trim() || 'Guerreiro',
    });
    setEditingTitle(false);
    sound.playClick();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          onImportData(text);
          sound.playLevelUp();
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Hero Badge Card */}
      <div className="rounded-2xl bg-[#090314] border border-purple-500/80 p-4 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-black border-2 border-purple-500 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              🛡️
            </div>
            <div>
              {editingTitle ? (
                <form onSubmit={handleSaveInfo} className="space-y-1.5">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-2 py-1 rounded bg-black border border-purple-600 text-white text-xs font-bold"
                    placeholder="Nome do Herói"
                  />
                  <input
                    type="text"
                    value={classInput}
                    onChange={(e) => setClassInput(e.target.value)}
                    className="px-2 py-1 rounded bg-black border border-purple-700 text-purple-200 text-[11px]"
                    placeholder="Classe (ex: Mago Arcano)"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="text-[10px] bg-purple-700 text-white px-2 py-0.5 rounded">
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTitle(false)}
                      className="text-[10px] text-slate-400 px-2 py-0.5"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="font-rpg font-bold text-base text-white tracking-wide">{profile.name}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900 border border-purple-500 text-purple-200 font-mono">
                      Nível {profile.level}
                    </span>
                  </div>
                  <p className="text-xs text-purple-300 font-medium">{profile.characterClass}</p>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setNameInput(profile.name);
                      setClassInput(profile.characterClass);
                      setEditingTitle(true);
                    }}
                    className="text-[10px] text-purple-400 hover:text-purple-200 underline mt-1"
                  >
                    Renomear Herói & Classe
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Global summary counters */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-purple-900/60 text-center">
          <div className="p-2 rounded-xl bg-black/60 border border-purple-900/60">
            <span className="block text-[10px] text-purple-300/80">Missões Concluídas</span>
            <span className="font-mono text-base font-bold text-white">{profile.totalQuestsCompleted}</span>
          </div>
          <div className="p-2 rounded-xl bg-black/60 border border-purple-900/60">
            <span className="block text-[10px] text-amber-300/80">Ouro Coletado</span>
            <span className="font-mono text-base font-bold text-amber-300">{profile.totalGoldEarned}</span>
          </div>
          <div className="p-2 rounded-xl bg-black/60 border border-purple-900/60">
            <span className="block text-[10px] text-orange-300/80">Sequência Atual</span>
            <span className="font-mono text-base font-bold text-orange-300">{profile.streak} dias</span>
          </div>
        </div>
      </div>

      {/* Attributes Section */}
      <div className="rounded-2xl bg-[#090314] border border-purple-600/70 p-4 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="font-rpg font-bold text-sm text-white tracking-wide">Atributos do Personagem</h3>
        </div>
        <p className="text-xs text-purple-300/80 mb-3">
          Complete quests com afeto a cada atributo para subir seus pontos permanentemente.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {ATTRIBUTE_CONFIG.map((att) => {
            const val = profile.attributes[att.key];
            const maxRef = Math.max(25, ...Object.values(profile.attributes));
            const fillPct = Math.min(100, Math.round((val / maxRef) * 100));

            return (
              <div key={att.key} className="p-2.5 rounded-xl bg-black border border-purple-900/60 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{att.icon}</span>
                    <div>
                      <span className="font-semibold text-white">{att.name}</span>
                      <span className="text-[10px] text-slate-400 block leading-none">{att.desc}</span>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-white px-2 py-0.5 rounded bg-purple-950 border border-purple-800">
                    {val}
                  </span>
                </div>

                <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-purple-950">
                  <div
                    className={`h-full bg-gradient-to-r ${att.color} rounded-full transition-all duration-500`}
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges / Conquistas */}
      <div className="rounded-2xl bg-[#090314] border border-purple-600/70 p-4 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="font-rpg font-bold text-sm text-white tracking-wide">Insígnias & Conquistas</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = profile.badges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3 rounded-xl border transition flex items-start gap-2.5 ${
                  isUnlocked
                    ? 'bg-purple-950/40 border-purple-400/80 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    : 'bg-black/60 border-purple-950/50 opacity-40'
                }`}
              >
                <div className="text-2xl shrink-0">{badge.icon}</div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs text-white leading-tight">{badge.name}</h4>
                  <p className="text-[10px] text-purple-300 mt-0.5 leading-tight">{badge.description}</p>
                  <span className="text-[9px] font-mono mt-1 inline-block">
                    {isUnlocked ? (
                      <span className="text-emerald-400">✓ Conquistado</span>
                    ) : (
                      <span className="text-slate-500">Bloqueado</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Actions & Backup */}
      <div className="rounded-2xl bg-[#090314] border border-purple-700/60 p-4 space-y-3">
        <h3 className="font-rpg font-bold text-xs text-purple-300 uppercase tracking-wider">
          Ações do Sistema & Backup
        </h3>

        <div className="flex flex-col gap-2">
          {/* Manual Daily Reset */}
          <button
            onClick={() => {
              sound.playClick();
              if (confirm('Deseja resetar as missões diárias para iniciar um novo dia de treino?')) {
                onResetDailies();
              }
            }}
            className="flex items-center justify-between p-2.5 rounded-xl bg-black border border-purple-800 text-xs text-purple-200 hover:text-white hover:border-purple-500 transition active:scale-98"
          >
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
              <span>Resetar Missões Diárias (Novo Dia)</span>
            </span>
            <span className="text-[10px] text-purple-400">Executar</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={() => {
              sound.playCoin();
              onExportData();
            }}
            className="flex items-center justify-between p-2.5 rounded-xl bg-black border border-purple-800 text-xs text-purple-200 hover:text-white hover:border-purple-500 transition active:scale-98"
          >
            <span className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Exportar Backup do Jogo (JSON)</span>
            </span>
            <span className="text-[10px] text-purple-400">Salvar</span>
          </button>

          {/* Import JSON */}
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-black border border-purple-800 text-xs text-purple-200 hover:text-white hover:border-purple-500 cursor-pointer transition active:scale-98">
            <span className="flex items-center gap-2">
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>Restaurar Backup (JSON)</span>
            </span>
            <span className="text-[10px] text-purple-400">Carregar</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
