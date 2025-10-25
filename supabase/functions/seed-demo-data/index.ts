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

    // Create product affinity pairs
    let affinityCount = 0
    const skusByClass = {
      A: existingSKUs.filter(s => s.velocity_class === 'A'),
      B: existingSKUs.filter(s => s.velocity_class === 'B'),
      C: existingSKUs.filter(s => s.velocity_class === 'C'),
      D: existingSKUs.filter(s => s.velocity_class === 'D'),
    }

    // Create affinity pairs within same class (high affinity)
    for (const velocityClass of ['A', 'B', 'C'] as const) {
      const skusInClass = skusByClass[velocityClass] || []
      
      for (let i = 0; i < skusInClass.length && i < 5; i++) {
        for (let j = i + 1; j < skusInClass.length && j < 5; j++) {
          const skuA = skusInClass[i]
          const skuB = skusInClass[j]
          
          // High affinity for same class
          const coOccurrence = Math.floor(30 + Math.random() * 40)
          const totalOrders = 150
          const ordersWithA = Math.floor(50 + Math.random() * 30)
          const ordersWithB = Math.floor(45 + Math.random() * 30)
          
          const support = coOccurrence / totalOrders
          const confidence = coOccurrence / ordersWithA
          const expectedCoOccurrence = (ordersWithA * ordersWithB) / totalOrders
          const lift = coOccurrence / expectedCoOccurrence

          const { error: affinityError } = await supabaseClient
            .from('product_affinity')
            .upsert({
              warehouse_id: warehouseId,
              sku_a_id: skuA.id,
              sku_b_id: skuB.id,
              co_occurrence_count: coOccurrence,
              support: support,
              confidence: confidence,
              lift: lift,
              total_orders: totalOrders,
              total_orders_with_a: ordersWithA,
              total_orders_with_b: ordersWithB,
              current_distance_m: Math.random() > 0.5 ? 25 + Math.random() * 40 : null,
              recommended_action: lift > 2.0 ? 'Aproximar estes produtos para reduzir distância de picking' : null
            }, { onConflict: 'warehouse_id,sku_a_id,sku_b_id' })

          if (!affinityError) affinityCount++
        }
      }
    }

    // Create some cross-class affinity pairs (medium affinity)
    const classAPairs: Array<{ from: 'A' | 'B' | 'C' | 'D', to: 'A' | 'B' | 'C' | 'D', count: number }> = [
      { from: 'A', to: 'B', count: 3 },
      { from: 'A', to: 'C', count: 2 },
      { from: 'B', to: 'C', count: 2 },
    ]

    for (const pair of classAPairs) {
      const fromSkus = skusByClass[pair.from] || []
      const toSkus = skusByClass[pair.to] || []

      for (let i = 0; i < Math.min(pair.count, fromSkus.length); i++) {
        const toIdx = Math.floor(Math.random() * toSkus.length)
        if (toIdx < toSkus.length) {
          const skuA = fromSkus[i]
          const skuB = toSkus[toIdx]

          const coOccurrence = Math.floor(15 + Math.random() * 25)
          const totalOrders = 150
          const ordersWithA = Math.floor(40 + Math.random() * 25)
          const ordersWithB = Math.floor(35 + Math.random() * 25)
          
          const support = coOccurrence / totalOrders
          const confidence = coOccurrence / ordersWithA
          const expectedCoOccurrence = (ordersWithA * ordersWithB) / totalOrders
          const lift = coOccurrence / expectedCoOccurrence

          const { error: affinityError } = await supabaseClient
            .from('product_affinity')
            .upsert({
              warehouse_id: warehouseId,
              sku_a_id: skuA.id,
              sku_b_id: skuB.id,
              co_occurrence_count: coOccurrence,
              support: support,
              confidence: confidence,
              lift: lift,
              total_orders: totalOrders,
              total_orders_with_a: ordersWithA,
              total_orders_with_b: ordersWithB,
              current_distance_m: Math.random() > 0.5 ? 30 + Math.random() * 50 : null,
              recommended_action: lift > 1.8 ? 'Considerar aproximar estes produtos' : null
            }, { onConflict: 'warehouse_id,sku_a_id,sku_b_id' })

          if (!affinityError) affinityCount++
        }
      }
    }

    console.log(`Created ${affinityCount} product affinity pairs`)

    // Create realistic order history (last 90 days)
    console.log('Creating order history...')
    let orderCount = 0
    let orderItemCount = 0
    
    const ordersToCreate = 200 + Math.floor(Math.random() * 100) // 200-300 orders
    const today = new Date()
    
    for (let i = 0; i < ordersToCreate; i++) {
      // Random date in last 90 days
      const daysAgo = Math.floor(Math.random() * 90)
      const orderDate = new Date(today)
      orderDate.setDate(orderDate.getDate() - daysAgo)
      
      // Create order
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          warehouse_id: warehouseId,
          order_code: `ORD-${String(i + 1).padStart(6, '0')}`,
          order_date: orderDate.toISOString().split('T')[0],
          total_items: 0, // Will update after items
          total_picks: 0,
          picking_time_minutes: null,
          total_distance_traveled_m: null,
        })
        .select()
        .single()
      
      if (orderError || !order) continue
      orderCount++
      
      // Determine number of items per order (4-10 items)
      const numItems = 4 + Math.floor(Math.random() * 7)
      const orderItems = []
      const usedSkuIds = new Set()
      
      // Select SKUs based on velocity distribution
      for (let j = 0; j < numItems; j++) {
        let selectedSku = null
        const rand = Math.random()
        
        // 60% chance for A, 25% for B, 12% for C, 3% for D
        if (rand < 0.60 && skusByClass.A && skusByClass.A.length > 0) {
          const availableA = skusByClass.A.filter(s => !usedSkuIds.has(s.id))
          if (availableA.length > 0) {
            selectedSku = availableA[Math.floor(Math.random() * availableA.length)]
          }
        } else if (rand < 0.85 && skusByClass.B && skusByClass.B.length > 0) {
          const availableB = skusByClass.B.filter(s => !usedSkuIds.has(s.id))
          if (availableB.length > 0) {
            selectedSku = availableB[Math.floor(Math.random() * availableB.length)]
          }
        } else if (rand < 0.97 && skusByClass.C && skusByClass.C.length > 0) {
          const availableC = skusByClass.C.filter(s => !usedSkuIds.has(s.id))
          if (availableC.length > 0) {
            selectedSku = availableC[Math.floor(Math.random() * availableC.length)]
          }
        } else if (skusByClass.D && skusByClass.D.length > 0) {
          const availableD = skusByClass.D.filter(s => !usedSkuIds.has(s.id))
          if (availableD.length > 0) {
            selectedSku = availableD[Math.floor(Math.random() * availableD.length)]
          }
        }
        
        // Fallback to any SKU if selection failed
        if (!selectedSku) {
          const allAvailable = existingSKUs.filter(s => !usedSkuIds.has(s.id))
          if (allAvailable.length > 0) {
            selectedSku = allAvailable[Math.floor(Math.random() * allAvailable.length)]
          }
        }
        
        if (selectedSku) {
          usedSkuIds.add(selectedSku.id)
          orderItems.push({
            order_id: order.id,
            sku_id: selectedSku.id,
            quantity: 1 + Math.floor(Math.random() * 3),
            pick_sequence: j + 1,
          })
        }
      }
      
      // Insert order items
      if (orderItems.length > 0) {
        const { error: itemsError } = await supabaseClient
          .from('order_items')
          .insert(orderItems)
        
        if (!itemsError) {
          orderItemCount += orderItems.length
          
          // Calculate realistic metrics
          const pickingTime = 3 + (orderItems.length * 2) + Math.floor(Math.random() * 5)
          const distanceTraveled = (15 + (orderItems.length * 8) + Math.floor(Math.random() * 20))
          
          // Update order with totals
          await supabaseClient
            .from('orders')
            .update({
              total_items: orderItems.length,
              total_picks: orderItems.length,
              picking_time_minutes: pickingTime,
              total_distance_traveled_m: distanceTraveled,
            })
            .eq('id', order.id)
        }
      }
    }
    
    console.log(`Created ${orderCount} orders with ${orderItemCount} items`)

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

    // Trigger warehouse analysis automatically
    console.log('Triggering automatic warehouse analysis...')
    try {
      const analysisResponse = await supabaseClient.functions.invoke('analyze-warehouse', {
        body: { warehouse_id: warehouseId }
      })
      
      if (analysisResponse.error) {
        console.error('Auto-analysis failed:', analysisResponse.error)
      } else {
        console.log('Auto-analysis completed successfully')
      }
    } catch (analysisError) {
      console.error('Error triggering analysis:', analysisError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo data seeded successfully with automatic analysis',
        stats: {
          skus_processed: existingSKUs.length,
          inventory_records: inventoryCount,
          affinity_pairs: affinityCount,
          orders_created: orderCount,
          order_items: orderItemCount,
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
