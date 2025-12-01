-- Fix case sensitivity issues for players and reviews
-- This migration normalizes all data to lowercase while preserving display names

-- Step 1: Add display columns to players table (for showing original casing)
ALTER TABLE players ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS display_tag TEXT;

-- Step 2: Copy original values to display columns before normalizing
UPDATE players 
SET display_name = game_name, display_tag = tag_line 
WHERE display_name IS NULL;

-- Step 3: Normalize game_name and tag_line to lowercase
UPDATE players 
SET game_name = LOWER(game_name), tag_line = LOWER(tag_line);

-- Step 4: Normalize summoner_name in reviews to lowercase
UPDATE reviews 
SET summoner_name = LOWER(summoner_name);

-- Step 5: Remove duplicate players (keep the one with highest search_count)
-- First, identify duplicates and sum their search counts
WITH ranked_players AS (
  SELECT 
    id,
    game_name, 
    tag_line,
    search_count,
    ROW_NUMBER() OVER (
      PARTITION BY game_name, tag_line 
      ORDER BY search_count DESC, created_at ASC
    ) as rn
  FROM players
),
total_counts AS (
  SELECT 
    game_name,
    tag_line,
    SUM(search_count) as total_count
  FROM players
  GROUP BY game_name, tag_line
)
UPDATE players p
SET search_count = tc.total_count
FROM ranked_players rp, total_counts tc
WHERE p.id = rp.id 
  AND rp.rn = 1
  AND tc.game_name = p.game_name
  AND tc.tag_line = p.tag_line;

-- Then delete the duplicates (keep only rank 1)
DELETE FROM players
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY game_name, tag_line 
        ORDER BY search_count DESC, created_at ASC
      ) as rn
    FROM players
  ) ranked
  WHERE rn > 1
);

-- Step 6: Create a unique constraint to prevent future duplicates
-- (Drop existing constraint first if it exists)
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_game_name_tag_line_key;
ALTER TABLE players ADD CONSTRAINT players_game_name_tag_line_key UNIQUE (game_name, tag_line);

-- Step 7: Create index for case-insensitive search (if not exists)
DROP INDEX IF EXISTS idx_players_game_name;
CREATE INDEX idx_players_game_name_lower ON players(game_name);

-- Step 8: Create index for reviews summoner_name
DROP INDEX IF EXISTS idx_reviews_summoner_name;
CREATE INDEX idx_reviews_summoner_name_lower ON reviews(summoner_name);

