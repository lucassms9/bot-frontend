'use client';

import { Bet } from '@/types';
import { useState } from 'react';

interface Props {
  bet: Bet;
  onMarkResult?: (betId: string, result: 'won' | 'lost', stake: number) => Promise<void>;
}

const riskColors: Record<string, string> = {
  'Excelente': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Ótimo': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Bom': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Moderado': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Alto': 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function BetCard({ bet, onMarkResult }: Props) {
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<'won' | 'lost' | null>(null);
  const [stakeAmount, setStakeAmount] = useState(bet.suggestedStake?.toFixed(2) || '');
  const [loading, setLoading] = useState(false);

  const colorClass = riskColors[bet.summary.riskCategory] || 'bg-zinc-800 text-zinc-300 border-zinc-700';
  const isPending = bet.status === 'pending';

  const handleResultClick = (result: 'won' | 'lost') => {
    setSelectedResult(result);
    setShowStakeModal(true);
  };

  const handleConfirmResult = async () => {
    if (!selectedResult || !onMarkResult) return;

    const stake = parseFloat(stakeAmount);
    if (isNaN(stake) || stake <= 0) {
      alert('Digite um valor válido');
      return;
    }

    setLoading(true);
    try {
      await onMarkResult(bet.id, selectedResult, stake);
      setShowStakeModal(false);
    } catch (error) {
      alert('Erro ao marcar resultado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-zinc-900 rounded-lg shadow-md border border-zinc-800 p-4 hover:border-green-500/30 transition-colors">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-800">
          <div>
            <div className="text-2xl font-bold text-green-400">
              {bet.summary.oddTotal.toFixed(2)}
            </div>
            <div className="text-xs text-zinc-500">odd total</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-emerald-500">
              R$ {bet.summary.potentialProfit}
            </div>
            <div className="text-xs text-zinc-500">lucro potencial</div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
            {bet.summary.riskCategory}
          </div>
        </div>

        {/* Suggested Stake */}
        {bet.suggestedStake && isPending && (
          <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-yellow-300">💡 Stake sugerido (10%)</span>
              <span className="text-lg font-bold text-yellow-400">
                R$ {bet.suggestedStake.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Result Display */}
        {!isPending && bet.result.profit !== null && (
          <div className={`mb-3 p-3 rounded-lg border ${
            bet.result.profit >= 0 
              ? 'bg-green-500/10 border-green-500/20' 
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-300">
                {bet.result.profit >= 0 ? '🟢 Lucro' : '🔴 Prejuízo'}
              </span>
              <span className={`text-lg font-bold ${
                bet.result.profit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {bet.result.profit >= 0 ? '+' : ''}R$ {bet.result.profit.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Game 1 */}
        <div className="mb-3 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
          <div className="text-xs font-semibold text-green-500 mb-2">JOGO 1</div>
          <div className="text-sm font-semibold text-zinc-100 mb-1">
            {bet.game1.match.homeTeam} <span className="text-zinc-500">vs</span> {bet.game1.match.awayTeam}
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm">
              <span className="font-bold text-zinc-300">{bet.game1.team}</span>
              <span className="text-green-400 font-semibold ml-2">+{bet.game1.handicap}</span>
            </div>
            <div className="text-lg font-bold text-green-400">
              {bet.game1.odd.toFixed(2)}
            </div>
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            {bet.game1.match.kickoffFormatted}
          </div>
        </div>

        {/* Divider */}
        <div className="text-center text-zinc-600 font-bold text-lg my-2">+</div>

        {/* Game 2 */}
        <div className="mb-3 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
          <div className="text-xs font-semibold text-emerald-500 mb-2">JOGO 2</div>
          <div className="text-sm font-semibold text-zinc-100 mb-1">
            {bet.game2.match.homeTeam} <span className="text-zinc-500">vs</span> {bet.game2.match.awayTeam}
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm">
              <span className="font-bold text-zinc-300">{bet.game2.team}</span>
              <span className="text-emerald-400 font-semibold ml-2">+{bet.game2.handicap}</span>
            </div>
            <div className="text-lg font-bold text-emerald-400">
              {bet.game2.odd.toFixed(2)}
            </div>
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            {bet.game2.match.kickoffFormatted}
          </div>
        </div>

        {/* Action Buttons */}
        {isPending && onMarkResult && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => handleResultClick('won')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg">🟢</span>
              <span>GREEN</span>
            </button>
            <button
              onClick={() => handleResultClick('lost')}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg">🔴</span>
              <span>RED</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
          <div className="text-xs text-zinc-500">
            Criado em {bet.createdAtFormatted}
          </div>
          <div className={`px-2 py-1 rounded text-xs font-semibold border ${
            bet.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
            bet.status === 'won' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
            'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {bet.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Stake Modal */}
      {showStakeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {selectedResult === 'won' ? '🟢 Marcar como GREEN' : '🔴 Marcar como RED'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Valor Apostado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="100.00"
                disabled={loading}
              />
            </div>

            {selectedResult === 'won' && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400">
                  Lucro estimado: <strong>R$ {(parseFloat(stakeAmount || '0') * (bet.summary.oddTotal - 1)).toFixed(2)}</strong>
                </p>
              </div>
            )}

            {selectedResult === 'lost' && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">
                  Prejuízo: <strong>R$ {parseFloat(stakeAmount || '0').toFixed(2)}</strong>
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowStakeModal(false)}
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmResult}
                className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  selectedResult === 'won' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
