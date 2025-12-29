import { createClient } from "@supabase/supabase-js";

// Shared Supabase client for user's own Supabase instance
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const REDIRECT_URL = import.meta.env.VITE_SUPABASE_REDIRECT_URL;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL nebo ANON KEY nejsou nastaveny v .env souboru");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const getRedirectUrl = () => REDIRECT_URL;
