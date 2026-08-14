document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  initNavigation();
  initPortfolio();
  initTransactions();
  initCards();
  initSecurity();
});

function initDashboard() {
  renderMetricCards();
  renderTransactions('transactions-container');
  renderCashFlowChart();
}

function renderCashFlowChart() {
  const container = document.getElementById('cash-flow-chart-container');
  if (!container) return;

  const dataIn = [60, 80, 50, 90, 70, 40, 85];
  const dataOut = [40, 30, 70, 20, 50, 30, 60];
  
  const W = container.clientWidth || 500;
  const H = 200;
  const pad = { top: 20, right: 20, bottom: 20, left: 20 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const barW = Math.max(10, Math.min(30, (chartW / dataIn.length) * 0.4));
  const spacing = chartW / dataIn.length;
  
  let rectsHTML = '';
  for (let i = 0; i < dataIn.length; i++) {
    const x = pad.left + i * spacing + spacing / 2;
    const hIn = (dataIn[i] / 100) * chartH;
    const hOut = (dataOut[i] / 100) * chartH;
    const yIn = pad.top + chartH - hIn;
    const yOut = pad.top + chartH - hOut;
    
    rectsHTML += `
      <rect x="${x - barW - 2}" y="${yIn}" width="${barW}" height="${hIn}" fill="var(--color-primary)" rx="2"/>
      <rect x="${x + 2}" y="${yOut}" width="${barW}" height="${hOut}" fill="var(--color-accent-warning)" rx="2"/>
    `;
  }
  
  container.innerHTML = `
    <svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      ${rectsHTML}
    </svg>
  `;
}

function navigateTo(viewId) {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const views = document.querySelectorAll('.view-section');

  navItems.forEach(nav => {
    if (nav.getAttribute('data-view') === viewId) {
      nav.classList.add('active');
    } else {
      nav.classList.remove('active');
    }
  });

  views.forEach(view => {
    if (view.id === `view-${viewId}`) {
      view.classList.add('active');
      // C5 FIX: Lazy-render line chart when portfolio becomes visible so width is correctly calculated
      if (viewId === 'portfolio') {
        setTimeout(() => renderLineChart('1W'), 0);
      }
    } else {
      view.classList.remove('active');
    }
  });
}

function initNavigation() {
  // Global data-view link handler
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-view]');
    if (!link) return;
    
    e.preventDefault();
    const viewId = link.getAttribute('data-view');
    if (viewId) navigateTo(viewId);
  });
}

const mockMetrics = [
  {
    title: 'Total Balance',
    value: '$124,563.00',
    trend: 'up',
    trendValue: '2.5%',
    trendText: 'vs last month',
    iconClass: 'ph-wallet',
    colorClass: 'blue'
  },
  {
    title: 'Total Income',
    value: '$14,230.50',
    trend: 'up',
    trendValue: '12.4%',
    trendText: 'vs last month',
    iconClass: 'ph-trend-up',
    colorClass: 'green'
  },
  {
    title: 'Total Expenses',
    value: '$5,120.25',
    trend: 'down',
    trendValue: '4.1%',
    trendText: 'vs last month',
    iconClass: 'ph-trend-down',
    colorClass: 'purple'
  }
];

// C3 FIX: mockTransactions removed — dashboard now uses allTransactions (unified dataset)

function renderMetricCards() {
  const container = document.getElementById('metrics-container');
  if (!container) return;
  
  let html = '';
  
  mockMetrics.forEach(metric => {
    const trendClass = metric.trend === 'up' ? 'trend-up' : 'trend-down';
    const trendIcon = metric.trend === 'up' ? 'ph-arrow-up-right' : 'ph-arrow-down-right';
    
    html += `
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-icon ${metric.colorClass}">
            <i class="ph ${metric.iconClass}"></i>
          </div>
          <div class="metric-title">${metric.title}</div>
        </div>
        <div class="metric-value">${metric.value}</div>
        <div class="metric-trend">
          <span class="${trendClass}">
            <i class="ph ${trendIcon}"></i> ${metric.trendValue}
          </span>
          <span class="trend-text">${metric.trendText}</span>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function renderTransactions(containerId = 'transactions-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // C3 FIX: use unified allTransactions, show first 5 on dashboard
  const txList = allTransactions.slice(0, 5);
  let html = '';

  txList.forEach(tx => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      signDisplay: 'always'
    }).format(tx.amount);
    const amountClass = tx.amount > 0 ? 'amount-positive' : 'amount-negative';
    html += `
      <tr>
        <td>
          <div class="tx-item">
            <div class="tx-icon"><i class="ph ${tx.icon}"></i></div>
            <div class="tx-details">
              <span class="tx-name">${tx.name}</span>
              <span class="tx-merchant">${tx.merchant}</span>
            </div>
          </div>
        </td>
        <td><span class="tx-category">${tx.category}</span></td>
        <td><span class="tx-date">${tx.date}</span></td>
        <td class="text-right"><span class="tx-amount ${amountClass}">${formattedAmount}</span></td>
      </tr>`;
  });
  container.innerHTML = html;
}

/* =====================
   PORTFOLIO PAGE
   ===================== */
const portfolioAssets = [
  { name: 'Stocks', value: 62000, pct: 49.8, color: '#2563EB' },
  { name: 'Crypto', value: 24500, pct: 19.7, color: '#8B5CF6' },
  { name: 'Cash', value: 20000, pct: 16.1, color: '#10B981' },
  { name: 'Real Estate', value: 12000, pct: 9.6, color: '#F59E0B' },
  { name: 'Bonds', value: 6063, pct: 4.8, color: '#94A3B8' },
];

const portfolioHoldings = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: '$189.50', change: '+1.24%', changeDir: 'up', value: '$18,950.00', icon: 'ph-apple-logo' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: '$415.20', change: '+0.87%', changeDir: 'up', value: '$16,608.00', icon: 'ph-windows-logo' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: '$875.00', change: '+3.12%', changeDir: 'up', value: '$14,000.00', icon: 'ph-cpu' },
  { ticker: 'BTC', name: 'Bitcoin', price: '$43,200.00', change: '-2.10%', changeDir: 'down', value: '$12,500.00', icon: 'ph-currency-btc' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', price: '$174.80', change: '+0.52%', changeDir: 'up', value: '$8,740.00', icon: 'ph-google-logo' },
];

const portfolioMetrics = [
  { title: 'Total Value', value: '$124,563.00', trend: 'up', trendValue: '2.5%', trendText: 'vs last month', iconClass: 'ph-wallet', colorClass: 'blue' },
  { title: "Day's Gain", value: '+$1,423.50', trend: 'up', trendValue: '1.16%', trendText: 'today', iconClass: 'ph-trend-up', colorClass: 'green' },
  { title: 'Total Return', value: '+$18,240.00', trend: 'up', trendValue: '17.2%', trendText: 'all time', iconClass: 'ph-chart-line-up', colorClass: 'purple' },
];

const perfData = {
  '1W': [116, 118, 117, 121, 120, 122, 124.5],
  '1M': [108, 110, 107, 113, 115, 118, 119, 121, 120, 122, 121, 124, 123, 124.5],
  '3M': [100, 103, 99, 105, 108, 106, 110, 112, 111, 115, 113, 117, 116, 119, 118, 120, 121, 122, 121, 123, 124.5],
  '1Y': [88, 90, 86, 94, 96, 91, 99, 102, 98, 104, 106, 103, 108, 111, 108, 113, 115, 112, 117, 116, 119, 118, 120, 121, 122, 121, 123, 124.5],
};

function initPortfolio() {
  renderPortfolioMetrics();
  renderDonutChart();
  renderHoldingsTable();
  // Line chart is now lazy-rendered via navigation activation (C5 fix)
  initPerfTabs();
}

function renderPortfolioMetrics() {
  const container = document.getElementById('portfolio-metrics-container');
  if (!container) return;
  let html = '';
  portfolioMetrics.forEach(metric => {
    const trendClass = metric.trend === 'up' ? 'trend-up' : 'trend-down';
    const trendIcon = metric.trend === 'up' ? 'ph-arrow-up-right' : 'ph-arrow-down-right';
    html += `
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-icon ${metric.colorClass}"><i class="ph ${metric.iconClass}"></i></div>
          <div class="metric-title">${metric.title}</div>
        </div>
        <div class="metric-value">${metric.value}</div>
        <div class="metric-trend">
          <span class="${trendClass}"><i class="ph ${trendIcon}"></i> ${metric.trendValue}</span>
          <span class="trend-text">${metric.trendText}</span>
        </div>
      </div>`;
  });
  container.innerHTML = html;
}

function renderDonutChart() {
  const chart = document.getElementById('donut-chart');
  const legend = document.getElementById('asset-legend');
  if (!chart || !legend) return;

  const total = portfolioAssets.reduce((s, a) => s + a.value, 0);
  let cumulativeDeg = -90;
  let gradientParts = [];

  portfolioAssets.forEach(asset => {
    const deg = (asset.value / total) * 360;
    const start = cumulativeDeg;
    const end = cumulativeDeg + deg;
    gradientParts.push(`${asset.color} ${start}deg ${end}deg`);
    cumulativeDeg = end;
  });

  chart.style.background = `conic-gradient(${gradientParts.join(', ')})`;

  // C2 FIX: Clear any previously appended hole before re-appending
  const existingHole = chart.querySelector('.donut-hole');
  if (!existingHole) {
    const hole = document.createElement('div');
    hole.className = 'donut-hole';
    hole.style.cssText = 'position:absolute;width:110px;height:110px;border-radius:50%;background:var(--color-surface);display:flex;flex-direction:column;align-items:center;justify-content:center;';
    
    const label = document.createElement('span');
    label.className = 'donut-total-label';
    label.textContent = 'Total Value';
    
    const value = document.createElement('span');
    value.className = 'donut-total-value';
    value.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(total);
    
    hole.appendChild(label);
    hole.appendChild(value);
    
    chart.appendChild(hole);
  } else {
    const valueEl = existingHole.querySelector('.donut-total-value');
    if (valueEl) valueEl.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(total);
  }

  // Legend
  let legendHTML = '';
  portfolioAssets.forEach(asset => {
    const val = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(asset.value);
    legendHTML += `
      <div class="legend-item">
        <div class="legend-left">
          <span class="legend-dot" style="background:${asset.color}"></span>
          <span class="legend-name">${asset.name}</span>
        </div>
        <div class="legend-right">
          <span class="legend-value">${val}</span>
          <span class="legend-pct">${asset.pct}%</span>
        </div>
      </div>`;
  });
  legend.innerHTML = legendHTML;
}

function renderHoldingsTable() {
  const tbody = document.getElementById('holdings-table-body');
  if (!tbody) return;
  let html = '';
  portfolioHoldings.forEach(h => {
    html += `
      <tr>
        <td>
          <div class="tx-item">
            <div class="tx-icon"><i class="ph ${h.icon}"></i></div>
            <div class="tx-details">
              <span class="tx-name">${h.ticker}</span>
              <span class="tx-merchant">${h.name}</span>
            </div>
          </div>
        </td>
        <td><span>${h.price}</span></td>
        <td><span class="change-badge ${h.changeDir}">${h.change}</span></td>
        <td class="text-right"><span class="tx-amount amount-positive">${h.value}</span></td>
      </tr>`;
  });
  tbody.innerHTML = html;
}

function renderLineChart(range) {
  const container = document.getElementById('line-chart-container');
  if (!container) return;
  const data = perfData[range];
  const W = container.clientWidth || 700;
  const H = 200;
  const pad = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const minVal = Math.min(...data) * 0.99;
  const maxVal = Math.max(...data) * 1.01;

  if (data.length <= 1) return; // M4 FIX: Guard division by zero
  const xStep = chartW / (data.length - 1);
  const yScale = (v) => chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  const points = data.map((v, i) => `${pad.left + i * xStep},${pad.top + yScale(v)}`);
  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M ${pad.left + 0},${pad.top + chartH} L ${points.join(' L ')} L ${pad.left + (data.length - 1) * xStep},${pad.top + chartH} Z`;

  // Y axis labels
  const yTicks = 4;
  let yAxisHTML = '';
  for (let i = 0; i <= yTicks; i++) {
    const v = minVal + ((maxVal - minVal) * i / yTicks);
    const y = pad.top + yScale(v);
    const label = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(v * 1000);
    yAxisHTML += `<text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="var(--color-text-secondary)">${label}</text>
    <line x1="${pad.left}" y1="${y}" x2="${pad.left + chartW}" y2="${y}" stroke="var(--color-border)" stroke-width="1"/>`;
  }

  container.innerHTML = `
    <svg class="line-chart-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${yAxisHTML}
      <path d="${areaD}" fill="url(#areaGrad)"/>
      <path d="${pathD}" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${pad.left + (data.length - 1) * xStep}" cy="${pad.top + yScale(data[data.length - 1])}" r="4" fill="var(--color-primary)"/>
    </svg>`;
}

function initPerfTabs() {
  const tabs = document.querySelectorAll('.perf-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderLineChart(tab.getAttribute('data-range'));
    });
  });
}

/* =====================
   TRANSACTIONS PAGE
   ===================== */
const allTransactions = [
  { id: 'tx-1',  name: 'Apple Store',         merchant: 'Technology',       category: 'Electronics',      date: 'Nov 01, 2023', amount: -1299.00, icon: 'ph-apple-logo',    status: 'completed' },
  { id: 'tx-2',  name: 'Stripe Payout',        merchant: 'Income',           category: 'Business',         date: 'Oct 31, 2023', amount: 4500.00,  icon: 'ph-bank',          status: 'completed' },
  { id: 'tx-3',  name: 'AWS Cloud Services',   merchant: 'Software',         category: 'Infrastructure',   date: 'Oct 29, 2023', amount: -145.20,  icon: 'ph-cloud',         status: 'completed' },
  { id: 'tx-4',  name: 'Starbucks',            merchant: 'Food & Dining',    category: 'Coffee',           date: 'Oct 28, 2023', amount: -6.50,   icon: 'ph-coffee',        status: 'completed' },
  { id: 'tx-5',  name: 'Upwork Escrow',        merchant: 'Income',           category: 'Freelance',        date: 'Oct 27, 2023', amount: 850.00,   icon: 'ph-briefcase',     status: 'completed' },
  { id: 'tx-6',  name: 'Netflix',              merchant: 'Entertainment',    category: 'Entertainment',    date: 'Oct 25, 2023', amount: -15.99,  icon: 'ph-television',    status: 'completed' },
  { id: 'tx-7',  name: 'Uber',                 merchant: 'Transport',        category: 'Transport',        date: 'Oct 24, 2023', amount: -23.40,  icon: 'ph-car',           status: 'completed' },
  { id: 'tx-8',  name: 'GitHub Copilot',       merchant: 'Software',         category: 'Infrastructure',   date: 'Oct 22, 2023', amount: -19.00,  icon: 'ph-github-logo',   status: 'completed' },
  { id: 'tx-9',  name: 'Freelance Invoice #8', merchant: 'Income',           category: 'Freelance',        date: 'Oct 20, 2023', amount: 2200.00,  icon: 'ph-receipt',       status: 'completed' },
  { id: 'tx-10', name: 'McDonald\'s',          merchant: 'Food & Dining',    category: 'Food & Dining',    date: 'Oct 19, 2023', amount: -12.30,  icon: 'ph-hamburger',     status: 'completed' },
  { id: 'tx-11', name: 'Spotify',              merchant: 'Entertainment',    category: 'Entertainment',    date: 'Oct 18, 2023', amount: -9.99,   icon: 'ph-music-notes',   status: 'completed' },
  { id: 'tx-12', name: 'Google Cloud',         merchant: 'Software',         category: 'Infrastructure',   date: 'Oct 17, 2023', amount: -78.50,  icon: 'ph-google-logo',   status: 'completed' },
  { id: 'tx-13', name: 'Client Payment',       merchant: 'Income',           category: 'Business',         date: 'Oct 15, 2023', amount: 3500.00,  icon: 'ph-handshake',     status: 'completed' },
  { id: 'tx-14', name: 'Pharmacy',             merchant: 'Healthcare',       category: 'Healthcare',       date: 'Oct 13, 2023', amount: -45.00,  icon: 'ph-first-aid-kit', status: 'pending'   },
  { id: 'tx-15', name: 'Amazon Purchase',      merchant: 'Shopping',         category: 'Electronics',      date: 'Oct 11, 2023', amount: -234.99, icon: 'ph-package',       status: 'completed' },
  { id: 'tx-16', name: 'Zoom Subscription',    merchant: 'Software',         category: 'Infrastructure',   date: 'Oct 09, 2023', amount: -16.99,  icon: 'ph-video-camera',  status: 'completed' },
  { id: 'tx-17', name: 'Salary Deposit',       merchant: 'Income',           category: 'Business',         date: 'Oct 01, 2023', amount: 7500.00,  icon: 'ph-money',         status: 'completed' },
  { id: 'tx-18', name: 'Electricity Bill',     merchant: 'Utilities',        category: 'Utilities',        date: 'Sep 30, 2023', amount: -120.00, icon: 'ph-lightning',     status: 'completed' },
  { id: 'tx-19', name: 'Gym Membership',       merchant: 'Health',           category: 'Healthcare',       date: 'Sep 28, 2023', amount: -50.00,  icon: 'ph-barbell',       status: 'failed'    },
  { id: 'tx-20', name: 'Airbnb',               merchant: 'Travel',           category: 'Transport',        date: 'Sep 25, 2023', amount: -380.00, icon: 'ph-house',         status: 'completed' },
];

const TX_PAGE_SIZE = 8;
let txCurrentPage = 1;
let txFiltered = [...allTransactions];

function initTransactions() {
  renderTxSummary();
  renderFullTxTable();
  initTxFilters();
}

function renderTxSummary() {
  const container = document.getElementById('tx-summary-container');
  if (!container) return;
  const income = allTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = allTransactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = income - expenses;
  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  const metrics = [
    { title: 'Total Income', value: fmt(income), trend: 'up', trendValue: `${allTransactions.filter(t=>t.amount>0).length} txns`, trendText: 'this period', iconClass: 'ph-trend-up', colorClass: 'green' },
    { title: 'Total Expenses', value: fmt(expenses), trend: 'down', trendValue: `${allTransactions.filter(t=>t.amount<0).length} txns`, trendText: 'this period', iconClass: 'ph-trend-down', colorClass: 'purple' },
    { title: 'Net Cash Flow', value: fmt(net), trend: net > 0 ? 'up' : 'down', trendValue: '-', trendText: 'income minus expenses', iconClass: 'ph-arrows-left-right', colorClass: 'blue' },
  ];
  let html = '';
  metrics.forEach(metric => {
    const trendClass = metric.trend === 'up' ? 'trend-up' : 'trend-down';
    const trendIcon = metric.trend === 'up' ? 'ph-arrow-up-right' : 'ph-arrow-down-right';
    html += `<div class="metric-card">
      <div class="metric-header">
        <div class="metric-icon ${metric.colorClass}"><i class="ph ${metric.iconClass}"></i></div>
        <div class="metric-title">${metric.title}</div>
      </div>
      <div class="metric-value">${metric.value}</div>
      <div class="metric-trend">
        <span class="${trendClass}"><i class="ph ${trendIcon}"></i> ${metric.trendValue}</span>
        <span class="trend-text">${metric.trendText}</span>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

function renderFullTxTable() {
  const tbody = document.getElementById('full-tx-body');
  const pagination = document.getElementById('tx-pagination');
  if (!tbody) return;

  const start = (txCurrentPage - 1) * TX_PAGE_SIZE;
  const page = txFiltered.slice(start, start + TX_PAGE_SIZE);
  const totalPages = Math.ceil(txFiltered.length / TX_PAGE_SIZE);

  if (page.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="ph ph-magnifying-glass"></i><p>No transactions match your filters.</p></div></td></tr>`;
  } else {
    let html = '';
    page.forEach(tx => {
      const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', signDisplay: 'always' }).format(tx.amount);
      const amtClass = tx.amount > 0 ? 'amount-positive' : 'amount-negative';
      html += `<tr>
        <td><div class="tx-item">
          <div class="tx-icon"><i class="ph ${tx.icon}"></i></div>
          <div class="tx-details"><span class="tx-name">${tx.name}</span><span class="tx-merchant">${tx.merchant}</span></div>
        </div></td>
        <td><span class="tx-category">${tx.category}</span></td>
        <td><span class="tx-date">${tx.date}</span></td>
        <td><span class="status-badge ${tx.status}">${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</span></td>
        <td class="text-right"><span class="tx-amount ${amtClass}">${fmt}</span></td>
      </tr>`;
    });
    tbody.innerHTML = html;
  }

  // Pagination
  if (pagination) {
    const startIdx = txFiltered.length === 0 ? 0 : start + 1;
    const endIdx = Math.min(start + TX_PAGE_SIZE, txFiltered.length);
    pagination.innerHTML = `
      <span>Showing ${startIdx}–${endIdx} of ${txFiltered.length} transactions</span>
      <div class="pagination-btns">
        <button class="page-btn" id="prev-page" ${txCurrentPage === 1 ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button>
        ${Array.from({ length: totalPages }, (_, i) => `<button class="page-btn ${i + 1 === txCurrentPage ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>`).join('')}
        <button class="page-btn" id="next-page" ${txCurrentPage === totalPages || totalPages === 0 ? 'disabled' : ''}><i class="ph ph-caret-right"></i></button>
      </div>`;

    document.getElementById('prev-page')?.addEventListener('click', () => { txCurrentPage--; renderFullTxTable(); });
    document.getElementById('next-page')?.addEventListener('click', () => { txCurrentPage++; renderFullTxTable(); });
    pagination.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => { txCurrentPage = parseInt(btn.getAttribute('data-page')); renderFullTxTable(); });
    });
  }
}

function applyTxFilters() {
  const search = document.getElementById('tx-search-input')?.value.toLowerCase() || '';
  const typeFilter = document.getElementById('tx-type-filter')?.value || 'all';
  const catFilter = document.getElementById('tx-category-filter')?.value || 'all';

  txFiltered = allTransactions.filter(tx => {
    const matchSearch = tx.name.toLowerCase().includes(search) || tx.merchant.toLowerCase().includes(search) || tx.category.toLowerCase().includes(search);
    const matchType = typeFilter === 'all' || (typeFilter === 'income' ? tx.amount > 0 : tx.amount < 0);
    const matchCat = catFilter === 'all' || tx.category === catFilter;
    return matchSearch && matchType && matchCat;
  });

  txCurrentPage = 1;
  renderFullTxTable();
}

function initTxFilters() {
  document.getElementById('tx-search-input')?.addEventListener('input', applyTxFilters);
  document.getElementById('tx-type-filter')?.addEventListener('change', applyTxFilters);
  document.getElementById('tx-category-filter')?.addEventListener('change', applyTxFilters);
  document.getElementById('tx-clear-filters')?.addEventListener('click', () => {
    const s = document.getElementById('tx-search-input');
    const t = document.getElementById('tx-type-filter');
    const c = document.getElementById('tx-category-filter');
    if (s) s.value = '';
    if (t) t.value = 'all';
    if (c) c.value = 'all';
    applyTxFilters();
  });
}

/* =====================
   CARDS PAGE
   ===================== */
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

const cardQuickActions = [
  { icon: 'ph-snowflake', color: 'blue', label: 'Freeze Card', desc: 'Temporarily lock card' },
  { icon: 'ph-eye', color: 'green', label: 'Reveal PIN', desc: 'View your card PIN' },
  { icon: 'ph-arrows-clockwise', color: 'amber', label: 'Request Replacement', desc: 'Get a new card issued' },
  { icon: 'ph-trash', color: 'red', label: 'Cancel Card', desc: 'Permanently close this card', danger: true },
];

const spendingLimits = [
  { name: 'Online Shopping', used: 1450, limit: 2000, color: '#2563EB' },
  { name: 'Food & Dining', used: 340, limit: 500, color: '#10B981' },
  { name: 'Travel', used: 890, limit: 1500, color: '#8B5CF6' },
  { name: 'Entertainment', used: 75, limit: 200, color: '#F59E0B' },
];

const cardActivity = allTransactions.slice(0, 5);

function initCards() {
  renderCardsGrid();
  renderCardQuickActions();
  renderSpendingLimits();
  renderCardActivity();
}

function renderCardsGrid() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;
  let html = '';
  mockCards.forEach((card, i) => {
    html += `
      <div class="credit-card ${i === 0 ? 'selected' : ''}" style="background: ${card.gradient};" id="${card.id}">
        ${card.isVirtual ? '<span class="card-type-badge">Virtual</span>' : ''}
        <div class="card-top-row">
          <span class="card-bank-name">${card.bank}</span>
          <div class="card-chip"></div>
        </div>
        <div class="card-number">${card.number}</div>
        <div class="card-bottom-row">
          <div class="card-holder-info">
            <div class="card-label">Card Holder</div>
            <div class="card-value">${card.holder}</div>
          </div>
          <div class="card-holder-info" style="text-align:center;">
            <div class="card-label">Expires</div>
            <div class="card-value">${card.expiry}</div>
          </div>
          <div>
            <i class="ph ${card.network} card-network-logo"></i>
          </div>
        </div>
      </div>`;
  });
  grid.innerHTML = html;

  // Clicking a card selects it
  grid.querySelectorAll('.credit-card').forEach(el => {
    el.addEventListener('click', () => {
      grid.querySelectorAll('.credit-card').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
    });
  });
}

function renderCardQuickActions() {
  const list = document.getElementById('card-actions-list');
  if (!list) return;
  let html = '';
  cardQuickActions.forEach(action => {
    html += `
      <button class="card-action-btn ${action.danger ? 'danger' : ''}">
        <div class="card-action-icon ${action.color}"><i class="ph ${action.icon}"></i></div>
        <div class="card-action-text">
          <span class="card-action-label">${action.label}</span>
          <span class="card-action-desc">${action.desc}</span>
        </div>
      </button>`;
  });
  list.innerHTML = html;
}

function renderSpendingLimits() {
  const list = document.getElementById('spend-limits-list');
  if (!list) return;
  let html = '';
  spendingLimits.forEach(limit => {
    const pct = Math.min((limit.used / limit.limit) * 100, 100);
    const fmtUsed = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(limit.used);
    const fmtLimit = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(limit.limit);
    html += `
      <div class="spend-limit-item">
        <div class="spend-limit-header">
          <span class="spend-limit-name">${limit.name}</span>
          <span class="spend-limit-amount">${fmtUsed} / ${fmtLimit}</span>
        </div>
        <div class="spend-limit-bar">
          <div class="spend-limit-fill" style="width: ${pct}%; background: ${limit.color};"></div>
        </div>
      </div>`;
  });
  list.innerHTML = html;
}

function renderCardActivity() {
  const tbody = document.getElementById('card-activity-body');
  if (!tbody) return;
  let html = '';
  cardActivity.forEach(tx => {
    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', signDisplay: 'always' }).format(tx.amount);
    const amtClass = tx.amount > 0 ? 'amount-positive' : 'amount-negative';
    html += `<tr>
      <td><div class="tx-item">
        <div class="tx-icon"><i class="ph ${tx.icon}"></i></div>
        <div class="tx-details"><span class="tx-name">${tx.name}</span><span class="tx-merchant">${tx.merchant}</span></div>
      </div></td>
      <td><span class="tx-date">${tx.date}</span></td>
      <td class="text-right"><span class="tx-amount ${amtClass}">${fmt}</span></td>
    </tr>`;
  });
  tbody.innerHTML = html;
}

/* =====================
   SECURITY PAGE
   ===================== */
const mockSessions = [
  { device: 'MacBook Pro', browser: 'Chrome 118 · Mumbai, IN', icon: 'ph-laptop', isCurrent: true, time: 'Active now' },
  { device: 'iPhone 15 Pro', browser: 'Safari 17 · Mumbai, IN', icon: 'ph-device-mobile', isCurrent: false, time: '2 hours ago' },
  { device: 'Windows PC', browser: 'Edge 119 · Delhi, IN', icon: 'ph-desktop', isCurrent: false, time: 'Yesterday, 4:30 PM' },
  { device: 'iPad Air', browser: 'Safari 17 · Pune, IN', icon: 'ph-device-tablet', isCurrent: false, time: '3 days ago' },
];

function initSecurity() {
  renderSessions();
  initPasswordStrength();

  const revokeAllBtn = document.getElementById('revoke-all-btn');
  if (revokeAllBtn) {
    revokeAllBtn.addEventListener('click', () => {
      const list = document.getElementById('session-list');
      if (list) {
        list.querySelectorAll('.session-revoke-btn').forEach(btn => {
          if (!btn.disabled) {
            btn.click();
          }
        });
      }
    });
  }
}

function renderSessions() {
  const list = document.getElementById('session-list');
  if (!list) return;
  let html = '';
  mockSessions.forEach(session => {
    html += `
      <div class="session-item">
        <div class="session-left">
          <div class="session-device-icon"><i class="ph ${session.icon}"></i></div>
          <div>
            <div class="session-device-name">
              ${session.device}
              ${session.isCurrent ? '<span class="session-current-badge">Current</span>' : ''}
            </div>
            <div class="session-device-detail">${session.browser} · ${session.time}</div>
          </div>
        </div>
        ${session.isCurrent
          ? '<span style="font-size:var(--font-size-xs);color:var(--color-text-tertiary);">This device</span>'
          : '<button class="session-revoke-btn">Revoke</button>'
        }
      </div>`;
  });
  list.innerHTML = html;

  // Revoke button click
  list.querySelectorAll('.session-revoke-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.session-item').style.opacity = '0.4';
      btn.textContent = 'Revoked';
      btn.disabled = true;
    });
  });
}

function initPasswordStrength() {
  const input = document.getElementById('sec-new-pw');
  const bar = document.getElementById('pw-strength-fill');
  const label = document.getElementById('pw-strength-label');
  if (!input || !bar || !label) return;

  input.addEventListener('input', () => {
    const val = input.value;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = [
      { pct: '0%', color: 'transparent', text: 'Password strength: Not set' },
      { pct: '25%', color: '#EF4444', text: 'Password strength: Weak' },
      { pct: '50%', color: '#F59E0B', text: 'Password strength: Fair' },
      { pct: '75%', color: '#3B82F6', text: 'Password strength: Good' },
      { pct: '100%', color: '#10B981', text: 'Password strength: Strong' },
    ];

    const lvl = val.length === 0 ? levels[0] : levels[Math.min(score, 4)];
    bar.style.width = lvl.pct;
    bar.style.backgroundColor = lvl.color;
    label.textContent = lvl.text;
    label.style.color = lvl.color === 'transparent' ? 'var(--color-text-secondary)' : lvl.color;
  });
}
