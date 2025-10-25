export interface AffinityPairEnhanced {
  sku_i: string;
  sku_j: string;
  support_ij: number;
  confidence_i_to_j: number;
  lift: number;
  phi: number;
}

export interface AnalyticsSnapshot {
  id: string;
  warehouse_id: string;
  optimization_run_id: string;
  abc_distribution: { [key: string]: number };
  top_affinity_pairs: AffinityPairEnhanced[];
  avg_distance_per_order_m: number;
  target_sla_reduction_pct: number;
  estimated_distance_reduction_pct: number;
  estimated_time_saved_pct: number;
  method_notes: {
    distance_metric: string;
    path_heuristic: string;
    min_pair_support: number;
    fallback_sem_layout: boolean;
    distance_mode?: 'profile_informed_no_layout' | 'layout_based' | 'ordinal_fallback';
    N_aisles?: number;
    aisle_width_m?: number;
    aisle_length_m?: number;
  };
  order_distance_samples?: any[];
  generated_at: string;
  created_at: string;
}
