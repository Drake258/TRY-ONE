-- Migration: Add inventory, stock management, coupons, and wishlist tables
-- Created: 2026-03-05

-- Add stock quantity and low stock threshold to products table
ALTER TABLE products ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER NOT NULL DEFAULT 5;

-- Create stock_history table
CREATE TABLE IF NOT EXISTS stock_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  change_type TEXT NOT NULL CHECK(change_type IN ('sale', 'restock', 'adjustment', 'return', 'damage')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT,
  order_id INTEGER,
  performed_by INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create stock_alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  alert_type TEXT NOT NULL CHECK(alert_type IN ('low_stock', 'out_of_stock', 'restock_needed')),
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  is_resolved INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  resolved_at INTEGER
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK(discount_type IN ('percentage', 'fixed')),
  discount_value REAL NOT NULL,
  min_order_amount REAL,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  max_uses_per_user INTEGER,
  valid_from INTEGER,
  valid_until INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_history_product ON stock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_unread ON stock_alerts(is_read, is_resolved);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_wishlist_session ON wishlist(session_id);
