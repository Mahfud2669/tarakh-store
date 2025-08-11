-- Insert initial games data
INSERT INTO games (game_id, name, image_url, color) VALUES
('ml', 'Mobile Legends', '/generic-moba-icon.png', 'bg-gradient-to-br from-blue-500 to-blue-600'),
('pubg', 'PUBG Mobile', '/generic-battle-royale-icon.png', 'bg-gradient-to-br from-orange-500 to-orange-600'),
('freefire', 'Free Fire', '/generic-battle-royale-icon.png', 'bg-gradient-to-br from-yellow-500 to-yellow-600'),
('genshin', 'Genshin Impact', '/genshin-impact-game-icon.png', 'bg-gradient-to-br from-purple-500 to-purple-600'),
('valorant', 'Valorant', '/valorant-icon.png', 'bg-gradient-to-br from-red-500 to-red-600'),
('fortnite', 'Fortnite', '/generic-battle-royale-icon.png', 'bg-gradient-to-br from-blue-400 to-blue-500'),
('cod', 'Call of Duty', '/codm-game-icon.png', 'bg-gradient-to-br from-gray-700 to-gray-800'),
('wildrift', 'Wild Rift', '/placeholder-wfp7q.png', 'bg-gradient-to-br from-blue-600 to-blue-700'),
('clash', 'Clash of Clans', '/fantasy-game-icon.png', 'bg-gradient-to-br from-green-500 to-green-600'),
('among', 'Among Us', '/among-us-icon.png', 'bg-gradient-to-br from-red-400 to-red-500')
ON CONFLICT (game_id) DO UPDATE SET
    name = EXCLUDED.name,
    image_url = EXCLUDED.image_url,
    color = EXCLUDED.color,
    updated_at = CURRENT_TIMESTAMP;

-- Insert Mobile Legends packages
INSERT INTO game_packages (game_id, diamonds, price, bonus) VALUES
('ml', 86, 20000, 0),
('ml', 172, 40000, 0),
('ml', 257, 60000, 0),
('ml', 344, 80000, 0),
('ml', 429, 100000, 0),
('ml', 514, 120000, 0)
ON CONFLICT DO NOTHING;

-- Insert default packages for other games
INSERT INTO game_packages (game_id, diamonds, price, bonus) VALUES
('pubg', 100, 25000, 0),
('pubg', 200, 50000, 0),
('pubg', 300, 75000, 0),
('pubg', 500, 125000, 0),
('pubg', 1000, 250000, 0),
('pubg', 2000, 500000, 0),

('freefire', 100, 25000, 0),
('freefire', 200, 50000, 0),
('freefire', 300, 75000, 0),
('freefire', 500, 125000, 0),
('freefire', 1000, 250000, 0),
('freefire', 2000, 500000, 0),

('genshin', 100, 25000, 0),
('genshin', 200, 50000, 0),
('genshin', 300, 75000, 0),
('genshin', 500, 125000, 0),
('genshin', 1000, 250000, 0),
('genshin', 2000, 500000, 0),

('valorant', 100, 25000, 0),
('valorant', 200, 50000, 0),
('valorant', 300, 75000, 0),
('valorant', 500, 125000, 0),
('valorant', 1000, 250000, 0),
('valorant', 2000, 500000, 0),

('fortnite', 100, 25000, 0),
('fortnite', 200, 50000, 0),
('fortnite', 300, 75000, 0),
('fortnite', 500, 125000, 0),
('fortnite', 1000, 250000, 0),
('fortnite', 2000, 500000, 0),

('cod', 100, 25000, 0),
('cod', 200, 50000, 0),
('cod', 300, 75000, 0),
('cod', 500, 125000, 0),
('cod', 1000, 250000, 0),
('cod', 2000, 500000, 0),

('wildrift', 100, 25000, 0),
('wildrift', 200, 50000, 0),
('wildrift', 300, 75000, 0),
('wildrift', 500, 125000, 0),
('wildrift', 1000, 250000, 0),
('wildrift', 2000, 500000, 0),

('clash', 100, 25000, 0),
('clash', 200, 50000, 0),
('clash', 300, 75000, 0),
('clash', 500, 125000, 0),
('clash', 1000, 250000, 0),
('clash', 2000, 500000, 0),

('among', 100, 25000, 0),
('among', 200, 50000, 0),
('among', 300, 75000, 0),
('among', 500, 125000, 0),
('among', 1000, 250000, 0),
('among', 2000, 500000, 0)
ON CONFLICT DO NOTHING;
