'use client';

import { Bankroll } from '@/types';

interface BankrollCardProps {
  bankroll: Bankroll;
  onEdit?: () => void;
}

export default function BankrollCard({ bankroll, onEdit }: BankrollCardProps) {
  const isProfit = bankroll.profit >= 0;
  
  return (
    <div className="bg-zinc-900 border border-green-500/20 rounded-xl p-6 text-zinc-100 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium opacity-90">💰 Banca</h3>
          <p className="text-3xl font-bold mt-1">
            {bankroll.currency} {bankroll.currentBalance.toFixed(2)}
          </p>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors text-zinc-300 flex items-center gap-1"
          >
            <span className="text-xs">✏️</span> Editar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs opacity-75">Inicial</p>
          <p className="text-lg font-semibold">
            {bankroll.currency} {bankroll.initialBalance.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs opacity-75">Lucro</p>
          <p className={`text-lg font-semibold ${isProfit ? 'text-green-300' : 'text-red-300'}`}>
            {isProfit ? '+' : ''}{bankroll.currency} {bankroll.profit.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs opacity-75">Retorno</p>
            <p className={`text-xl font-bold ${isProfit ? 'text-green-300' : 'text-red-300'}`}>
              {isProfit ? '+' : ''}{bankroll.profitPercentage}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-75">Sugestão ({bankroll.stakePercentage}%)</p>
            <p className="text-xl font-bold text-yellow-500">
              {bankroll.currency} {bankroll.suggestedStake.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs opacity-60 mt-3 text-center">
        Atualizado: {new Date(bankroll.updatedAt).toLocaleString('pt-BR')}
      </p>
    </div>
  );
}
