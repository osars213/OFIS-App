-- ============================================================================
-- OFIS 2.0 MINIMAL MIGRATION: ADD PRICING_RULES COLUMN TO PUBLIC.SPACES
-- ============================================================================

-- 1. Add pricing_rules JSONB column to public.spaces
ALTER TABLE public.spaces 
ADD COLUMN IF NOT EXISTS pricing_rules JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Populate test pricing rules directly on the existing space
UPDATE public.spaces 
SET pricing_rules = '{
  "promotionalDiscountPercent": 20,
  "weekendMarkupPercent": 15,
  "weekendMultiplier": 1.15,
  "dailyDiscountPercent": 10
}'::jsonb
WHERE id = 'space-sandbox-test-1';
