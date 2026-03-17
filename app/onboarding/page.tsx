'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getBankroll, createOrUpdateBankroll } from '@/lib/api';

type Step = 'loading' | 'welcome' | 'configure' | 'generating' | 'done';

export default function OnboardingPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('loading');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('BRL');
  const [stakePercentage, setStakePercentage] = useState('10');
  const [betsGenerated, setBetsGenerated] = useState(0);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Guard: must be authenticated; if bankroll already exists, skip to bets
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    getBankroll()
      .then((data) => {
        if (data.success && data.bankroll) {
          // Bankroll already configured — skip onboarding
          router.replace('/bets');
        } else {
          // API returned 200 but no bankroll — start onboarding
          setStep('welcome');
        }
      })
      .catch(() => {
        // Request failed — start onboarding
        setStep('welcome');
      });
  }, [isAuthenticated, isLoading, router]);

  const handleConfigure = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numBalance = parseFloat(balance);
    const numStake = parseFloat(stakePercentage);

    if (isNaN(numBalance) || numBalance <= 0) {
      setError('Insira um saldo inicial válido.');
      return;
    }
    if (isNaN(numStake) || numStake <= 0 || numStake > 100) {
      setError('A porcentagem da stake deve estar entre 0.01 e 100.');
      return;
    }

    setFormLoading(true);
    setStep('generating');

    try {
      const res = await createOrUpdateBankroll({
        initial_balance: numBalance,
        currency,
        stake_percentage: numStake,
      });

      // Backend returns betsGenerated on first-time setup
      const generated = (res as unknown as { betsGenerated?: number }).betsGenerated ?? 0;
      setBetsGenerated(generated);
      setStep('done');
    } catch {
      setError('Erro ao configurar banca. Tente novamente.');
      setStep('configure');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Loading / redirect check ──────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4" />
          <p className="text-zinc-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // ── Generating bets ───────────────────────────────────────────────────────
  if (step === 'generating') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mb-6" />
          <h2 className="text-xl font-semibold text-white mb-2">Configurando sua banca…</h2>
          <p className="text-zinc-400 text-sm">Estamos gerando suas apostas com base nas oportunidades ativas. Isso leva apenas um momento.</p>
        </div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Tudo pronto! 🎉</h2>
          {betsGenerated > 0 ? (
            <p className="text-zinc-300 mb-2">
              Sua banca foi configurada e{' '}
              <span className="text-green-400 font-semibold">{betsGenerated} {betsGenerated === 1 ? 'aposta foi' : 'apostas foram'} geradas</span>{' '}
              com base nas oportunidades ativas do momento.
            </p>
          ) : (
            <p className="text-zinc-300 mb-2">
              Sua banca foi configurada! Novas apostas serão geradas automaticamente conforme as oportunidades forem identificadas.
            </p>
          )}
          <p className="text-zinc-500 text-sm mb-8">Bom jogo! 🏆</p>
          <button
            onClick={() => router.push('/bets')}
            className="w-full py-3 px-6 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl transition-colors text-lg"
          >
            Acessar a plataforma
          </button>
        </div>
      </div>
    );
  }

  // ── Welcome ───────────────────────────────────────────────────────────────
  if (step === 'welcome') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 max-w-lg w-full text-center shadow-2xl">
          <div className="text-5xl mb-6">🤖</div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Bem-vindo{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-zinc-400 mb-6 leading-relaxed">
            O <span className="text-green-400 font-medium">Bot de Apostas</span> analisa o mercado de Handicap Asiático do Brasileirão e gera duplas de apostas configuradas pra você.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-800 rounded-xl p-4">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-xs text-zinc-400">Oportunidades filtradas por risco</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-4">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-xs text-zinc-400">Duplas de apostas geradas automaticamente</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-4">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-xs text-zinc-400">Stake ajustada à sua banca</p>
            </div>
          </div>

          <p className="text-zinc-500 text-sm mb-6">
            Para começar, precisamos configurar sua banca inicial.
          </p>

          <button
            onClick={() => setStep('configure')}
            className="w-full py-3 px-6 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl transition-colors text-lg"
          >
            Configurar minha banca →
          </button>
        </div>
      </div>
    );
  }

  // ── Configure bankroll ────────────────────────────────────────────────────
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="w-6 h-6 rounded-full bg-green-500 text-black text-xs flex items-center justify-center font-bold">1</span>
            <span className="text-green-400">Boas-vindas</span>
          </div>
          <div className="flex-1 h-px bg-green-500 mx-2" />
          <div className="flex items-center gap-2 text-sm">
            <span className="w-6 h-6 rounded-full bg-green-500 text-black text-xs flex items-center justify-center font-bold">2</span>
            <span className="text-white font-medium">Configurar banca</span>
          </div>
          <div className="flex-1 h-px bg-zinc-700 mx-2" />
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <span className="w-6 h-6 rounded-full bg-zinc-700 text-zinc-400 text-xs flex items-center justify-center font-bold">3</span>
            <span>Pronto</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Configurar Banca</h2>
          <p className="text-zinc-400 text-sm">Defina seu saldo e a porcentagem de cada aposta. Você poderá alterar isso a qualquer momento.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleConfigure} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Saldo Inicial
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">
                {currency === 'BRL' ? 'R$' : '$'}
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1000.00"
                required
                disabled={formLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Moeda
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={formLoading}
            >
              <option value="BRL">BRL — Real Brasileiro</option>
              <option value="USD">USD — Dólar Americano</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Porcentagem da Stake por Aposta
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={stakePercentage}
                onChange={(e) => setStakePercentage(e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="10"
                required
                disabled={formLoading}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">%</span>
            </div>
            {balance && stakePercentage && !isNaN(parseFloat(balance)) && !isNaN(parseFloat(stakePercentage)) && (
              <p className="mt-2 text-xs text-zinc-500">
                Cada aposta usará{' '}
                <span className="text-green-400 font-medium">
                  {currency === 'BRL' ? 'R$ ' : '$ '}
                  {(parseFloat(balance) * parseFloat(stakePercentage) / 100).toFixed(2)}
                </span>{' '}
                da sua banca.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep('welcome')}
              className="px-5 py-3 border border-zinc-700 text-zinc-300 rounded-xl hover:bg-zinc-800 transition-colors"
              disabled={formLoading}
            >
              Voltar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={formLoading}
            >
              {formLoading ? 'Configurando…' : 'Configurar e gerar apostas →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
