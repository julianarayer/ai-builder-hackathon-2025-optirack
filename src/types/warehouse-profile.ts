export type OperationType = 'cd' | 'retail';

export interface Zone {
  type: 'manual' | 'forklift' | 'temperature_controlled';
  enabled: boolean;
  min_corridor_width_m?: number;
  temp_type?: 'freezer' | 'cooler';
}

export interface Policies {
  max_picking_to_packing_distance_m?: number;
  prioritize_fast_movers: boolean;
  separate_by_families: boolean;
  family_separation_rules?: string;
  blocking_rules?: string;
}

export interface LayoutShape {
  id: string;
  type: 'shelf' | 'box' | 'freezer' | 'rack';
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  color?: string;
}

export interface LayoutDrawingData {
  canvas_width: number;
  canvas_height: number;
  shapes: LayoutShape[];
}

export interface WarehouseProfile {
  id: string;
  user_id: string;
  operation_type?: OperationType;
  total_area_sqm?: number;
  useful_height_m?: number;
  approximate_positions?: number;
  num_sectors?: number;
  zones?: Zone[];
  max_picking_to_packing_distance_m?: number;
  prioritize_fast_movers: boolean;
  separate_by_families: boolean;
  family_separation_rules?: string;
  blocking_rules?: string;
  layout_image_url?: string;
  layout_drawing_data?: LayoutDrawingData;
  onboarding_completed: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export interface Step1Data {
  operationType: OperationType | null;
}

export interface Step2Data {
  totalAreaSqm: number;
  usefulHeightM: number;
  approximatePositions: number;
  numSectors: number;
  zones: Zone[];
  policies: Policies;
}

export interface Step3Data {
  layoutImageUrl?: string;
  layoutDrawingData?: LayoutDrawingData;
}
