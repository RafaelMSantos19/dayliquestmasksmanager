import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, Sparkles, X, ArrowRight, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    isStandalone,
    isIOS,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setErrorMsg(null);
      setIsLoading(true);
      sound.playClick();
      const user = await signInWithGoogle();
      if (user) {
        onClose();
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Informe um endereço de e-mail válido.');
      return;
    }

    setIsLoading(true);
    sound.playClick();

    try {
      if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
        setIsLoading(false);
        return;
      }

      if (mode === 'signup') {
        if (password.length < 6) {
          setErrorMsg('A senha do herói deve ter no mínimo 6 caracteres.');
          setIsLoading(false);
          return;
        }
        const user = await signUpWithEmail(email, password, displayName || 'Aventureiro');
        if (user) {
          sound.playLevelUp();
          onClose();
        }
      } else {
        if (!password) {
          setErrorMsg('Informe sua senha.');
          setIsLoading(false);
          return;
        }
        const user = await signInWithEmail(email, password);
        if (user) {
          sound.playLevelUp();
          onClose();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na autenticação';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      style={{
        height: '100dvh',
        width: '100vw',
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playClick();
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md max-h-[85dvh] flex flex-col rounded-2xl bg-[#0c051a] border-2 border-purple-500/80 p-5 sm:p-6 shadow-[0_0_35px_rgba(168,85,247,0.45)] text-white overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/60 transition"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4 pr-8">
          <div className="w-9 h-9 rounded-xl bg-purple-900/80 border border-purple-400 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.4)] shrink-0">
            <Sparkles className="w-5 h-5 text-purple-200" />
          </div>
          <div>
            <h3 className="font-rpg font-bold text-base sm:text-lg text-white tracking-wide">
              {mode === 'login' && 'Entrar no Grimório'}
              {mode === 'signup' && 'Criar Conta de Aventureiro'}
              {mode === 'forgot' && 'Recuperar Acesso'}
            </h3>
            <p className="text-[11px] text-purple-300">
              Sincronize seus personagens e quests em todos os seus aparelhos
            </p>
          </div>
        </div>

        {/* Standalone iOS tip banner */}
        {isIOS && isStandalone && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/60 text-[11px] text-purple-200 flex items-start gap-2">
            <Smartphone className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-semibold text-white">Dica para iPhone PWA:</span> No app instalado na tela inicial, recomendamos usar <strong>E-mail e Senha</strong> abaixo para entrar diretamente sem abrir abas do Safari.
            </div>
          </div>
        )}

        <div className="overflow-y-auto max-h-[60dvh] pr-0.5 space-y-3.5">
          {/* Google Sign-in Option */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-purple-400 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition active:scale-98 shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
              />
            </svg>
            <span>Continuar com o Google</span>
          </button>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-purple-900/80 w-full" />
            <span className="bg-[#0c051a] px-3 text-[10px] text-purple-400 uppercase tracking-widest font-mono">
              ou com e-mail
            </span>
          </div>

          {/* Error / Success Feedback */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-600/80 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-600/80 text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold text-purple-200 mb-1">
                  Nome do Herói
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-purple-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ex: Artur Pendragon"
                    className="w-full bg-black/60 border border-purple-800 focus:border-purple-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-purple-200 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-purple-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu-email@exemplo.com"
                  className="w-full bg-black/60 border border-purple-800 focus:border-purple-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-purple-200">
                    Senha
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setMode('forgot');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[10px] text-purple-400 hover:text-purple-300 underline"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-purple-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-black/60 border border-purple-800 focus:border-purple-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 rounded-xl border border-purple-500 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(168,85,247,0.35)] flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-60"
            >
              <span>
                {mode === 'login' && 'Entrar com E-mail'}
                {mode === 'signup' && 'Criar Conta de Aventureiro'}
                {mode === 'forgot' && 'Enviar E-mail de Recuperação'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Toggle Modes */}
          <div className="pt-2 text-center text-xs text-purple-300">
            {mode === 'login' && (
              <p>
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMode('signup');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-purple-200 font-bold underline hover:text-white"
                >
                  Cadastre-se grátis
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Já possui conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-purple-200 font-bold underline hover:text-white"
                >
                  Entrar com e-mail
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p>
                Lembrou da senha?{' '}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-purple-200 font-bold underline hover:text-white"
                >
                  Voltar ao login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
