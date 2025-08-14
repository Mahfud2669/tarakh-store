-- Remove duplicate packages keeping only the first one (lowest ID)
DELETE FROM game_packages 
WHERE id NOT IN (
  SELECT DISTINCT ON (game_id, diamonds, price) id
  FROM game_packages 
  ORDER BY game_id, diamonds, price, id ASC
);

-- Verify cleanup
SELECT 
  game_id, 
  diamonds, 
  price, 
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as ids
FROM game_packages 
GROUP BY game_id, diamonds, price 
HAVING COUNT(*) > 1
ORDER BY game_id, diamonds;

-- Show remaining packages
SELECT 
  game_id, 
  diamonds, 
  price, 
  bonus, 
  is_active,
  created_at
FROM game_packages 
ORDER BY game_id, diamonds ASC;
