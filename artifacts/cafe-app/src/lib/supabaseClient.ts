import { createClient } from '@supabase/supabase-js';

// Public anon key only — safe to expose in the browser bundle.
// Set these in your Vercel/frontend environment as VITE_SUPABASE_URL and
// VITE_SUPABASE_ANON_KEY (Project Settings → API in your Supabase dashboard).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const MENU_IMAGES_BUCKET = 'menu-images';
