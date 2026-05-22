# Cargill Institutional Platform — Production Readiness Plan

## What's Built (Frontend MVP)
- Landing, Login, Portfolio, Markets, Fund, Contact pages
- Deposit, Withdraw, Invest, Sell modals (instant completion)
- Real-time portfolio state management
- Auth flow with route guards

## What's Missing for Production

### 1. Backend Infrastructure
- User authentication (JWT/session-based)
- Database (PostgreSQL/MongoDB) for users, portfolios, transactions
- API server (Node.js/Express or similar)
- File storage for KYC documents

### 2. Payment & Deposit System
- **Crypto deposits**: BTC, USDT (ERC20/TRC20), ETH
  - Generate unique wallet addresses per user
  - Webhook listener for blockchain confirmations
  - Pending → Confirmed flow (3-6 confirmations)
- **Bank transfers**: Wire / ACH
  - Display bank details with reference code
  - Manual verification by admin
  - Pending → Approved flow
- **Minimum deposit enforcement**: $1,000 (configurable per user tier)

### 3. Withdrawal System
- Crypto withdrawals to user-provided wallet
- Bank withdrawals to linked accounts
- **Admin approval required** — all withdrawals start as Pending
- Daily/weekly withdrawal limits
- KYC verification gate (level 2 for withdrawals > $10K)

### 4. Admin Panel
- Dashboard with platform-wide stats
- Pending deposits table (approve/reject)
- Pending withdrawals table (approve/reject)
- User management (view, suspend, KYC status)
- Fund management (create, edit, open/close)
- Transaction audit log
- Settings (min deposit, withdrawal limits, fees)

### 5. User Tier System
- Tier 0: Unverified — can view only
- Tier 1: Email verified — can deposit up to $10K
- Tier 2: KYC verified (ID + address) — full access
- Tier 3: Institutional — custom limits

### 6. Security
- Rate limiting on all endpoints
- 2FA for admin + optional for users
- IP whitelisting for admin panel
- Audit logging for all state changes
- SQL injection / XSS protection
- CORS policy

---

## Frontend Changes Needed Now
1. Update types to support `Pending` / `Approved` / `Rejected` status
2. Add `paymentMethod` and `paymentDetails` to transactions
3. Create CryptoDepositModal with wallet addresses and QR codes
4. Create BankDepositModal with wire instructions
5. Update WithdrawModal to require wallet address / bank account
6. Create AdminPanel page with tabs: Dashboard, Pending Deposits, Pending Withdrawals, Users, Funds
7. Add `isAdmin` state to App + admin route guard
8. Update PortfolioPage to show pending transactions differently
