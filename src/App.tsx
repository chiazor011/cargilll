import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './lib/api';
import Layout from './components/layout/Layout';
import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/auth/LoginPage';
import PortfolioPage from './components/dashboard/PortfolioPage';
import MarketsPage from './components/markets/MarketsPage';
import FundPage from './components/fund/FundPage';
import ContactPage from './components/contact/ContactPage';
import SupportPage from './components/support/SupportPage';
import AdminPanel from './components/admin/AdminPanel';
import DepositModal from './components/modals/DepositModal';
import WithdrawModal from './components/modals/WithdrawModal';
import InvestModal from './components/modals/InvestModal';
import SellModal from './components/modals/SellModal';
import CryptoDepositModal from './components/modals/CryptoDepositModal';
import BankDepositModal from './components/modals/BankDepositModal';
import ChatbotWidget from './components/chatbot/ChatbotWidget';
import { ToastContainer, type Toast } from './components/common/Toast';
import type { PortfolioState, AvailableFund, Holding } from './types';

function AppContent() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const [activePath, setActivePath] = useState('landing');

  // Portfolio state from API
  const [portfolio, setPortfolio] = useState<PortfolioState>({ balance: 0, holdings: [], transactions: [] });
  const [funds, setFunds] = useState<AvailableFund[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  // Modal state
  const [depositOpen, setDepositOpen] = useState(false);
  const [cryptoDepositOpen, setCryptoDepositOpen] = useState(false);
  const [bankDepositOpen, setBankDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [investOpen, setInvestOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState<AvailableFund | null>(null);
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load funds
  useEffect(() => {
    api.funds().then(data => setFunds(data.funds)).catch(console.error);
  }, []);

  // Load portfolio when logged in
  const refreshPortfolio = async () => {
    if (!isLoggedIn) return;
    setLoadingPortfolio(true);
    try {
      const data = await api.portfolio();
      setPortfolio(data);
    } catch (e) {
      console.error('Failed to load portfolio', e);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  useEffect(() => {
    refreshPortfolio();
  }, [isLoggedIn]);

  // Route guards
  useEffect(() => {
    if (isLoggedIn && (activePath === 'landing' || activePath === 'login')) {
      setActivePath(isAdmin ? 'admin' : 'portfolio');
    }
    if (!isLoggedIn && (activePath === 'portfolio' || activePath === 'admin')) {
      setActivePath('landing');
    }
    if (!isAdmin && activePath === 'admin') {
      setActivePath('portfolio');
    }
  }, [isLoggedIn, isAdmin, activePath]);

  // Handle query params for email verification / password reset
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('token');
    const path = window.location.pathname;

    if (verifyToken && path.includes('verify-email')) {
      api.verifyEmail(verifyToken)
        .then(() => addToast('Email verified successfully!', 'success'))
        .catch((e: any) => addToast(e.message || 'Verification failed', 'error'));
    }
  }, [addToast]);

  const navigate = (path: string) => {
    setActivePath(path);
    window.scrollTo(0, 0);
  };

  // Portfolio actions via API
  const handleDeposit = async (amount: number, method: string, details?: string) => {
    try {
      await api.deposit(amount, method, details);
      await refreshPortfolio();
      addToast('Deposit request submitted and is pending approval.', 'success');
    } catch (e: any) {
      addToast(e.message, 'error');
    }
  };

  const handleWithdraw = async (amount: number, method: string, destination: string) => {
    try {
      await api.withdraw(amount, method, destination);
      await refreshPortfolio();
      addToast('Withdrawal request submitted and is pending approval.', 'success');
    } catch (e: any) {
      addToast(e.message, 'error');
    }
  };

  const handleInvest = async (fund: AvailableFund, amount: number) => {
    try {
      if (!fund.dbId) throw new Error('Fund not found');
      await api.invest(fund.dbId, amount);
      await refreshPortfolio();
      addToast(`Successfully invested $${amount.toLocaleString()} in ${fund.name}.`, 'success');
    } catch (e: any) {
      addToast(e.message, 'error');
    }
  };

  const handleSell = async (holding: Holding, amount: number) => {
    try {
      await api.divest(Number(holding.id), amount);
      await refreshPortfolio();
      addToast(`Successfully sold $${amount.toLocaleString()} of ${holding.fundName}.`, 'success');
    } catch (e: any) {
      addToast(e.message, 'error');
    }
  };

  // Admin actions
  const handleApproveTransaction = async (id: string, notes?: string) => {
    try {
      await api.approveTx(Number(id), notes);
      await refreshPortfolio();
      addToast('Transaction approved.', 'success');
    } catch (e: any) {
      addToast(e.message, 'error');
    }
  };

  const handleRejectTransaction = async (id: string, notes?: string) => {
    try {
      await api.rejectTx(Number(id), notes);
      await refreshPortfolio();
      addToast('Transaction rejected.', 'info');
    } catch (e: any) {
      addToast(e.message, 'error');
    }
  };

  const handleUpdateSettings = async (settings: { minDeposit: number; dailyWithdrawalLimit: number; fee: number }) => {
    try {
      await api.updateSettings({
        minDeposit: settings.minDeposit,
        dailyWithdrawalLimit: settings.dailyWithdrawalLimit,
        fee: settings.fee,
      });
      addToast('Settings updated.', 'success');
    } catch (e: any) {
      addToast(e.message, 'error');
    }
  };

  // Modal helpers
  const openInvest = (fund: AvailableFund) => {
    setSelectedFund(fund);
    setSelectedHolding(portfolio.holdings.find(h => h.fundId === fund.id) || null);
    setInvestOpen(true);
  };

  const openSell = (holding: Holding) => {
    setSelectedHolding(holding);
    setSellOpen(true);
  };

  const totalValue = portfolio.balance + portfolio.holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalInvested = portfolio.holdings.reduce((s, h) => s + h.investedAmount, 0);
  const ytdReturn = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

  const renderPage = () => {
    switch (activePath) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'login':
        return <LoginPage />;
      case 'portfolio':
        return isLoggedIn ? (
          <PortfolioPage
            portfolio={portfolio}
            totalValue={totalValue}
            ytdReturn={ytdReturn}
            onNavigate={navigate}
            onDeposit={() => setDepositOpen(true)}
            onCryptoDeposit={() => setCryptoDepositOpen(true)}
            onBankDeposit={() => setBankDepositOpen(true)}
            onWithdraw={() => setWithdrawOpen(true)}
            onInvest={openInvest}
            onSell={openSell}
          />
        ) : (
          <LandingPage onNavigate={navigate} />
        );
      case 'markets':
        return <MarketsPage onNavigate={navigate} onInvest={openInvest} availableFunds={funds} />;
      case 'fund':
        return <FundPage onNavigate={navigate} onInvest={openInvest} availableFunds={funds} />;
      case 'contact':
        return <ContactPage />;
      case 'support':
        return <SupportPage />;
      case 'admin':
        return isAdmin ? (
          <AdminPanel
            transactions={portfolio.transactions}
            availableFunds={funds}
            onApproveTransaction={handleApproveTransaction}
            onRejectTransaction={handleRejectTransaction}
            onUpdateSettings={handleUpdateSettings}
          />
        ) : (
          <PortfolioPage
            portfolio={portfolio}
            totalValue={totalValue}
            ytdReturn={ytdReturn}
            onNavigate={navigate}
            onDeposit={() => setDepositOpen(true)}
            onCryptoDeposit={() => setCryptoDepositOpen(true)}
            onBankDeposit={() => setBankDepositOpen(true)}
            onWithdraw={() => setWithdrawOpen(true)}
            onInvest={openInvest}
            onSell={openSell}
          />
        );
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <Layout activePath={activePath} onNavigate={navigate} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={logout}>
      {renderPage()}

      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        onDeposit={handleDeposit}
        onRequestCrypto={() => { setDepositOpen(false); setCryptoDepositOpen(true); }}
        onRequestBank={() => { setDepositOpen(false); setBankDepositOpen(true); }}
        currentBalance={portfolio.balance}
      />

      <CryptoDepositModal
        isOpen={cryptoDepositOpen}
        onClose={() => setCryptoDepositOpen(false)}
        onDeposit={handleDeposit}
        currentBalance={portfolio.balance}
      />

      <BankDepositModal
        isOpen={bankDepositOpen}
        onClose={() => setBankDepositOpen(false)}
        onDeposit={handleDeposit}
        currentBalance={portfolio.balance}
      />

      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onWithdraw={handleWithdraw}
        currentBalance={portfolio.balance}
      />

      <InvestModal
        isOpen={investOpen}
        onClose={() => setInvestOpen(false)}
        onInvest={handleInvest}
        currentBalance={portfolio.balance}
        fund={selectedFund}
        existingHolding={selectedHolding}
      />

      <SellModal
        isOpen={sellOpen}
        onClose={() => setSellOpen(false)}
        onSell={handleSell}
        holding={selectedHolding}
      />

      <ChatbotWidget />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
