-- Enhanced orders table with additional fields
ALTER TABLE orders ADD COLUMN billing_address TEXT;
ALTER TABLE orders ADD COLUMN city TEXT;
ALTER TABLE orders ADD COLUMN region TEXT;
ALTER TABLE orders ADD COLUMN discount REAL;
ALTER TABLE orders ADD COLUMN promo_code TEXT;
ALTER TABLE orders ADD COLUMN payment_reference TEXT;
