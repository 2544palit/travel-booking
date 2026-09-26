import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load apikey.env from project root
dotenv.config({ path: path.resolve(__dirname, '../../apikey.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration missing! Please check .env file');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
