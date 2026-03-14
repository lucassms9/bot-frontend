'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading && isAuthenticated) {
      router.replace('/bets');
    }
  }, [isAuthenticated, isLoading, router, isMounted]);

  // Não renderizar nada no servidor ou antes do mount
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-zinc-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se autenticado, mostrar loading durante redirect
  if (isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-zinc-400">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
