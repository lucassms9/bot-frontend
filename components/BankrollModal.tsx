'use client';

import { useState } from 'react';

interface BankrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (balance: number, currency: string, stakePercentage: number) => Promise<void>;
  onReset?: (balance: number, currency: string, stakePercentage: number) => Promise<void>;
  currentBalance?: number;
  currentCurrency?: string;
  currentStakePercentage?: number;
  hasExistingBankroll?: boolean;
}

export default function BankrollModal({
  isOpen,
  onClose,
  onSave,
  onReset,
  currentBalance = 0,
  currentCurrency = 'BRL',
  currentStakePercentage = 10,
  hasExistingBankroll = false,
}: BankrollModalProps) {
  const [balance, setBalance] = useState(currentBalance.toString());
  const [currency, setCurrency] = useState(currentCurrency);
  const [stakePercentage, setStakePercentage] = useState(currentStakePercentage.toString());
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

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

    if (resetMode && !confirmReset) {
      alert('Confirme o reset marcando a caixa de confirmação.');
      return;
    }

    setLoading(true);
    try {
      if (resetMode && onReset) {
        await onReset(numBalance, currency, numStakePercentage);
      } else {
        await onSave(numBalance, currency, numStakePercentage);
      }
      setResetMode(false);
      setConfirmReset(false);
      onClose();
    } catch {
      alert(resetMode ? 'Erro ao resetar banca' : 'Erro ao salvar banca');
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
              {resetMode ? 'Novo Saldo (ponto de partida)' : 'Saldo Inicial'}
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

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-400">
              <span className="opacity-80">ℹ️ Com {stakePercentage || 0}% de R$ {balance || 0}, o stake sugerido será</span> <strong>R$ {((parseFloat(balance || '0') * parseFloat(stakePercentage || '0')) / 100).toFixed(2)}</strong>
            </p>
          </div>

          {/* Reset option — only shown for existing bankrolls */}
          {hasExistingBankroll && onReset && (
            <div className="mb-5">
              <button
                type="button"
                onClick={() => { setResetMode(!resetMode); setConfirmReset(false); }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  resetMode
                    ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
                disabled={loading}
              >
                <span>🔄</span>
                {resetMode ? 'Resetar banca ativado' : 'Resetar banca (zerar lucro/prejuízo)'}
              </button>

              {resetMode && (
                <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg space-y-3">
                  <p className="text-xs text-orange-300 leading-relaxed">
                    <strong>Atenção:</strong> isso define um novo ponto de partida. O saldo atual e o saldo inicial serão ambos ajustados para o valor informado acima, zerando o histórico de lucro/prejuízo.
                  </p>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmReset}
                      onChange={(e) => setConfirmReset(e.target.checked)}
                      className="mt-0.5 accent-orange-400"
                      disabled={loading}
                    />
                    <span className="text-xs text-orange-300">Entendo que o histórico de lucro/prejuízo será zerado</span>
                  </label>
                </div>
              )}
            </div>
          )}

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
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                resetMode
                  ? 'bg-orange-500 hover:bg-orange-400 text-white'
                  : 'bg-green-600 hover:bg-green-500 text-zinc-100 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
              }`}
              disabled={loading || (resetMode && !confirmReset)}
            >
              {loading ? 'Salvando...' : resetMode ? '🔄 Resetar banca' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
