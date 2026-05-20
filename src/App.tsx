import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './lib/api';
import Layout from './components/layout/Layout';
import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/auth/LoginPage';
import PortfolioPage from './components/dashboard/PortfolioPage';
import MarketsPage from './components/markets/MarketsPage';
import FundPage from './components/fund/FundPage';
import ContactPage from './components/contact/ContactPage';
import AdminPanel from './components/admin/AdminPanel';
import DepositModal from './components/modals/DepositModal';
import WithdrawModal from './components/modals/WithdrawModal';
import InvestModal from './components/modals/InvestModal';
import SellModal from './components/modals/SellModal';
import CryptoDepositModal from './components/modals/CryptoDepositModal';
import BankDepositModal from './components/modals/BankDepositModal';
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

  const navigate = (path: string) => {
    setActivePath(path);
  };

  // Portfolio actions via API
  const handleDeposit = async (amount: number, method: string, details?: string) => {
    try {
      await api.deposit(amount, method, details);
      await refreshPortfolio();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleWithdraw = async (amount: number, method: string, destination: string) => {
    try {
      await api.withdraw(amount, method, destination);
      await refreshPortfolio();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleInvest = async (fund: AvailableFund, amount: number) => {
    try {
      if (!fund.dbId) throw new Error('Fund not found');
      await api.invest(fund.dbId, amount);
      await refreshPortfolio();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSell = async (holding: Holding, amount: number) => {
    try {
      await api.divest(Number(holding.id), amount);
      await refreshPortfolio();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Admin actions
  const handleApproveTransaction = async (id: string, notes?: string) => {
    try {
      await api.approveTx(Number(id), notes);
      await refreshPortfolio();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRejectTransaction = async (id: string, notes?: string) => {
    try {
      await api.rejectTx(Number(id), notes);
      await refreshPortfolio();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdateSettings = async (settings: { minDeposit: number; dailyWithdrawalLimit: number; fee: number }) => {
    try {
      await api.updateSettings({
        minDeposit: settings.minDeposit,
        dailyWithdrawalLimit: settings.dailyWithdrawalLimit,
        fee: settings.fee,
      });
    } catch (e: any) {
      alert(e.message);
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
