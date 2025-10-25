-- Create inventory_snapshots table
CREATE TABLE inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
  on_hand INTEGER NOT NULL DEFAULT 0,
  allocated INTEGER NOT NULL DEFAULT 0,
  in_transit INTEGER NOT NULL DEFAULT 0,
  pickface_min INTEGER,
  pickface_max INTEGER,
  last_move_at TIMESTAMPTZ,
  lot VARCHAR(100),
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(warehouse_id, sku_id, lot)
);

CREATE INDEX idx_inventory_warehouse ON inventory_snapshots(warehouse_id);
CREATE INDEX idx_inventory_sku ON inventory_snapshots(sku_id);
CREATE INDEX idx_inventory_expiry ON inventory_snapshots(expiry_date) WHERE expiry_date IS NOT NULL;

-- Enable RLS
ALTER TABLE inventory_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own warehouse inventory" ON inventory_snapshots
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM warehouses w WHERE w.id = inventory_snapshots.warehouse_id AND w.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own warehouse inventory" ON inventory_snapshots
  FOR ALL USING (EXISTS (
    SELECT 1 FROM warehouses w WHERE w.id = inventory_snapshots.warehouse_id AND w.user_id = auth.uid()
  ));

-- Create demand_stats table
CREATE TABLE demand_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
  avg_daily NUMERIC(10,2) NOT NULL DEFAULT 0,
  std_daily NUMERIC(10,2) NOT NULL DEFAULT 0,
  horizon_days INTEGER NOT NULL DEFAULT 30,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(warehouse_id, sku_id)
);

CREATE INDEX idx_demand_warehouse ON demand_stats(warehouse_id);
CREATE INDEX idx_demand_sku ON demand_stats(sku_id);

-- Enable RLS
ALTER TABLE demand_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own warehouse demand" ON demand_stats
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM warehouses w WHERE w.id = demand_stats.warehouse_id AND w.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own warehouse demand" ON demand_stats
  FOR ALL USING (EXISTS (
    SELECT 1 FROM warehouses w WHERE w.id = demand_stats.warehouse_id AND w.user_id = auth.uid()
  ));

-- Create replenishment_rules table
CREATE TABLE replenishment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
  pickface_min INTEGER NOT NULL DEFAULT 10,
  pickface_max INTEGER NOT NULL DEFAULT 50,
  z_value NUMERIC(4,2) NOT NULL DEFAULT 1.65,
  lead_time_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(warehouse_id, sku_id)
);

CREATE INDEX idx_replenishment_warehouse ON replenishment_rules(warehouse_id);
CREATE INDEX idx_replenishment_sku ON replenishment_rules(sku_id);

-- Enable RLS
ALTER TABLE replenishment_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own warehouse replenishment" ON replenishment_rules
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM warehouses w WHERE w.id = replenishment_rules.warehouse_id AND w.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own warehouse replenishment" ON replenishment_rules
  FOR ALL USING (EXISTS (
    SELECT 1 FROM warehouses w WHERE w.id = replenishment_rules.warehouse_id AND w.user_id = auth.uid()
  ));

-- Create slot_capacity table
CREATE TABLE slot_capacity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  slot_id VARCHAR(50) NOT NULL,
  capacity_units INTEGER NOT NULL DEFAULT 100,
  capacity_weight NUMERIC(10,2),
  occupied_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  zone CHAR(1),
  distance_to_pack NUMERIC(10,2),
  current_sku_id UUID REFERENCES skus(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(warehouse_id, slot_id)
);

CREATE INDEX idx_slot_warehouse ON slot_capacity(warehouse_id);
CREATE INDEX idx_slot_zone ON slot_capacity(zone);

-- Enable RLS
ALTER TABLE slot_capacity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own warehouse slots" ON slot_capacity
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM warehouses w WHERE w.id = slot_capacity.warehouse_id AND w.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own warehouse slots" ON slot_capacity
  FOR ALL USING (EXISTS (
    SELECT 1 FROM warehouses w WHERE w.id = slot_capacity.warehouse_id AND w.user_id = auth.uid()
  ));

-- Create tasks_queue table
CREATE TABLE tasks_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  task_type VARCHAR(50) NOT NULL,
  sku_id UUID REFERENCES skus(id) ON DELETE CASCADE,
  from_slot VARCHAR(50),
  to_slot VARCHAR(50),
  qty INTEGER,
  priority INTEGER NOT NULL DEFAULT 3,
  assignee VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_warehouse ON tasks_queue(warehouse_id);
CREATE INDEX idx_tasks_status ON tasks_queue(status);
CREATE INDEX idx_tasks_priority ON tasks_queue(priority);
CREATE INDEX idx_tasks_type ON tasks_queue(task_type);

-- Enable RLS
ALTER TABLE tasks_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own warehouse tasks" ON tasks_queue
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM warehouses w WHERE w.id = tasks_queue.warehouse_id AND w.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own warehouse tasks" ON tasks_queue
  FOR ALL USING (EXISTS (
    SELECT 1 FROM warehouses w WHERE w.id = tasks_queue.warehouse_id AND w.user_id = auth.uid()
  ));