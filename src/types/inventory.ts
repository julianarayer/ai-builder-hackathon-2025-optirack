export interface InventorySnapshot {
  id: string;
  warehouse_id: string;
  sku_id: string;
  on_hand: number;
  allocated: number;
  in_transit: number;
  pickface_min: number | null;
  pickface_max: number | null;
  last_move_at: string | null;
  lot: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DemandStats {
  id: string;
  warehouse_id: string;
  sku_id: string;
  avg_daily: number;
  std_daily: number;
  horizon_days: number;
  calculated_at: string;
}

export interface ReplenishmentRule {
  id: string;
  warehouse_id: string;
  sku_id: string;
  pickface_min: number;
  pickface_max: number;
  z_value: number;
  lead_time_days: number;
  created_at: string;
  updated_at: string;
}

export interface SlotCapacity {
  id: string;
  warehouse_id: string;
  slot_id: string;
  capacity_units: number;
  capacity_weight: number | null;
  occupied_pct: number;
  zone: string | null;
  distance_to_pack: number | null;
  current_sku_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskQueue {
  id: string;
  warehouse_id: string;
  task_type: 'reposicionar' | 'reabastecer' | 'contar' | 'comprar' | 'corrigir_zona' | 'investigar_shrinkage';
  sku_id: string | null;
  from_slot: string | null;
  to_slot: string | null;
  qty: number | null;
  priority: 1 | 2 | 3;
  assignee: string | null;
  status: 'pendente' | 'em_andamento' | 'concluído' | 'cancelado';
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// View models (computed)
export interface PickfaceHealth {
  sku_id: string;
  sku_code: string;
  sku_name: string | null;
  abc_class: string;
  on_hand: number;
  allocated: number;
  available: number;
  pickface_min: number;
  pickface_max: number;
  doc: number | null;
  replenishment_suggested: number;
  status: 'ok' | 'reabastecer' | 'crítico';
}

export interface ReplenishmentNeeds {
  sku_id: string;
  sku_code: string;
  sku_name: string | null;
  demand_per_day: number;
  lead_time_days: number;
  std_demand: number;
  rop: number;
  safety_stock: number;
  on_hand: number;
  in_transit: number;
  action: 'comprar' | 'reabastecer' | 'ok';
}

export interface SlotHealth {
  slot_id: string;
  zone: string | null;
  capacity: number;
  occupied_pct: number;
  sku_code: string | null;
  sku_abc_class: string | null;
  distance_to_pack: number | null;
  slot_health: number;
}

export interface AgingItem {
  sku_id: string;
  sku_code: string;
  sku_name: string | null;
  days_without_movement: number;
  last_movement: string | null;
  lot: string | null;
  expiry_date: string | null;
  risk_level: 'baixo' | 'médio' | 'alto';
}
