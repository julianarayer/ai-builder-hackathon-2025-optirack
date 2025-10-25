import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Get warehouse
    const { data: warehouse } = await supabaseClient
      .from('warehouses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!warehouse) {
      return new Response(JSON.stringify({ error: 'Warehouse not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    const warehouseId = warehouse.id

    // Create demo SKUs
    const demoSKUs = [
      { code: 'SKU-A001', name: 'Notebook Dell Inspiron', category: 'Eletrônicos', velocity: 'A' },
      { code: 'SKU-A002', name: 'Mouse Logitech MX Master', category: 'Periféricos', velocity: 'A' },
      { code: 'SKU-A003', name: 'Teclado Mecânico RGB', category: 'Periféricos', velocity: 'A' },
      { code: 'SKU-B001', name: 'Monitor LG 27"', category: 'Eletrônicos', velocity: 'B' },
      { code: 'SKU-B002', name: 'Webcam Logitech C920', category: 'Periféricos', velocity: 'B' },
      { code: 'SKU-B003', name: 'Headset Gamer HyperX', category: 'Periféricos', velocity: 'B' },
      { code: 'SKU-C001', name: 'Cabo HDMI 2m', category: 'Cabos', velocity: 'C' },
      { code: 'SKU-C002', name: 'Hub USB-C 4 portas', category: 'Acessórios', velocity: 'C' },
      { code: 'SKU-C003', name: 'Mousepad Extended', category: 'Acessórios', velocity: 'C' },
      { code: 'SKU-D001', name: 'Filtro de linha 6 tomadas', category: 'Energia', velocity: 'D' },
    ]

    const skuInserts = []
    for (const sku of demoSKUs) {
      const { data } = await supabaseClient
        .from('skus')
        .upsert({
          warehouse_id: warehouseId,
          sku_code: sku.code,
          sku_name: sku.name,
          category: sku.category,
          velocity_class: sku.velocity,
          pick_frequency: sku.velocity === 'A' ? 120 : sku.velocity === 'B' ? 60 : sku.velocity === 'C' ? 20 : 5,
        }, { onConflict: 'warehouse_id,sku_code' })
        .select()
        .single()
      
      if (data) skuInserts.push(data)
    }

    // Create inventory snapshots
    const inventoryData = [
      { sku_code: 'SKU-A001', on_hand: 8, allocated: 3, in_transit: 20, pickface_min: 10, pickface_max: 30 },
      { sku_code: 'SKU-A002', on_hand: 45, allocated: 15, in_transit: 50, pickface_min: 30, pickface_max: 80 },
      { sku_code: 'SKU-A003', on_hand: 22, allocated: 8, in_transit: 40, pickface_min: 20, pickface_max: 60 },
      { sku_code: 'SKU-B001', on_hand: 35, allocated: 5, in_transit: 15, pickface_min: 15, pickface_max: 50 },
      { sku_code: 'SKU-B002', on_hand: 18, allocated: 2, in_transit: 10, pickface_min: 12, pickface_max: 40 },
      { sku_code: 'SKU-B003', on_hand: 28, allocated: 7, in_transit: 20, pickface_min: 15, pickface_max: 45 },
      { sku_code: 'SKU-C001', on_hand: 120, allocated: 10, in_transit: 0, pickface_min: 50, pickface_max: 150 },
      { sku_code: 'SKU-C002', on_hand: 65, allocated: 5, in_transit: 30, pickface_min: 30, pickface_max: 100 },
      { sku_code: 'SKU-C003', on_hand: 88, allocated: 12, in_transit: 0, pickface_min: 40, pickface_max: 120 },
      { sku_code: 'SKU-D001', on_hand: 15, allocated: 1, in_transit: 0, pickface_min: 10, pickface_max: 30 },
    ]

    for (const inv of inventoryData) {
      const sku = skuInserts.find(s => s.sku_code === inv.sku_code)
      if (sku) {
        await supabaseClient
          .from('inventory_snapshots')
          .upsert({
            warehouse_id: warehouseId,
            sku_id: sku.id,
            on_hand: inv.on_hand,
            allocated: inv.allocated,
            in_transit: inv.in_transit,
            pickface_min: inv.pickface_min,
            pickface_max: inv.pickface_max,
            last_move_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          }, { onConflict: 'warehouse_id,sku_id,lot' })
      }
    }

    // Create demand stats
    const demandData = [
      { sku_code: 'SKU-A001', avg_daily: 4.2, std_daily: 1.8 },
      { sku_code: 'SKU-A002', avg_daily: 5.8, std_daily: 2.1 },
      { sku_code: 'SKU-A003', avg_daily: 3.9, std_daily: 1.5 },
      { sku_code: 'SKU-B001', avg_daily: 2.5, std_daily: 1.0 },
      { sku_code: 'SKU-B002', avg_daily: 1.8, std_daily: 0.9 },
      { sku_code: 'SKU-B003', avg_daily: 2.2, std_daily: 1.1 },
      { sku_code: 'SKU-C001', avg_daily: 0.9, std_daily: 0.5 },
      { sku_code: 'SKU-C002', avg_daily: 1.1, std_daily: 0.6 },
      { sku_code: 'SKU-C003', avg_daily: 0.8, std_daily: 0.4 },
      { sku_code: 'SKU-D001', avg_daily: 0.3, std_daily: 0.2 },
    ]

    for (const demand of demandData) {
      const sku = skuInserts.find(s => s.sku_code === demand.sku_code)
      if (sku) {
        await supabaseClient
          .from('demand_stats')
          .upsert({
            warehouse_id: warehouseId,
            sku_id: sku.id,
            avg_daily: demand.avg_daily,
            std_daily: demand.std_daily,
            horizon_days: 30,
          }, { onConflict: 'warehouse_id,sku_id' })
      }
    }

    // Create replenishment rules
    for (const sku of skuInserts) {
      await supabaseClient
        .from('replenishment_rules')
        .upsert({
          warehouse_id: warehouseId,
          sku_id: sku.id,
          pickface_min: sku.velocity_class === 'A' ? 20 : sku.velocity_class === 'B' ? 15 : 30,
          pickface_max: sku.velocity_class === 'A' ? 60 : sku.velocity_class === 'B' ? 50 : 100,
          z_value: 1.65,
          lead_time_days: sku.velocity_class === 'A' ? 3 : sku.velocity_class === 'B' ? 5 : 7,
        }, { onConflict: 'warehouse_id,sku_id' })
    }

    // Create slot capacity data
    const zones = ['A', 'B', 'C']
    const slotsPerZone = 20
    const slotData = []

    for (let z = 0; z < zones.length; z++) {
      const zone = zones[z]
      const baseDistance = zone === 'A' ? 15 : zone === 'B' ? 35 : 65
      
      for (let i = 1; i <= slotsPerZone; i++) {
        const slotId = `${zone}-${String(i).padStart(3, '0')}`
        const occupied = Math.random() > 0.3 // 70% ocupado
        const skuForSlot = occupied ? skuInserts[Math.floor(Math.random() * skuInserts.length)] : null
        
        slotData.push({
          warehouse_id: warehouseId,
          slot_id: slotId,
          capacity_units: 100,
          occupied_pct: occupied ? 50 + Math.random() * 50 : 0,
          zone: zone,
          distance_to_pack: baseDistance + Math.random() * 10,
          current_sku_id: skuForSlot?.id || null,
        })
      }
    }

    for (const slot of slotData) {
      await supabaseClient
        .from('slot_capacity')
        .upsert(slot, { onConflict: 'warehouse_id,slot_id' })
    }

    // Create product affinity (co-occurrence) data
    const affinityPairs = [
      { sku_a: 'SKU-A001', sku_b: 'SKU-A002', co_occurrence: 45, support: 0.35, confidence: 0.68, lift: 2.4 },
      { sku_a: 'SKU-A001', sku_b: 'SKU-A003', co_occurrence: 38, support: 0.29, confidence: 0.58, lift: 2.1 },
      { sku_a: 'SKU-A001', sku_b: 'SKU-B001', co_occurrence: 28, support: 0.22, confidence: 0.42, lift: 1.8 },
      { sku_a: 'SKU-A002', sku_b: 'SKU-A003', co_occurrence: 52, support: 0.41, confidence: 0.75, lift: 2.8 },
      { sku_a: 'SKU-A002', sku_b: 'SKU-C001', co_occurrence: 22, support: 0.17, confidence: 0.32, lift: 1.5 },
      { sku_a: 'SKU-B001', sku_b: 'SKU-B002', co_occurrence: 31, support: 0.24, confidence: 0.55, lift: 2.2 },
      { sku_a: 'SKU-B002', sku_b: 'SKU-B003', co_occurrence: 26, support: 0.20, confidence: 0.48, lift: 1.9 },
      { sku_a: 'SKU-C001', sku_b: 'SKU-C002', co_occurrence: 18, support: 0.14, confidence: 0.35, lift: 1.6 },
    ]

    for (const pair of affinityPairs) {
      const skuA = skuInserts.find(s => s.sku_code === pair.sku_a)
      const skuB = skuInserts.find(s => s.sku_code === pair.sku_b)
      
      if (skuA && skuB) {
        await supabaseClient
          .from('product_affinity')
          .upsert({
            warehouse_id: warehouseId,
            sku_a_id: skuA.id,
            sku_b_id: skuB.id,
            co_occurrence_count: pair.co_occurrence,
            support: pair.support,
            confidence: pair.confidence,
            lift: pair.lift,
            total_orders: 130,
            total_orders_with_a: 65,
            total_orders_with_b: 58,
          })
      }
    }

    // Create some demo tasks
    const criticalSku = skuInserts.find(s => s.sku_code === 'SKU-A001')
    if (criticalSku) {
      await supabaseClient
        .from('tasks_queue')
        .insert([
          {
            warehouse_id: warehouseId,
            task_type: 'reabastecer',
            sku_id: criticalSku.id,
            qty: 15,
            priority: 1,
            status: 'pendente',
            notes: 'Estoque crítico - reabastecer urgentemente'
          },
          {
            warehouse_id: warehouseId,
            task_type: 'comprar',
            sku_id: criticalSku.id,
            qty: 50,
            priority: 1,
            status: 'pendente',
            notes: 'Pedido de compra urgente - lead time 3 dias'
          }
        ])
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Dados de demonstração criados com sucesso!',
        stats: {
          skus: skuInserts.length,
          inventory_records: inventoryData.length,
          affinity_pairs: affinityPairs.length,
          slots: slotData.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error seeding demo data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})