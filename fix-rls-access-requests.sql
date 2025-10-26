-- Fix RLS policies for access_requests table
-- Run this in Supabase SQL editor

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON access_requests;
DROP POLICY IF EXISTS "Enable insert for all users" ON access_requests;
DROP POLICY IF EXISTS "Enable update for all users" ON access_requests;

-- Create better RLS policies
CREATE POLICY "Patients can view their own access requests" 
ON access_requests FOR SELECT 
USING (true); -- Allow all for now, can restrict later

CREATE POLICY "Hospitals can create access requests" 
ON access_requests FOR INSERT 
WITH CHECK (true); -- Allow all for now

CREATE POLICY "Allow updates for all users" 
ON access_requests FOR UPDATE 
USING (true);

-- Create RPC function to get patient access requests
CREATE OR REPLACE FUNCTION get_patient_access_requests(p_patient_id uuid)
RETURNS TABLE (
    id uuid,
    patient_id uuid,
    hospital_id text,
    status text,
    request_type text,
    blockchain_tx text,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        ar.id,
        ar.patient_id,
        ar.hospital_id,
        ar.status,
        ar.request_type,
        ar.blockchain_tx,
        ar.created_at,
        ar.updated_at
    FROM access_requests ar
    WHERE ar.patient_id = p_patient_id
    ORDER BY ar.created_at DESC;
$$;