-- Create patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile TEXT,
  date_of_birth TEXT,
  gender TEXT,
  blood_group TEXT,
  wallet_address TEXT,
  emergency_contact TEXT,
  qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hospitals table
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  registration_id TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Create policies for patients table
CREATE POLICY "Users can view own data" ON patients
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON patients
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON patients
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for hospitals table
CREATE POLICY "Hospitals can view own data" ON hospitals
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Hospitals can insert own data" ON hospitals
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Hospitals can update own data" ON hospitals
  FOR UPDATE USING (auth.uid() = id);

-- Create guardians table
CREATE TABLE guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  relationship TEXT,
  contact TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health_records table
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ipfs_cid TEXT,
  is_encrypted BOOLEAN DEFAULT true,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for new tables
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- Create policies for guardians table
CREATE POLICY "Patients can manage their guardians" ON guardians
  FOR ALL USING (patient_id = auth.uid());

-- Create policies for health_records table
CREATE POLICY "Patients can manage their records" ON health_records
  FOR ALL USING (patient_id = auth.uid());

-- Create access_requests table for hospital access tracking
CREATE TABLE access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  guardian_approvals TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for access_requests
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for access_requests table
CREATE POLICY "Patients can view their access requests" ON access_requests
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Hospitals can view requests they made" ON access_requests
  FOR SELECT USING (hospital_id = auth.uid());

CREATE POLICY "Hospitals can create access requests" ON access_requests
  FOR INSERT WITH CHECK (hospital_id = auth.uid());

CREATE POLICY "System can update access requests" ON access_requests
  FOR UPDATE USING (true);