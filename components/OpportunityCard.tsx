import { Opportunity } from '@/types';
import { StarIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface Props {
  opportunity: Opportunity;
  selected?: boolean;
  selectionIndex?: 1 | 2; // which slot it occupies
  onSelect?: (id: string) => void;
}

const riskBadge: Record<string, string> = {
  Excelente: 'bg-green-500/20 text-green-400 border-green-500/30',
  Ótimo: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Bom: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Moderado: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Alto: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  paired: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  discarded: 'bg-zinc-700 text-zinc-400 border-zinc-600',
};

const statusLabel: Record<string, string> = {
  pending: 'DISPONÍVEL',
  paired: 'EMPARELHADA',
  discarded: 'DESCARTADA',
};

export default function OpportunityCard({ opportunity, selected, selectionIndex, onSelect }: Props) {
  const riskClass = riskBadge[opportunity.risk.category] ?? 'bg-zinc-700 text-zinc-400 border-zinc-600';
  const stClass = statusBadge[opportunity.status] ?? 'bg-zinc-700 text-zinc-400 border-zinc-600';
  const isSelectable = opportunity.status === 'pending' && !!onSelect;

  return (
    <div
      onClick={() => isSelectable && onSelect(opportunity.id)}
      className={`bg-zinc-900 border rounded-xl p-4 transition-all ${
        isSelectable ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-green-500 ring-2 ring-green-500/30 shadow-[0_0_16px_rgba(34,197,94,0.15)]'
          : isSelectable
          ? 'border-zinc-800 hover:border-zinc-600'
          : 'border-zinc-800 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {selected && (
            <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/20 border border-green-500/30 px-2 py-0.5 rounded-full">
              <CheckCircleIcon className="w-3.5 h-3.5" />
              JOGO {selectionIndex}
            </span>
          )}
          {!selected && (
            <>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${riskClass}`}>
                {opportunity.risk.category}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${stClass}`}>
                {statusLabel[opportunity.status] ?? opportunity.status.toUpperCase()}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: opportunity.risk.stars }).map((_, i) => (
            <StarIcon key={i} className="w-3.5 h-3.5 text-yellow-400" />
          ))}
        </div>
      </div>

      {/* Liga */}
      <span className="inline-block text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded mb-2">
        {opportunity.match.league}
      </span>

      {/* Jogo */}
      <div className="mb-3">
        <div className="text-sm font-semibold text-zinc-100">
          {opportunity.match.homeTeam} <span className="text-zinc-500">vs</span>{' '}
          {opportunity.match.awayTeam}
        </div>
        <div className="text-xs text-zinc-500 mt-0.5">{opportunity.match.kickoffFormatted}</div>
      </div>

      {/* Aposta */}
      <div className={`rounded-lg p-3 flex justify-between items-center ${
        selected ? 'bg-green-500/10 border border-green-500/20' : 'bg-zinc-800/60'
      }`}>
        <div>
          <div className="text-sm font-bold text-zinc-100">{opportunity.bet.team}</div>
          <div className="text-xs text-zinc-500 mt-0.5">
            Handicap{' '}
            <span className="font-semibold text-green-400">+{opportunity.bet.handicap}</span>
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">{opportunity.bet.bookmaker}</div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${selected ? 'text-green-300' : 'text-green-400'}`}>
            {opportunity.bet.odd.toFixed(2)}
          </div>
          <div className="text-xs text-zinc-500">odd</div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex justify-between text-xs text-zinc-500">
        <span>Criado em {opportunity.createdAtFormatted}</span>
        <span>Risco: <span className="font-semibold text-zinc-300">{opportunity.risk.score.toFixed(2)}</span></span>
      </div>
    </div>
  );
}
