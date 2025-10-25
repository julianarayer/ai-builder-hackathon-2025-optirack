-- Create analytics_snapshots table
CREATE TABLE analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  optimization_run_id UUID REFERENCES optimization_runs(id) ON DELETE CASCADE,
  
  -- ABC Distribution (snapshot)
  abc_distribution JSONB NOT NULL DEFAULT '{}',
  
  -- Co-ocorrência (afinidade)
  top_affinity_pairs JSONB NOT NULL DEFAULT '[]',
  
  -- Distância média por pedido
  avg_distance_per_order_m NUMERIC(10,2),
  
  -- SLA alvo e estimativa de ganho
  target_sla_reduction_pct NUMERIC(5,2) DEFAULT 15,
  estimated_distance_reduction_pct NUMERIC(5,2),
  estimated_time_saved_pct NUMERIC(5,2),
  
  -- Metadados do cálculo
  method_notes JSONB NOT NULL DEFAULT '{}',
  
  -- Amostras de distância (debug)
  order_distance_samples JSONB,
  
  -- Timestamps
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_analytics_snapshots_warehouse ON analytics_snapshots(warehouse_id);
CREATE INDEX idx_analytics_snapshots_run ON analytics_snapshots(optimization_run_id);
CREATE INDEX idx_analytics_snapshots_generated_at ON analytics_snapshots(generated_at DESC);

-- RLS Policies
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics from own warehouses"
  ON analytics_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM warehouses w
      WHERE w.id = analytics_snapshots.warehouse_id
      AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage analytics from own warehouses"
  ON analytics_snapshots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM warehouses w
      WHERE w.id = analytics_snapshots.warehouse_id
      AND w.user_id = auth.uid()
    )
  );