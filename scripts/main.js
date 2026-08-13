document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  initNavigation();
  initPortfolio();
});

function initDashboard() {
  renderMetricCards();
  renderTransactions('transactions-container');
  renderTransactions('all-transactions-container');
}

function initNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const views = document.querySelectorAll('.view-section');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const viewId = item.getAttribute('data-view');
      if (!viewId) return;

      // Update active nav state
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Update active view
      views.forEach(view => {
        if (view.id === `view-${viewId}`) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });
    });
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

const mockTransactions = [
  {
    id: 'tx-1',
    name: 'Apple Store',
    merchant: 'Technology',
    category: 'Electronics',
    date: 'Oct 24, 2023',
    amount: -1299.00,
    icon: 'ph-apple-logo'
  },
  {
    id: 'tx-2',
    name: 'Stripe Payout',
    merchant: 'Income',
    category: 'Business',
    date: 'Oct 23, 2023',
    amount: 4500.00,
    icon: 'ph-bank'
  },
  {
    id: 'tx-3',
    name: 'AWS Cloud Services',
    merchant: 'Software',
    category: 'Infrastructure',
    date: 'Oct 21, 2023',
    amount: -145.20,
    icon: 'ph-cloud'
  },
  {
    id: 'tx-4',
    name: 'Starbucks',
    merchant: 'Food & Dining',
    category: 'Coffee',
    date: 'Oct 20, 2023',
    amount: -6.50,
    icon: 'ph-coffee'
  },
  {
    id: 'tx-5',
    name: 'Upwork Escrow',
    merchant: 'Income',
    category: 'Freelance',
    date: 'Oct 18, 2023',
    amount: 850.00,
    icon: 'ph-briefcase'
  }
];

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
  
  let html = '';
  
  mockTransactions.forEach(tx => {
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
            <div class="tx-icon">
              <i class="ph ${tx.icon}"></i>
            </div>
            <div class="tx-details">
              <span class="tx-name">${tx.name}</span>
              <span class="tx-merchant">${tx.merchant}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="tx-category">${tx.category}</span>
        </td>
        <td>
          <span class="tx-date">${tx.date}</span>
        </td>
        <td class="text-right">
          <span class="tx-amount ${amountClass}">${formattedAmount}</span>
        </td>
      </tr>
    `;
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
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: '$415.20', change: '+0.87%', changeDir: 'up', value: '$16,608.00', icon: 'ph-microsoft-teams-logo' },
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
  renderLineChart('1W');
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

  // Inner hole
  const hole = document.createElement('div');
  hole.style.cssText = 'position:absolute;width:110px;height:110px;border-radius:50%;background:white;display:flex;flex-direction:column;align-items:center;justify-content:center;';
  chart.appendChild(hole);

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
        <td><span class="tx-date">${h.price}</span></td>
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
    yAxisHTML += `<text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#94A3B8">$${Math.round(v)}k</text>
    <line x1="${pad.left}" y1="${y}" x2="${pad.left + chartW}" y2="${y}" stroke="#E2E8F0" stroke-width="1"/>`;
  }

  container.innerHTML = `
    <svg class="line-chart-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2563EB" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#2563EB" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${yAxisHTML}
      <path d="${areaD}" fill="url(#areaGrad)"/>
      <path d="${pathD}" fill="none" stroke="#2563EB" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${pad.left + (data.length - 1) * xStep}" cy="${pad.top + yScale(data[data.length - 1])}" r="4" fill="#2563EB"/>
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
