-- Migration: Add must_change_password field to users table
-- Date: 2026-03-05

ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0;
