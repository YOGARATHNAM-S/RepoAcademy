import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env for local runs; on Vercel, process.env is provided by project settings.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_KEY. For Vercel, set both in Project Settings > Environment Variables. For local, define them in backend/.env.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };

