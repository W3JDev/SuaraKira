-- SuaraKira Database Schema for Supabase
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/dpdpcyzpjvtrslwzrped/editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS suarakira_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  business_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sales/Transactions Table
CREATE TABLE IF NOT EXISTS suarakira_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES suarakira_users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10, 2) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sale', 'expense')),
  voice_input TEXT,
  receipt_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Receipts Table
CREATE TABLE IF NOT EXISTS suarakira_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES suarakira_sales(id) ON DELETE CASCADE,
  receipt_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON suarakira_sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON suarakira_sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_type ON suarakira_sales(type);
CREATE INDEX IF NOT EXISTS idx_receipts_sale_id ON suarakira_receipts(sale_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE suarakira_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suarakira_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE suarakira_receipts ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON suarakira_users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON suarakira_users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON suarakira_users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Sales table policies
CREATE POLICY "Users can view own sales"
  ON suarakira_sales FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales"
  ON suarakira_sales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales"
  ON suarakira_sales FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales"
  ON suarakira_sales FOR DELETE
  USING (auth.uid() = user_id);

-- Receipts table policies
CREATE POLICY "Users can view own receipts"
  ON suarakira_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM suarakira_sales
      WHERE suarakira_sales.id = suarakira_receipts.sale_id
      AND suarakira_sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own receipts"
  ON suarakira_receipts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM suarakira_sales
      WHERE suarakira_sales.id = suarakira_receipts.sale_id
      AND suarakira_sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own receipts"
  ON suarakira_receipts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM suarakira_sales
      WHERE suarakira_sales.id = suarakira_receipts.sale_id
      AND suarakira_sales.user_id = auth.uid()
    )
  );

-- Function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.suarakira_users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'SuaraKira database schema created successfully!';
  RAISE NOTICE 'Tables: suarakira_users, suarakira_sales, suarakira_receipts';
  RAISE NOTICE 'RLS policies enabled for data security';
END $$;
