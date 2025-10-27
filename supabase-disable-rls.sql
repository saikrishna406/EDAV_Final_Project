-- Disable RLS for all tables
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE guardians DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to anon and authenticated roles
GRANT ALL ON patients TO anon, authenticated;
GRANT ALL ON hospitals TO anon, authenticated;
GRANT ALL ON health_records TO anon, authenticated;
GRANT ALL ON access_requests TO anon, authenticated;
GRANT ALL ON guardians TO anon, authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Check if tables exist and their permissions
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';