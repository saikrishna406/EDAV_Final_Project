-- Debug access_requests table
-- Run these queries in Supabase SQL editor to check the data

-- 1. Check if access_requests table exists and its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'access_requests';

-- 2. Check all access requests (raw data)
SELECT * FROM access_requests ORDER BY created_at DESC;

-- 3. Check patients table to compare IDs
SELECT id, name, email FROM patients ORDER BY created_at DESC;

-- 4. Check RLS policies on access_requests
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'access_requests';

-- 5. Test query that patient dashboard is running
-- Replace 'ea9204c8-c47b-4ca8-9fb8-149f4d0e2bed' with actual patient ID
SELECT * FROM access_requests 
WHERE patient_id = 'ea9204c8-c47b-4ca8-9fb8-149f4d0e2bed'::uuid;

-- 6. Check if there are any foreign key constraint issues
SELECT 
    ar.id,
    ar.patient_id,
    ar.status,
    ar.created_at,
    p.name as patient_name
FROM access_requests ar
LEFT JOIN patients p ON ar.patient_id = p.id
ORDER BY ar.created_at DESC;