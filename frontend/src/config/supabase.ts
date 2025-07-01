import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fwhidyckiftbpagczzot.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aGlkeWNraWZ0YnBhZ2N6em90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMDEzMjUsImV4cCI6MjA2NjU3NzMyNX0.aBl7Da3_HIqw18CXeE4HISbRh6GmMo6MThhtuaH9yw0';

export const supabase = createClient(supabaseUrl, supabaseKey); 