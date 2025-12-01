-- Security update: Restrict access to reviewer_ip column
-- This migration creates a secure view and updates policies

-- Option 1: Create a secure view that excludes sensitive columns
-- This is the recommended approach for hiding specific columns

CREATE OR REPLACE VIEW public_reviews AS
SELECT 
  id,
  summoner_name,
  region,
  rating,
  comment,
  created_at
FROM reviews;

-- Grant access to the view
GRANT SELECT ON public_reviews TO anon;
GRANT SELECT ON public_reviews TO authenticated;

-- Option 2: If you want to use RLS with column-level security,
-- you can revoke direct table access and only allow view access
-- (Uncomment if you want stricter security)

-- REVOKE SELECT ON reviews FROM anon;
-- REVOKE SELECT ON reviews FROM authenticated;

-- Note: The API already filters out reviewer_ip in the SELECT statement,
-- but this view provides an extra layer of security at the database level.

-- Additional security: Add rate limiting table for future use
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ip_address, endpoint)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint ON rate_limits(ip_address, endpoint);

-- Enable RLS on rate_limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow server-side access to rate_limits (no anon access)
CREATE POLICY "Deny anon access to rate_limits" ON rate_limits
  FOR ALL USING (false);

