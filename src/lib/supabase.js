import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fecxbivkntyupuqqnevd.supabase.co';
const supabaseKey = 'sb_publishable_5QH4ck-8BTDRC6bnYdfxOw_io9c8oWC';

export const supabase = createClient(supabaseUrl, supabaseKey);