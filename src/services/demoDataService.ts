import { supabase } from "@/integrations/supabase/client";

export async function seedDemoData(): Promise<void> {
  const { data, error } = await supabase.functions.invoke('seed-demo-data', {
    method: 'POST',
  });

  if (error) {
    throw error;
  }

  return data;
}
