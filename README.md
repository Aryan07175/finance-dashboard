# Finance Dashboard

A modern, responsive, and highly polished financial analytics dashboard built with standard web technologies. Designed with a focus on clean architecture, usability, and a premium fintech aesthetic.

## Features

- **Responsive Layout**: Scales beautifully across mobile, tablet, and desktop viewports.
- **Clean UI/UX**: Adheres to strict brand guidelines emphasizing financial clarity, data readability, and visual hierarchy.
- **Reusable Components**: Built with modular UI elements for sidebars, headers, metric cards, and transaction tables.
- **Centralized Design System**: Driven by CSS variables (`design-tokens.css`) for consistent typography, spacing, colors, and shadows.
- **Full-Stack Application**: Includes a Node.js + Express backend serving data from a local SQLite database.
- **Dynamic API Integration**: Frontend fetches data dynamically through standard REST API endpoints.

## Technology Stack

**Frontend:**
- **HTML5** for semantic structure
- **CSS3** (Vanilla) for custom design system and layout
- **JavaScript** (Vanilla) for dynamic rendering and API integration
- **[Phosphor Icons](https://phosphoricons.com/)** for clean, professional iconography

**Backend:**
- **Node.js** with **Express.js** for the REST API
- **SQLite3** for lightweight, file-based data persistence

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aryan07175/finance-dashboard.git
   cd finance-dashboard
   ```

2. **Setup the Backend:**
   Navigate into the `backend` directory and install the dependencies.
   ```bash
   cd backend
   npm install
   ```

3. **Start the Backend Server:**
   This will automatically initialize the `database.sqlite` and seed it with initial data.
   ```bash
   npm start
   ```
   The API will run on `http://localhost:3000`.

4. **Launch the Frontend:**
   Open a new terminal or just open the `index.html` file in your preferred web browser. No frontend build steps are required!

## Project Structure

- `index.html`: Main application entry point and layout shell.
- `styles/`: Contains all CSS files including `design-tokens.css` (design system) and `main.css`.
- `scripts/api.js`: Frontend client for fetching data from the backend API.
- `scripts/main.js`: Logic to dynamically render the dashboard metrics, charts, and tables using API data.
- `backend/`: Node.js Express server directory.
  - `backend/server.js`: Express application and API route definitions.
  - `backend/db.js`: SQLite database initialization and seeding scripts.
- `brandGuidelines.md`: The source of truth for the visual identity and UI/UX design system.
