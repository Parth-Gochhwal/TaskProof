# TaskProof — Verified Micro-Task Marketplace

TaskProof is a premium prototype built for **DEV2HACK 2026**. It demonstrates a robust micro-task marketplace where businesses can post structured tasks, and contributors can complete them to earn verified rewards.

## Key Features

### For Contributors
- **Browse & Filter**: Find micro-tasks tailored to skills (e.g., AI Evaluation, Data Labeling).
- **Interactive Completion Flow**: Step-by-step UI for task execution with validation.
- **Verified Work History**: Blockchain-simulated immutable record of approved tasks.
- **Leaderboard & Progression**: Level up and earn badges based on quality and volume.
- **Wallet**: Track earned Task Credits (TCR) with transparent transaction history.

### For Businesses
- **Task Creation**: 5-step wizard to define tasks, budgets, and specific acceptance criteria.
- **Submission Review**: Streamlined interface to approve or reject work with automated pre-checks.
- **Analytics Dashboard**: Monitor approval rates, active tasks, and average review times.
- **Budget Management**: View reserved budgets and transaction history.

## Tech Stack
- **Frontend Framework**: React 18 with TypeScript, powered by Vite.
- **Styling**: Tailwind CSS with a custom Glassmorphism design system.
- **Routing**: React Router DOM (v6).
- **Icons & Animations**: Lucide React and Framer Motion.
- **Data Visualization**: Recharts.
- **State & Data**: React Context and in-memory simulated services for instant demo capabilities without requiring backend setup.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open the application:**
   Navigate to `http://localhost:5173` in your browser.

## Demo Accounts
The application uses a simulated authentication system for immediate access during the hackathon. Clicking "I'm a Contributor" or "I'm a Business" on the signup page will automatically log you into the respective demo accounts pre-seeded with mock data.
