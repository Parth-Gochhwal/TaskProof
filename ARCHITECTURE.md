# TaskProof Architecture

This document describes the full-stack architecture of the TaskProof prototype.

## Overview

TaskProof is a client-server web application.
- **Frontend**: A Single-Page Application (SPA) built with React, TypeScript, and Vite.
- **Backend**: A RESTful API built with FastAPI (Python) and SQLite.

## Backend (FastAPI)

The backend provides all data persistence, business logic, validation, and authentication.

### Key Components

1. **Routing Layer (`backend/app/api/routes`)**
   - **Auth (`auth.py`)**: Handles simulated demo logins and returns HMAC-signed stateless tokens.
   - **Tasks (`tasks.py`)**: Endpoints for creating, listing, and managing micro-tasks.
   - **Submissions (`submissions.py`)**: Endpoints for contributors to submit answers and businesses to review them.
   - **Wallet (`wallet.py`)**: Endpoints to fetch transaction history, proofs, and balance.
   - **Users & Business (`users.py`, `business.py`)**: Endpoints for profiles, leaderboards, and business analytics.

2. **Database Models (`backend/app/db/models.py`)**
   - Uses **SQLAlchemy 2.0 ORM** with SQLite (`taskproof.db`).
   - For compatibility with Python 3.14, models are defined using the classic `Column` approach rather than `Mapped[]` type annotations.

3. **Core Logic (`backend/app/core/`)**
   - **Security (`security.py`)**: Handles HMAC token generation and verification.
   - **Ledger (`ledger.py`)**: Manages the simulated reward ledger. Provides atomic transaction guarantees for crediting/debiting balances, emitting reward proofs, and calculating overall wallet balances dynamically.

4. **Serialization (`backend/app/schemas/schemas.py`)**
   - Uses Pydantic for validation and serialization.
   - A base `CamelModel` is used to automatically translate Python's standard `snake_case` variable names into the `camelCase` format expected by the React frontend.

## Frontend (React)

The frontend is a React 19 application styled with Tailwind CSS, emphasizing a premium, glassmorphism design identity (deep cobalt blue and polished silver).

### Key Components

1. **API Client (`src/services/apiClient.ts`)**
   - A centralized fetch wrapper that automatically manages the authorization token, prepends the backend URL, and formats JSON payloads.

2. **Data Fetching Hook (`src/hooks/useApi.ts`)**
   - A custom `useApi` hook that wraps asynchronous calls and exposes `data`, `isLoading`, `error`, and `refetch` states, drastically reducing boilerplate in page components.

3. **Service Abstractions (`src/services/`)**
   - Abstract over the `apiClient` to provide strongly-typed functions (e.g., `taskService.getAll()`, `submissionService.approve()`).
   - Replaced earlier mock in-memory stores with actual HTTP requests to the FastAPI backend.

4. **State Management**
   - **Authentication State (`AuthContext.tsx`)**: Manages global session state and profile data. It automatically rehydrates the session on load by verifying the token with the backend.
   - Component-level state manages form progression (e.g., task creation wizards).

5. **Visual Identity**
   - Preserves the required design aesthetic utilizing dynamic animations (Framer Motion) and complex CSS layouts (e.g. `GlassCard`, `AppShell`).
