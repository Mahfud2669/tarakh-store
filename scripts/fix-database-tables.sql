-- Fix database tables for proper transaction logging

-- Drop existing tables if they have issues
DROP TABLE IF EXISTS game_transaction_logs CASCADE;
DROP TABLE IF EXISTS game_transactions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS transaction_logs CASCADE;

-- Create main transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    game_name VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    server_id VARCHAR(50),
    package_diamonds INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    midtrans_transaction_id VARCHAR(100),
    midtrans_status VARCHAR(50),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create transaction logs table for audit trail
CREATE TABLE IF NOT EXISTS transaction_logs (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL,
    status_from VARCHAR(50),
    status_to VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_game_id ON transactions(game_id);

-- Insert some test data to verify tables work
INSERT INTO transactions (
    order_id, game_id, game_name, user_id, server_id, 
    package_diamonds, amount, status, customer_email, customer_phone
) VALUES (
    'TEST-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || FLOOR(RANDOM() * 1000)::text,
    'ml', 
    'Mobile Legends', 
    'test123', 
    '1234', 
    86, 
    20000, 
    'pending',
    'test@tarakhstore.com',
    '08123456789'
) ON CONFLICT (order_id) DO NOTHING;

-- Verify tables exist
SELECT 'transactions' as table_name, COUNT(*) as record_count FROM transactions
UNION ALL
SELECT 'transaction_logs' as table_name, COUNT(*) as record_count FROM transaction_logs;
