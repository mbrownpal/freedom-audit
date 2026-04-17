-- Freedom Audit Database Schema
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  current_question INTEGER DEFAULT 0,
  answers JSONB DEFAULT '{}'::jsonb,
  report JSONB,
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'complete', 'error'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_assessments_email ON assessments(email);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assessments_updated_at 
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (start assessment)
CREATE POLICY "Anyone can create assessments"
  ON assessments FOR INSERT
  WITH CHECK (true);

-- Policy: Users can read/update their own assessments by email
CREATE POLICY "Users can read their own assessments"
  ON assessments FOR SELECT
  USING (true); -- Allow reading for now, you can restrict by auth later

CREATE POLICY "Users can update their own assessments"
  ON assessments FOR UPDATE
  USING (true); -- Allow updating for now
