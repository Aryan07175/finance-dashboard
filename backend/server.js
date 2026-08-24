require('dotenv').config(); // load .env variables (PORT, etc.) before anything else
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// BUG-G FIX: CORS is intentionally unrestricted here for local development.
// TODO: Before deploying to production, replace this with an explicit origin
// allowlist, e.g.:
//   app.use(cors({ origin: ['https://yourdomain.com'] }))
// Leaving CORS fully open in production exposes the API to any web origin.
app.use(cors());
app.use(express.json());

// Helper function for database queries
const queryAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// =====================
// API ENDPOINTS
// =====================

// 1. Dashboard Metrics
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const transactions = await queryAll('SELECT amount FROM transactions');
    // BUG-08 FIX: sum all amounts directly (income positive, expenses negative)
    const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    // Net balance = sum of all amounts (income already positive, expenses already negative)
    const balance = transactions.reduce((s, t) => s + t.amount, 0);

    // BUG-C FIX: trendValue percentages below are static placeholder estimates.
    // They should be replaced with real period-over-period calculations once
    // a time-series or historical_metrics table is available.
    res.json({
      metrics: [
        {
          title: 'Net Balance',
          value: `$${balance.toLocaleString('en-US', {minimumFractionDigits: 2})}`,
          trend: balance >= 0 ? 'up' : 'down',
          trendValue: '2.5% (est.)',
          trendText: 'vs last month',
          iconClass: 'ph-wallet',
          colorClass: 'blue'
        },
        {
          title: 'Total Income',
          value: `$${income.toLocaleString('en-US', {minimumFractionDigits: 2})}`,
          trend: 'up',
          trendValue: '12.4% (est.)',
          trendText: 'vs last month',
          iconClass: 'ph-trend-up',
          colorClass: 'green'
        },
        {
          title: 'Total Expenses',
          value: `$${expenses.toLocaleString('en-US', {minimumFractionDigits: 2})}`,
          trend: 'down',
          trendValue: '4.1% (est.)',
          trendText: 'vs last month',
          iconClass: 'ph-trend-down',
          colorClass: 'purple'
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Transactions — ORDER BY date DESC ensures newest-first regardless of
// insert order, which matters when transactions are added individually later.
app.get('/api/transactions', async (req, res) => {
  try {
    const rows = await queryAll(
      `SELECT * FROM transactions
       ORDER BY date(substr(date,8,4)||'-'||
         CASE substr(date,1,3)
           WHEN 'Jan' THEN '01' WHEN 'Feb' THEN '02' WHEN 'Mar' THEN '03'
           WHEN 'Apr' THEN '04' WHEN 'May' THEN '05' WHEN 'Jun' THEN '06'
           WHEN 'Jul' THEN '07' WHEN 'Aug' THEN '08' WHEN 'Sep' THEN '09'
           WHEN 'Oct' THEN '10' WHEN 'Nov' THEN '11' ELSE '12'
         END||'-'||printf('%02d',CAST(substr(date,5,2) AS INTEGER))
       ) DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Portfolio
app.get('/api/portfolio', async (req, res) => {
  try {
    const assets = await queryAll('SELECT * FROM portfolio_assets');
    
    // Mock performance data for now, would typically come from a timeseries DB
    const perfData = {
      '1W': [116, 118, 117, 121, 120, 122, 124.5],
      '1M': [108, 110, 107, 113, 115, 118, 119, 121, 120, 122, 121, 124, 123, 124.5],
      '3M': [100, 103, 99, 105, 108, 106, 110, 112, 111, 115, 113, 117, 116, 119, 118, 120, 121, 122, 121, 123, 124.5],
      '1Y': [88, 90, 86, 94, 96, 91, 99, 102, 98, 104, 106, 103, 108, 111, 108, 113, 115, 112, 117, 116, 119, 118, 120, 121, 122, 121, 123, 124.5],
    };

    const holdings = [
      { ticker: 'AAPL', name: 'Apple Inc.', price: '$189.50', change: '+1.24%', changeDir: 'up', value: '$18,950.00', icon: 'ph-apple-logo' },
      { ticker: 'MSFT', name: 'Microsoft Corp.', price: '$415.20', change: '+0.87%', changeDir: 'up', value: '$16,608.00', icon: 'ph-windows-logo' },
      { ticker: 'NVDA', name: 'NVIDIA Corp.', price: '$875.00', change: '+3.12%', changeDir: 'up', value: '$14,000.00', icon: 'ph-cpu' },
      { ticker: 'BTC', name: 'Bitcoin', price: '$43,200.00', change: '-2.10%', changeDir: 'down', value: '$12,500.00', icon: 'ph-currency-btc' },
      { ticker: 'GOOGL', name: 'Alphabet Inc.', price: '$174.80', change: '+0.52%', changeDir: 'up', value: '$8,740.00', icon: 'ph-google-logo' },
    ];

    res.json({ assets, perfData, holdings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Cards
app.get('/api/cards', async (req, res) => {
  try {
    const cards = await queryAll('SELECT * FROM cards');
    
    // Transform boolean back
    const formattedCards = cards.map(c => ({
      ...c,
      isVirtual: c.isVirtual === 1
    }));

    res.json(formattedCards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await queryAll('SELECT * FROM sessions');
    const formattedSessions = sessions.map(s => ({
      ...s,
      isCurrent: s.isCurrent === 1
    }));
    res.json(formattedSessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// ERROR HANDLING
// =====================

// 405 Method Not Allowed — catches requests to /api/* paths with a wrong
// HTTP verb (e.g. POST /api/transactions). Registered before the 404 handler.
// Express 5 uses path-to-regexp v8 — wildcard syntax is '{*path}' not '/*'.
app.all('/api/{*path}', (req, res) => {
  res.status(405).json({ error: `Method ${req.method} not allowed on ${req.path}` });
});

// 404 Not Found — catches any request that didn't match a registered route.
// Returns JSON so the frontend fetchWithHandling() can parse and display it
// instead of crashing on an unexpected HTML response body.
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

// Global error handler (4-param signature required by Express).
// Catches any error thrown/rejected inside async route handlers that isn't
// already caught by the route's own try/catch, and returns a structured JSON
// error response instead of Express 5's default HTML error page.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Unhandled route error]', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
