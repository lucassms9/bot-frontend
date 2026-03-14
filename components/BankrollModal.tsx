'use client';

import { useState } from 'react';

interface BankrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (balance: number, currency: string, stakePercentage: number) => Promise<void>;
  currentBalance?: number;
  currentCurrency?: string;
  currentStakePercentage?: number;
}

export default function BankrollModal({
  isOpen,
  onClose,
  onSave,
  currentBalance = 0,
  currentCurrency = 'BRL',
  currentStakePercentage = 10,
}: BankrollModalProps) {
  const [balance, setBalance] = useState(currentBalance.toString());
  const [currency, setCurrency] = useState(currentCurrency);
  const [stakePercentage, setStakePercentage] = useState(currentStakePercentage.toString());
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numBalance = parseFloat(balance);
    const numStakePercentage = parseFloat(stakePercentage);
    
    if (isNaN(numBalance) || numBalance <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    if (isNaN(numStakePercentage) || numStakePercentage <= 0 || numStakePercentage > 100) {
      alert('Porcentagem deve estar entre 0.01 e 100');
      return;
    }

    setLoading(true);
    try {
      await onSave(numBalance, currency, numStakePercentage);
      onClose();
    } catch {
      alert('Erro ao salvar banca');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <span>💰</span> Configurar Banca
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 text-2xl leading-none transition-colors"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Saldo Inicial
            </label>
            <input
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-zinc-100"
              placeholder="1000.00"
              disabled={loading}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Moeda
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-zinc-100"
              disabled={loading}
            >
              <option value="BRL">BRL - Real Brasileiro</option>
              <option value="USD">USD - Dólar Americano</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Porcentagem de Entrada (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              value={stakePercentage}
              onChange={(e) => setStakePercentage(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-zinc-100"
              placeholder="10.00"
              disabled={loading}
              required
            />
            <p className="text-xs text-zinc-500 mt-1">
              Porcentagem do saldo que será sugerida como stake em cada aposta
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-400">
              <span className="opacity-80">ℹ️ Com {stakePercentage || 0}% de R$ {balance || 0}, o stake sugerido será</span> <strong>R$ {((parseFloat(balance || '0') * parseFloat(stakePercentage || '0')) / 100).toFixed(2)}</strong>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-green-600 text-zinc-100 rounded-lg font-medium hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,197,94,0.2)]"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
