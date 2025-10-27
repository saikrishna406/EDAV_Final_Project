-- Add columns for encrypted file storage
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'health_records' 
                   AND column_name = 'encryption_key') THEN
        ALTER TABLE health_records ADD COLUMN encryption_key TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'health_records' 
                   AND column_name = 'file_data') THEN
        ALTER TABLE health_records ADD COLUMN file_data TEXT;
    END IF;
END $$;