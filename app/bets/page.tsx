'use client';

import { useEffect, useState } from 'react';
import { getBets, getStats, getBankroll, createOrUpdateBankroll, markBetResult } from '@/lib/api';
import { Bet, Stats, Bankroll } from '@/types';
import BetCard from '@/components/BetCard';
import StatsCard from '@/components/StatsCard';
import BankrollCard from '@/components/BankrollCard';
import BankrollModal from '@/components/BankrollModal';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function BetsPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [bankroll, setBankroll] = useState<Bankroll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showBankrollModal, setShowBankrollModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [betsData, statsData, bankrollData] = await Promise.all([
        getBets(),
        getStats(),
        getBankroll().catch(() => ({ success: false, bankroll: null })),
      ]);

      setBets(betsData.bets);
      setStats(statsData.stats);
      if (bankrollData.success && bankrollData.bankroll) {
        setBankroll(bankrollData.bankroll);
      }
    } catch (err) {
      setError('Erro ao carregar apostas. Verifique se a API está rodando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveBankroll = async (balance: number, currency: string, stakePercentage: number) => {
    try {
      await createOrUpdateBankroll({ initial_balance: balance, currency, stake_percentage: stakePercentage });
      await fetchData(); // Reload data
    } catch (error) {
      throw error;
    }
  };

  const handleMarkBetResult = async (betId: string, result: 'won' | 'lost', stake: number) => {
    try {
      await markBetResult(betId, { result, stake });
      await fetchData(); // Reload data to update bet status and bankroll
    } catch (error) {
      throw error;
    }
  };

  const filteredBets = filter === 'all' 
    ? bets 
    : bets.filter(bet => bet.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Carregando duplas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Bankroll Card */}
      <div className="mb-6">
        {bankroll ? (
          <BankrollCard bankroll={bankroll} onEdit={() => setShowBankrollModal(true)} />
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
            <p className="text-zinc-400 mb-4">💰 Configure sua banca para receber sugestões de stake</p>
            <button
              onClick={() => setShowBankrollModal(true)}
              className="bg-green-600 text-zinc-100 px-6 py-2 rounded-lg hover:bg-green-500 transition-colors font-medium shadow-[0_0_15px_rgba(34,197,94,0.2)]"
            >
              Configurar Banca
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && <StatsCard stats={stats} />}

      {/* Header com Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Duplas de Apostas</h2>
          <p className="text-sm text-zinc-400">
            {filteredBets.length} dupla{filteredBets.length !== 1 ? 's' : ''} encontrada{filteredBets.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Filtro */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 sm:flex-none border border-zinc-800 rounded-lg px-3 py-2 bg-zinc-900 text-zinc-100 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendentes</option>
            <option value="won">Vencidas</option>
            <option value="lost">Perdidas</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchData}
            className="flex items-center justify-center gap-2 bg-green-500 text-zinc-950 px-4 py-2 rounded-lg hover:bg-green-400 transition-colors font-semibold shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>

      {/* Bets Grid */}
      {filteredBets.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-400 text-lg">Nenhuma dupla {filter !== 'all' ? filter : 'disponível'} no momento.</p>
          <p className="text-zinc-500 text-sm mt-2">
            O bot cria duplas automaticamente quando encontra oportunidades compatíveis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBets.map((bet) => (
            <BetCard 
              key={bet.id} 
              bet={bet} 
              onMarkResult={handleMarkBetResult}
            />
          ))}
        </div>
      )}

      {/* Bankroll Modal */}
      <BankrollModal
        isOpen={showBankrollModal}
        onClose={() => setShowBankrollModal(false)}
        onSave={handleSaveBankroll}
        currentBalance={bankroll?.currentBalance || 0}
        currentCurrency={bankroll?.currency || 'BRL'}
        currentStakePercentage={bankroll?.stakePercentage || 10}
      />
    </div>
  );
}
