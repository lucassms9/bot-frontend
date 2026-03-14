// Types para as APIs do Bot de Apostas

export interface Opportunity {
  id: string;
  status: string;
  match: {
    eventId: string;
    league: string;
    homeTeam: string;
    awayTeam: string;
    kickoff: string;
    kickoffFormatted: string;
  };
  bet: {
    team: string;
    handicap: number;
    odd: number;
    bookmaker: string;
  };
  risk: {
    score: number;
    category: string;
    stars: number;
  };
  createdAt: string;
  createdAtFormatted: string;
}

export interface OpportunitiesResponse {
  success: boolean;
  count: number;
  opportunities: Opportunity[];
  timestamp: string;
}

export interface BetGame {
  id: string;
  team: string;
  handicap: number;
  odd: number;
  bookmaker: string;
  riskScore: number;
  riskCategory: string;
  match: {
    league: string;
    homeTeam: string;
    awayTeam: string;
    kickoff: string;
    kickoffFormatted: string;
  };
}

export interface Bet {
  id: string;
  status: string;
  summary: {
    oddTotal: number;
    riskTotal: number;
    riskCategory: string;
    potentialProfit: string;
    profitPercentage: string;
  };
  game1: BetGame;
  game2: BetGame;
  result: {
    status: string;
    profit: number | null;
  };
  stake?: number;
  suggestedStake?: number;
  createdAt: string;
  createdAtFormatted: string;
}

export interface BetsResponse {
  success: boolean;
  count: number;
  bets: Bet[];
  timestamp: string;
}

export interface Stats {
  opportunities: {
    total: number;
    pending: number;
    paired: number;
    averageRisk: number;
  };
  bets: {
    total: number;
    pending: number;
    won: number;
    lost: number;
    winRate: number;
    averageOdd: number;
    totalProfit: number;
  };
}

export interface StatsResponse {
  success: boolean;
  stats: Stats;
  timestamp: string;
}

// Bankroll types
export interface Bankroll {
  id: string;
  currentBalance: number;
  initialBalance: number;
  currency: string;
  stakePercentage: number;
  profit: number;
  profitPercentage: string;
  suggestedStake: number;
  updatedAt: string;
}

export interface BankrollResponse {
  success: boolean;
  bankroll: Bankroll;
  timestamp: string;
}

export interface CreateBankrollDto {
  initial_balance: number;
  currency?: string;
  stake_percentage?: number;
}

export interface MarkBetResultDto {
  result: 'won' | 'lost';
  stake: number;
}
