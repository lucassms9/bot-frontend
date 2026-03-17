import { Stats } from '@/types';

interface Props {
  stats: Stats;
}

export default function StatsCard({ stats }: Props) {
  return (
    <div className="bg-zinc-900 border border-green-500/20 rounded-lg shadow-lg p-6 text-zinc-100 mb-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-green-500">📊</span> Estatísticas
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Oportunidades */}
        <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800">
          <div className="text-xs opacity-80 mb-1">Oportunidades</div>
          <div className="text-2xl font-bold">{stats.opportunities.pending}</div>
          <div className="text-xs mt-2">
            {stats.opportunities.paired} em uso
          </div>
        </div>

        {/* Duplas */}
        <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800">
          <div className="text-xs text-zinc-400 mb-1">Duplas</div>
          <div className="text-2xl font-bold text-green-400">{stats.bets.total}</div>
          <div className="text-xs mt-2">
            {stats.bets.pending > 0 && <span>{stats.bets.pending} pendentes</span>}
            {stats.bets.pending > 0 && stats.bets.inProgress > 0 && <span> · </span>}
            {stats.bets.inProgress > 0 && <span className="text-orange-400">{stats.bets.inProgress} em andamento</span>}
            {stats.bets.pending === 0 && stats.bets.inProgress === 0 && <span>todas resolvidas</span>}
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800">
          <div className="text-xs text-zinc-400 mb-1">Win Rate</div>
          <div className="text-2xl font-bold text-zinc-100">{stats.bets.winRate.toFixed(1)}%</div>
          <div className="text-xs mt-2">
            {stats.bets.won}W / {stats.bets.lost}L
          </div>
        </div>

        {/* Lucro */}
        <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800">
          <div className="text-xs text-zinc-400 mb-1">Lucro Total</div>
          <div className={`text-2xl font-bold ${
            stats.bets.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            R$ {stats.bets.totalProfit.toFixed(2)}
          </div>
          <div className="text-xs mt-2">
            Odd média: {stats.bets.averageOdd.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
