"use client";

import { Bet } from "@/types";
import { useState } from "react";

interface Props {
  bet: Bet;
  onMarkResult?: (
    betId: string,
    result: "won" | "lost" | "void",
    finalValue: number,
  ) => Promise<void>;
  onUndo?: (betId: string) => Promise<void>;
  onStart?: (betId: string) => Promise<void>;
}

const riskColors: Record<string, string> = {
  Excelente: "bg-green-500/10 text-green-400 border-green-500/20",
  Ótimo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Bom: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Moderado: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Alto: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function BetCard({ bet, onMarkResult, onUndo, onStart }: Props) {
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);
  const [selectedResult, setSelectedResult] = useState<
    "won" | "lost" | "void" | null
  >(null);
  const [finalValue, setFinalValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [undoLoading, setUndoLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [copiedGame, setCopiedGame] = useState<string | null>(null);

  const colorClass =
    riskColors[bet.summary.riskCategory] ||
    "bg-zinc-800 text-zinc-300 border-zinc-700";
  const isPending = bet.status === "pending";
  const isInProgress = bet.status === "in_progress";

  const handleCopyTeam = async (team: string, temaaway: string) => {
    try {
      console.log(`Copying to clipboard: ${team} ${temaaway}`);
      await navigator.clipboard.writeText(`${team} ${temaaway}`);
      setCopiedGame(`${team} ${temaaway}`);
      setTimeout(() => setCopiedGame(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleResultClick = (result: "won" | "lost" | "void") => {
    setSelectedResult(result);
    setShowStakeModal(true);
    // Pre-fill with suggested stake for void
    if (result === "void" && bet.suggestedStake) {
      setFinalValue(bet.suggestedStake.toFixed(2));
    }
  };

  const handleConfirmResult = async () => {
    if (!selectedResult || !onMarkResult) return;

    const value = parseFloat(finalValue);
    if (isNaN(value) || value <= 0) {
      alert("Digite um valor válido");
      return;
    }

    setLoading(true);
    try {
      await onMarkResult(bet.id, selectedResult, value);
      setShowStakeModal(false);
    } catch {
      alert("Erro ao marcar resultado");
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    if (!onUndo) return;
    setUndoLoading(true);
    try {
      await onUndo(bet.id);
      setShowUndoConfirm(false);
    } catch {
      alert("Erro ao desfazer aposta");
    } finally {
      setUndoLoading(false);
    }
  };

  const handleStart = async () => {
    if (!onStart) return;
    setStartLoading(true);
    try {
      await onStart(bet.id);
    } catch {
      alert("Erro ao confirmar aposta");
    } finally {
      setStartLoading(false);
    }
  };

  return (
    <>
      <div
        className={`bg-zinc-900 rounded-lg shadow-md border p-4 transition-colors ${
          isInProgress
            ? "border-orange-500/40 hover:border-orange-500/60 shadow-orange-900/20"
            : "border-zinc-800 hover:border-green-500/30"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {bet.summary.oddTotal.toFixed(2)}
              </div>
              <div className="text-xs text-zinc-500">odd total</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-emerald-500">
              R$ {bet.summary.potentialProfit}
            </div>
            <div className="text-xs text-zinc-500">lucro potencial</div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
          >
            {bet.summary.riskCategory}
          </div>
        </div>

        {/* In-progress banner */}
        {isInProgress && (
          <div className="mb-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-orange-300/80 block mb-0.5">
                Em Andamento
              </span>
              <span className="text-sm text-orange-300 font-medium">
                ⏳ Aguardando resultado dos jogos
              </span>
            </div>
            {bet.suggestedStake && (
              <span className="text-xl font-bold text-orange-400">
                R$ {bet.suggestedStake.toFixed(2)}
              </span>
            )}
          </div>
        )}

        {/* Suggested Stake — pending only */}
        {bet.suggestedStake && isPending && (
          <div className="mb-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-yellow-300/80 block mb-1">
                  Stake Sugerido
                </span>
                <span className="text-sm text-yellow-300 font-medium">
                  💡 Baseado no seu bankroll
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-yellow-400">
                  R$ {bet.suggestedStake.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actual Stake (if bet was placed) */}
        {bet.stake && !isPending && (
          <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-300">💰 Valor Apostado</span>
              <span className="text-lg font-bold text-blue-400">
                R$ {bet.stake.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Result Display */}
        {!isPending && bet.result.profit !== null && (
          <div
            className={`mb-3 p-3 rounded-lg border ${
              bet.result.profit >= 0
                ? "bg-green-500/10 border-green-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-300">
                {bet.result.profit >= 0 ? "🟢 Lucro" : "🔴 Prejuízo"}
              </span>
              <span
                className={`text-lg font-bold ${
                  bet.result.profit >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {bet.result.profit >= 0 ? "+" : ""}R${" "}
                {bet.result.profit.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Game 1 */}
        <div className="mb-3 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs font-semibold text-green-500">JOGO 1</div>
            <div className="text-xs bg-zinc-800/50 px-2 py-0.5 rounded text-zinc-400">
              {bet.game1.match.league}
            </div>
          </div>
          <div className="text-sm font-semibold text-zinc-100 mb-1">
            {bet.game1.match.homeTeam} <span className="text-zinc-500">vs</span>{" "}
            {bet.game1.match.awayTeam}
            <button
              onClick={() =>
                handleCopyTeam(
                  bet.game1.match.homeTeam,
                  bet.game1.match.awayTeam,
                )
              }
              className="p-0.5 rounded hover:bg-zinc-700 transition-colors"
              title="Copiar time"
            >
              {copiedGame ? (
                <svg
                  className="w-3.5 h-3.5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm flex items-center gap-1.5">
              <span className="font-bold text-zinc-300">{bet.game1.team}</span>

              <span className="text-green-400 font-semibold">
                +{bet.game1.handicap}
              </span>
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
        <div className="text-center text-zinc-600 font-bold text-lg my-2">
          +
        </div>

        {/* Game 2 */}
        <div className="mb-3 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs font-semibold text-emerald-500">JOGO 2</div>
            <div className="text-xs bg-zinc-800/50 px-2 py-0.5 rounded text-zinc-400">
              {bet.game2.match.league}
            </div>
          </div>
          <div className="text-sm font-semibold text-zinc-100 mb-1">
            {bet.game2.match.homeTeam} <span className="text-zinc-500">vs</span>{" "}
            {bet.game2.match.awayTeam}
            <button
              onClick={() =>
                handleCopyTeam(
                  bet.game2.match.homeTeam,
                  bet.game2.match.awayTeam,
                )
              }
              className="p-0.5 rounded hover:bg-zinc-700 transition-colors"
              title="Copiar time"
            >
              {copiedGame ? (
                <svg
                  className="w-3.5 h-3.5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm flex items-center gap-1.5">
              <span className="font-bold text-zinc-300">{bet.game2.team}</span>

              <span className="text-emerald-400 font-semibold">
                +{bet.game2.handicap}
              </span>
            </div>
            <div className="text-lg font-bold text-emerald-400">
              {bet.game2.odd.toFixed(2)}
            </div>
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            {bet.game2.match.kickoffFormatted}
          </div>
        </div>

        {/* Action Buttons — pending: show start + result buttons */}
        {isPending && onStart && (
          <button
            onClick={handleStart}
            disabled={startLoading}
            className="w-full mb-2 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {startLoading ? "Confirmando..." : "▶️ Confirmar que apostei"}
          </button>
        )}
        {isPending && onMarkResult && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => handleResultClick("won")}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="text-lg">🟢</span>
              <span>GREEN</span>
            </button>
            <button
              onClick={() => handleResultClick("void")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="text-lg">🔵</span>
              <span>VOID</span>
            </button>
            <button
              onClick={() => handleResultClick("lost")}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="text-lg">🔴</span>
              <span>RED</span>
            </button>
          </div>
        )}

        {/* Action Buttons — in_progress: show result buttons only */}
        {isInProgress && onMarkResult && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => handleResultClick("won")}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="text-lg">🟢</span>
              <span>GREEN</span>
            </button>
            <button
              onClick={() => handleResultClick("void")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="text-lg">🔵</span>
              <span>VOID</span>
            </button>
            <button
              onClick={() => handleResultClick("lost")}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="text-lg">🔴</span>
              <span>RED</span>
            </button>
          </div>
        )}

        {/* Undo button — only for pending bets */}
        {isPending && onUndo && (
          <button
            onClick={() => setShowUndoConfirm(true)}
            className="w-full mb-3 py-2 rounded-lg border border-zinc-700 text-zinc-400 text-sm font-medium hover:border-zinc-500 hover:text-zinc-200 transition-colors"
          >
            Desfazer aposta
          </button>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
          <div className="text-xs text-zinc-500">
            Criado em {bet.createdAtFormatted}
          </div>
          <div
            className={`px-2 py-1 rounded text-xs font-semibold border ${
              bet.status === "pending"
                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                : bet.status === "in_progress"
                  ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                  : bet.status === "won"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {bet.status === "in_progress"
              ? "EM ANDAMENTO"
              : bet.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Undo Confirmation Modal */}
      {showUndoConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              Desfazer aposta?
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              A aposta será removida e as duas oportunidades voltam para a lista
              de disponíveis, podendo ser usadas em novas duplas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUndoConfirm(false)}
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                disabled={undoLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleUndo}
                className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                disabled={undoLoading}
              >
                {undoLoading ? "Removendo..." : "Desfazer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stake Modal */}
      {showStakeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {selectedResult === "won"
                ? "🟢 Marcar como GREEN"
                : selectedResult === "void"
                  ? "🔵 Marcar como VOID"
                  : "🔴 Marcar como RED"}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                {selectedResult === "won"
                  ? "Lucro Final (R$)"
                  : selectedResult === "void"
                    ? "Stake Retornado (R$)"
                    : "Prejuízo Final (R$)"}
              </label>
              <input
                type="number"
                step="0.01"
                value={finalValue}
                onChange={(e) => setFinalValue(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={
                  selectedResult === "won"
                    ? "205.50"
                    : selectedResult === "void"
                      ? bet.suggestedStake?.toFixed(2) || "100.00"
                      : "100.00"
                }
                disabled={loading}
              />
              <p className="text-xs text-zinc-500 mt-2">
                {selectedResult === "won"
                  ? "💡 Digite o valor que você ganhou (lucro líquido)"
                  : selectedResult === "void"
                    ? "💡 Digite o valor da stake que será devolvida à banca"
                    : "💡 Digite o valor que você perdeu (prejuízo total)"}
              </p>
            </div>

            {selectedResult === "won" && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400">
                  ✅ Será adicionado:{" "}
                  <strong>R$ {parseFloat(finalValue || "0").toFixed(2)}</strong>{" "}
                  à banca
                </p>
              </div>
            )}

            {selectedResult === "void" && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-400">
                  🔄 Será retornado:{" "}
                  <strong>R$ {parseFloat(finalValue || "0").toFixed(2)}</strong>{" "}
                  à banca
                </p>
                <p className="text-xs text-blue-300 mt-1">
                  Aposta cancelada/void - sem lucro nem prejuízo
                </p>
              </div>
            )}

            {selectedResult === "lost" && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">
                  ❌ Será subtraído:{" "}
                  <strong>R$ {parseFloat(finalValue || "0").toFixed(2)}</strong>{" "}
                  da banca
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
                  selectedResult === "won"
                    ? "bg-green-600 hover:bg-green-700"
                    : selectedResult === "void"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-red-600 hover:bg-red-700"
                }`}
                disabled={loading}
              >
                {loading ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
