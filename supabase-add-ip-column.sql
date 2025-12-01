-- Add reviewer_ip column to reviews table for rate limiting
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_ip TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_ip_summoner ON reviews(reviewer_ip, summoner_name);

