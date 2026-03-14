import { Bet } from '@/types';

interface Props {
  bet: Bet;
}

const riskColors: Record<string, string> = {
  'Excelente': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Ótimo': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Bom': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Moderado': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Alto': 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function BetCard({ bet }: Props) {
  const colorClass = riskColors[bet.summary.riskCategory] || 'bg-zinc-800 text-zinc-300 border-zinc-700';

  return (
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
  );
}
