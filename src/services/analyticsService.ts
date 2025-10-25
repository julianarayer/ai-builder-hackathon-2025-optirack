import { supabase } from "@/integrations/supabase/client";
import { AnalyticsSnapshot } from "@/types/analytics";

export async function getLatestAnalyticsSnapshot(
  warehouseId: string
): Promise<AnalyticsSnapshot | null> {
  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .eq('warehouse_id', warehouseId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching analytics snapshot:', error);
    return null;
  }

  return data as unknown as AnalyticsSnapshot | null;
}

export async function getAnalyticsSnapshotByRunId(
  runId: string
): Promise<AnalyticsSnapshot | null> {
  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .eq('optimization_run_id', runId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching analytics snapshot:', error);
    return null;
  }

  return data as unknown as AnalyticsSnapshot | null;
}
