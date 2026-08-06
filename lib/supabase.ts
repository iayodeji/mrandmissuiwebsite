import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Lazy initialization to allow builds without env vars
let supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseInstance() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseServiceKey);
  }

  return supabaseInstance;
}

// Create a proxy that lazily initializes Supabase
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get: (target, prop) => {
    const instance = getSupabaseInstance();
    return (instance as any)[prop];
  },
});
