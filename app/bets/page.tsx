'use client';

import { useEffect, useState } from 'react';
import { getBets, getStats, getBankroll, createOrUpdateBankroll, markBetResult, getOpportunities, undoBet, createBetFromOpportunities, markBetInProgress } from '@/lib/api';
import { Bet, Stats, Bankroll, Opportunity } from '@/types';
import BetCard from '@/components/BetCard';
import StatsCard from '@/components/StatsCard';
import BankrollCard from '@/components/BankrollCard';
import BankrollModal from '@/components/BankrollModal';
import OpportunityCard from '@/components/OpportunityCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

type Tab = 'bets' | 'in_progress' | 'opportunities';

export default function BetsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('bets');

  const [bets, setBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [bankroll, setBankroll] = useState<Bankroll | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('pending');
  const [sortBy, setSortBy] = useState<string>('date');
  const [oppFilter, setOppFilter] = useState<string>('pending');
  const [showBankrollModal, setShowBankrollModal] = useState(false);
  const [selectedOppIds, setSelectedOppIds] = useState<string[]>([]);
  const [creatingBet, setCreatingBet] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [betsData, statsData, bankrollData, oppsData] = await Promise.all([
        getBets(),
        getStats(),
        getBankroll().catch(() => ({ success: false, bankroll: null })),
        getOpportunities(),
      ]);

      setBets(betsData.bets);
      setStats(statsData.stats);
      setOpportunities(oppsData.opportunities);
      if (bankrollData.success && bankrollData.bankroll) {
        setBankroll(bankrollData.bankroll);
      }
    } catch (err) {
      setError('Erro ao carregar dados. Verifique se a API está rodando.');
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
      await fetchData();
    } catch (error) {
      throw error;
    }
  };

  const handleMarkBetResult = async (betId: string, result: 'won' | 'lost' | 'void', finalValue: number) => {
    try {
      await markBetResult(betId, { result, finalValue });
      await fetchData();
    } catch (error) {
      throw error;
    }
  };

  const handleUndoBet = async (betId: string) => {
    await undoBet(betId);
    await fetchData();
  };

  const handleStartBet = async (betId: string) => {
    await markBetInProgress(betId);
    await fetchData();
  };

  const handleSelectOpportunity = (id: string) => {
    setCreateError(null);
    setSelectedOppIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev; // max 2
      return [...prev, id];
    });
  };

  const handleCreateBet = async () => {
    if (selectedOppIds.length !== 2) return;
    setCreatingBet(true);
    setCreateError(null);
    try {
      const res = await createBetFromOpportunities(selectedOppIds[0], selectedOppIds[1]);
      if (!res.success) {
        setCreateError(res.error || 'Erro ao criar aposta');
        return;
      }
      setSelectedOppIds([]);
      setActiveTab('bets');
      await fetchData();
    } catch {
      setCreateError('Erro ao criar aposta');
    } finally {
      setCreatingBet(false);
    }
  };

  const processedBets = () => {
    let result = filter === 'all' ? bets : bets.filter((bet) => bet.status === filter);
    switch (sortBy) {
      case 'odd-high': result = [...result].sort((a, b) => b.summary.oddTotal - a.summary.oddTotal); break;
      case 'odd-low':  result = [...result].sort((a, b) => a.summary.oddTotal - b.summary.oddTotal); break;
      case 'risk-high': result = [...result].sort((a, b) => b.summary.riskTotal - a.summary.riskTotal); break;
      case 'risk-low':  result = [...result].sort((a, b) => a.summary.riskTotal - b.summary.riskTotal); break;
    }
    return result;
  };

  const filteredOpportunities = oppFilter === 'all'
    ? opportunities
    : opportunities.filter((o) => o.status === oppFilter);

  const filteredBets = processedBets();
  const inProgressBets = bets.filter((b) => b.status === 'in_progress');
  const pendingOppsCount = opportunities.filter((o) => o.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Carregando...</p>
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
    <ProtectedRoute>
      <div>
        {/* Bankroll */}
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

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('bets')}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === 'bets'
                ? 'bg-zinc-900 text-green-400 border border-b-zinc-900 border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Duplas de Apostas
            {bets.filter((b) => b.status === 'pending').length > 0 && (
              <span className="ml-2 bg-green-500/20 text-green-400 text-xs px-1.5 py-0.5 rounded-full">
                {bets.filter((b) => b.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('in_progress')}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === 'in_progress'
                ? 'bg-zinc-900 text-orange-400 border border-b-zinc-900 border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Em Andamento
            {inProgressBets.length > 0 && (
              <span className="ml-2 bg-orange-500/20 text-orange-400 text-xs px-1.5 py-0.5 rounded-full">
                {inProgressBets.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === 'opportunities'
                ? 'bg-zinc-900 text-green-400 border border-b-zinc-900 border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Oportunidades
            {pendingOppsCount > 0 && (
              <span className="ml-2 bg-yellow-500/20 text-yellow-400 text-xs px-1.5 py-0.5 rounded-full">
                {pendingOppsCount}
              </span>
            )}
          </button>
        </div>

        {/* ── TAB: APOSTAS ── */}
        {activeTab === 'bets' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <p className="text-sm text-zinc-400">
                {filteredBets.length} dupla{filteredBets.length !== 1 ? 's' : ''} encontrada{filteredBets.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="flex-1 sm:flex-none border border-zinc-800 rounded-lg px-3 py-2 bg-zinc-900 text-zinc-100 text-sm focus:ring-2 focus:ring-green-500 outline-none min-w-[140px]"
                >
                  <option value="pending">Pendentes</option>
                  <option value="all">Todas</option>
                  <option value="won">Vencidas</option>
                  <option value="lost">Perdidas</option>
                  <option value="void">Anuladas</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none border border-zinc-800 rounded-lg px-3 py-2 bg-zinc-900 text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-w-[140px]"
                >
                  <option value="date">📅 Data</option>
                  <option value="odd-high">🔼 Maior Odd</option>
                  <option value="odd-low">🔽 Menor Odd</option>
                  <option value="risk-high">⚠️ Maior Risco</option>
                  <option value="risk-low">✅ Menor Risco</option>
                </select>
                <button
                  onClick={fetchData}
                  className="flex items-center justify-center gap-2 bg-green-500 text-zinc-950 px-4 py-2 rounded-lg hover:bg-green-400 transition-colors font-semibold shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Atualizar</span>
                </button>
              </div>
            </div>

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
                  <BetCard key={bet.id} bet={bet} onUndo={handleUndoBet} onStart={handleStartBet} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: EM ANDAMENTO ── */}
        {activeTab === 'in_progress' && (
          <div>
            <p className="text-sm text-zinc-400 mb-6">
              {inProgressBets.length} aposta{inProgressBets.length !== 1 ? 's' : ''} em andamento
            </p>
            {inProgressBets.length === 0 ? (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-12 text-center">
                <p className="text-zinc-400 text-lg">⏳ Nenhuma aposta em andamento.</p>
                <p className="text-zinc-500 text-sm mt-2">
                  Clique em &ldquo;▶️ Confirmar que apostei&rdquo; em uma dupla pendente para movê-la aqui.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {inProgressBets.map((bet) => (
                  <BetCard key={bet.id} bet={bet} onMarkResult={handleMarkBetResult} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: OPORTUNIDADES ── */}
        {activeTab === 'opportunities' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <p className="text-sm text-zinc-400">
                {filteredOpportunities.length} oportunidade{filteredOpportunities.length !== 1 ? 's' : ''} encontrada{filteredOpportunities.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={oppFilter}
                  onChange={(e) => setOppFilter(e.target.value)}
                  className="flex-1 sm:flex-none border border-zinc-800 rounded-lg px-3 py-2 bg-zinc-900 text-zinc-100 text-sm focus:ring-2 focus:ring-green-500 outline-none min-w-[160px]"
                >
                  <option value="pending">Disponíveis</option>
                  <option value="paired">Emparelhadas</option>
                  <option value="all">Todas</option>
                </select>
                <button
                  onClick={fetchData}
                  className="flex items-center justify-center gap-2 bg-green-500 text-zinc-950 px-4 py-2 rounded-lg hover:bg-green-400 transition-colors font-semibold shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Atualizar</span>
                </button>
              </div>
            </div>

            {filteredOpportunities.length === 0 ? (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-12 text-center">
                <p className="text-zinc-400 text-lg">Nenhuma oportunidade {oppFilter !== 'all' ? oppFilter : ''} no momento.</p>
                <p className="text-zinc-500 text-sm mt-2">
                  O bot busca oportunidades automaticamente a cada 30 minutos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-32">
                {filteredOpportunities.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    selected={selectedOppIds.includes(opp.id)}
                    selectionIndex={selectedOppIds.indexOf(opp.id) === 0 ? 1 : selectedOppIds.indexOf(opp.id) === 1 ? 2 : undefined}
                    onSelect={opp.status === 'pending' ? handleSelectOpportunity : undefined}
                  />
                ))}
              </div>
            )}

            {/* Floating action bar */}
            {selectedOppIds.length > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl shadow-black/60">
                  {createError && (
                    <p className="text-red-400 text-xs text-center mb-3">{createError}</p>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-zinc-400 mb-1">
                        {selectedOppIds.length === 1 ? 'Selecione mais 1 oportunidade' : 'Dupla pronta'}
                      </p>
                      {selectedOppIds.length === 2 && (() => {
                        const o1 = filteredOpportunities.find((o) => o.id === selectedOppIds[0]);
                        const o2 = filteredOpportunities.find((o) => o.id === selectedOppIds[1]);
                        const oddTotal = o1 && o2 ? (o1.bet.odd * o2.bet.odd).toFixed(2) : null;
                        return oddTotal ? (
                          <p className="text-lg font-bold text-green-400">
                            Odd total: {oddTotal}
                          </p>
                        ) : null;
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedOppIds([]); setCreateError(null); }}
                        className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:text-zinc-200 hover:border-zinc-500 transition-colors"
                        disabled={creatingBet}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCreateBet}
                        disabled={selectedOppIds.length !== 2 || creatingBet}
                        className="px-5 py-2 rounded-lg bg-green-500 text-zinc-950 font-semibold text-sm hover:bg-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                      >
                        {creatingBet ? 'Criando...' : 'Gerar Dupla'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
    </ProtectedRoute>
  );
}

