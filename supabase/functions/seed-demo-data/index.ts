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
      console.error('Auth error:', userError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    console.log('User authenticated:', user.id)

    // Get warehouse
    const { data: warehouse } = await supabaseClient
      .from('warehouses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!warehouse) {
      console.error('Warehouse not found for user:', user.id)
      return new Response(JSON.stringify({ error: 'Warehouse not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    const warehouseId = warehouse.id
    console.log('Using warehouse:', warehouseId)

    // Fetch existing SKUs
    const { data: existingSKUs, error: skusError } = await supabaseClient
      .from('skus')
      .select('*')
      .eq('warehouse_id', warehouseId)

    if (skusError) {
      console.error('Error fetching SKUs:', skusError)
      return new Response(JSON.stringify({ error: 'Failed to fetch SKUs' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (!existingSKUs || existingSKUs.length === 0) {
      console.error('No SKUs found for warehouse:', warehouseId)
      return new Response(JSON.stringify({ error: 'No SKUs found. Please upload SKU data first.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log(`Found ${existingSKUs.length} SKUs`)

    // Helper function to get realistic values by ABC class
    const getInventoryByClass = (velocityClass: string, pickFrequency: number) => {
      const avgDaily = pickFrequency / 30
      const stdDaily = avgDaily * 0.3

      switch (velocityClass) {
        case 'A':
          return {
            on_hand: Math.floor(80 + Math.random() * 70),
            allocated: Math.floor(10 + Math.random() * 20),
            in_transit: Math.floor(20 + Math.random() * 30),
            pickface_min: 50,
            pickface_max: 100,
            lead_time_days: 3 + Math.floor(Math.random() * 3),
            avg_daily: avgDaily || 4,
            std_daily: stdDaily || 1.2,
          }
        case 'B':
          return {
            on_hand: Math.floor(40 + Math.random() * 40),
            allocated: Math.floor(5 + Math.random() * 10),
            in_transit: Math.floor(10 + Math.random() * 20),
            pickface_min: 30,
            pickface_max: 60,
            lead_time_days: 5 + Math.floor(Math.random() * 3),
            avg_daily: avgDaily || 2,
            std_daily: stdDaily || 0.6,
          }
        case 'C':
          return {
            on_hand: Math.floor(20 + Math.random() * 20),
            allocated: Math.floor(0 + Math.random() * 5),
            in_transit: Math.floor(5 + Math.random() * 10),
            pickface_min: 15,
            pickface_max: 30,
            lead_time_days: 7 + Math.floor(Math.random() * 7),
            avg_daily: avgDaily || 0.7,
            std_daily: stdDaily || 0.2,
          }
        default: // D
          return {
            on_hand: Math.floor(5 + Math.random() * 15),
            allocated: Math.floor(0 + Math.random() * 3),
            in_transit: Math.floor(0 + Math.random() * 5),
            pickface_min: 5,
            pickface_max: 15,
            lead_time_days: 14 + Math.floor(Math.random() * 7),
            avg_daily: avgDaily || 0.2,
            std_daily: stdDaily || 0.1,
          }
      }
    }

    // Create inventory snapshots for all SKUs
    let inventoryCount = 0
    let criticalSKUs = []
    
    for (const sku of existingSKUs) {
      const velocityClass = sku.velocity_class || 'C'
      const pickFrequency = sku.pick_frequency || 10
      const config = getInventoryByClass(velocityClass, pickFrequency)

      // Randomly create some critical scenarios
      const isCritical = Math.random() < 0.1 // 10% chance
      const needsReplenishment = Math.random() < 0.15 // 15% chance
      const isSlowMover = velocityClass === 'D' && Math.random() < 0.3 // 30% for D items

      let onHand = config.on_hand
      if (isCritical) {
        onHand = Math.floor(config.pickface_min * 0.3) // Critical: 30% of min
        criticalSKUs.push({ sku, qty: config.pickface_min - onHand })
      } else if (needsReplenishment) {
        onHand = Math.floor(config.pickface_min * 0.8) // Needs replenishment: 80% of min
      }

      const daysAgo = isSlowMover 
        ? 60 + Math.floor(Math.random() * 60) 
        : Math.floor(Math.random() * 30)

      const { error: invError } = await supabaseClient
        .from('inventory_snapshots')
        .upsert({
          warehouse_id: warehouseId,
          sku_id: sku.id,
          on_hand: onHand,
          allocated: config.allocated,
          in_transit: config.in_transit,
          pickface_min: config.pickface_min,
          pickface_max: config.pickface_max,
          last_move_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
          lot: null,
        }, { onConflict: 'warehouse_id,sku_id,lot' })

      if (!invError) inventoryCount++

      // Create demand stats
      await supabaseClient
        .from('demand_stats')
        .upsert({
          warehouse_id: warehouseId,
          sku_id: sku.id,
          avg_daily: config.avg_daily,
          std_daily: config.std_daily,
          horizon_days: 30,
        }, { onConflict: 'warehouse_id,sku_id' })

      // Create replenishment rules
      await supabaseClient
        .from('replenishment_rules')
        .upsert({
          warehouse_id: warehouseId,
          sku_id: sku.id,
          pickface_min: config.pickface_min,
          pickface_max: config.pickface_max,
          z_value: 1.65,
          lead_time_days: config.lead_time_days,
        }, { onConflict: 'warehouse_id,sku_id' })
    }

    console.log(`Created ${inventoryCount} inventory records`)

    // Create slot capacity data (75 slots across 5 zones)
    const zones = ['A', 'B', 'C', 'D', 'E']
    const slotsPerZone = 15
    let slotCount = 0

    for (const zone of zones) {
      const baseDistance = zone === 'A' ? 15 : zone === 'B' ? 30 : zone === 'C' ? 50 : zone === 'D' ? 70 : 90
      
      for (let i = 1; i <= slotsPerZone; i++) {
        const slotId = `${zone}-${String(i).padStart(3, '0')}`
        const occupied = Math.random() > 0.25 // 75% occupied
        const skuForSlot = occupied ? existingSKUs[Math.floor(Math.random() * existingSKUs.length)] : null
        
        const { error: slotError } = await supabaseClient
          .from('slot_capacity')
          .upsert({
            warehouse_id: warehouseId,
            slot_id: slotId,
            capacity_units: 100,
            occupied_pct: occupied ? 40 + Math.random() * 60 : 0,
            zone: zone,
            distance_to_pack: baseDistance + Math.random() * 15,
            current_sku_id: skuForSlot?.id || null,
          }, { onConflict: 'warehouse_id,slot_id' })

        if (!slotError) slotCount++
      }
    }

    console.log(`Created ${slotCount} slot capacity records`)

    // Create tasks for critical SKUs
    let taskCount = 0
    for (const critical of criticalSKUs.slice(0, 3)) { // Max 3 critical tasks
      await supabaseClient
        .from('tasks_queue')
        .insert({
          warehouse_id: warehouseId,
          task_type: 'reabastecer',
          sku_id: critical.sku.id,
          qty: critical.qty,
          priority: 1,
          status: 'pendente',
          notes: `Estoque crítico - apenas ${critical.sku.pick_frequency || 0} unidades disponíveis`
        })
      taskCount++
    }

    console.log(`Created ${taskCount} critical tasks`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Dados de inventário criados automaticamente!',
        stats: {
          skus_processed: existingSKUs.length,
          inventory_records: inventoryCount,
          slots_created: slotCount,
          critical_tasks: taskCount,
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
