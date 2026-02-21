

# BudgetFlow: Backend Database and Authentication

## Overview
Transform BudgetFlow from a localStorage-only app into a full multi-user SaaS application with Lovable Cloud (Supabase), featuring user authentication (email/password login) and persistent cloud database storage for all budget data.

## What You'll Get
- **Login and Signup pages** with email and password
- **All budget data saved permanently** in a cloud database (no more data loss on refresh)
- **Per-user data isolation** -- each user only sees their own budget info
- **User profiles** with display name
- **Protected app** -- only logged-in users can access the budget tools

---

## Step-by-Step Plan

### Step 1: Enable Lovable Cloud (Supabase)
Connect the project to a cloud backend so we have a database, authentication, and secure storage.

### Step 2: Create Database Tables
Set up all the tables to store budget data persistently:

- **profiles** -- display name, linked to auth user
- **income_sources** -- salary, freelance, etc.
- **bills** -- all recurring and one-time expenses
- **savings_goals** -- savings targets and progress
- **category_budgets** -- spending limits per category
- **transactions** -- income/expense transaction log
- **expense_groups** -- custom expense categories (e.g., "Kids' Expenses")
- **payment_accounts** -- bank accounts, credit cards, etc.
- **assets** -- for net worth tracking
- **liabilities** -- debts for net worth tracking

Each table will have a `user_id` column linking to the logged-in user, with Row-Level Security (RLS) policies so users can only access their own data.

### Step 3: Build Authentication Pages
- **Login page** -- email and password sign-in
- **Signup page** -- create new account with display name
- **Password reset flow** -- forgot password and reset pages
- **Auto-redirect** -- unauthenticated users go to login, authenticated users go to the app

### Step 4: Replace localStorage with Database
Rewrite the `useBudget` hook to read/write from the cloud database instead of localStorage using React Query for caching and real-time updates. All existing CRUD operations (add, update, delete bills, goals, etc.) will call the database.

### Step 5: Add Logout and User Menu
Add a user menu in the header showing the logged-in user's name with a logout button.

---

## Technical Details

### Database Schema
All tables include `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL` and have RLS policies restricting access to the owning user only.

A trigger will auto-create a profile row when a new user signs up.

Tables mirror the existing TypeScript types:
- `bills`: name, amount, category, frequency, due_date, is_paid, auto_pay, owner, payment_account_id, month, is_recurring, pending_review
- `income_sources`: name, amount, frequency, type
- `savings_goals`: name, target_amount, current_amount, color
- `category_budgets`: category, budget_limit
- `transactions`: date, description, amount, type, category, notes
- `expense_groups`: name
- `payment_accounts`: name, nickname, type
- `assets`: name, value, type
- `liabilities`: name, balance, interest_rate, minimum_payment, type

### Authentication Architecture
- Supabase Auth with email/password
- Protected routes using an auth context provider
- Session persistence across page refreshes
- Proper `onAuthStateChange` listener

### Data Migration Approach
- Default expense groups and payment accounts will be seeded on first login
- The `useBudget` hook will be refactored to use React Query mutations and queries against Supabase
- All existing component interfaces remain the same -- components won't need changes

### New Files
- `src/pages/Auth.tsx` -- Login/Signup page
- `src/pages/ResetPassword.tsx` -- Password reset page
- `src/contexts/AuthContext.tsx` -- Auth state management
- `src/components/ProtectedRoute.tsx` -- Route guard
- `src/components/UserMenu.tsx` -- Header user menu with logout
- `src/integrations/supabase/client.ts` -- Supabase client setup
- Database migrations for all tables, RLS policies, and triggers

### Security
- Row-Level Security on every table
- `user_id` columns are NOT nullable
- Passwords handled entirely by Supabase Auth (never stored in app code)
- No client-side role checks

