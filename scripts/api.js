const API_BASE = 'http://localhost:3000/api';

async function fetchWithHandling(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      // Try to parse the backend error JSON
      let errorMsg = `HTTP error! status: ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.error) errorMsg = errorData.error;
      } catch (e) {
        // Not a JSON response
      }
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${url}:`, error);
    throw error;
  }
}

const api = {
  getDashboardMetrics: () => fetchWithHandling(`${API_BASE}/dashboard/metrics`),
  getTransactions: () => fetchWithHandling(`${API_BASE}/transactions`),
  getPortfolio: () => fetchWithHandling(`${API_BASE}/portfolio`),
  getCards: () => fetchWithHandling(`${API_BASE}/cards`),
  getSessions: () => fetchWithHandling(`${API_BASE}/sessions`),
  sendMoney: async (payload) => {
    const res = await fetch(`${API_BASE}/transactions/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      let errorMsg = `HTTP error! status: ${res.status}`;
      try { const errData = await res.json(); if (errData.error) errorMsg = errData.error; } catch (e) {}
      throw new Error(errorMsg);
    }
    return await res.json();
  }
};
