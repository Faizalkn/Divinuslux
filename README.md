# Pennywise — Personal Expense Tracker

A full-stack expense tracker built with React, Express, and MongoDB. User data is scoped to the authenticated account; passwords are hashed with bcrypt and API access is protected with JWTs.

## Requirements

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB connection URI

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.
2. Copy `frontend/.env.example` to `frontend/.env` if the API is not at `http://localhost:5000/api`.
3. Install dependencies from the repository root and each app folder:

   ```sh
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```

4. Start the API and Vite development server:

   ```sh
   npm run dev
   ```

   The API listens on port 5000 and the web app on port 5173 by default.

For production, build the client with `npm run build` and run the API with `npm start`.

## Features

- Email/password registration and login, JWT sessions, protected pages, and logout.
- User-scoped transaction CRUD with date, category, and type filters.
- Monthly overall and category budgets, budget progress, and approaching/exceeded warnings.
- Dashboard totals and recent activity; spending and income analytics with Recharts.
- MongoDB aggregation pipelines for financial summaries, and compound indexes for queried data.

## API overview

All endpoints are under `/api`. Except for registration, login, and health, requests require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | API health |
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Sign in |
| GET | `/auth/me` | Current account |
| GET, POST | `/transactions` | List (supports `startDate`, `endDate`, `category`, `type`) or create |
| PUT, DELETE | `/transactions/:id` | Update or delete a transaction |
| GET | `/budgets?month=&year=` | List monthly budgets with spending |
| PUT | `/budgets` | Create or update a monthly budget |
| DELETE | `/budgets/:id` | Delete a budget |
| GET | `/dashboard` | User-specific dashboard summary |
| GET | `/analytics?startDate=&endDate=` | Aggregated income, expense, category, and monthly summaries |

Amounts are represented in INR in the interface. Categories are Food, Travel, Utilities, and Entertainment; payment methods are Cash, UPI, Credit Card, Debit Card, and Bank Transfer.
