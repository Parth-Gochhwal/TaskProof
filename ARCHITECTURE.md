# Architecture Overview

TaskProof is designed as a standalone, presentation-ready prototype. To ensure flawless execution during hackathon demos without relying on external network conditions, the backend and blockchain layers have been simulated locally.

## Core Modules

### 1. Data Layer (Simulated)
Located in `src/data/seed.ts`, this module holds the initial mock data (users, tasks, submissions, analytics). It represents the initial state of the database.

### 2. Service Layer
Services act as the bridge between the UI and the data layer, simulating API calls and business logic.
- **`taskService.ts`**: Manages task creation, retrieval, and slot management.
- **`submissionService.ts`**: Handles the lifecycle of task submissions (creation, approval, rejection) and coordinates with the ledger.
- **`ledgerService.ts` (`RewardLedger`)**: Abstraction layer for blockchain operations. It handles TCR (Task Credit) transactions and generates mock cryptographic proofs for verified actions.

### 3. State Management
- **`AuthContext.tsx`**: Manages the current user session (demo login) and provides real-time access to user profile data and token balances across the application.

### 4. UI Architecture
The UI follows a modular, component-driven approach:
- **`components/ui/`**: Reusable base components (Buttons, Cards, Badges, Modals).
- **`components/layout/`**: Application shell structure (Navigation, Sidebar).
- **`pages/`**: Page-level components split by role (`contributor/` and `business/`).

## Blockchain Abstraction Strategy
The application is designed to be easily integrated with a real blockchain (e.g., Ethereum, Polygon) post-hackathon:
1. Replace `RewardLedger` logic with Web3.js / Ethers.js calls to a smart contract.
2. Update the Auth system to use wallet connections (MetaMask/WalletConnect) instead of mock user IDs.
3. Replace the local data services with standard REST/GraphQL API calls to a backend service indexer.
