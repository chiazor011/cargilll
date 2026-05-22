export interface Holding {
  id: string;
  fundId: string;
  fundName: string;
  sector: string;
  investedAmount: number;
  currentValue: number;
  ytdReturn: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'divestment' | 'dividend' | 'fee';
  description: string;
  fundName?: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Approved' | 'Rejected';
  paymentMethod?: 'crypto' | 'bank' | 'wire' | 'ach' | 'card';
  paymentDetails?: string;
  adminNotes?: string;
}

export interface AvailableFund {
  id: string;
  dbId: number;
  name: string;
  sector: string;
  description: string;
  minInvestment: number;
  maxInvestment?: number;
  targetYield: number;
  ytdReturn: number;
  aum: string;
  image: string;
}

export interface PortfolioState {
  balance: number;
  holdings: Holding[];
  transactions: Transaction[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  tier: 0 | 1 | 2 | 3;
  kycStatus: 'none' | 'pending' | 'verified';
  isAdmin: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalAum: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalTransactions: number;
}

export interface InvestmentGoal {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  lastUpdate: string;
}

export interface InvestmentOpportunity {
  id: string;
  title: string;
  description: string;
  expectedReturn: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  category: 'Agriculture' | 'Sustainability' | 'Infrastructure' | 'Food Solutions';
  image: string;
  minimumInvestment: number;
}

export interface PortfolioAllocation {
  name: string;
  value: number;
  color: string;
}

export interface MarketInsight {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
}
