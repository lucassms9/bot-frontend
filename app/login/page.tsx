'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PublicRoute from '@/components/PublicRoute';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo!</h1>
            <p className="text-zinc-400">Faça login para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-400">
              Não tem uma conta?{' '}
              <Link href="/signup" className="text-green-400 hover:text-green-300 font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </PublicRoute>
  );
}
