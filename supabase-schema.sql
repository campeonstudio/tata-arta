-- ============================================================
-- TATA ARTA — Supabase Schema v2
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- BUDGET SETTINGS
CREATE TABLE budget_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  income NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'IDR',
  pay_cycle TEXT DEFAULT 'monthly',
  pay_cycle_day INT DEFAULT 1,
  period_type TEXT DEFAULT 'calendar',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BUDGET GROUPS (Needs / Wants / Savings & Debt)
CREATE TABLE budget_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#8B7355',
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BUDGET CATEGORIES
CREATE TABLE budget_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES budget_groups(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WALLETS
CREATE TABLE wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'ewallet', 'credit_card')),
  balance NUMERIC(15,2) DEFAULT 0,
  color TEXT DEFAULT '#8B7355',
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSACTIONS
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer', 'savings')),
  amount NUMERIC(15,2) NOT NULL,
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  group_id UUID REFERENCES budget_groups(id) ON DELETE SET NULL,
  category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
  from_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  to_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  transfer_fee NUMERIC(15,2) DEFAULT 0,
  fee_category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
  note TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GOALS
CREATE TABLE goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  current_amount NUMERIC(15,2) DEFAULT 0,
  target_date DATE,
  icon TEXT,
  color TEXT DEFAULT '#8B7355',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users manage own budget_settings" ON budget_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own budget_groups" ON budget_groups FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own budget_categories" ON budget_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own wallets" ON wallets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);
