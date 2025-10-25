-- Fix security warning: Set search_path for update_sku_pick_frequency function
CREATE OR REPLACE FUNCTION update_sku_pick_frequency()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE skus 
  SET 
    pick_frequency = pick_frequency + NEW.quantity,
    updated_at = NOW()
  WHERE id = NEW.sku_id;
  
  RETURN NEW;
END;
$$;