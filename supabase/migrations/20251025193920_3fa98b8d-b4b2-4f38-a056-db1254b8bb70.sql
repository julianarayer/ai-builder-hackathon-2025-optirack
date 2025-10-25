-- Create warehouse_profiles table for onboarding data
CREATE TABLE IF NOT EXISTS public.warehouse_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Step 1: Operation type
  operation_type TEXT CHECK (operation_type IN ('cd', 'retail')),
  
  -- Step 2: Dimensions and restrictions
  total_area_sqm NUMERIC,
  useful_height_m NUMERIC,
  approximate_positions INTEGER,
  num_sectors INTEGER,
  
  -- Zones (JSONB for flexibility)
  zones JSONB DEFAULT '[]'::jsonb,
  
  -- Policies
  max_picking_to_packing_distance_m NUMERIC,
  prioritize_fast_movers BOOLEAN DEFAULT true,
  separate_by_families BOOLEAN DEFAULT false,
  family_separation_rules TEXT,
  blocking_rules TEXT,
  
  -- Step 3: Layout reference
  layout_image_url TEXT,
  layout_drawing_data JSONB,
  
  -- Metadata
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 1 CHECK (onboarding_step BETWEEN 1 AND 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.warehouse_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own warehouse profile"
  ON public.warehouse_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own warehouse profile"
  ON public.warehouse_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own warehouse profile"
  ON public.warehouse_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER set_warehouse_profiles_updated_at
  BEFORE UPDATE ON public.warehouse_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();