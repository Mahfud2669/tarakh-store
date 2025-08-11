-- Create tables for Tarakh Store game top-up system using existing database

-- Games table to store available games
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    color VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game packages table to store top-up packages for each game
CREATE TABLE IF NOT EXISTS game_packages (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(50) NOT NULL,
    diamonds INTEGER NOT NULL,
    price INTEGER NOT NULL,
    bonus INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game transactions table (separate from existing transaksi table)
CREATE TABLE IF NOT EXISTS game_transactions (
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

-- Transaction logs table for audit trail
CREATE TABLE IF NOT EXISTS game_transaction_logs (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL,
    status_from VARCHAR(50),
    status_to VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES game_transactions(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_transactions_order_id ON game_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_game_transactions_user_id ON game_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_transactions_status ON game_transactions(status);
CREATE INDEX IF NOT EXISTS idx_game_transactions_created_at ON game_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_game_packages_game_id ON game_packages(game_id);
