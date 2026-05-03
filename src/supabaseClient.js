import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovzxivvdqeavgzghzudy.supabase.co';
const supabaseKey = 'sb_publishable_YQrg0driUqENDqbFnGpxYQ_9j9TWuTX';

export const supabase = createClient(supabaseUrl, supabaseKey);
