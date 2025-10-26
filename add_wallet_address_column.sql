-- Add wallet_address column to existing guardians table
ALTER TABLE guardians ADD COLUMN IF NOT EXISTS wallet_address TEXT NOT NULL DEFAULT '';

-- Update the column to be NOT NULL after adding it
ALTER TABLE guardians ALTER COLUMN wallet_address SET NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'guardians' 
ORDER BY ordinal_position;