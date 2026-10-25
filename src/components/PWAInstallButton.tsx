import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, Smartphone, Sparkles, Check } from 'lucide-react';
import { sound } from '../utils/audio';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone mode or installed, hide completely (no badges)
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={() => {
          sound.playClick();
          install();
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-500 bg-purple-900/60 hover:bg-purple-800 text-white text-xs font-semibold shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-all active:scale-95"
      >
        <Download className="w-3.5 h-3.5 text-purple-300" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow (WebKit doesn't fire beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => {
            sound.playClick();
            setShowIOSGuide(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/70 bg-purple-950/60 hover:bg-purple-900/80 text-white text-xs font-medium transition-all active:scale-95 shadow-[0_0_10px_rgba(147,51,234,0.3)] focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
        >
          <Smartphone className="w-3.5 h-3.5 text-purple-300" />
          <span>Instalar no iOS</span>
        </button>

        {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#0d0718] border-2 border-purple-500/80 p-5 shadow-[0_0_30px_rgba(168,85,247,0.35)] text-white">
            <button
              onClick={() => {
                sound.playClick();
                setShowIOSGuide(false);
              }}
              className="absolute top-4 right-4 text-purple-300 hover:text-white p-1 rounded-lg border border-purple-900 hover:border-purple-600 transition"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-900/70 border border-purple-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-300" />
              </div>
              <div>
                <h3 className="font-rpg text-base font-bold text-white tracking-wide">Instalar no iPhone / iPad</h3>
                <p className="text-[11px] text-purple-300">Transforme em app nativo sem barra de navegador</p>
              </div>
            </div>

            <div className="space-y-3 my-4 text-xs text-slate-200">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-purple-950/50 border border-purple-800/60">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-800 text-purple-200 font-bold text-xs">
                  1
                </div>
                <div>
                  <p className="font-semibold text-white">Toque no botão de Compartilhar</p>
                  <p className="text-[11px] text-purple-300 flex items-center gap-1 mt-0.5">
                    No Safari do iPhone, procure pelo ícone <Share className="w-3.5 h-3.5 inline text-purple-400" /> na barra inferior.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-purple-950/50 border border-purple-800/60">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-800 text-purple-200 font-bold text-xs">
                  2
                </div>
                <div>
                  <p className="font-semibold text-white">Adicionar à Tela de Início</p>
                  <p className="text-[11px] text-purple-300 flex items-center gap-1 mt-0.5">
                    Role a lista de opções e clique em <PlusSquare className="w-3.5 h-3.5 inline text-purple-400" /> <strong>"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-purple-950/50 border border-purple-800/60">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-800 text-purple-200 font-bold text-xs">
                  3
                </div>
                <div>
                  <p className="font-semibold text-white">Pronto para a Aventura!</p>
                  <p className="text-[11px] text-purple-300 mt-0.5">
                    Abra pelo ícone roxo na sua tela de início para jogar suas tarefas em tela cheia!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setShowIOSGuide(false);
              }}
              className="w-full py-2.5 rounded-xl border border-purple-500 bg-gradient-to-r from-purple-700 to-purple-900 text-white font-semibold text-xs tracking-wide hover:brightness-110 active:scale-98 transition shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              Entendi, vamos lá!
            </button>
          </div>
        </div>
      )}
    </>
  );
  }

  return null;
};
