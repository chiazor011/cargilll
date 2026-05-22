import React, { useState, useEffect } from 'react';
import {
  Users, DollarSign, ArrowDownLeft, ArrowUpRight, Activity, CheckCircle, XCircle,
  Clock, Shield, Search, Settings, BarChart3, Wallet, TrendingUp, AlertTriangle,
  Banknote, Bitcoin, ChevronRight, Filter, MessageSquare, Ticket
} from 'lucide-react';
import { api } from '../../lib/api';
import type { Transaction, AvailableFund } from '../../types';

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  tier: number;
  kycStatus: string;
  balance: number;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalAum: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalTransactions: number;
}

interface AdminPanelProps {
  transactions: Transaction[];
  availableFunds: AvailableFund[];
  onApproveTransaction: (id: string, notes?: string) => void;
  onRejectTransaction: (id: string, notes?: string) => void;
  onUpdateSettings: (settings: { minDeposit: number; dailyWithdrawalLimit: number; fee: number }) => void;
}

type Tab = 'dashboard' | 'pending-deposits' | 'pending-withdrawals' | 'users' | 'funds' | 'settings' | 'support-tickets';

export default function AdminPanel({ transactions, availableFunds, onApproveTransaction, onRejectTransaction, onUpdateSettings }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Real data from APIs
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [adminTransactions, setAdminTransactions] = useState<Transaction[]>([]);
  const [platformSettings, setPlatformSettings] = useState<Record<string, any>>({});
  const [settingsForm, setSettingsForm] = useState({ minDeposit: 1000, dailyWithdrawalLimit: 50000, fee: 0.5 });
  const [loading, setLoading] = useState(false);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [ticketReplyModal, setTicketReplyModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [ticketReplyStatus, setTicketReplyStatus] = useState('open');

  // Fetch dashboard stats on mount
  useEffect(() => {
    api.dashboard()
      .then(data => setDashboardStats(data))
      .catch(console.error);
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'users') {
      setLoading(true);
      api.adminUsers()
        .then(data => { setAdminUsers(data.users || []); })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'pending-deposits' || activeTab === 'pending-withdrawals' || activeTab === 'dashboard') {
      setLoading(true);
      api.adminTransactions()
        .then(data => { setAdminTransactions(data.transactions || []); })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'settings') {
      setLoading(true);
      api.adminSettings()
        .then(data => {
          setPlatformSettings(data.settings || {});
          const s = data.settings || {};
          setSettingsForm({
            minDeposit: Number(s.min_deposit || 1000),
            dailyWithdrawalLimit: Number(s.daily_withdrawal_limit || 50000),
            fee: Number(s.platform_fee || 0.5),
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'support-tickets') {
      setLoading(true);
      api.adminSupportTickets()
        .then(data => { setSupportTickets(data.tickets || []); })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  const pendingDeposits = adminTransactions.filter(t => t.type === 'deposit' && t.status === 'Pending');
  const pendingWithdrawals = adminTransactions.filter(t => t.type === 'withdrawal' && t.status === 'Pending');
  const totalVolume = adminTransactions.reduce((s, t) => s + Math.abs(t.amount), 0);

  const openTicketCount = supportTickets.filter((t: any) => t.status === 'open' || t.status === 'in_progress').length;

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
    { id: 'pending-deposits' as Tab, label: 'Pending Deposits', icon: ArrowDownLeft, badge: pendingDeposits.length },
    { id: 'pending-withdrawals' as Tab, label: 'Pending Withdrawals', icon: ArrowUpRight, badge: pendingWithdrawals.length },
    { id: 'support-tickets' as Tab, label: 'Support Tickets', icon: MessageSquare, badge: openTicketCount },
    { id: 'users' as Tab, label: 'Users', icon: Users },
    { id: 'funds' as Tab, label: 'Funds', icon: Wallet },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  const openReject = (id: string) => {
    setSelectedTxId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (selectedTxId) {
      onRejectTransaction(selectedTxId, rejectReason);
      setRejectModalOpen(false);
      setSelectedTxId(null);
      // Refresh transactions after a short delay
      setTimeout(() => {
        api.adminTransactions().then(data => setAdminTransactions(data.transactions || [])).catch(console.error);
        api.dashboard().then(data => setDashboardStats(data)).catch(console.error);
      }, 300);
    }
  };

  const handleApprove = (id: string) => {
    onApproveTransaction(id);
    setTimeout(() => {
      api.adminTransactions().then(data => setAdminTransactions(data.transactions || [])).catch(console.error);
      api.dashboard().then(data => setDashboardStats(data)).catch(console.error);
    }, 300);
  };

  const handleSettingsSave = () => {
    onUpdateSettings(settingsForm);
    // Also update via API directly
    api.updateSettings({
      minDeposit: settingsForm.minDeposit,
      dailyWithdrawalLimit: settingsForm.dailyWithdrawalLimit,
      fee: settingsForm.fee,
    }).catch(console.error);
  };

  const tierLabel = (tier: number) => {
    const labels = ['Unverified', 'Email Verified', 'KYC Verified', 'Institutional'];
    const colors = ['bg-gray-100 text-gray-600', 'bg-blue-50 text-blue-600', 'bg-cargill-green-light text-cargill-green-dark', 'bg-amber-50 text-amber-700'];
    return { label: labels[tier] || 'Unknown', color: colors[tier] || colors[0] };
  };

  const kycLabel = (status: string) => {
    const colors: Record<string, string> = {
      none: 'bg-gray-100 text-gray-500',
      pending: 'bg-amber-50 text-amber-600',
      verified: 'bg-cargill-green-light text-cargill-green-dark',
    };
    return colors[status] || colors.none;
  };

  const recentActivity = adminTransactions.slice(0, 6);

  return (
    <div className="min-h-screen pt-32 pb-16 bg-cargill-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-cargill-green-dark flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-serif text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 text-sm">Platform management and transaction oversight</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-cargill-green-brand text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && activeTab !== 'funds' && (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-cargill-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        )}

        {/* Dashboard */}
        {activeTab === 'dashboard' && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: String(dashboardStats?.totalUsers ?? adminUsers.length), icon: Users, color: 'bg-blue-50 text-blue-600' },
                { label: 'Pending Deposits', value: String(dashboardStats?.pendingDeposits ?? pendingDeposits.length), icon: ArrowDownLeft, color: 'bg-amber-50 text-amber-600' },
                { label: 'Pending Withdrawals', value: String(dashboardStats?.pendingWithdrawals ?? pendingWithdrawals.length), icon: ArrowUpRight, color: 'bg-red-50 text-red-600' },
                { label: 'Total AUM', value: `$${((dashboardStats?.totalAum || totalVolume) / 1e6).toFixed(1)}M`, icon: DollarSign, color: 'bg-cargill-green-light text-cargill-green-dark' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">No recent activity</p>
                  )}
                  {recentActivity.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.type === 'deposit' ? 'bg-cargill-green-light' : tx.type === 'withdrawal' ? 'bg-red-50' : 'bg-gray-100'
                        }`}>
                          {tx.type === 'deposit' && <ArrowDownLeft className="w-4 h-4 text-cargill-green" />}
                          {tx.type === 'withdrawal' && <ArrowUpRight className="w-4 h-4 text-red-500" />}
                          {tx.type === 'investment' && <TrendingUp className="w-4 h-4 text-gray-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{tx.description}</p>
                          <p className="text-xs text-gray-400">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${tx.amount >= 0 ? 'text-cargill-green' : 'text-gray-900'}`}>
                          {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                        </p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          tx.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                          tx.status === 'Approved' ? 'bg-cargill-green-light text-cargill-green-dark' :
                          tx.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Health</h3>
                <div className="space-y-4">
                  {[
                    { label: 'System Uptime', value: '99.97%', status: 'good' },
                    { label: 'Avg. Deposit Approval', value: '4.2 hrs', status: 'good' },
                    { label: 'Pending Backlog', value: `${pendingDeposits.length + pendingWithdrawals.length} tx`, status: pendingDeposits.length > 5 ? 'warn' : 'good' },
                    { label: 'KYC Queue', value: '3 users', status: 'good' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                        <div className={`w-2 h-2 rounded-full ${item.status === 'good' ? 'bg-cargill-green-brand' : 'bg-amber-500'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Deposits */}
        {activeTab === 'pending-deposits' && !loading && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl font-bold text-gray-900">Pending Deposits</h2>
                <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold">{pendingDeposits.length} awaiting approval</span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search deposits..."
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cargill-green"
                />
              </div>
            </div>

            {pendingDeposits.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-cargill-green mx-auto mb-3" />
                <p className="text-gray-600 font-bold">All caught up!</p>
                <p className="text-sm text-gray-400">No pending deposits to review.</p>
              </div>
            ) : (
              <>
                <div className="bg-[#052b14] text-white flex px-6 py-4 font-semibold text-xs uppercase tracking-wider">
                  <div className="w-[15%]">Date</div>
                  <div className="w-[15%]">Method</div>
                  <div className="flex-1">Description</div>
                  <div className="w-[15%] text-right">Amount</div>
                  <div className="w-[25%] text-right">Actions</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {pendingDeposits
                    .filter(tx => tx.description.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((tx) => (
                    <div key={tx.id} className="flex px-6 py-5 items-center hover:bg-gray-50 transition-colors">
                      <div className="w-[15%] text-sm text-gray-500">{tx.date}</div>
                      <div className="w-[15%]">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                          {tx.paymentMethod === 'crypto' || ['btc', 'usdt-erc20', 'usdt-trc20', 'eth'].includes(tx.paymentMethod || '')
                            ? <><Bitcoin className="w-3.5 h-3.5 text-amber-600" /> Crypto</>
                            : <><Banknote className="w-3.5 h-3.5 text-blue-600" /> Bank</>}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate pr-4">{tx.description}</p>
                        {tx.paymentDetails && <p className="text-xs text-gray-400 font-mono mt-0.5">Ref: {tx.paymentDetails}</p>}
                      </div>
                      <div className="w-[15%] text-right font-bold text-cargill-green text-sm">
                        +${tx.amount.toLocaleString()}
                      </div>
                      <div className="w-[25%] text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(tx.id)}
                          className="px-3 py-1.5 rounded-md bg-cargill-green-brand text-white text-xs font-bold hover:bg-[#0c7036] transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => openReject(tx.id)}
                          className="px-3 py-1.5 rounded-md border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Pending Withdrawals */}
        {activeTab === 'pending-withdrawals' && !loading && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-bold text-gray-900">Pending Withdrawals</h2>
                <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-md text-xs font-bold">{pendingWithdrawals.length} awaiting approval</span>
              </div>
            </div>

            {pendingWithdrawals.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-cargill-green mx-auto mb-3" />
                <p className="text-gray-600 font-bold">All caught up!</p>
                <p className="text-sm text-gray-400">No pending withdrawals to review.</p>
              </div>
            ) : (
              <>
                <div className="bg-[#052b14] text-white flex px-6 py-4 font-semibold text-xs uppercase tracking-wider">
                  <div className="w-[15%]">Date</div>
                  <div className="w-[15%]">Method</div>
                  <div className="flex-1">Description</div>
                  <div className="w-[15%] text-right">Amount</div>
                  <div className="w-[25%] text-right">Actions</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {pendingWithdrawals.map((tx) => (
                    <div key={tx.id} className="flex px-6 py-5 items-center hover:bg-gray-50 transition-colors">
                      <div className="w-[15%] text-sm text-gray-500">{tx.date}</div>
                      <div className="w-[15%]">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                          {tx.paymentMethod === 'crypto'
                            ? <><Bitcoin className="w-3.5 h-3.5 text-amber-600" /> Crypto</>
                            : <><Banknote className="w-3.5 h-3.5 text-blue-600" /> Bank</>}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate pr-4">{tx.description}</p>
                        {tx.paymentDetails && <p className="text-xs text-gray-400 font-mono mt-0.5">To: {tx.paymentDetails}</p>}
                      </div>
                      <div className="w-[15%] text-right font-bold text-red-600 text-sm">
                        -${Math.abs(tx.amount).toLocaleString()}
                      </div>
                      <div className="w-[25%] text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(tx.id)}
                          className="px-3 py-1.5 rounded-md bg-cargill-green-brand text-white text-xs font-bold hover:bg-[#0c7036] transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => openReject(tx.id)}
                          className="px-3 py-1.5 rounded-md border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && !loading && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cargill-green"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#052b14] text-white flex px-6 py-4 font-semibold text-xs uppercase tracking-wider">
              <div className="w-[25%]">User</div>
              <div className="w-[15%]">Tier</div>
              <div className="w-[15%]">KYC Status</div>
              <div className="w-[20%]">Joined</div>
              <div className="w-[25%] text-right">Actions</div>
            </div>
            <div className="divide-y divide-gray-100">
              {adminUsers.length === 0 && (
                <div className="p-12 text-center text-sm text-gray-400">No users found</div>
              )}
              {adminUsers
                .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((user) => {
                  const tier = tierLabel(user.tier);
                  return (
                    <div key={user.id} className="flex px-6 py-5 items-center hover:bg-gray-50 transition-colors">
                      <div className="w-[25%]">
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <div className="w-[15%]">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${tier.color}`}>
                          {tier.label}
                        </span>
                      </div>
                      <div className="w-[15%]">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${kycLabel(user.kycStatus)}`}>
                          {user.kycStatus}
                        </span>
                      </div>
                      <div className="w-[20%] text-sm text-gray-500">{user.createdAt?.split('T')[0] || user.createdAt}</div>
                      <div className="w-[25%] text-right">
                        <button className="text-cargill-green text-xs font-bold hover:underline">
                          View Details <ChevronRight className="w-3 h-3 inline" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Funds */}
        {activeTab === 'funds' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableFunds.map((fund) => (
              <div key={fund.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <img src={fund.image} alt={fund.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{fund.sector}</span>
                    <span className="text-[10px] font-bold text-cargill-green bg-cargill-green-light px-2 py-0.5 rounded">+{fund.ytdReturn}% YTD</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{fund.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{fund.description}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-xs text-gray-400">AUM</p>
                      <p className="font-bold text-gray-900">{fund.aum}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Min Investment</p>
                      <p className="font-bold text-gray-900">${fund.minInvestment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Target Yield</p>
                      <p className="font-bold text-gray-900">{fund.targetYield}%</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-lg bg-cargill-green-brand text-white text-xs font-bold hover:bg-[#0c7036] transition-colors">
                      Edit Fund
                    </button>
                    <button className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && !loading && (
          <div className="max-w-xl bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Settings</h2>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Minimum Deposit Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  value={settingsForm.minDeposit}
                  onChange={(e) => setSettingsForm(s => ({ ...s, minDeposit: Number(e.target.value) }))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-lg font-bold"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Default: $1,000. Can be overridden per user tier.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Daily Withdrawal Limit
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  value={settingsForm.dailyWithdrawalLimit}
                  onChange={(e) => setSettingsForm(s => ({ ...s, dailyWithdrawalLimit: Number(e.target.value) }))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-lg font-bold"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Maximum withdrawal per user per 24 hours.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Platform Fee (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={settingsForm.fee}
                  onChange={(e) => setSettingsForm(s => ({ ...s, fee: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-lg font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Applied to investment transactions.</p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={handleSettingsSave}
                className="w-full bg-cargill-green-brand text-white font-bold py-3 rounded-lg hover:bg-[#0c7036] transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

        {/* Support Tickets */}
        {activeTab === 'support-tickets' && !loading && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-cargill-green" />
                <h2 className="text-xl font-bold text-gray-900">Support Tickets</h2>
                <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold">{openTicketCount} open</span>
              </div>
            </div>

            {supportTickets.length === 0 ? (
              <div className="p-12 text-center">
                <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-bold">No support tickets</p>
                <p className="text-sm text-gray-400">Tickets submitted by users will appear here.</p>
              </div>
            ) : (
              <>
                <div className="bg-[#052b14] text-white flex px-6 py-4 font-semibold text-xs uppercase tracking-wider">
                  <div className="w-[15%]">Date</div>
                  <div className="w-[20%]">User</div>
                  <div className="flex-1">Subject</div>
                  <div className="w-[15%]">Status</div>
                  <div className="w-[15%] text-right">Actions</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {supportTickets.map((t: any) => (
                    <div key={t.id} className="flex px-6 py-5 items-start hover:bg-gray-50 transition-colors">
                      <div className="w-[15%] text-sm text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</div>
                      <div className="w-[20%]">
                        <p className="text-sm font-bold text-gray-900 truncate">{t.userName}</p>
                        <p className="text-xs text-gray-400 truncate">{t.userEmail}</p>
                      </div>
                      <div className="flex-1 pr-4">
                        <p className="text-sm font-bold text-gray-900">{t.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">{t.message}</p>
                        {t.adminReply && (
                          <p className="text-xs text-cargill-green mt-1">Reply: {t.adminReply}</p>
                        )}
                      </div>
                      <div className="w-[15%]">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          t.status === 'open' ? 'bg-amber-50 text-amber-600' :
                          t.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                          t.status === 'resolved' ? 'bg-green-50 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="w-[15%] text-right">
                        <button
                          onClick={() => { setSelectedTicketId(t.id); setTicketReplyStatus(t.status); setTicketReplyText(t.adminReply || ''); setTicketReplyModal(true); }}
                          className="px-3 py-1.5 rounded-md bg-cargill-green-brand text-white text-xs font-bold hover:bg-[#0c7036] transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      {/* Ticket Reply Modal */}
      {ticketReplyModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setTicketReplyModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-cargill-green-light flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-cargill-green" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Reply to Ticket</h3>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Status</label>
              <select
                value={ticketReplyStatus}
                onChange={(e) => setTicketReplyStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <textarea
              value={ticketReplyText}
              onChange={(e) => setTicketReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cargill-green focus:border-transparent text-sm mb-4 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setTicketReplyModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedTicketId) return;
                  try {
                    await api.replySupportTicket(selectedTicketId, ticketReplyStatus, ticketReplyText);
                    const data = await api.adminSupportTickets();
                    setSupportTickets(data.tickets || []);
                  } catch (e: any) { alert(e.message); }
                  setTicketReplyModal(false);
                }}
                className="flex-1 py-2.5 rounded-lg bg-cargill-green-brand text-white font-bold text-sm hover:bg-[#0c7036] transition-colors"
              >
                Save Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRejectModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Reject Transaction</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejection. This will be visible to the user.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Insufficient verification, incorrect reference code..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm mb-4 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
