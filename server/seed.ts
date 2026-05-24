import bcrypt from 'bcryptjs';
import { runQuery, toCents } from './db.js';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPass123!';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'DemoPass123!';

const FUNDS = [
  {
    slug: 'fund-starter',
    name: 'Starter Agriculture Fund',
    sector: 'Diversified',
    description: 'A diversified entry-point fund providing broad exposure to global agricultural markets across grains, livestock, and soft commodities. Ideal for new institutional investors seeking stable yields with lower capital commitment.',
    min_investment_cents: toCents(1000),
    target_yield: 4.5,
    ytd_return: 3.2,
    aum: '$450M',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2532&auto=format&fit=crop',
  },
  {
    slug: 'fund-biofuels',
    name: 'Biofuels Initiative',
    sector: 'Energy',
    description: 'Sustainable energy derived from agricultural feedstocks.',
    min_investment_cents: toCents(10000),
    target_yield: 6.8,
    ytd_return: 4.7,
    aum: '$1.1B',
    image: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=2672&auto=format&fit=crop',
  },
  {
    slug: 'fund-cocoa',
    name: 'Sustainable Cocoa Fund',
    sector: 'Agriculture',
    description: 'Ethical cocoa production supporting farming communities.',
    min_investment_cents: toCents(10000),
    target_yield: 5.5,
    ytd_return: 3.2,
    aum: '$890M',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2670&auto=format&fit=crop',
  },
  {
    slug: 'fund-wheat',
    name: 'Global Wheat Fund',
    sector: 'Grains',
    description: 'Invest in the global wheat supply chain from origination to distribution.',
    min_investment_cents: toCents(25000),
    target_yield: 5.2,
    ytd_return: 2.1,
    aum: '$2.4B',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2643&auto=format&fit=crop',
  },
  {
    slug: 'fund-harvest',
    name: 'Sustainable Harvest Fund',
    sector: 'Impact',
    description: 'ESG-focused agricultural investments with measurable carbon impact.',
    min_investment_cents: toCents(50000),
    max_investment_cents: toCents(100000),
    target_yield: 6.5,
    ytd_return: 8.4,
    aum: '$1.2B',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop',
  },
];

const CRYPTO_ADDRESSES = [
  { id: 'btc', name: 'Bitcoin (BTC)', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', network: 'Bitcoin Network', color: '#f7931a' },
  { id: 'usdt-erc20', name: 'USDT (ERC20)', address: '0x742d35Cc6634C0532925a3b8D4C9db96590f6C7E', network: 'Ethereum (ERC20)', color: '#26a17b' },
  { id: 'usdt-trc20', name: 'USDT (TRC20)', address: 'TV6MuMXfmLbBqPZvBHdwFsDnQAaXY3zZf9', network: 'Tron (TRC20)', color: '#26a17b' },
  { id: 'eth', name: 'Ethereum (ETH)', address: '0x742d35Cc6634C0532925a3b8D4C9db96590f6C7E', network: 'Ethereum Network', color: '#627eea' },
];

const BANK_DETAILS = {
  wire: {
    bankName: 'JPMorgan Chase Bank, N.A.',
    accountName: 'Cargill Institutional Services LLC',
    accountNumber: '1234567890',
    routingNumber: '021000021',
    swift: 'CHASUS33',
    address: '270 Park Avenue, New York, NY 10017',
  },
  ach: {
    bankName: 'JPMorgan Chase Bank, N.A.',
    accountName: 'Cargill Institutional Services LLC',
    accountNumber: '0987654321',
    routingNumber: '021000021',
    swift: '-',
    address: '270 Park Avenue, New York, NY 10017',
  },
};

export async function seed() {
  // Seed funds
  for (const f of FUNDS) {
    await runQuery(
      `INSERT INTO funds (slug, name, sector, description, min_investment_cents, target_yield, ytd_return, aum, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (slug) DO NOTHING`,
      [f.slug, f.name, f.sector, f.description, f.min_investment_cents, f.target_yield, f.ytd_return, f.aum, f.image]
    );
  }

  // Update max_investment_cents for existing rows
  await runQuery(
    `UPDATE funds SET max_investment_cents = ? WHERE slug = ?`,
    [toCents(100000), 'fund-harvest']
  );

  // Seed platform settings
  const settings = [
    { key: 'min_deposit', value: '1000' },
    { key: 'daily_withdrawal_limit', value: '50000' },
    { key: 'platform_fee', value: '0.5' },
    { key: 'wallet_addresses', value: JSON.stringify(CRYPTO_ADDRESSES) },
    { key: 'bank_details', value: JSON.stringify(BANK_DETAILS) },
  ];
  for (const s of settings) {
    await runQuery(
      `INSERT INTO platform_settings (key, value) VALUES (?, ?)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [s.key, s.value]
    );
  }

  // Seed admin user
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await runQuery(
    `INSERT INTO users (email, password_hash, name, role, tier, kyc_status, balance_cents, email_verified)
     VALUES (?, ?, ?, 'admin', 3, 'verified', 0, 1)
     ON CONFLICT (email) DO NOTHING`,
    ['admin@cargill.com', adminHash, 'Admin User']
  );

  // Seed demo investor with portfolio
  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  await runQuery(
    `INSERT INTO users (email, password_hash, name, role, tier, kyc_status, balance_cents, email_verified)
     VALUES (?, ?, ?, 'investor', 2, 'verified', ?, 1)
     ON CONFLICT (email) DO NOTHING`,
    ['demo@investor.com', demoHash, 'Demo Investor', toCents(980000)]
  );

  const demoUser = (await runQuery(`SELECT id FROM users WHERE email = ?`, ['demo@investor.com'])).rows[0] as { id: number } | undefined;
  if (demoUser) {
    // Seed holdings
    const wheatFund = (await runQuery(`SELECT id FROM funds WHERE slug = ?`, ['fund-wheat'])).rows[0] as { id: number } | undefined;
    const bioFund = (await runQuery(`SELECT id FROM funds WHERE slug = ?`, ['fund-biofuels'])).rows[0] as { id: number } | undefined;

    if (wheatFund) {
      await runQuery(
        `INSERT INTO holdings (user_id, fund_id, invested_cents, current_cents)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (user_id, fund_id) DO NOTHING`,
        [demoUser.id, wheatFund.id, toCents(850000), toCents(867850)]
      );
    }
    if (bioFund) {
      await runQuery(
        `INSERT INTO holdings (user_id, fund_id, invested_cents, current_cents)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (user_id, fund_id) DO NOTHING`,
        [demoUser.id, bioFund.id, toCents(620000), toCents(649140)]
      );
    }

    // Seed transactions
    const txs = [
      { type: 'dividend', amount: 4250, desc: 'Global Wheat Fund quarterly dividend', fund: 'Global Wheat Fund', date: '2023-10-24' },
      { type: 'investment', amount: -50000, desc: 'Investment in Biofuels Initiative', fund: 'Biofuels Initiative', date: '2023-10-15' },
      { type: 'fee', amount: -1250, desc: 'Management Fee Q3', fund: null, date: '2023-09-30' },
      { type: 'dividend', amount: 3100, desc: 'Sustainable Cocoa Fund quarterly dividend', fund: 'Sustainable Cocoa Fund', date: '2023-09-15' },
      { type: 'deposit', amount: 100000, desc: 'Wire transfer from Chase Institutional', fund: null, date: '2023-09-01' },
      { type: 'investment', amount: -200000, desc: 'Investment in Global Wheat Fund', fund: 'Global Wheat Fund', date: '2023-08-20' },
    ];
    for (const t of txs) {
      await runQuery(
        `INSERT INTO transactions (user_id, type, amount_cents, status, description, fund_name, created_at)
         VALUES (?, ?, ?, 'Completed', ?, ?, ?)
         ON CONFLICT DO NOTHING`,
        [demoUser.id, t.type, toCents(t.amount), t.desc, t.fund, t.date]
      );
    }
  }

  console.log('[seed] Database seeded successfully');
}
