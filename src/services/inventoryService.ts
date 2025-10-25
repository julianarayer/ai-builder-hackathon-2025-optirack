import { supabase } from "@/integrations/supabase/client";
import { 
  PickfaceHealth,
  ReplenishmentNeeds,
  SlotHealth,
  TaskQueue,
  AgingItem
} from "@/types/inventory";

export async function getPickfaceHealth(warehouseId: string): Promise<PickfaceHealth[]> {
  const { data: inventory } = await supabase
    .from('inventory_snapshots')
    .select(`
      *,
      sku:skus(sku_code, sku_name, velocity_class)
    `)
    .eq('warehouse_id', warehouseId);

  const { data: demandStats } = await supabase
    .from('demand_stats')
    .select('*')
    .eq('warehouse_id', warehouseId);

  const { data: rules } = await supabase
    .from('replenishment_rules')
    .select('*')
    .eq('warehouse_id', warehouseId);

  if (!inventory) return [];

  const demandMap = new Map(demandStats?.map(d => [d.sku_id, d]) || []);
  const rulesMap = new Map(rules?.map(r => [r.sku_id, r]) || []);

  return inventory.map((inv: any) => {
    const demand = demandMap.get(inv.sku_id);
    const rule = rulesMap.get(inv.sku_id);

    const available = inv.on_hand - inv.allocated;
    const doc = demand && demand.avg_daily > 0 
      ? parseFloat((inv.on_hand / demand.avg_daily).toFixed(1))
      : null;

    const pickfaceMin = inv.pickface_min || rule?.pickface_min || 10;
    const pickfaceMax = inv.pickface_max || rule?.pickface_max || 50;

    let replenishmentSuggested = 0;
    let status: 'ok' | 'reabastecer' | 'crítico' = 'ok';

    if (inv.on_hand < pickfaceMin) {
      replenishmentSuggested = Math.min(pickfaceMax - inv.on_hand, 100);
      status = inv.on_hand < pickfaceMin * 0.5 ? 'crítico' : 'reabastecer';
    }

    return {
      sku_id: inv.sku_id,
      sku_code: inv.sku.sku_code,
      sku_name: inv.sku.sku_name,
      abc_class: inv.sku.velocity_class || 'C',
      on_hand: inv.on_hand,
      allocated: inv.allocated,
      available,
      pickface_min: pickfaceMin,
      pickface_max: pickfaceMax,
      doc,
      replenishment_suggested: replenishmentSuggested,
      status
    };
  }).sort((a, b) => {
    const statusOrder = { 'crítico': 1, 'reabastecer': 2, 'ok': 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
}

export async function getReplenishmentNeeds(warehouseId: string): Promise<ReplenishmentNeeds[]> {
  const { data: inventory } = await supabase
    .from('inventory_snapshots')
    .select(`
      *,
      sku:skus(sku_code, sku_name)
    `)
    .eq('warehouse_id', warehouseId);

  const { data: demandStats } = await supabase
    .from('demand_stats')
    .select('*')
    .eq('warehouse_id', warehouseId);

  const { data: rules } = await supabase
    .from('replenishment_rules')
    .select('*')
    .eq('warehouse_id', warehouseId);

  if (!inventory || !demandStats || !rules) return [];

  const demandMap = new Map(demandStats.map(d => [d.sku_id, d]));
  const rulesMap = new Map(rules.map(r => [r.sku_id, r]));

  return inventory
    .map((inv: any) => {
      const demand = demandMap.get(inv.sku_id);
      const rule = rulesMap.get(inv.sku_id);

      if (!demand || !rule) return null;

      const zValue = rule.z_value || 1.65;
      const leadTime = rule.lead_time_days || 7;
      const demandPerDay = demand.avg_daily;
      const stdDemand = demand.std_daily;

      const safetyStock = zValue * stdDemand * Math.sqrt(leadTime);
      const rop = demandPerDay * leadTime + safetyStock;
      const totalAvailable = inv.on_hand + inv.in_transit;

      let action: 'comprar' | 'reabastecer' | 'ok' = 'ok';

      if (totalAvailable < rop) {
        action = 'comprar';
      } else if (inv.on_hand < rule.pickface_min) {
        action = 'reabastecer';
      }

      return {
        sku_id: inv.sku_id,
        sku_code: inv.sku.sku_code,
        sku_name: inv.sku.sku_name,
        demand_per_day: parseFloat(demandPerDay.toFixed(2)),
        lead_time_days: leadTime,
        std_demand: parseFloat(stdDemand.toFixed(2)),
        rop: parseFloat(rop.toFixed(0)),
        safety_stock: parseFloat(safetyStock.toFixed(0)),
        on_hand: inv.on_hand,
        in_transit: inv.in_transit,
        action
      };
    })
    .filter(Boolean) as ReplenishmentNeeds[];
}

export async function getSlotHealth(warehouseId: string): Promise<SlotHealth[]> {
  const { data: slots } = await supabase
    .from('slot_capacity')
    .select(`
      *,
      sku:skus(sku_code, velocity_class)
    `)
    .eq('warehouse_id', warehouseId);

  if (!slots || slots.length === 0) return [];

  const distances = slots.map(s => s.distance_to_pack || 999).filter(d => d < 999);
  const minDist = Math.min(...distances);
  const maxDist = Math.max(...distances);

  return slots.map((slot: any) => {
    const abcClass = slot.sku?.velocity_class || null;
    const distNormalized = slot.distance_to_pack 
      ? (slot.distance_to_pack - minDist) / (maxDist - minDist || 1)
      : 0.5;

    let health = 100;

    if (distNormalized < 0.25 && abcClass && ['B', 'C', 'D'].includes(abcClass)) {
      health -= 30;
    }

    if (slot.occupied_pct < 50) {
      health -= 20;
    }

    if (slot.occupied_pct > 95) {
      health -= 10;
    }

    return {
      slot_id: slot.slot_id,
      zone: slot.zone,
      capacity: slot.capacity_units,
      occupied_pct: slot.occupied_pct,
      sku_code: slot.sku?.sku_code || null,
      sku_abc_class: abcClass,
      distance_to_pack: slot.distance_to_pack,
      slot_health: Math.max(0, health)
    };
  }).sort((a, b) => a.slot_health - b.slot_health);
}

export async function getAgingItems(warehouseId: string): Promise<AgingItem[]> {
  const { data: inventory } = await supabase
    .from('inventory_snapshots')
    .select(`
      *,
      sku:skus(sku_code, sku_name)
    `)
    .eq('warehouse_id', warehouseId);

  if (!inventory) return [];

  const now = new Date();

  return inventory
    .map((inv: any) => {
      const lastMove = inv.last_move_at ? new Date(inv.last_move_at) : null;
      const daysWithoutMovement = lastMove 
        ? Math.floor((now.getTime() - lastMove.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      const expiryDate = inv.expiry_date ? new Date(inv.expiry_date) : null;
      const daysUntilExpiry = expiryDate
        ? Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      let riskLevel: 'baixo' | 'médio' | 'alto' = 'baixo';

      if (daysWithoutMovement > 90 || daysUntilExpiry < 30) {
        riskLevel = 'alto';
      } else if (daysWithoutMovement > 60 || daysUntilExpiry < 60) {
        riskLevel = 'médio';
      }

      return {
        sku_id: inv.sku_id,
        sku_code: inv.sku.sku_code,
        sku_name: inv.sku.sku_name,
        days_without_movement: daysWithoutMovement,
        last_movement: inv.last_move_at,
        lot: inv.lot,
        expiry_date: inv.expiry_date,
        risk_level: riskLevel
      };
    })
    .filter(item => item.risk_level !== 'baixo')
    .sort((a, b) => {
      const riskOrder = { 'alto': 1, 'médio': 2, 'baixo': 3 };
      return riskOrder[a.risk_level] - riskOrder[b.risk_level];
    });
}

export async function createReplenishmentTask(
  warehouseId: string,
  skuId: string,
  qty: number
): Promise<void> {
  const { error } = await supabase
    .from('tasks_queue')
    .insert({
      warehouse_id: warehouseId,
      task_type: 'reabastecer',
      sku_id: skuId,
      qty,
      priority: 2,
      status: 'pendente'
    });

  if (error) throw error;
}

export async function getTasks(
  warehouseId: string,
  filters?: {
    type?: string;
    status?: string;
    priority?: number;
  }
): Promise<TaskQueue[]> {
  let query = supabase
    .from('tasks_queue')
    .select(`
      *,
      sku:skus(sku_code, sku_name)
    `)
    .eq('warehouse_id', warehouseId)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false });

  if (filters?.type) {
    query = query.eq('task_type', filters.type);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data as TaskQueue[];
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskQueue['status']
): Promise<void> {
  const updates: any = { status, updated_at: new Date().toISOString() };

  if (status === 'concluído') {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('tasks_queue')
    .update(updates)
    .eq('id', taskId);

  if (error) throw error;
}
