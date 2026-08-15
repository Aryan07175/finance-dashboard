const API_BASE = 'http://localhost:3000/api';

const api = {
  getDashboardMetrics: async () => {
    const res = await fetch(`${API_BASE}/dashboard/metrics`);
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  },
  
  getTransactions: async () => {
    const res = await fetch(`${API_BASE}/transactions`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },
  
  getPortfolio: async () => {
    const res = await fetch(`${API_BASE}/portfolio`);
    if (!res.ok) throw new Error('Failed to fetch portfolio data');
    return res.json();
  },
  
  getCards: async () => {
    const res = await fetch(`${API_BASE}/cards`);
    if (!res.ok) throw new Error('Failed to fetch cards');
    return res.json();
  }
};
