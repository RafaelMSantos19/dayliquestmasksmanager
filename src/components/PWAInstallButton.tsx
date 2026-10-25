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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm my-auto max-h-[90dvh] flex flex-col rounded-2xl bg-[#0d0718] border-2 border-purple-500/80 p-4 sm:p-5 shadow-[0_0_35px_rgba(168,85,247,0.4)] text-white">
              {/* Close Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  setShowIOSGuide(false);
                }}
                className="absolute top-3 right-3 text-purple-300 hover:text-white p-1.5 rounded-lg border border-purple-900 hover:border-purple-600 bg-purple-950/60 transition active:scale-95"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-2.5 pr-8 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-900/80 border border-purple-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                  <Sparkles className="w-4 h-4 text-purple-200" />
                </div>
                <div>
                  <h3 className="font-rpg text-sm sm:text-base font-bold text-white tracking-wide">Instalar no iPhone / iPad</h3>
                  <p className="text-[10px] sm:text-[11px] text-purple-300">Modo tela cheia sem barra de navegador</p>
                </div>
              </div>

              {/* Scrollable instructions list */}
              <div className="space-y-2.5 my-2.5 text-xs text-slate-200 overflow-y-auto max-h-[55dvh] pr-0.5 overscroll-contain">
                <div className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-purple-950/50 border border-purple-800/60">
                  <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg bg-purple-800 text-purple-200 font-bold text-xs">
                    1
                  </div>
                  <div className="text-[11px] sm:text-xs">
                    <p className="font-semibold text-white">Toque em Compartilhar</p>
                    <p className="text-[10px] sm:text-[11px] text-purple-300 flex items-center gap-1 mt-0.5">
                      No Safari do iOS, toque no ícone <Share className="w-3.5 h-3.5 inline text-purple-400" /> na barra inferior.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-purple-950/50 border border-purple-800/60">
                  <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg bg-purple-800 text-purple-200 font-bold text-xs">
                    2
                  </div>
                  <div className="text-[11px] sm:text-xs">
                    <p className="font-semibold text-white">Adicionar à Tela de Início</p>
                    <p className="text-[10px] sm:text-[11px] text-purple-300 flex items-center gap-1 mt-0.5">
                      Role o menu e toque em <PlusSquare className="w-3.5 h-3.5 inline text-purple-400" /> <strong>"Adicionar à Tela de Início"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-purple-950/50 border border-purple-800/60">
                  <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg bg-purple-800 text-purple-200 font-bold text-xs">
                    3
                  </div>
                  <div className="text-[11px] sm:text-xs">
                    <p className="font-semibold text-white">Pronto para Jogar!</p>
                    <p className="text-[10px] sm:text-[11px] text-purple-300 mt-0.5">
                      Abra pelo ícone roxo criado na sua tela para usar como aplicativo nativo!
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  setShowIOSGuide(false);
                }}
                className="w-full mt-1 py-2 sm:py-2.5 rounded-xl border border-purple-500 bg-gradient-to-r from-purple-700 to-purple-900 text-white font-semibold text-xs tracking-wide hover:brightness-110 active:scale-98 transition shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0"
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
