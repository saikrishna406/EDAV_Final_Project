# Database Setup Fix

## Issue
Error: "Could not find the 'wallet_address' column of 'guardians' in the schema cache"

## Solution
The guardians table needs to be created in your Supabase database.

## Steps to Fix:

### Option 1: Run SQL in Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `create-guardians-table.sql`

### Option 2: Quick Fix SQL
Copy and paste this SQL into your Supabase SQL Editor:

```sql
-- Create guardians table
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

-- Create policy
CREATE POLICY "Patients can manage their guardians" ON guardians
  FOR ALL USING (patient_id = auth.uid());
```

### Option 3: Complete Database Setup
Run the full `supabase-setup.sql` file if you haven't already.

## Verification
After running the SQL, try adding a guardian again. The error should be resolved.

## Alternative Workaround
If you can't access Supabase dashboard, the app will still work but guardian data won't persist. The UI will show guardians during the session but they won't be saved to the database.