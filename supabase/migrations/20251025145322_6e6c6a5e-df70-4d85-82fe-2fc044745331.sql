-- OptiRack AI Database Schema
-- Warehouse slotting optimization system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update warehouses table to add user_id foreign key if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'warehouses_user_id_fkey'
  ) THEN
    ALTER TABLE warehouses
    ADD CONSTRAINT warehouses_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on warehouses
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own warehouses
DROP POLICY IF EXISTS "Users can view own warehouses" ON warehouses;
CREATE POLICY "Users can view own warehouses" 
ON warehouses FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own warehouses
DROP POLICY IF EXISTS "Users can create own warehouses" ON warehouses;
CREATE POLICY "Users can create own warehouses" 
ON warehouses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own warehouses
DROP POLICY IF EXISTS "Users can update own warehouses" ON warehouses;
CREATE POLICY "Users can update own warehouses" 
ON warehouses FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own warehouses
DROP POLICY IF EXISTS "Users can delete own warehouses" ON warehouses;
CREATE POLICY "Users can delete own warehouses" 
ON warehouses FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on SKUs
ALTER TABLE skus ENABLE ROW LEVEL SECURITY;

-- RLS Policy for SKUs (based on warehouse ownership)
DROP POLICY IF EXISTS "Users can view skus from own warehouses" ON skus;
CREATE POLICY "Users can view skus from own warehouses" 
ON skus FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM warehouses 
    WHERE warehouses.id = skus.warehouse_id 
    AND warehouses.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage skus from own warehouses" ON skus;
CREATE POLICY "Users can manage skus from own warehouses" 
ON skus FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM warehouses 
    WHERE warehouses.id = skus.warehouse_id 
    AND warehouses.user_id = auth.uid()
  )
);

-- Enable RLS on Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view orders from own warehouses" ON orders;
CREATE POLICY "Users can view orders from own warehouses" 
ON orders FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM warehouses 
    WHERE warehouses.id = orders.warehouse_id 
    AND warehouses.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage orders from own warehouses" ON orders;
CREATE POLICY "Users can manage orders from own warehouses" 
ON orders FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM warehouses 
    WHERE warehouses.id = orders.warehouse_id 
    AND warehouses.user_id = auth.uid()
  )
);

-- Enable RLS on Order Items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view order items from own warehouses" ON order_items;
CREATE POLICY "Users can view order items from own warehouses" 
ON order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    JOIN warehouses ON warehouses.id = orders.warehouse_id
    WHERE orders.id = order_items.order_id 
    AND warehouses.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage order items from own warehouses" ON order_items;
CREATE POLICY "Users can manage order items from own warehouses" 
ON order_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    JOIN warehouses ON warehouses.id = orders.warehouse_id
    WHERE orders.id = order_items.order_id 
    AND warehouses.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_warehouses_user_id ON warehouses(user_id);
CREATE INDEX IF NOT EXISTS idx_skus_warehouse_id ON skus(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_skus_velocity_class ON skus(velocity_class);
CREATE INDEX IF NOT EXISTS idx_skus_pick_frequency ON skus(pick_frequency DESC);
CREATE INDEX IF NOT EXISTS idx_orders_warehouse_id ON orders(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_sku_id ON order_items(sku_id);
CREATE INDEX IF NOT EXISTS idx_slotting_recommendations_warehouse_id ON slotting_recommendations(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_slotting_recommendations_status ON slotting_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_product_affinity_warehouse_id ON product_affinity(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_optimization_runs_warehouse_id ON optimization_runs(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_kpis_warehouse_id ON warehouse_kpis(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_kpis_date ON warehouse_kpis(date DESC);

-- Create trigger to update SKU pick frequencies when order items are inserted
CREATE OR REPLACE FUNCTION update_sku_pick_frequency()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE skus 
  SET 
    pick_frequency = pick_frequency + NEW.quantity,
    updated_at = NOW()
  WHERE id = NEW.sku_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sku_pick_frequency ON order_items;
CREATE TRIGGER trigger_update_sku_pick_frequency
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_sku_pick_frequency();