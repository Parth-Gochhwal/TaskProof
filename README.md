# TaskProof — Verified Micro-Task Marketplace

TaskProof is a full-stack prototype built for **DEV2HACK 2026**. It demonstrates a robust micro-task marketplace where businesses can post structured tasks, and contributors can complete them to earn verified rewards.

## Key Features

### For Contributors
- **Browse & Filter**: Find micro-tasks tailored to skills (e.g., AI Evaluation, Data Labeling).
- **Interactive Completion Flow**: Step-by-step UI for task execution with validation.
- **Verified Work History**: Ledger-backed immutable record of approved tasks.
- **Leaderboard & Progression**: Level up and earn badges based on quality and volume.
- **Wallet**: Track earned Task Credits (TCR) with transparent transaction history.

### For Businesses
- **Task Creation**: 5-step wizard to define tasks, budgets, and specific acceptance criteria.
- **Submission Review**: Streamlined interface to approve or reject work with automated pre-checks.
- **Analytics Dashboard**: Monitor approval rates, active tasks, and average review times.
- **Budget Management**: View reserved budgets and transaction history.

## Tech Stack
- **Frontend Framework**: React 19 with TypeScript, powered by Vite.
- **Backend Framework**: FastAPI (Python 3.14).
- **Database**: SQLite with SQLAlchemy 2.0 ORM.
- **Styling**: Tailwind CSS with a custom Glassmorphism design system.
- **Data Fetching**: Native asynchronous data fetching using custom `useApi` hook.
- **Authentication**: Stateless HMAC-signed token authentication.

## Getting Started

### 1. Backend Setup
1. Open a terminal in the `backend/` directory.
2. The virtual environment is already configured in `.venv`. Run the FastAPI server:
   ```bash
   ../.venv/Scripts/python -m uvicorn app.main:app --port 8000 --host 127.0.0.1 --reload
   ```
   *Note: The SQLite database is pre-seeded with initial data upon startup.*

### 2. Frontend Setup
1. Open a new terminal in the root directory.
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the application at `http://localhost:5173`.

## Documentation
- [Architecture Details](ARCHITECTURE.md)
- [Demo Walkthrough](DEMO_FLOW.md)
