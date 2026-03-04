# Financial App - Monorepo

A comprehensive financial aggregation application built with Vue.js and FastAPI, designed for tracking investments, transactions, and portfolio analytics.


## Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework for building user interfaces
- **Vue Router** - Official router for Vue.js
- **Pinia** - State management for Vue
- **Vite** - Next generation frontend tooling

### Backend
- **Python 3.11+** - Programming language
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and ORM
- **Alembic** - Database migration tool
- **Pydantic** - Data validation using Python type annotations

### Database
- **PostgreSQL** - Relational database management system

### Authentication & Security
- **JWT (JSON Web Tokens)** - Token-based authentication
- **OAuth2** - Authorization framework
- **Password Hashing** - Secure password storage (bcrypt)

### Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **AWS / Render / Railway** - Cloud deployment platforms

## Features Integration

### Core Features
- **User Authentication** - JWT-based auth with OAuth2 support
- **Transaction Management** - Track income, expenses, and transfers
- **Account Management** - Multiple bank accounts and investment accounts
- **Portfolio Analytics** - Net worth tracking, asset allocation, performance metrics
- **Budgeting** - Budget creation and tracking

### Planned Integrations
- **Plaid** - Bank account aggregation and transaction sync
- **Kite API** - Indian stock market integration (Zerodha)
- **Kraken API** - Cryptocurrency exchange integration
- **Background Jobs** - Automated data syncing and portfolio updates
- **Real-time Analytics** - Live portfolio valuation and market data



## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Installation
```bash
# Backend setup
cd backend
pip install -r requirements.txt

# Frontend setup
cd frontend
npm install

# Database setup
# Configure PostgreSQL connection in backend/.env
# Run migrations: alembic upgrade head
```

### Running Locally
```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

### Running with Docker (frontend only)
No local Node install needed. From the project root:
```bash
docker compose up
```
Then open http://localhost:5173. Uses Vite + Vue 3 + Tailwind; light/dark mode and sidebar (Dashboard, Accounts, Transactions, Portfolio, Goals, Reports, Settings).



Built with ❤️ for financial management and investment tracking
