import { Opportunity } from '@/types';
import { StarIcon } from '@heroicons/react/24/solid';

interface Props {
  opportunity: Opportunity;
}

const riskColors: Record<string, string> = {
  'Excelente': 'bg-green-100 text-green-800 border-green-300',
  'Ótimo': 'bg-blue-100 text-blue-800 border-blue-300',
  'Bom': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Moderado': 'bg-orange-100 text-orange-800 border-orange-300',
  'Alto': 'bg-red-100 text-red-800 border-red-300',
};

export default function OpportunityCard({ opportunity }: Props) {
  const colorClass = riskColors[opportunity.risk.category] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      {/* Header com Badge de Risco */}
      <div className="flex justify-between items-start mb-3">
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
          {opportunity.risk.category}
        </div>
        <div className="flex items-center">
          {Array.from({ length: opportunity.risk.stars }).map((_, i) => (
            <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
          ))}
        </div>
      </div>

      {/* Jogo */}
      <div className="mb-3">
        <div className="text-sm font-semibold text-gray-900 mb-1">
          {opportunity.match.homeTeam} <span className="text-gray-400">vs</span> {opportunity.match.awayTeam}
        </div>
        <div className="text-xs text-gray-500">
          {opportunity.match.kickoffFormatted}
        </div>
      </div>

      {/* Aposta */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm font-bold text-gray-900">{opportunity.bet.team}</div>
            <div className="text-xs text-gray-500 mt-1">
              Handicap <span className="font-semibold text-blue-600">+{opportunity.bet.handicap}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{opportunity.bet.odd.toFixed(2)}</div>
            <div className="text-xs text-gray-500">odd</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center">
          <span className="font-medium">{opportunity.bet.bookmaker}</span>
        </div>
        <div>
          Risk: <span className="font-semibold">{opportunity.risk.score.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
