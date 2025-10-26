-- Drop existing table if it exists
DROP TABLE IF EXISTS access_requests CASCADE;

-- Create access_requests table
CREATE TABLE access_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  hospital_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  request_type TEXT DEFAULT 'emergency',
  blockchain_tx TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON access_requests FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON access_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON access_requests FOR UPDATE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_access_requests_patient_id ON access_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_created_at ON access_requests(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_access_requests_updated_at 
    BEFORE UPDATE ON access_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();