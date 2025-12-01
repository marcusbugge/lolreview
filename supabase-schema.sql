-- Create players table for autocomplete
CREATE TABLE players (
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
CREATE INDEX idx_players_game_name ON players(game_name);
CREATE INDEX idx_players_search_count ON players(search_count DESC);

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

-- Create reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  summoner_name TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'unknown',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  reviewer_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_reviews_summoner_name ON reviews(summoner_name);
CREATE INDEX idx_reviews_ip_summoner ON reviews(reviewer_ip, summoner_name);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read reviews
CREATE POLICY "Allow public read access" ON reviews
  FOR SELECT USING (true);

-- Allow anyone to insert reviews (anonymous)
CREATE POLICY "Allow anonymous insert" ON reviews
  FOR INSERT WITH CHECK (true);

