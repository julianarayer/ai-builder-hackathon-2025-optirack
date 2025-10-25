import { supabase } from "@/integrations/supabase/client";

export async function seedDemoData(): Promise<void> {
  const { data, error } = await supabase.functions.invoke('seed-demo-data', {
    method: 'POST',
  });

  if (error) {
    console.error('Erro ao criar dados demo:', error);
    throw new Error(error.message || 'Falha ao criar dados de demonstração');
  }

  return data;
}
