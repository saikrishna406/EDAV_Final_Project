-- Create storage bucket for health records
INSERT INTO storage.buckets (id, name, public) VALUES ('health-records', 'health-records', false);

-- Create policy to allow patients to upload their own files
CREATE POLICY "Patients can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow patients to view their own files
CREATE POLICY "Patients can view their own files" ON storage.objects
FOR SELECT USING (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow hospitals to view all files (for emergency access)
CREATE POLICY "Hospitals can view all files" ON storage.objects
FOR SELECT USING (bucket_id = 'health-records');