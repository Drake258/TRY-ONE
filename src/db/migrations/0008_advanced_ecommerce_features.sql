-- Migration: Advanced E-commerce Features
-- Features: Product recommendations, Abandoned cart recovery, Loyalty points, Enhanced order tracking, Invoices

-- Add new columns to products table
ALTER TABLE products ADD COLUMN rating REAL;
ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN popularity INTEGER DEFAULT 0;

-- Add enhanced order tracking columns
ALTER TABLE orders ADD COLUMN order_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN estimated_delivery INTEGER;
ALTER TABLE orders ADD COLUMN shipped_at INTEGER;
ALTER TABLE orders ADD COLUMN delivered_at INTEGER;
ALTER TABLE orders ADD COLUMN loyalty_points_earned INTEGER;

-- Create recently_viewed table
CREATE TABLE IF NOT EXISTS recently_viewed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  viewed_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create product_recommendations table
CREATE TABLE IF NOT EXISTS product_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_product_id INTEGER NOT NULL,
  recommended_product_id INTEGER NOT NULL,
  recommendation_type TEXT NOT NULL,
  score REAL DEFAULT 1.0,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create abandoned_carts table
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  items TEXT NOT NULL,
  total_amount REAL NOT NULL,
  recovery_email_sent INTEGER DEFAULT 0,
  recovery_email_sent_at INTEGER,
  recovered_at INTEGER,
  discount_code TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  name TEXT NOT NULL,
  password_hash TEXT,
  loyalty_points INTEGER DEFAULT 0,
  total_spent REAL DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  is_verified INTEGER DEFAULT 0,
  verification_token TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create loyalty_points_transactions table
CREATE TABLE IF NOT EXISTS loyalty_points_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  order_id INTEGER,
  points INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create loyalty_settings table
CREATE TABLE IF NOT EXISTS loyalty_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  points_per_cedi REAL DEFAULT 1.0,
  points_redemption_rate REAL DEFAULT 0.01,
  min_points_to_redeem INTEGER DEFAULT 100,
  expiry_days INTEGER DEFAULT 365,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT NOT NULL UNIQUE,
  order_id INTEGER NOT NULL,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  billing_address TEXT,
  items TEXT NOT NULL,
  subtotal REAL NOT NULL,
  discount REAL,
  tax REAL,
  total REAL NOT NULL,
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT DEFAULT 'draft',
  issued_at INTEGER DEFAULT (strftime('%s', 'now')),
  paid_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Insert default loyalty settings
INSERT INTO loyalty_settings (points_per_cedi, points_redemption_rate, min_points_to_redeem, expiry_days, is_active)
VALUES (1.0, 0.01, 100, 365, 1);
