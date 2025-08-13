-- Test database connection and create tables if needed

-- Test basic connection
SELECT 'Database connection successful' as status, NOW() as timestamp;

-- Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('games', 'game_packages', 'transactions', 'transaction_logs')
ORDER BY table_name;

-- Create games table if it doesn't exist
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

-- Create game_packages table if it doesn't exist
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

-- Insert sample data if tables are empty
INSERT INTO games (game_id, name, image_url, color) 
SELECT 'ml', 'Mobile Legends', '/generic-moba-icon.png', 'bg-gradient-to-br from-blue-500 to-blue-600'
WHERE NOT EXISTS (SELECT 1 FROM games WHERE game_id = 'ml');

INSERT INTO games (game_id, name, image_url, color) 
SELECT 'pubg', 'PUBG Mobile', '/generic-battle-royale-icon.png', 'bg-gradient-to-br from-orange-500 to-orange-600'
WHERE NOT EXISTS (SELECT 1 FROM games WHERE game_id = 'pubg');

-- Insert ML packages if they don't exist
INSERT INTO game_packages (game_id, diamonds, price, bonus) 
SELECT 'ml', 86, 20000, 0
WHERE NOT EXISTS (SELECT 1 FROM game_packages WHERE game_id = 'ml' AND diamonds = 86);

INSERT INTO game_packages (game_id, diamonds, price, bonus) 
SELECT 'ml', 172, 40000, 0
WHERE NOT EXISTS (SELECT 1 FROM game_packages WHERE game_id = 'ml' AND diamonds = 172);

INSERT INTO game_packages (game_id, diamonds, price, bonus) 
SELECT 'ml', 257, 60000, 0
WHERE NOT EXISTS (SELECT 1 FROM game_packages WHERE game_id = 'ml' AND diamonds = 257);

INSERT INTO game_packages (game_id, diamonds, price, bonus) 
SELECT 'ml', 344, 80000, 0
WHERE NOT EXISTS (SELECT 1 FROM game_packages WHERE game_id = 'ml' AND diamonds = 344);

INSERT INTO game_packages (game_id, diamonds, price, bonus) 
SELECT 'ml', 429, 100000, 0
WHERE NOT EXISTS (SELECT 1 FROM game_packages WHERE game_id = 'ml' AND diamonds = 429);

INSERT INTO game_packages (game_id, diamonds, price, bonus) 
SELECT 'ml', 514, 120000, 0
WHERE NOT EXISTS (SELECT 1 FROM game_packages WHERE game_id = 'ml' AND diamonds = 514);

-- Verify data was inserted
SELECT 'Games count:' as info, COUNT(*) as count FROM games
UNION ALL
SELECT 'Packages count:' as info, COUNT(*) as count FROM game_packages;
