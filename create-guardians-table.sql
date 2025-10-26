-- Create guardians table if it doesn't exist
CREATE TABLE IF NOT EXISTS guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  relationship TEXT,
  contact TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Patients can manage their guardians" ON guardians;
CREATE POLICY "Patients can manage their guardians" ON guardians
  FOR ALL USING (patient_id = auth.uid());

-- Verify table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'guardians' 
ORDER BY ordinal_position;