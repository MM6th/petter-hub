// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fhdephyoizikcazfwrda.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZGVwaHlvaXppa2NhemZ3cmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4NTkxODcsImV4cCI6MjA1NDQzNTE4N30.69ZsOlcE9MVuzhRK55LPZPE0-8WjNIPFIj8jwA_ohKo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);