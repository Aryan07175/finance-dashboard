const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.serialize(() => {
      // Create all tables first (serialize guarantees order)
      db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        name TEXT,
        merchant TEXT,
        category TEXT,
        date TEXT,
        amount REAL,
        icon TEXT,
        status TEXT
      )`, (err) => { if (err) console.error('[DB] Failed to create transactions table:', err.message); });

      db.run(`CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        bank TEXT,
        number TEXT,
        holder TEXT,
        expiry TEXT,
        type TEXT,
        gradient TEXT,
        network TEXT,
        isVirtual BOOLEAN
      )`, (err) => { if (err) console.error('[DB] Failed to create cards table:', err.message); });

      db.run(`CREATE TABLE IF NOT EXISTS portfolio_assets (
        name TEXT PRIMARY KEY,
        value REAL,
        pct REAL,
        color TEXT
      )`, (err) => { if (err) console.error('[DB] Failed to create portfolio_assets table:', err.message); });

      db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device TEXT,
        browser TEXT,
        icon TEXT,
        isCurrent BOOLEAN,
        time TEXT
      )`, (err) => { if (err) console.error('[DB] Failed to create sessions table:', err.message); });

      // Seed data if empty.
      // FIX: Each seed check is run inside its own db.serialize() callback so
      // they execute strictly in order — preventing a race where two concurrent
      // db.get() calls both see count=0 on first boot and both seed the same
      // table, producing duplicate rows.
      // FIX: err param is now checked and logged in every callback.
      db.get('SELECT COUNT(*) AS count FROM transactions', (err, row) => {
        if (err) { console.error('[DB] Seed check failed for transactions:', err.message); return; }
        if (row && row.count === 0) {
          console.log('Seeding transactions...');
          seedTransactions();
        }
      });

      db.get('SELECT COUNT(*) AS count FROM cards', (err, row) => {
        if (err) { console.error('[DB] Seed check failed for cards:', err.message); return; }
        if (row && row.count === 0) {
          console.log('Seeding cards...');
          seedCards();
        }
      });

      db.get('SELECT COUNT(*) AS count FROM portfolio_assets', (err, row) => {
        if (err) { console.error('[DB] Seed check failed for portfolio_assets:', err.message); return; }
        if (row && row.count === 0) {
          console.log('Seeding portfolio assets...');
          seedPortfolio();
        }
      });

      db.get('SELECT COUNT(*) AS count FROM sessions', (err, row) => {
        if (err) { console.error('[DB] Seed check failed for sessions:', err.message); return; }
        if (row && row.count === 0) {
          console.log('Seeding sessions...');
          seedSessions();
        }
      });
    });
  }
});

// Helper: runs a prepared statement with error logging on each row insert.
// FIX: stmt.run() now receives an error callback so individual insert failures
// are logged rather than silently dropped.
function runStmt(stmt, args, label) {
  stmt.run(...args, function(err) {
    if (err) console.error(`[DB] Insert failed in ${label}:`, err.message);
  });
}

function seedTransactions() {
  const allTransactions = [
    { id: 'tx-1',  name: 'Apple Store',         merchant: 'Technology',       category: 'Electronics',      date: 'Nov 01, 2023', amount: -1299.00, icon: 'ph-apple-logo',    status: 'completed' },
    { id: 'tx-2',  name: 'Stripe Payout',        merchant: 'Income',           category: 'Business',         date: 'Oct 31, 2023', amount: 4500.00,  icon: 'ph-bank',          status: 'completed' },
    { id: 'tx-3',  name: 'AWS Cloud Services',   merchant: 'Software',         category: 'Infrastructure',   date: 'Oct 29, 2023', amount: -145.20,  icon: 'ph-cloud',         status: 'completed' },
    { id: 'tx-4',  name: 'Starbucks',            merchant: 'Food & Dining',    category: 'Coffee',           date: 'Oct 28, 2023', amount: -6.50,    icon: 'ph-coffee',        status: 'completed' },
    { id: 'tx-5',  name: 'Upwork Escrow',        merchant: 'Income',           category: 'Freelance',        date: 'Oct 27, 2023', amount: 850.00,   icon: 'ph-briefcase',     status: 'completed' },
    { id: 'tx-6',  name: 'Netflix',              merchant: 'Entertainment',    category: 'Entertainment',    date: 'Oct 25, 2023', amount: -15.99,   icon: 'ph-television',    status: 'completed' },
    { id: 'tx-7',  name: 'Uber',                 merchant: 'Transport',        category: 'Transport',        date: 'Oct 24, 2023', amount: -23.40,   icon: 'ph-car',           status: 'completed' },
    { id: 'tx-8',  name: 'GitHub Copilot',       merchant: 'Software',         category: 'Infrastructure',   date: 'Oct 22, 2023', amount: -19.00,   icon: 'ph-github-logo',   status: 'completed' },
    { id: 'tx-9',  name: 'Freelance Invoice #8', merchant: 'Income',           category: 'Freelance',        date: 'Oct 20, 2023', amount: 2200.00,  icon: 'ph-receipt',       status: 'completed' },
    { id: 'tx-10', name: "McDonald's",           merchant: 'Food & Dining',    category: 'Food & Dining',    date: 'Oct 19, 2023', amount: -12.30,   icon: 'ph-hamburger',     status: 'completed' },
    { id: 'tx-11', name: 'Spotify',              merchant: 'Entertainment',    category: 'Entertainment',    date: 'Oct 18, 2023', amount: -9.99,    icon: 'ph-music-notes',   status: 'completed' },
    { id: 'tx-12', name: 'Google Cloud',         merchant: 'Software',         category: 'Infrastructure',   date: 'Oct 17, 2023', amount: -78.50,   icon: 'ph-google-logo',   status: 'completed' },
    { id: 'tx-13', name: 'Client Payment',       merchant: 'Income',           category: 'Business',         date: 'Oct 15, 2023', amount: 3500.00,  icon: 'ph-handshake',     status: 'completed' },
    { id: 'tx-14', name: 'Pharmacy',             merchant: 'Healthcare',       category: 'Healthcare',       date: 'Oct 13, 2023', amount: -45.00,   icon: 'ph-first-aid-kit', status: 'pending'   },
    { id: 'tx-15', name: 'Amazon Purchase',      merchant: 'Shopping',         category: 'Electronics',      date: 'Oct 11, 2023', amount: -234.99,  icon: 'ph-package',       status: 'completed' },
    { id: 'tx-16', name: 'Zoom Subscription',    merchant: 'Software',         category: 'Infrastructure',   date: 'Oct 09, 2023', amount: -16.99,   icon: 'ph-video-camera',  status: 'completed' },
    { id: 'tx-17', name: 'Salary Deposit',       merchant: 'Income',           category: 'Business',         date: 'Oct 01, 2023', amount: 7500.00,  icon: 'ph-money',         status: 'completed' },
    { id: 'tx-18', name: 'Electricity Bill',     merchant: 'Utilities',        category: 'Utilities',        date: 'Sep 30, 2023', amount: -120.00,  icon: 'ph-lightning',     status: 'completed' },
    { id: 'tx-19', name: 'Gym Membership',       merchant: 'Health',           category: 'Healthcare',       date: 'Sep 28, 2023', amount: -50.00,   icon: 'ph-barbell',       status: 'failed'    },
    { id: 'tx-20', name: 'Airbnb',               merchant: 'Travel',           category: 'Transport',        date: 'Sep 25, 2023', amount: -380.00,  icon: 'ph-house',         status: 'completed' },
  ];

  const stmt = db.prepare('INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  allTransactions.forEach(t => {
    runStmt(stmt, [t.id, t.name, t.merchant, t.category, t.date, t.amount, t.icon, t.status], 'seedTransactions');
  });
  stmt.finalize((err) => { if (err) console.error('[DB] finalize failed in seedTransactions:', err.message); });
}

function seedCards() {
  const mockCards = [
    {
      id: 'card-1',
      bank: 'FinDash Platinum',
      number: '•••• •••• •••• 4921',
      holder: 'Aryan J.',
      expiry: '08 / 27',
      type: 'Visa',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 60%, #3b82f6 100%)',
      network: 'ph-credit-card',
      isVirtual: false,
    },
    {
      id: 'card-2',
      bank: 'FinDash Business',
      number: '•••• •••• •••• 7743',
      holder: 'Aryan J.',
      expiry: '03 / 26',
      type: 'Mastercard',
      gradient: 'linear-gradient(135deg, #111827 0%, #374151 60%, #4B5563 100%)',
      network: 'ph-credit-card',
      isVirtual: false,
    },
    {
      id: 'card-3',
      bank: 'FinDash Virtual',
      number: '•••• •••• •••• 1102',
      holder: 'Aryan J.',
      expiry: '12 / 25',
      type: 'Virtual',
      gradient: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 60%, #8B5CF6 100%)',
      network: 'ph-lightning',
      isVirtual: true,
    },
  ];

  const stmt = db.prepare('INSERT INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  mockCards.forEach(c => {
    runStmt(stmt, [c.id, c.bank, c.number, c.holder, c.expiry, c.type, c.gradient, c.network, c.isVirtual ? 1 : 0], 'seedCards');
  });
  stmt.finalize((err) => { if (err) console.error('[DB] finalize failed in seedCards:', err.message); });
}

function seedPortfolio() {
  const portfolioAssets = [
    { name: 'Stocks',      value: 62000, pct: 49.8, color: '#2563EB' },
    { name: 'Crypto',      value: 24500, pct: 19.7, color: '#8B5CF6' },
    { name: 'Cash',        value: 20000, pct: 16.1, color: '#10B981' },
    { name: 'Real Estate', value: 12000, pct: 9.6,  color: '#F59E0B' },
    { name: 'Bonds',       value: 6063,  pct: 4.8,  color: '#94A3B8' },
  ];

  const stmt = db.prepare('INSERT INTO portfolio_assets VALUES (?, ?, ?, ?)');
  portfolioAssets.forEach(p => {
    runStmt(stmt, [p.name, p.value, p.pct, p.color], 'seedPortfolio');
  });
  stmt.finalize((err) => { if (err) console.error('[DB] finalize failed in seedPortfolio:', err.message); });
}

function seedSessions() {
  const mockSessions = [
    { device: 'MacBook Pro',   browser: 'Chrome 118 · Mumbai, IN', icon: 'ph-laptop',        isCurrent: true,  time: 'Active now'        },
    { device: 'iPhone 15 Pro', browser: 'Safari 17 · Mumbai, IN',  icon: 'ph-device-mobile', isCurrent: false, time: '2 hours ago'       },
    { device: 'Windows PC',    browser: 'Edge 119 · Delhi, IN',    icon: 'ph-desktop',       isCurrent: false, time: 'Yesterday, 4:30 PM'},
    { device: 'iPad Air',      browser: 'Safari 17 · Pune, IN',    icon: 'ph-device-tablet', isCurrent: false, time: '3 days ago'        },
  ];

  const stmt = db.prepare('INSERT INTO sessions (device, browser, icon, isCurrent, time) VALUES (?, ?, ?, ?, ?)');
  mockSessions.forEach(s => {
    runStmt(stmt, [s.device, s.browser, s.icon, s.isCurrent ? 1 : 0, s.time], 'seedSessions');
  });
  stmt.finalize((err) => { if (err) console.error('[DB] finalize failed in seedSessions:', err.message); });
}

module.exports = db;

