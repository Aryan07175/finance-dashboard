document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

function initDashboard() {
  renderMetricCards();
  renderTransactions();
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

function renderTransactions() {
  const container = document.getElementById('transactions-container');
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
