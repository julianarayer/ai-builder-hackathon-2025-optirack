export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_snapshots: {
        Row: {
          abc_distribution: Json
          avg_distance_per_order_m: number | null
          created_at: string
          estimated_distance_reduction_pct: number | null
          estimated_time_saved_pct: number | null
          generated_at: string
          id: string
          method_notes: Json
          optimization_run_id: string | null
          order_distance_samples: Json | null
          target_sla_reduction_pct: number | null
          top_affinity_pairs: Json
          warehouse_id: string
        }
        Insert: {
          abc_distribution?: Json
          avg_distance_per_order_m?: number | null
          created_at?: string
          estimated_distance_reduction_pct?: number | null
          estimated_time_saved_pct?: number | null
          generated_at?: string
          id?: string
          method_notes?: Json
          optimization_run_id?: string | null
          order_distance_samples?: Json | null
          target_sla_reduction_pct?: number | null
          top_affinity_pairs?: Json
          warehouse_id: string
        }
        Update: {
          abc_distribution?: Json
          avg_distance_per_order_m?: number | null
          created_at?: string
          estimated_distance_reduction_pct?: number | null
          estimated_time_saved_pct?: number | null
          generated_at?: string
          id?: string
          method_notes?: Json
          optimization_run_id?: string | null
          order_distance_samples?: Json | null
          target_sla_reduction_pct?: number | null
          top_affinity_pairs?: Json
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_snapshots_optimization_run_id_fkey"
            columns: ["optimization_run_id"]
            isOneToOne: false
            referencedRelation: "optimization_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_snapshots_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_stats: {
        Row: {
          avg_daily: number
          calculated_at: string | null
          horizon_days: number
          id: string
          sku_id: string
          std_daily: number
          warehouse_id: string
        }
        Insert: {
          avg_daily?: number
          calculated_at?: string | null
          horizon_days?: number
          id?: string
          sku_id: string
          std_daily?: number
          warehouse_id: string
        }
        Update: {
          avg_daily?: number
          calculated_at?: string | null
          horizon_days?: number
          id?: string
          sku_id?: string
          std_daily?: number
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_stats_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_stats_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "v_top_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_stats_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_snapshots: {
        Row: {
          allocated: number
          created_at: string | null
          expiry_date: string | null
          id: string
          in_transit: number
          last_move_at: string | null
          lot: string | null
          on_hand: number
          pickface_max: number | null
          pickface_min: number | null
          sku_id: string
          updated_at: string | null
          warehouse_id: string
        }
        Insert: {
          allocated?: number
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          in_transit?: number
          last_move_at?: string | null
          lot?: string | null
          on_hand?: number
          pickface_max?: number | null
          pickface_min?: number | null
          sku_id: string
          updated_at?: string | null
          warehouse_id: string
        }
        Update: {
          allocated?: number
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          in_transit?: number
          last_move_at?: string | null
          lot?: string | null
          on_hand?: number
          pickface_max?: number | null
          pickface_min?: number | null
          sku_id?: string
          updated_at?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_snapshots_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_snapshots_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "v_top_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_snapshots_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      optimization_runs: {
        Row: {
          analysis_end_date: string | null
          analysis_start_date: string | null
          created_at: string | null
          current_avg_distance_per_order_m: number | null
          current_productivity_pieces_per_hour: number | null
          estimated_annual_cost_savings_usd: number | null
          estimated_annual_hours_saved: number | null
          estimated_distance_reduction_percent: number | null
          estimated_time_reduction_percent: number | null
          high_priority_count: number | null
          id: string
          low_priority_count: number | null
          medium_priority_count: number | null
          optimized_avg_distance_per_order_m: number | null
          optimized_productivity_pieces_per_hour: number | null
          processing_time_seconds: number | null
          productivity_improvement_percent: number | null
          recommendations_generated: number | null
          run_date: string | null
          total_orders_analyzed: number | null
          total_skus_analyzed: number | null
          warehouse_id: string
        }
        Insert: {
          analysis_end_date?: string | null
          analysis_start_date?: string | null
          created_at?: string | null
          current_avg_distance_per_order_m?: number | null
          current_productivity_pieces_per_hour?: number | null
          estimated_annual_cost_savings_usd?: number | null
          estimated_annual_hours_saved?: number | null
          estimated_distance_reduction_percent?: number | null
          estimated_time_reduction_percent?: number | null
          high_priority_count?: number | null
          id?: string
          low_priority_count?: number | null
          medium_priority_count?: number | null
          optimized_avg_distance_per_order_m?: number | null
          optimized_productivity_pieces_per_hour?: number | null
          processing_time_seconds?: number | null
          productivity_improvement_percent?: number | null
          recommendations_generated?: number | null
          run_date?: string | null
          total_orders_analyzed?: number | null
          total_skus_analyzed?: number | null
          warehouse_id: string
        }
        Update: {
          analysis_end_date?: string | null
          analysis_start_date?: string | null
          created_at?: string | null
          current_avg_distance_per_order_m?: number | null
          current_productivity_pieces_per_hour?: number | null
          estimated_annual_cost_savings_usd?: number | null
          estimated_annual_hours_saved?: number | null
          estimated_distance_reduction_percent?: number | null
          estimated_time_reduction_percent?: number | null
          high_priority_count?: number | null
          id?: string
          low_priority_count?: number | null
          medium_priority_count?: number | null
          optimized_avg_distance_per_order_m?: number | null
          optimized_productivity_pieces_per_hour?: number | null
          processing_time_seconds?: number | null
          productivity_improvement_percent?: number | null
          recommendations_generated?: number | null
          run_date?: string | null
          total_orders_analyzed?: number | null
          total_skus_analyzed?: number | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "optimization_runs_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          empty_slot_found: boolean | null
          id: string
          location_at_pick: string | null
          non_conformity_reason: string | null
          order_id: string
          pick_sequence: number | null
          picked_at: string | null
          quantity: number
          sku_id: string
          was_conforming: boolean | null
        }
        Insert: {
          created_at?: string | null
          empty_slot_found?: boolean | null
          id?: string
          location_at_pick?: string | null
          non_conformity_reason?: string | null
          order_id: string
          pick_sequence?: number | null
          picked_at?: string | null
          quantity: number
          sku_id: string
          was_conforming?: boolean | null
        }
        Update: {
          created_at?: string | null
          empty_slot_found?: boolean | null
          id?: string
          location_at_pick?: string | null
          non_conformity_reason?: string | null
          order_id?: string
          pick_sequence?: number | null
          picked_at?: string | null
          quantity?: number
          sku_id?: string
          was_conforming?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "v_top_skus"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          order_code: string
          order_date: string
          picking_time_minutes: number | null
          processed_at: string | null
          processing_time_minutes: number | null
          received_at: string | null
          shipped_at: string | null
          total_distance_traveled_m: number | null
          total_items: number | null
          total_picks: number | null
          warehouse_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_code: string
          order_date: string
          picking_time_minutes?: number | null
          processed_at?: string | null
          processing_time_minutes?: number | null
          received_at?: string | null
          shipped_at?: string | null
          total_distance_traveled_m?: number | null
          total_items?: number | null
          total_picks?: number | null
          warehouse_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_code?: string
          order_date?: string
          picking_time_minutes?: number | null
          processed_at?: string | null
          processing_time_minutes?: number | null
          received_at?: string | null
          shipped_at?: string | null
          total_distance_traveled_m?: number | null
          total_items?: number | null
          total_picks?: number | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      product_affinity: {
        Row: {
          calculated_at: string | null
          co_occurrence_count: number
          confidence: number | null
          current_distance_m: number | null
          id: string
          lift: number | null
          recommended_action: string | null
          sku_a_id: string
          sku_b_id: string
          support: number | null
          total_orders: number | null
          total_orders_with_a: number | null
          total_orders_with_b: number | null
          warehouse_id: string
        }
        Insert: {
          calculated_at?: string | null
          co_occurrence_count?: number
          confidence?: number | null
          current_distance_m?: number | null
          id?: string
          lift?: number | null
          recommended_action?: string | null
          sku_a_id: string
          sku_b_id: string
          support?: number | null
          total_orders?: number | null
          total_orders_with_a?: number | null
          total_orders_with_b?: number | null
          warehouse_id: string
        }
        Update: {
          calculated_at?: string | null
          co_occurrence_count?: number
          confidence?: number | null
          current_distance_m?: number | null
          id?: string
          lift?: number | null
          recommended_action?: string | null
          sku_a_id?: string
          sku_b_id?: string
          support?: number | null
          total_orders?: number | null
          total_orders_with_a?: number | null
          total_orders_with_b?: number | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_affinity_sku_a_id_fkey"
            columns: ["sku_a_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_affinity_sku_a_id_fkey"
            columns: ["sku_a_id"]
            isOneToOne: false
            referencedRelation: "v_top_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_affinity_sku_b_id_fkey"
            columns: ["sku_b_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_affinity_sku_b_id_fkey"
            columns: ["sku_b_id"]
            isOneToOne: false
            referencedRelation: "v_top_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_affinity_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      replenishment_rules: {
        Row: {
          created_at: string | null
          id: string
          lead_time_days: number
          pickface_max: number
          pickface_min: number
          sku_id: string
          updated_at: string | null
          warehouse_id: string
          z_value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_time_days?: number
          pickface_max?: number
          pickface_min?: number
          sku_id: string
          updated_at?: string | null
          warehouse_id: string
          z_value?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_time_days?: number
          pickface_max?: number
          pickface_min?: number
          sku_id?: string
          updated_at?: string | null
          warehouse_id?: string
          z_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "replenishment_rules_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replenishment_rules_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "v_top_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replenishment_rules_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      skus: {
        Row: {
          category: string | null
          created_at: string | null
          current_location: string | null
          current_zone: string | null
          dimensions: Json | null
          empty_slot_incidents: number | null
          id: string
          last_analyzed_at: string | null
          non_conformity_count: number | null
          pick_frequency: number | null
          pick_frequency_monthly: number | null
          recommended_location: string | null
          recommended_zone: string | null
          sku_code: string
          sku_name: string | null
          updated_at: string | null
          velocity_class: string | null
          warehouse_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          current_location?: string | null
          current_zone?: string | null
          dimensions?: Json | null
          empty_slot_incidents?: number | null
          id?: string
          last_analyzed_at?: string | null
          non_conformity_count?: number | null
          pick_frequency?: number | null
          pick_frequency_monthly?: number | null
          recommended_location?: string | null
          recommended_zone?: string | null
          sku_code: string
          sku_name?: string | null
          updated_at?: string | null
          velocity_class?: string | null
          warehouse_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          current_location?: string | null
          current_zone?: string | null
          dimensions?: Json | null
          empty_slot_incidents?: number | null
          id?: string
          last_analyzed_at?: string | null
          non_conformity_count?: number | null
          pick_frequency?: number | null
          pick_frequency_monthly?: number | null
          recommended_location?: string | null
          recommended_zone?: string | null
          sku_code?: string
          sku_name?: string | null
          updated_at?: string | null
          velocity_class?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skus_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      slot_capacity: {
        Row: {
          capacity_units: number
          capacity_weight: number | null
          created_at: string | null
          current_sku_id: string | null
          distance_to_pack: number | null
          id: string
          occupied_pct: number
          slot_id: string
          updated_at: string | null
          warehouse_id: string
          zone: string | null
        }
        Insert: {
          capacity_units?: number
          capacity_weight?: number | null
          created_at?: string | null
          current_sku_id?: string | null
          distance_to_pack?: number | null
          id?: string
          occupied_pct?: number
          slot_id: string
          updated_at?: string | null
          warehouse_id: string
          zone?: string | null
        }
        Update: {
          capacity_units?: number
          capacity_weight?: number | null
          created_at?: string | null
          current_sku_id?: string | null
          distance_to_pack?: number | null
          id?: string
          occupied_pct?: number
          slot_id?: string
          updated_at?: string | null
          warehouse_id?: string
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slot_capacity_current_sku_id_fkey"
            columns: ["current_sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_capacity_current_sku_id_fkey"
            columns: ["current_sku_id"]
            isOneToOne: false
            referencedRelation: "v_top_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_capacity_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      slotting_recommendations: {
        Row: {
          affinity_note: string | null
          applied_at: string | null
          applied_by: string | null
          created_at: string | null
          current_location: string
          current_zone: string | null
          distance_saved_per_pick_m: number | null
          estimated_improvement_percent: number | null
          id: string
          optimization_run_id: string | null
          priority: number | null
          reason: string
          recommended_location: string
          recommended_zone: string | null
          rejected_at: string | null
          rejection_reason: string | null
          related_skus: string[] | null
          sku_id: string
          status: string | null
          warehouse_id: string
        }
        Insert: {
          affinity_note?: string | null
          applied_at?: string | null
          applied_by?: string | null
          created_at?: string | null
          current_location: string
          current_zone?: string | null
          distance_saved_per_pick_m?: number | null
          estimated_improvement_percent?: number | null
          id?: string
          optimization_run_id?: string | null
          priority?: number | null
          reason: string
          recommended_location: string
          recommended_zone?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          related_skus?: string[] | null
          sku_id: string
          status?: string | null
          warehouse_id: string
        }
        Update: {
          affinity_note?: string | null
          applied_at?: string | null
          applied_by?: string | null
          created_at?: string | null
          current_location?: string
          current_zone?: string | null
          distance_saved_per_pick_m?: number | null
          estimated_improvement_percent?: number | null
          id?: string
          optimization_run_id?: string | null
          priority?: number | null
          reason?: string
          recommended_location?: string
          recommended_zone?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          related_skus?: string[] | null
          sku_id?: string
          status?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slotting_recommendations_optimization_run_id_fkey"
            columns: ["optimization_run_id"]
            isOneToOne: false
            referencedRelation: "optimization_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slotting_recommendations_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slotting_recommendations_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "v_top_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slotting_recommendations_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks_queue: {
        Row: {
          assignee: string | null
          completed_at: string | null
          created_at: string | null
          from_slot: string | null
          id: string
          notes: string | null
          priority: number
          qty: number | null
          sku_id: string | null
          status: string
          task_type: string
          to_slot: string | null
          updated_at: string | null
          warehouse_id: string
        }
        Insert: {
          assignee?: string | null
          completed_at?: string | null
          created_at?: string | null
          from_slot?: string | null
          id?: string
          notes?: string | null
          priority?: number
          qty?: number | null
          sku_id?: string | null
          status?: string
          task_type: string
          to_slot?: string | null
          updated_at?: string | null
          warehouse_id: string
        }
        Update: {
          assignee?: string | null
          completed_at?: string | null
          created_at?: string | null
          from_slot?: string | null
          id?: string
          notes?: string | null
          priority?: number
          qty?: number | null
          sku_id?: string | null
          status?: string
          task_type?: string
          to_slot?: string | null
          updated_at?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_queue_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_queue_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "v_top_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_queue_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_kpis: {
        Row: {
          avg_order_processing_time_minutes: number | null
          created_at: string | null
          date: string
          empty_slot_incidents: number | null
          id: string
          inspection_error_rate_percent: number | null
          inspection_errors_found: number | null
          inventory_accuracy_percent: number | null
          on_time_shipment_percent: number | null
          picking_accuracy_percent: number | null
          picking_productivity_pieces_per_hour: number | null
          putaway_productivity_pallets_per_hour: number | null
          receiving_non_conformities: number | null
          receiving_productivity_pieces_per_hour: number | null
          total_distance_traveled_km: number | null
          total_items_picked: number | null
          total_orders_processed: number | null
          warehouse_id: string
        }
        Insert: {
          avg_order_processing_time_minutes?: number | null
          created_at?: string | null
          date: string
          empty_slot_incidents?: number | null
          id?: string
          inspection_error_rate_percent?: number | null
          inspection_errors_found?: number | null
          inventory_accuracy_percent?: number | null
          on_time_shipment_percent?: number | null
          picking_accuracy_percent?: number | null
          picking_productivity_pieces_per_hour?: number | null
          putaway_productivity_pallets_per_hour?: number | null
          receiving_non_conformities?: number | null
          receiving_productivity_pieces_per_hour?: number | null
          total_distance_traveled_km?: number | null
          total_items_picked?: number | null
          total_orders_processed?: number | null
          warehouse_id: string
        }
        Update: {
          avg_order_processing_time_minutes?: number | null
          created_at?: string | null
          date?: string
          empty_slot_incidents?: number | null
          id?: string
          inspection_error_rate_percent?: number | null
          inspection_errors_found?: number | null
          inventory_accuracy_percent?: number | null
          on_time_shipment_percent?: number | null
          picking_accuracy_percent?: number | null
          picking_productivity_pieces_per_hour?: number | null
          putaway_productivity_pallets_per_hour?: number | null
          receiving_non_conformities?: number | null
          receiving_productivity_pieces_per_hour?: number | null
          total_distance_traveled_km?: number | null
          total_items_picked?: number | null
          total_orders_processed?: number | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_kpis_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_profiles: {
        Row: {
          approximate_positions: number | null
          blocking_rules: string | null
          created_at: string | null
          family_separation_rules: string | null
          id: string
          layout_drawing_data: Json | null
          layout_image_url: string | null
          max_picking_to_packing_distance_m: number | null
          num_sectors: number | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          operation_type: string | null
          prioritize_fast_movers: boolean | null
          separate_by_families: boolean | null
          total_area_sqm: number | null
          updated_at: string | null
          useful_height_m: number | null
          user_id: string
          zones: Json | null
        }
        Insert: {
          approximate_positions?: number | null
          blocking_rules?: string | null
          created_at?: string | null
          family_separation_rules?: string | null
          id?: string
          layout_drawing_data?: Json | null
          layout_image_url?: string | null
          max_picking_to_packing_distance_m?: number | null
          num_sectors?: number | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          operation_type?: string | null
          prioritize_fast_movers?: boolean | null
          separate_by_families?: boolean | null
          total_area_sqm?: number | null
          updated_at?: string | null
          useful_height_m?: number | null
          user_id: string
          zones?: Json | null
        }
        Update: {
          approximate_positions?: number | null
          blocking_rules?: string | null
          created_at?: string | null
          family_separation_rules?: string | null
          id?: string
          layout_drawing_data?: Json | null
          layout_image_url?: string | null
          max_picking_to_packing_distance_m?: number | null
          num_sectors?: number | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          operation_type?: string | null
          prioritize_fast_movers?: boolean | null
          separate_by_families?: boolean | null
          total_area_sqm?: number | null
          updated_at?: string | null
          useful_height_m?: number | null
          user_id?: string
          zones?: Json | null
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          created_at: string | null
          id: string
          layout_config: Json | null
          name: string
          total_locations: number | null
          total_zones: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          layout_config?: Json | null
          name: string
          total_locations?: number | null
          total_zones?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          layout_config?: Json | null
          name?: string
          total_locations?: number | null
          total_zones?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_abc_distribution: {
        Row: {
          percentage: number | null
          sku_count: number | null
          velocity_class: string | null
          warehouse_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skus_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      v_pending_recommendations: {
        Row: {
          affinity_note: string | null
          applied_at: string | null
          applied_by: string | null
          created_at: string | null
          current_location: string | null
          current_zone: string | null
          distance_saved_per_pick_m: number | null
          estimated_improvement_percent: number | null
          id: string | null
          optimization_run_id: string | null
          priority: number | null
          reason: string | null
          recommended_location: string | null
          recommended_zone: string | null
          rejected_at: string | null
          rejection_reason: string | null
          related_skus: string[] | null
          sku_code: string | null
          sku_id: string | null
          sku_name: string | null
          status: string | null
          velocity_class: string | null
          warehouse_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slotting_recommendations_optimization_run_id_fkey"
            columns: ["optimization_run_id"]
            isOneToOne: false
            referencedRelation: "optimization_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slotting_recommendations_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slotting_recommendations_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "v_top_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slotting_recommendations_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      v_top_skus: {
        Row: {
          current_location: string | null
          id: string | null
          pick_frequency: number | null
          recommended_location: string | null
          sku_code: string | null
          sku_name: string | null
          velocity_class: string | null
          warehouse_id: string | null
        }
        Insert: {
          current_location?: string | null
          id?: string | null
          pick_frequency?: number | null
          recommended_location?: string | null
          sku_code?: string | null
          sku_name?: string | null
          velocity_class?: string | null
          warehouse_id?: string | null
        }
        Update: {
          current_location?: string | null
          id?: string | null
          pick_frequency?: number | null
          recommended_location?: string | null
          sku_code?: string | null
          sku_name?: string | null
          velocity_class?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skus_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
