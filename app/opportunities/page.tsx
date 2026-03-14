'use client';

import { useEffect, useState } from 'react';
import { getOpportunities, getStats } from '@/lib/api';
import { Opportunity, Stats } from '@/types';
import OpportunityCard from '@/components/OpportunityCard';
import StatsCard from '@/components/StatsCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [oppsData, statsData] = await Promise.all([
        getOpportunities('pending'),
        getStats(),
      ]);

      setOpportunities(oppsData.opportunities);
      setStats(statsData.stats);
    } catch (err) {
      setError('Erro ao carregar oportunidades. Verifique se a API está rodando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando oportunidades...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div>
      {/* Stats */}
      {stats && <StatsCard stats={stats} />}

      {/* Header com Refresh */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Oportunidades</h2>
          <p className="text-sm text-gray-600">
            {opportunities.length} oportunidade{opportunities.length !== 1 ? 's' : ''} disponíve{opportunities.length !== 1 ? 'is' : 'l'}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Atualizar
        </button>
      </div>

      {/* Oportunidades Grid */}
      {opportunities.length === 0 ? (
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg">Nenhuma oportunidade disponível no momento.</p>
          <p className="text-gray-500 text-sm mt-2">
            O bot processa odds a cada 30 minutos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
