# Finance Dashboard

A modern, responsive, and feature-rich personal finance dashboard application. It features a clean and premium user interface built with Vanilla JavaScript and CSS, powered by a Node.js and SQLite backend.

## ✨ Features

- **Dashboard:** Overview of key financial metrics including Net Balance, Total Income, and Total Expenses with trend indicators.
- **Transactions Management:** View, search, and filter transactions by date range, type (income/expense), and category. Includes client-side pagination.
- **Send Money:** Transfer funds seamlessly through a dedicated modal interface, instantly reflecting balance and transaction history.
- **Portfolio Tracking:** Visualize your asset allocation (Stocks, Crypto, Cash, Real Estate, Bonds) and track holding performance.
- **Card Management:** Manage your physical and virtual credit/debit cards in a sleek UI.
- **Settings & Preferences:** Configure user profile details, notification preferences (Email, SMS, Push), and view active device sessions.
- **Responsive Design:** A fully responsive layout that adapts seamlessly to desktop, tablet, and mobile devices, utilizing a robust custom CSS design system with CSS variables.
- **Single Page Application (SPA):** Fast, client-side routing without page reloads.

## 🛠️ Technology Stack

**Frontend:**
- HTML5
- CSS3 (Custom Design System with Design Tokens)
- Vanilla JavaScript (ES6+)
- Phosphor Icons

**Backend:**
- Node.js
- Express.js (v5)
- SQLite3 (Database)
- dotenv (Environment Management)
- cors (Cross-Origin Resource Sharing)

## 🚀 Getting Started

Follow these steps to get the project running locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- A modern web browser

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aryan07175/finance-dashboard.git
   cd finance-dashboard
   ```

2. **Setup the Backend:**
   Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env file in the `backend` directory (optional):
   ```env
   PORT=3000
   ```

4. **Start the Backend Server:**
   ```bash
   npm start
   ```
   *Note: The server will automatically create and seed the SQLite database (`database.sqlite`) on its first run.*

5. **Start the Frontend:**
   Since the frontend is built with vanilla web technologies, you can simply open the `index.html` file located in the root directory directly in your web browser. 
   
   Alternatively, for a better development experience, you can serve it using a local static server like `serve` or `Live Server` in VS Code:
   ```bash
   # From the project root
   npx serve .
   ```
   Then navigate to `http://localhost:3000` (or the port provided by your static server) in your browser.

## 📁 Project Structure

```
finance-dashboard/
├── index.html           # Main application entry point (Frontend)
├── backend/             # Node.js backend application
│   ├── db.js            # SQLite database initialization & seeding
│   ├── server.js        # Express API server setup and routes
│   └── package.json     # Backend dependencies
├── scripts/             # Frontend JavaScript logic
│   ├── api.js           # API communication layer
│   └── main.js          # Core application logic, routing, and UI rendering
└── styles/              # Frontend CSS
    ├── design-tokens.css# Core CSS variables (colors, typography, spacing)
    ├── main.css         # Global styles and layout
    └── components.css   # Component-specific styles (cards, tables, etc.)
```

## 🔒 API Endpoints

The backend provides a RESTful JSON API:

- `GET /api/dashboard/metrics` - Fetch high-level financial metrics.
- `GET /api/transactions` - Retrieve all transactions (ordered newest first).
- `POST /api/transactions/send` - Send money to a recipient (creates a new transaction and updates balance).
- `GET /api/portfolio` - Get asset allocation and holdings data.
- `GET /api/cards` - List user credit and debit cards.
- `GET /api/sessions` - List active user sessions and devices.

*Note: The API includes standard JSON error handling for 404 (Not Found) and 405 (Method Not Allowed) responses, as well as a global error middleware.*
