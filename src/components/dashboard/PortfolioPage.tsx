import React from 'react';
import { ArrowRight, ArrowUpRight, TrendingUp, TrendingDown, Wallet, Globe, Leaf, Plus, Minus, PiggyBank, AlertTriangle, Clock, Bitcoin, Landmark } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { PortfolioState, Holding } from '../../types';

interface PortfolioPageProps {
  portfolio: PortfolioState;
  totalValue: number;
  ytdReturn: number;
  onNavigate: (path: string) => void;
  onDeposit: () => void;
  onCryptoDeposit: () => void;
  onBankDeposit: () => void;
  onWithdraw: () => void;
  onInvest: (fundId: any) => void;
  onSell: (holding: Holding) => void;
}

const COLORS = ['#0a4f26', '#8DC63F', '#052b14', '#d1d5db'];

export default function PortfolioPage({ portfolio, totalValue, ytdReturn, onNavigate, onDeposit, onCryptoDeposit, onBankDeposit, onWithdraw, onInvest, onSell }: PortfolioPageProps) {
  const { balance, holdings, transactions } = portfolio;

  const totalInvested = holdings.reduce((s, h) => s + h.investedAmount, 0);
  const totalHoldingsValue = holdings.reduce((s, h) => s + h.currentValue, 0);

  const dividends = transactions.filter(t => t.type === 'dividend').reduce((s, t) => s + t.amount, 0);

  const allocationData = holdings.map((h, i) => ({
    name: h.fundName,
    value: Math.round((h.currentValue / totalHoldingsValue) * 100) || 0,
    color: COLORS[i % COLORS.length],
  }));

  if (balance > 0) {
    allocationData.push({
      name: 'Cash',
      value: Math.round((balance / totalValue) * 100),
      color: '#e5e7eb',
    });
  }

  // Chart data over months based on current portfolio state
  const chartData = [
    { month: 'Jan', value: totalValue * 0.92 },
    { month: 'Feb', value: totalValue * 0.94 },
    { month: 'Mar', value: totalValue * 0.95 },
    { month: 'Apr', value: totalValue * 0.93 },
    { month: 'May', value: totalValue * 0.96 },
    { month: 'Jun', value: totalValue * 0.98 },
    { month: 'Jul', value: totalValue * 0.99 },
    { month: 'Aug', value: totalValue * 1.01 },
    { month: 'Sep', value: totalValue * 1.02 },
    { month: 'Oct', value: totalValue },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 bg-cargill-beige">
      {/* Hero Banner */}
      <div className="relative h-[260px] mb-8 overflow-hidden rounded-xl bg-cargill-green-dark mx-4 sm:mx-6 lg:mx-8 max-w-7xl xl:mx-auto">
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2670&auto=format&fit=crop"
          alt="Portfolio"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cargill-green-dark via-cargill-green-dark/80 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-12">
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="w-5 h-5 text-cargill-green-brand" />
            <span className="text-cargill-green-brand text-xs font-bold uppercase tracking-widest">Institutional Portfolio</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
          <p className="text-white/70 text-sm md:text-base max-w-lg">
            ${totalHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} invested across {holdings.length} fund{holdings.length !== 1 ? 's' : ''} • ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} cash available.
          </p>
        </div>
      </div>

      {/* Pending Transactions Banner */}
      {(() => {
        const pending = transactions.filter(t => t.status === 'Pending');
        if (pending.length === 0) return null;
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800">
                  {pending.length} Pending Transaction{pending.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-amber-700">
                  {pending.filter(t => t.type === 'deposit').length} deposit{pending.filter(t => t.type === 'deposit').length !== 1 ? 's' : ''} and {pending.filter(t => t.type === 'withdrawal').length} withdrawal{pending.filter(t => t.type === 'withdrawal').length !== 1 ? 's' : ''} awaiting admin approval.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Action Bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={onDeposit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cargill-green-brand text-white text-sm font-bold hover:bg-[#0c7036] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Deposit
          </button>
          <button
            onClick={onWithdraw}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:border-gray-300 transition-colors"
          >
            <Minus className="w-4 h-4" /> Withdraw
          </button>
          <button
            onClick={() => onNavigate('markets')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:border-gray-300 transition-colors"
          >
            <PiggyBank className="w-4 h-4" /> Invest
          </button>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-cargill-green-brand" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">YTD Return</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{ytdReturn >= 0 ? '+' : ''}{ytdReturn.toFixed(1)}%</p>
            <p className="text-xs text-gray-400 mt-1">${(totalValue - totalInvested).toLocaleString(undefined, { minimumFractionDigits: 0 })} gain</p>
          </div>
          <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-cargill-green-brand" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dividends</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${dividends.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Across {holdings.length} funds</p>
          </div>
          <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-cargill-green-brand" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Positions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{holdings.length}</p>
            <p className="text-xs text-gray-400 mt-1">{holdings.length} sectors, 7 markets</p>
          </div>
          <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-cargill-green-brand" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cash Available</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${balance.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Ready to invest</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Chart Card */}
          <div className="lg:col-span-2 bg-white p-8 border border-gray-200 shadow-sm rounded-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Portfolio Performance</p>
                <h2 className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
              </div>
              <div className="bg-[#e5eed9] text-cargill-green px-3 py-1 text-sm font-bold flex items-center rounded-md">
                ~ {ytdReturn >= 0 ? '+' : ''}{ytdReturn.toFixed(1)}%
              </div>
            </div>

            <div className="h-72 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f8b44" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0f8b44" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis hide domain={['dataMin - 50000', 'dataMax + 50000']} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                    labelStyle={{ color: '#6b7280' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#0f8b44"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Allocation Donut */}
            <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-xl flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Asset Allocation</h3>
              {allocationData.length > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={55}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {allocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 flex-1">
                    {allocationData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-600 truncate max-w-[100px]">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No allocations yet. Invest to get started.</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={onDeposit} className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-cargill-green-light/50 text-sm font-semibold text-gray-700 transition-colors flex items-center justify-between group">
                  Deposit Funds
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-cargill-green" />
                </button>
                <button onClick={onCryptoDeposit} className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-amber-50 text-sm font-semibold text-gray-700 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-amber-600" />
                    Crypto Deposit
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600" />
                </button>
                <button onClick={onBankDeposit} className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-blue-50 text-sm font-semibold text-gray-700 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-blue-600" />
                    Bank Deposit
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </button>
                <button onClick={() => onNavigate('markets')} className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-cargill-green-light/50 text-sm font-semibold text-gray-700 transition-colors flex items-center justify-between group"
                >
                  View Market Data
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-cargill-green" />
                </button>
                <button onClick={() => onNavigate('fund')} className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-cargill-green-light/50 text-sm font-semibold text-gray-700 transition-colors flex items-center justify-between group"
                >
                  Explore Impact Funds
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-cargill-green" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Holdings */}
        <h2 className="text-2xl font-bold font-serif text-gray-900 mb-6">Active Holdings</h2>
        {holdings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            {holdings.map((holding) => (
              <div key={holding.id} className="bg-white p-7 border border-gray-200 shadow-sm rounded-xl group hover:border-cargill-green transition-all cursor-pointer hover:shadow-md">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cargill-green-light flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-cargill-green-dark" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{holding.sector}</span>
                      <h3 className="text-xl font-bold text-gray-900">{holding.fundName}</h3>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-cargill-green transition-colors" />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Current Value</p>
                    <p className="text-2xl font-mono font-bold text-gray-900">${holding.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${holding.ytdReturn >= 0 ? 'text-cargill-green' : 'text-red-500'}`}>
                      {holding.ytdReturn >= 0 ? '+' : ''}{holding.ytdReturn}% YTD
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onSell(holding); }}
                      className="px-3 py-1.5 rounded-md border border-gray-200 text-xs font-bold text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
                    >
                      Sell
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 border border-gray-200 rounded-xl text-center mb-14">
            <p className="text-gray-500 mb-4">You have no active holdings yet.</p>
            <button
              onClick={() => onNavigate('markets')}
              className="bg-cargill-green-brand text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#0c7036] transition-colors"
            >
              Browse Funds
            </button>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-serif text-gray-900">Recent Activity</h2>
            <span className="text-gray-400 text-sm">{transactions.length} transactions</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden text-sm shadow-sm">
            <div className="bg-[#052b14] text-white flex px-6 py-4 font-semibold text-xs uppercase tracking-wider">
              <div className="w-[18%] hidden md:block">Date</div>
              <div className="w-[18%]">Type</div>
              <div className="flex-1">Description</div>
              <div className="w-[20%] text-right">Amount</div>
              <div className="w-[18%] text-right">Status</div>
            </div>

            {transactions.slice(0, 8).map((row) => {
              const typeColors: Record<string, string> = {
                deposit: 'bg-cargill-green-light text-cargill-green-dark',
                withdrawal: 'bg-red-50 text-red-600',
                investment: 'bg-amber-50 text-amber-700',
                divestment: 'bg-gray-100 text-gray-600',
                dividend: 'bg-[#e5eed9] text-cargill-green',
                fee: 'bg-gray-100 text-gray-500',
              };
              return (
                <div key={row.id} className="flex px-6 py-4 border-b border-gray-100 font-mono text-gray-800 items-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-[18%] hidden md:block text-gray-500 text-xs">{row.date}</div>
                  <div className="w-[18%] font-sans">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${typeColors[row.type] || 'bg-gray-100 text-gray-600'}`}>
                      {row.type}
                    </span>
                  </div>
                  <div className="flex-1 font-sans text-gray-700 text-sm truncate pr-4">{row.description}</div>
                  <div className={`w-[20%] text-right font-medium ${row.amount >= 0 ? 'text-cargill-green' : 'text-gray-900'}`}>
                    {row.amount >= 0 ? '+' : ''}${Math.abs(row.amount).toLocaleString()}
                  </div>
                  <div className="w-[18%] text-right">
                    <span className={`px-2.5 py-1 text-[10px] inline-block rounded-md font-bold uppercase tracking-wider ${
                      row.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      row.status === 'Approved' ? 'bg-cargill-green-light text-cargill-green-dark border border-cargill-green/20' :
                      row.status === 'Rejected' ? 'bg-red-50 text-red-600 border border-red-200' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {row.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
