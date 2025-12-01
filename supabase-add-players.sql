-- Run this if you already have the reviews table
-- This adds the players table for autocomplete functionality

-- Create players table for autocomplete
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_name TEXT NOT NULL,
  tag_line TEXT NOT NULL,
  profile_icon_id INTEGER DEFAULT 29,
  summoner_level INTEGER DEFAULT 0,
  region TEXT DEFAULT 'unknown',
  search_count INTEGER DEFAULT 1,
  last_searched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_name, tag_line)
);

-- Create index for faster autocomplete searches
CREATE INDEX IF NOT EXISTS idx_players_game_name ON players(game_name);
CREATE INDEX IF NOT EXISTS idx_players_search_count ON players(search_count DESC);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read players
CREATE POLICY "Allow public read players" ON players
  FOR SELECT USING (true);

-- Allow anyone to insert/update players
CREATE POLICY "Allow public insert players" ON players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update players" ON players
  FOR UPDATE USING (true);

