-- ============================================
-- BUDGETLY — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable RLS (Row Level Security)
-- This ensures users can only access their own data

-- ---- Budget Profiles ----
-- Stores the user's income, cycle, and budget group allocations
CREATE TABLE budget_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  income NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly | biweekly | weekly | custom
  budget_groups JSONB NOT NULL DEFAULT '[]',
  goals JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE budget_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile"
  ON budget_profiles
  FOR ALL
  USING (auth.uid() = user_id);

-- ---- Expenses ----
-- Individual expense transactions logged by the user
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  group_id TEXT NOT NULL,        -- needs | wants | savings
  category_id TEXT NOT NULL,     -- e.g. housing, food, dining
  subcategory TEXT,              -- e.g. Rent, Groceries
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own expenses"
  ON expenses
  FOR ALL
  USING (auth.uid() = user_id);

-- ---- Goals ----
-- Financial goals with target amounts and progress
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  icon TEXT,
  target_amount NUMERIC,
  current_amount NUMERIC DEFAULT 0,
  target_date DATE,
  status TEXT DEFAULT 'active', -- active | completed | paused
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goals"
  ON goals
  FOR ALL
  USING (auth.uid() = user_id);

-- ---- Helpful indexes ----
CREATE INDEX expenses_user_id_date_idx ON expenses(user_id, date DESC);
CREATE INDEX expenses_group_id_idx ON expenses(group_id);
