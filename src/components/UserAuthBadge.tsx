import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, Cloud, CloudCheck, Share2, Check, User as UserIcon } from 'lucide-react';
import { sound } from '../utils/audio';

export const UserAuthBadge: React.FC = () => {
  const { currentUser, loadingAuth, signInWithGoogle, logout } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleCopyLink = () => {
    sound.playClick();
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loadingAuth) {
    return (
      <div className="h-7 w-20 rounded-lg bg-purple-950/40 animate-pulse border border-purple-900/60" />
    );
  }

  if (!currentUser) {
    return (
      <button
        type="button"
        onClick={() => signInWithGoogle()}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-purple-500/80 bg-purple-950/60 hover:bg-purple-900 text-white text-xs font-semibold shadow-[0_0_12px_rgba(168,85,247,0.3)] transition active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
        title="Entrar com o Google para salvar seu progresso na nuvem em vários aparelhos"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
        <span className="hidden sm:inline">Entrar com Google</span>
        <span className="sm:hidden">Entrar</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          sound.playClick();
          setShowUserMenu(!showUserMenu);
        }}
        className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl border border-purple-500/80 bg-purple-950/60 hover:bg-purple-900 text-white text-xs font-semibold shadow-[0_0_12px_rgba(168,85,247,0.3)] transition active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
      >
        {currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt={currentUser.displayName || 'Usuário'}
            className="w-5 h-5 rounded-full border border-purple-400 object-cover"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-purple-700 flex items-center justify-center text-[10px] text-white font-bold">
            {currentUser.displayName ? currentUser.displayName[0] : 'U'}
          </div>
        )}
        <span className="hidden sm:inline max-w-[100px] truncate text-purple-200 text-xs">
          {currentUser.displayName?.split(' ')[0] || 'Usuário'}
        </span>
        <Cloud className="w-3.5 h-3.5 text-emerald-400" />
      </button>

      {/* User dropdown popup */}
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0d041c] border-2 border-purple-500/80 p-3 shadow-[0_0_30px_rgba(168,85,247,0.4)] text-white z-50 animate-in fade-in zoom-in-95">
          <div className="pb-2.5 border-b border-purple-900/60 mb-2">
            <p className="font-semibold text-xs text-white truncate">{currentUser.displayName || 'Aventureiro'}</p>
            <p className="text-[11px] text-purple-300 truncate">{currentUser.email}</p>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sincronização em nuvem ativa</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {/* Share app link button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-purple-900 hover:border-purple-600 bg-black/60 hover:bg-purple-950/60 text-xs text-purple-200 hover:text-white transition"
            >
              <span className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Compartilhar App</span>
              </span>
              {copiedLink ? (
                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Copiado!
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">Copiar Link</span>
              )}
            </button>

            {/* Logout button */}
            <button
              type="button"
              onClick={async () => {
                setShowUserMenu(false);
                await logout();
              }}
              className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-900/60 hover:border-rose-500 bg-rose-950/30 hover:bg-rose-950/70 text-xs text-rose-300 hover:text-white transition"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sair da Conta Google</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
