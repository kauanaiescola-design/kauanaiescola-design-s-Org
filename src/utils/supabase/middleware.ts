import { createServerClient } from "@supabase/ssr";

const supabaseUrl = 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  'https://tpembfkvoxgqdjbnennc.supabase.co';

const supabaseKey = 
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  'sb_publishable_xC2pJSJYn0RtvushiqB4jw_8bCepq_Z';

export const createClient = (request?: any) => {
  let supabaseResponse = {
    headers: new Headers(),
    cookies: new Map(),
  };

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request?.cookies?.getAll ? request.cookies.getAll() : [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }: any) => {
            if (request?.cookies?.set) {
              request.cookies.set(name, value);
            }
          });
        },
      },
    },
  );

  return { supabase, supabaseResponse };
};
