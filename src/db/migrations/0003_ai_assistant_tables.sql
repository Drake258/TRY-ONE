-- Migration: Create AI Assistant tables
-- Created: 2026-03-04

-- Chat Sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  order_number TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'closed', 'escalated')),
  is_ai_mode INTEGER NOT NULL DEFAULT 1,
  assigned_to INTEGER,
  created_at INTEGER,
  updated_at INTEGER
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK(sender IN ('customer', 'ai', 'admin')),
  sender_name TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK(message_type IN ('text', 'order_query', 'product_recommendation', 'escalation')),
  metadata TEXT,
  created_at INTEGER
);

-- AI Responses table
CREATE TABLE IF NOT EXISTS ai_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trigger TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('greeting', 'faq', 'pricing', 'shipping', 'returns', 'payment', 'product', 'order', 'support', 'general')),
  response TEXT NOT NULL,
  keywords TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER
);

-- AI Settings table
CREATE TABLE IF NOT EXISTS ai_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at INTEGER
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_responses_category ON ai_responses(category);
CREATE INDEX IF NOT EXISTS idx_ai_responses_active ON ai_responses(is_active);
