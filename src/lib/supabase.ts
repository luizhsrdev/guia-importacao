import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente com Service Role Key (usar APENAS em Server Components/Actions)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Cliente com Anon Key (para uso no cliente - adicionar depois)
// export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
