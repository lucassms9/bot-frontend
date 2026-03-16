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

// Helper function to handle 401 errors globally
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    // Unauthorized - clear auth and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized - redirecting to login');
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function getOpportunities(status?: string): Promise<OpportunitiesResponse> {
  const url = status 
    ? `${API_BASE_URL}/api/opportunities?status=${status}`
    : `${API_BASE_URL}/api/opportunities`;
  
  const response = await fetch(url, {
    cache: 'no-store',
  });
  
  return handleResponse<OpportunitiesResponse>(response);
}

export async function getBets(status?: string): Promise<BetsResponse> {
  const url = status 
    ? `${API_BASE_URL}/api/bets?status=${status}`
    : `${API_BASE_URL}/api/bets`;
  
  const response = await fetch(url, {
    cache: 'no-store',
    headers: getAuthHeaders(),
  });
  
  return handleResponse<BetsResponse>(response);
}

export async function getStats(): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/stats`, {
    cache: 'no-store',
    headers: getAuthHeaders(),
  });
  
  return handleResponse<StatsResponse>(response);
}

export async function getTopOpportunities(limit = 10): Promise<OpportunitiesResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/top-opportunities?limit=${limit}`,
    {
      cache: 'no-store',
    }
  );
  
  return handleResponse<OpportunitiesResponse>(response);
}

// Bankroll API functions
export async function getBankroll(): Promise<BankrollResponse> {
  const response = await fetch(`${API_BASE_URL}/api/bankroll`, {
    cache: 'no-store',
    headers: getAuthHeaders(),
  });
  
  return handleResponse<BankrollResponse>(response);
}

export async function createOrUpdateBankroll(data: CreateBankrollDto): Promise<BankrollResponse> {
  const response = await fetch(`${API_BASE_URL}/api/bankroll`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  return handleResponse<BankrollResponse>(response);
}

export async function markBetResult(betId: string, data: MarkBetResultDto): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/bets/${betId}/result`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<any>(response);
}

export async function markBetInProgress(betId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/bets/${betId}/start`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  const data = await handleResponse<any>(response);
  if (!data.success) {
    throw new Error(data.error || 'Erro ao marcar aposta como em andamento');
  }
  return data;
}

export async function undoBet(betId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/bets/${betId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse<any>(response);
}

export async function createBetFromOpportunities(
  opportunity1Id: string,
  opportunity2Id: string,
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/bets/create-from-opportunities`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ opportunity1Id, opportunity2Id }),
  });

  return handleResponse<any>(response);
}
