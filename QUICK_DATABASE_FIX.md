# Quick Database Fix for Guardian Error

## The Problem
"Database table not properly set up" error when adding guardians.

## Quick Solution (Works Immediately)
The app now works WITHOUT database setup! Guardians are stored locally in your browser.

## To Fix Database (Optional)
1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Go to "SQL Editor" in the left menu
4. Copy and paste this SQL:

```sql
CREATE TABLE guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID,
  name TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  relationship TEXT,
  contact TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage their guardians" ON guardians
  FOR ALL USING (patient_id = auth.uid());
```

5. Click "Run" button

## Current Status
- ✅ Guardian functionality works (stored locally)
- ✅ QR code generation works
- ✅ Quick actions work
- ⚠️ Guardians only saved in browser (not persistent across devices)

## What This Means
- You can add/remove guardians and they'll work during your session
- Data is saved in your browser's localStorage
- If you clear browser data, guardians will be lost
- Once database is set up, guardians will be saved permanently