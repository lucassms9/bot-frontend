import { OpportunitiesResponse, BetsResponse, StatsResponse, BankrollResponse, CreateBankrollDto, MarkBetResultDto } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export async function getOpportunities(status?: string): Promise<OpportunitiesResponse> {
  const url = status 
    ? `${API_BASE_URL}/api/opportunities?status=${status}`
    : `${API_BASE_URL}/api/opportunities`;
  
  const response = await fetch(url, {
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch opportunities');
  }
  
  return response.json();
}

export async function getBets(status?: string): Promise<BetsResponse> {
  const url = status 
    ? `${API_BASE_URL}/api/bets?status=${status}`
    : `${API_BASE_URL}/api/bets`;
  
  const response = await fetch(url, {
    cache: 'no-store',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch bets');
  }
  
  return response.json();
}

export async function getStats(): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/stats`, {
    cache: 'no-store',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  
  return response.json();
}

export async function getTopOpportunities(limit = 10): Promise<OpportunitiesResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/top-opportunities?limit=${limit}`,
    {
      cache: 'no-store',
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch top opportunities');
  }
  
  return response.json();
}

// Bankroll API functions
export async function getBankroll(): Promise<BankrollResponse> {
  const response = await fetch(`${API_BASE_URL}/api/bankroll`, {
    cache: 'no-store',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch bankroll');
  }
  
  return response.json();
}

export async function createOrUpdateBankroll(data: CreateBankrollDto): Promise<BankrollResponse> {
  const response = await fetch(`${API_BASE_URL}/api/bankroll`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create/update bankroll');
  }
  
  return response.json();
}

export async function markBetResult(betId: string, data: MarkBetResultDto): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/bets/${betId}/result`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark bet result');
  }
  
  return response.json();
}
