// src/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ciuufenfnubuisuunboi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpdXVmZW5mbnVidWlzdXVuYm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUyMzE4ODksImV4cCI6MjA3MzA5OTE4OX0.DqCvindmLv2G4aSr41z5t-k9ZTB2WxvSvy2UFz2KIdA';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          name: string;
          email: string;
          mobile: string;
          date_of_birth: string;
          gender: string;
          blood_group: string;
          wallet_address: string;
          emergency_contact?: string;
          qr_code?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['patients']['Insert']>;
      };
      hospitals: {
        Row: {
          id: string;
          name: string;
          email: string;
          registration_id: string;
          role: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hospitals']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['hospitals']['Insert']>;
      };
      health_records: {
        Row: {
          id: string;
          patient_id: string;
          name: string;
          type: string;
          upload_date: string;
          ipfs_cid: string;
          is_encrypted: boolean;
          size: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['health_records']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['health_records']['Insert']>;
      };
    };
  };
}