import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!globalThis.supabase) {
  globalThis.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,      // uloží session do storage
      detectSessionInUrl: true,  // přečte token z URL po redirectu
    },
  });
}

export const supabase = globalThis.supabase;
