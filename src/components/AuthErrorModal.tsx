import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ExternalLink, Copy, Check, RefreshCw, Smartphone, X } from 'lucide-react';
import { sound } from '../utils/audio';

export const AuthErrorModal: React.FC = () => {
  const { authError, clearAuthError, signInWithGoogle, signInWithRedirectFlow } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!authError) return null;

  const currentDomain = authError.domain || window.location.hostname;
  const firebaseConsoleUrl = 'https://console.firebase.google.com/project/gen-lang-client-0167673033/authentication/settings';

  const handleCopyDomain = () => {
    sound.playClick();
    navigator.clipboard.writeText(currentDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTryRedirect = () => {
    sound.playClick();
    clearAuthError();
    signInWithRedirectFlow();
  };

  const handleRetryPopup = () => {
    sound.playClick();
    clearAuthError();
    signInWithGoogle(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0d041c] border-2 border-purple-500 p-5 sm:p-6 shadow-[0_0_40px_rgba(168,85,247,0.4)] text-white space-y-4">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            clearAuthError();
          }}
          className="absolute top-3.5 right-3.5 p-1 rounded-lg text-purple-400 hover:text-white hover:bg-purple-900/50 transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-rpg font-bold text-base sm:text-lg text-white">
              {authError.isUnauthorizedDomain
                ? 'Autorização de Domínio no Firebase'
                : 'Ajuste de Login Google (Tablet / PWA)'}
            </h3>
            <p className="text-xs text-purple-300">
              {authError.isUnauthorizedDomain
                ? 'Seu app foi acessado por um novo endereço que precisa ser liberado.'
                : 'A janela de autenticação foi encerrada pelo navegador.'}
            </p>
          </div>
        </div>

        {/* Section 1: Unauthorized Domain Diagnosis & Fix */}
        {authError.isUnauthorizedDomain && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-black/80 border border-purple-800/80 text-xs space-y-2">
              <p className="text-purple-200">
                Por segurança, o Google Firebase só aceita logins vindos de domínios cadastrados. O endereço onde seu app está rodando agora é:
              </p>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-purple-950/70 border border-purple-600 font-mono text-xs text-amber-300 font-semibold select-all">
                <span className="truncate">{currentDomain}</span>
                <button
                  onClick={handleCopyDomain}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-800 hover:bg-purple-700 text-[11px] text-white shrink-0 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-900 text-xs space-y-2.5">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <span>⚡ Como resolver em 3 cliques:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-purple-200/90 text-[11px] leading-relaxed">
                <li>
                  Abra o painel do Firebase:{' '}
                  <a
                    href={firebaseConsoleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-300 underline font-semibold hover:text-white inline-flex items-center gap-1"
                  >
                    Abrir Firebase Auth Settings <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  Na seção <strong>Domínios autorizados (Authorized domains)</strong>, clique em <strong>Adicionar domínio (Add domain)</strong>.
                </li>
                <li>
                  Cole o domínio copiado (<span className="text-amber-300 font-mono">{currentDomain}</span>) e salve.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Section 2: Tablet / Standalone PWA Popup Blocked / Dismissed */}
        {!authError.isUnauthorizedDomain && (
          <div className="p-3.5 rounded-xl bg-black/80 border border-purple-800/80 text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Dica para Tablets e Aplicativos Instalados (PWA):</span>
            </div>
            <p className="text-purple-200 leading-relaxed text-[11px]">
              Em tablets e quando o app está instalado na tela inicial, navegadores (como Safari e Chrome) muitas vezes fecham janelas popup automaticamente por restrições do sistema operacional.
            </p>
            <p className="text-purple-200 leading-relaxed text-[11px]">
              O modo de <strong>Redirecionamento Direto</strong> autentica diretamente na mesma aba sem depender de janelas popups.
            </p>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-2 border-t border-purple-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <button
            onClick={() => {
              sound.playClick();
              clearAuthError();
            }}
            className="px-4 py-2 rounded-xl border border-purple-900 bg-transparent hover:bg-purple-950/40 text-purple-300 text-xs font-semibold transition"
          >
            Fechar
          </button>

          {/* Primary Action: Direct Redirect (ideal for Tablet/PWA) */}
          <button
            onClick={handleTryRedirect}
            className="px-4 py-2 rounded-xl border border-purple-400 bg-gradient-to-r from-purple-800 to-indigo-700 hover:from-purple-700 hover:to-indigo-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-200" />
            <span>Entrar por Redirecionamento (Tablet/PWA)</span>
          </button>

          {/* Secondary Action: Retry standard popup */}
          <button
            onClick={handleRetryPopup}
            className="px-3 py-2 rounded-xl border border-purple-600/70 bg-purple-950/60 hover:bg-purple-900 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <RefreshCw className="w-3 h-3 text-purple-400" />
            <span>Tentar Popup Novamente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
