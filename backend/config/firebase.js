import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('WARNING: Missing SUPABASE_URL or SUPABASE_KEY in environment variables');
  console.warn('SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
  console.warn('SUPABASE_KEY:', supabaseKey ? 'SET' : 'NOT SET');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export { supabase };

