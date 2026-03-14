'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-zinc-950 border-b border-green-500/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">⚽</span>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
              Bot de Apostas
            </h1>
            <p className="text-xs text-zinc-400">Handicap Asiático - Multi-Ligas</p>
          </div>
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
