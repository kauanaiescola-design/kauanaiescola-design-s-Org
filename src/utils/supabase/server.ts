import { createServerClient } from "@supabase/ssr";

const supabaseUrl = 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  'https://tpembfkvoxgqdjbnennc.supabase.co';

const supabaseKey = 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  'sb_publishable_xC2pJSJYn0RtvushiqB4jw_8bCepq_Z';

export const createClient = (cookieStore?: any) => {
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore?.getAll ? cookieStore.getAll() : [];
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore?.set ? cookieStore.set(name, value, options) : null
            );
          } catch {
            // Can be ignored if handled by middleware
          }
        },
      },
    },
  );
};
