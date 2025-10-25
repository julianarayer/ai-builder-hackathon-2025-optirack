/**
 * OptiRack Type Definitions
 * Complete TypeScript types for warehouse optimization system
 */

// ============= Database Types =============

export interface Warehouse {
  id: string;
  user_id: string;
  name: string;
  total_locations: number;
  total_zones: number;
  layout_config: WarehouseLayoutConfig;
  created_at: string;
  updated_at: string;
}

export interface WarehouseLayoutConfig {
  zones: Array<{
    name: string;
    capacity: number;
    distance_from_dock_m: number;
  }>;
}

export interface SKU {
  id: string;
  warehouse_id: string;
  sku_code: string;
  sku_name: string | null;
  category: string | null;
  current_location: string | null;
  current_zone: string | null;
  recommended_location: string | null;
  recommended_zone: string | null;
  velocity_class: 'A' | 'B' | 'C' | 'D' | null;
  pick_frequency: number;
  pick_frequency_monthly: number;
  dimensions: SKUDimensions | null;
  empty_slot_incidents: number;
  non_conformity_count: number;
  last_analyzed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SKUDimensions {
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
}

export interface Order {
  id: string;
  warehouse_id: string;
  order_code: string;
  order_date: string;
  received_at: string | null;
  processed_at: string | null;
  shipped_at: string | null;
  total_items: number;
  total_picks: number;
  total_distance_traveled_m: number | null;
  picking_time_minutes: number | null;
  processing_time_minutes: number | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  sku_id: string;
  quantity: number;
  location_at_pick: string | null;
  pick_sequence: number | null;
  picked_at: string | null;
  was_conforming: boolean;
  empty_slot_found: boolean;
  non_conformity_reason: string | null;
  created_at: string;
}

export interface SlottingRecommendation {
  id: string;
  warehouse_id: string;
  optimization_run_id: string | null;
  sku_id: string;
  current_location: string;
  current_zone: string | null;
  recommended_location: string;
  recommended_zone: string | null;
  reason: string;
  priority: number;
  estimated_improvement_percent: number | null;
  distance_saved_per_pick_m: number | null;
  related_skus: string[] | null;
  affinity_note: string | null;
  status: 'pending' | 'applied' | 'rejected';
  applied_at: string | null;
  applied_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface ProductAffinity {
  id: string;
  warehouse_id: string;
  sku_a_id: string;
  sku_b_id: string;
  co_occurrence_count: number;
  total_orders: number;
  total_orders_with_a: number;
  total_orders_with_b: number;
  support: number;
  confidence: number;
  lift: number;
  current_distance_m: number | null;
  recommended_action: string | null;
  calculated_at: string;
}

export interface OptimizationRun {
  id: string;
  warehouse_id: string;
  run_date: string;
  analysis_start_date: string | null;
  analysis_end_date: string | null;
  total_orders_analyzed: number;
  total_skus_analyzed: number;
  recommendations_generated: number;
  high_priority_count: number;
  medium_priority_count: number;
  low_priority_count: number;
  current_avg_distance_per_order_m: number | null;
  optimized_avg_distance_per_order_m: number | null;
  estimated_distance_reduction_percent: number | null;
  estimated_time_reduction_percent: number | null;
  current_productivity_pieces_per_hour: number | null;
  optimized_productivity_pieces_per_hour: number | null;
  productivity_improvement_percent: number | null;
  estimated_annual_hours_saved: number | null;
  estimated_annual_cost_savings_usd: number | null;
  processing_time_seconds: number | null;
  created_at: string;
}

export interface WarehouseKPI {
  id: string;
  warehouse_id: string;
  date: string;
  total_orders_processed: number;
  total_items_picked: number;
  total_distance_traveled_km: number | null;
  avg_order_processing_time_minutes: number | null;
  picking_accuracy_percent: number | null;
  picking_productivity_pieces_per_hour: number | null;
  receiving_productivity_pieces_per_hour: number | null;
  putaway_productivity_pallets_per_hour: number | null;
  inventory_accuracy_percent: number | null;
  on_time_shipment_percent: number | null;
  empty_slot_incidents: number;
  receiving_non_conformities: number;
  inspection_errors_found: number;
  inspection_error_rate_percent: number | null;
  created_at: string;
}

// ============= UI Component Types =============

export interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  changePercent?: number;
  trend?: 'up' | 'down';
  className?: string;
}

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export interface BadgeVariant {
  variant: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

// ============= Analysis Types =============

export interface ABCAnalysisResult {
  sku_id: string;
  sku_code: string;
  sku_name: string | null;
  pick_frequency: number;
  velocity_class: 'A' | 'B' | 'C' | 'D';
  cumulative_percent: number;
  current_location: string | null;
  current_zone: string | null;
}

export interface AffinityPair {
  sku_a_code: string;
  sku_a_name: string | null;
  sku_b_code: string;
  sku_b_name: string | null;
  co_occurrence_count: number;
  confidence: number;
  lift: number;
  current_distance_m: number | null;
  is_misplaced: boolean;
}

export interface HeatmapCell {
  location: string;
  zone: string;
  sku_codes: string[];
  pick_frequency: number;
  status: 'hot' | 'warm' | 'cool' | 'cold' | 'empty';
}

// ============= Upload Types =============

export interface CSVUploadData {
  order_id: string;
  order_date: string;
  sku_code: string;
  sku_name?: string;
  quantity: number;
  current_location: string;
  category?: string;
}

export interface FileUploadState {
  file: File | null;
  isUploading: boolean;
  progress: number;
  error: string | null;
  preview: CSVUploadData[] | null;
}

// ============= Dashboard Types =============

export interface DashboardMetrics {
  totalSKUs: number;
  skuChangePercent: number;
  timeReduction: number;
  distanceReduction: number;
  pendingRecommendations: number;
  highPriorityRecommendations: number;
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

// ============= API Response Types =============

export interface APIResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
