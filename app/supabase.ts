import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://itmucwagpxuwgzacfgul.supabase.co";
const supabaseKey = "sb_publishable_N7G8sWZmiSs7ZfplW1Up5g_vEpn7J69";

export const supabase = createClient(supabaseUrl, supabaseKey);