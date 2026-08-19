let mockMetrics = [];
let allTransactions = [];
let portfolioAssets = [];
let portfolioHoldings = [];
let portfolioMetrics = [];
let perfData = {};
let mockCards = [];
let mockSessions = [];
let cardActivity = [];
let txFiltered = [];

document.addEventListener('DOMContentLoaded', async () => {
  const loader = document.getElementById('global-loader');
  const errorState = document.getElementById('global-error');
  const appContainer = document.getElementById('app');

  try {
    const metricsData = await api.getDashboardMetrics();
    mockMetrics = metricsData.metrics;
    
    allTransactions = await api.getTransactions();
    cardActivity = allTransactions.slice(0, 5);
    txFiltered = [...allTransactions]; // initialise filtered set from full transaction list
    
    const portfolioData = await api.getPortfolio();
    portfolioAssets = portfolioData.assets;
    perfData = portfolioData.perfData;
    portfolioHoldings = portfolioData.holdings;
    
    // Derived metrics for portfolio from dashboard metrics
    portfolioMetrics = [
      metricsData.metrics[0], // Total Balance
      { title: "Day's Gain", value: '+$1,423.50', trend: 'up', trendValue: '1.16%', trendText: 'today', iconClass: 'ph-trend-up', colorClass: 'green' },
      { title: 'Total Return', value: '+$18,240.00', trend: 'up', trendValue: '17.2%', trendText: 'all time', iconClass: 'ph-chart-line-up', colorClass: 'purple' },
    ];
    
    mockCards = await api.getCards();
    mockSessions = await api.getSessions();
    
    initDashboard();
    initNavigation();
    initPortfolio();
    initTransactions();
    initCards();
    initSecurity();
    initPreferences(); // BUG-05 FIX: wire up previously no-op buttons
    initNotifications(); // BUG-13 FIX: control badge visibility based on data

    // Hide loader and show app
    if (loader) loader.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';
  } catch (error) {
    console.error('Error loading data from backend:', error);
    if (loader) loader.style.display = 'none';
    if (errorState) {
      errorState.style.display = 'flex';
      const errorMsg = document.getElementById('error-message');
      if (errorMsg) errorMsg.textContent = error.message;
    }
  }
});

function initDashboard() {
  renderMetricCards();
  renderTransactions('transactions-container');
  // BUG-03 FIX: defer chart render so clientWidth is measured after #app becomes visible
  setTimeout(() => renderCashFlowChart(), 0);

  // BUG-16 FIX: wire up date range picker dropdown
  const dateBtn = document.getElementById('date-range-btn');
  const dateDropdown = document.getElementById('date-range-dropdown');
  const dateLabel = document.getElementById('date-range-label');
  if (dateBtn && dateDropdown) {
    dateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dateDropdown.style.display = dateDropdown.style.display === 'none' ? 'block' : 'none';
    });
    dateDropdown.querySelectorAll('.date-range-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const range = opt.getAttribute('data-range');
        if (dateLabel) dateLabel.textContent = range;
        dateDropdown.style.display = 'none';
        showToast(`Date range set to: ${range}`);
      });
    });
    document.addEventListener('click', () => { dateDropdown.style.display = 'none'; });
  }
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

  // BUG-14 FIX: wire up global header search — navigate to transactions and apply search
  const globalSearch = document.querySelector('.search-input');
  if (globalSearch) {
    globalSearch.addEventListener('input', () => {
      const term = globalSearch.value.trim();
      if (term.length === 0) return;
      // Navigate to transactions view
      navigateTo('transactions');
      // Sync with the transaction search input and re-apply filters
      const txSearch = document.getElementById('tx-search-input');
      if (txSearch) {
        txSearch.value = term;
        applyTxFilters();
      }
    });
    // Clear tx search when global search is cleared
    globalSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        globalSearch.value = '';
        const txSearch = document.getElementById('tx-search-input');
        if (txSearch) { txSearch.value = ''; applyTxFilters(); }
      }
    });
  }
}

// mockMetrics initialized from API

// C3 FIX: mockTransactions removed — dashboard now uses allTransactions (unified dataset)

// BUG-13 FIX: notification badge controlled by data, not hardcoded on
function initNotifications() {
  const notifications = [
    { title: "Security Alert", message: "New login from Mac OS.", time: "2m ago", read: false },
    { title: "Payment Received", message: "You received $4,500.00 from Stripe.", time: "1h ago", read: false },
    { title: "Subscription Active", message: "AWS Cloud Services charged $145.20.", time: "Yesterday", read: false }
  ];
  let unreadCount = notifications.filter(n => !n.read).length;
  
  const badge = document.getElementById('notif-badge');
  const btn = document.getElementById('notif-btn');
  const panel = document.getElementById('notif-panel');
  const list = document.getElementById('notif-list');
  const markReadBtn = document.getElementById('notif-mark-read');

  if (badge) badge.style.display = unreadCount > 0 ? 'block' : 'none';

  function renderNotifications() {
    if (!list) return;
    list.innerHTML = '';
    if (notifications.length === 0) {
      list.innerHTML = `<div style="padding: var(--spacing-4); text-align: center; color: var(--color-text-secondary); font-size: var(--font-size-sm);">No notifications</div>`;
      return;
    }
    notifications.forEach((n, idx) => {
      const bg = n.read ? 'transparent' : 'rgba(10, 102, 194, 0.05)';
      const dot = !n.read ? `<span style="width: 8px; height: 8px; background-color: var(--color-primary); border-radius: 50%; display: inline-block;"></span>` : '';
      
      list.innerHTML += `
        <div class="notif-item" data-idx="${idx}" style="padding: var(--spacing-3) var(--spacing-4); border-bottom: 1px solid var(--color-border); background-color: ${bg}; display: flex; flex-direction: column; gap: 4px; cursor: pointer;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none;">
            <span style="font-weight: var(--font-weight-medium); font-size: var(--font-size-sm); color: var(--color-text-primary);">${n.title}</span>
            ${dot}
          </div>
          <span style="font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.4; pointer-events: none;">${n.message}</span>
          <span style="font-size: var(--font-size-xs); color: var(--color-text-tertiary); pointer-events: none;">${n.time}</span>
        </div>
      `;
    });
  }

  renderNotifications();

  if (list) {
    list.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = e.target.closest('.notif-item');
      if (item) {
        const idx = parseInt(item.getAttribute('data-idx'), 10);
        if (!notifications[idx].read) {
          notifications[idx].read = true;
          unreadCount = notifications.filter(n => !n.read).length;
          if (badge) badge.style.display = unreadCount > 0 ? 'block' : 'none';
          renderNotifications();
        }
      }
    });
  }

  if (btn && panel) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent document click from immediately closing it
      panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    });
    
    panel.addEventListener('click', (e) => {
      e.stopPropagation(); // keep panel open when clicking inside it
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !btn.contains(e.target)) {
        panel.style.display = 'none';
      }
    });
  }
  
  if (markReadBtn) {
    markReadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifications.forEach(n => n.read = true);
      unreadCount = 0;
      if (badge) badge.style.display = 'none';
      renderNotifications();
    });
  }
}


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

function renderTransactions(containerId = 'transactions-container', limit = 5) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // BUG-11 FIX: added explicit `limit` param; the function now uses it instead of always slicing 5
  const txList = allTransactions.slice(0, limit);
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
// portfolio data initialized from API

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
    // BUG-09 FIX: perfData values are stored as index values in thousands
    // (e.g. 124.5 = $124,500). The * 1000 is now explicitly documented here.
    const portfolioValueUSD = v * 1000;
    const label = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(portfolioValueUSD);
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
// allTransactions initialized from API

const TX_PAGE_SIZE = 8;
let txCurrentPage = 1;
// txFiltered is declared at the top of the file (module-level)

function initTransactions() {
  renderTxSummary();
  renderFullTxTable();
  initTxFilters();

  // BUG-12 FIX: single delegated listener on the static pagination container
  // instead of re-adding listeners on every renderFullTxTable() call
  const paginationEl = document.getElementById('tx-pagination');
  if (paginationEl) {
    paginationEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.page-btn');
      if (!btn || btn.disabled) return;
      if (btn.id === 'prev-page') { txCurrentPage--; renderFullTxTable(); }
      else if (btn.id === 'next-page') { txCurrentPage++; renderFullTxTable(); }
      else if (btn.dataset.page) { txCurrentPage = parseInt(btn.dataset.page); renderFullTxTable(); }
    });
  }
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
    // BUG-10 FIX: show savings rate (net / income) as a meaningful trend value
    { title: 'Net Cash Flow', value: fmt(net), trend: net > 0 ? 'up' : 'down', trendValue: income > 0 ? `${((net / income) * 100).toFixed(1)}% savings rate` : '–', trendText: 'income minus expenses', iconClass: 'ph-arrows-left-right', colorClass: 'blue' },
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
    // BUG-12 FIX: listeners are attached via delegation in initTransactions(), not here
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
  // BUG-06/07 FIX: populate categories dynamically from actual transaction data
  const catSelect = document.getElementById('tx-category-filter');
  if (catSelect) {
    const categories = [...new Set(allTransactions.map(t => t.category))].sort();
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      catSelect.appendChild(opt);
    });
  }

  document.getElementById('tx-search-input')?.addEventListener('input', applyTxFilters);
  document.getElementById('tx-type-filter')?.addEventListener('change', applyTxFilters);
  catSelect?.addEventListener('change', applyTxFilters);
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
// mockCards initialized from API

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

// cardActivity is declared at the top of the file (module-level)

function initCards() {
  renderCardsGrid();
  renderCardQuickActions();
  renderSpendingLimits();
  renderCardActivity();

  // BUG-04 FIX: wire up the "Add New Card" button
  const addCardBtn = document.getElementById('add-card-btn');
  if (addCardBtn) {
    addCardBtn.addEventListener('click', () => {
      alert('Add New Card: This feature is coming soon. Contact support to add a new card to your account.');
    });
  }
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
   PREFERENCES PAGE
   ===================== */

// BUG-05 FIX: wire up all previously no-op buttons with user feedback
function showToast(message, type = 'success') {
  // Remove any existing toast
  const existing = document.getElementById('app-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'app-toast';
  const bgColor = type === 'success' ? 'var(--color-accent-success)' : type === 'error' ? 'var(--color-accent-danger)' : 'var(--color-primary)';
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 99999;
    background: ${bgColor}; color: white;
    padding: 12px 20px; border-radius: 8px;
    font-size: 14px; font-family: inherit; font-weight: 500;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    display: flex; align-items: center; gap: 8px;
    animation: fadeIn 0.2s ease-out;
    max-width: 340px;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function initPreferences() {
  // BUG-17 FIX: restore previously saved display preferences from localStorage
  const prefFields = ['pref-currency', 'pref-language', 'pref-timezone', 'pref-dateformat'];
  prefFields.forEach(id => {
    const el = document.getElementById(id);
    const saved = localStorage.getItem(id);
    if (el && saved) el.value = saved;
  });
  const savedFirstname = localStorage.getItem('pref-firstname');
  const savedLastname = localStorage.getItem('pref-lastname');
  if (savedFirstname) { const el = document.getElementById('pref-firstname'); if (el) el.value = savedFirstname; }
  if (savedLastname) { const el = document.getElementById('pref-lastname'); if (el) el.value = savedLastname; }

  // Save Profile button
  const saveProfileBtn = document.getElementById('save-profile-btn');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
      const first = document.getElementById('pref-firstname')?.value || '';
      const last = document.getElementById('pref-lastname')?.value || '';
      // Persist name fields
      localStorage.setItem('pref-firstname', first);
      localStorage.setItem('pref-lastname', last);
      // Update sidebar user name to reflect saved values
      const sidebarName = document.querySelector('.user-name');
      if (sidebarName && (first || last)) sidebarName.textContent = `${first} ${last}`.trim();
      // BUG-17 FIX: also persist display preference dropdowns
      prefFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) localStorage.setItem(id, el.value);
      });
      showToast('✓ Profile & preferences saved successfully!');
    });
  }

  // Upload Photo button
  const uploadPhotoBtn = document.querySelector('.profile-avatar-row .btn-secondary');
  if (uploadPhotoBtn) {
    uploadPhotoBtn.addEventListener('click', () => {
      showToast('Photo upload is coming soon. Stay tuned!', 'info');
    });
  }

  // Export CSV button (Transactions page)
  const exportCsvBtn = document.querySelector('#view-transactions .btn-secondary');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      if (!allTransactions.length) { showToast('No transactions to export.', 'error'); return; }
      const headers = ['ID', 'Name', 'Merchant', 'Category', 'Date', 'Amount', 'Status'];
      const rows = allTransactions.map(t =>
        [t.id, `"${t.name}"`, `"${t.merchant}"`, `"${t.category}"`, t.date, t.amount, t.status].join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'transactions.csv'; a.click();
      URL.revokeObjectURL(url);
      showToast('✓ Transactions exported as CSV!');
    });
  }

  // Export Report button (Portfolio page)
  const exportReportBtn = document.querySelector('#view-portfolio .btn-secondary');
  if (exportReportBtn) {
    exportReportBtn.addEventListener('click', () => {
      showToast('Portfolio report export is coming soon!', 'info');
    });
  }

  // Update Password button
  const updatePwBtn = document.querySelector('#view-security .btn-primary');
  if (updatePwBtn) {
    updatePwBtn.addEventListener('click', () => {
      const current = document.getElementById('sec-current-pw')?.value || '';
      const newPw = document.getElementById('sec-new-pw')?.value || '';
      const confirm = document.getElementById('sec-confirm-pw')?.value || '';
      if (!current) { showToast('Please enter your current password.', 'error'); return; }
      if (!newPw || newPw.length < 8) { showToast('New password must be at least 8 characters.', 'error'); return; }
      if (newPw !== confirm) { showToast('Passwords do not match.', 'error'); return; }
      // Clear fields after simulated save
      ['sec-current-pw', 'sec-new-pw', 'sec-confirm-pw'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
      });
      const bar = document.getElementById('pw-strength-fill');
      const label = document.getElementById('pw-strength-label');
      if (bar) { bar.style.width = '0%'; bar.style.backgroundColor = 'transparent'; }
      if (label) label.textContent = 'Password strength: Not set';
      showToast('✓ Password updated successfully!');
    });
  }
}

/* =====================
   SECURITY PAGE
   ===================== */

function initSecurity() {
  renderSessions();
  initPasswordStrength();

  const revokeAllBtn = document.getElementById('revoke-all-btn');
  if (revokeAllBtn) {
    revokeAllBtn.addEventListener('click', () => {
      // BUG-15 FIX: call revokeSession() directly instead of simulating .click()
      const list = document.getElementById('session-list');
      if (list) {
        list.querySelectorAll('.session-item:not([data-revoked])').forEach(item => {
          if (!item.querySelector('.session-current-badge')) {
            revokeSession(item);
          }
        });
      }
      showToast('✓ All other sessions have been revoked.');
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

  // BUG-15 FIX: use event delegation + shared revokeSession() instead of per-button listeners
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.session-revoke-btn');
    if (!btn || btn.disabled) return;
    revokeSession(btn.closest('.session-item'));
  });
}

// Shared revoke handler — called by both individual buttons and Revoke All
function revokeSession(sessionItem) {
  if (!sessionItem || sessionItem.dataset.revoked) return;
  sessionItem.dataset.revoked = 'true';
  sessionItem.style.opacity = '0.4';
  const btn = sessionItem.querySelector('.session-revoke-btn');
  if (btn) { btn.textContent = 'Revoked'; btn.disabled = true; }
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
