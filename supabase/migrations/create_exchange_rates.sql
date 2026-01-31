-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id BIGSERIAL PRIMARY KEY,
  official_rate DECIMAL(10, 6) NOT NULL,
  manual_adjustment DECIMAL(5, 4) NOT NULL DEFAULT 0.95,
  effective_rate DECIMAL(10, 6) GENERATED ALWAYS AS (official_rate * manual_adjustment) STORED,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exchange_rates_active ON public.exchange_rates (is_active, created_at DESC);

-- Enable RLS
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Public read policy (everyone can read active rates)
CREATE POLICY "exchange_rates_public_read" ON public.exchange_rates
  FOR SELECT
  USING (is_active = true);

-- Admin write policy (only admins can insert/update)
CREATE POLICY "exchange_rates_admin_write" ON public.exchange_rates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE clerk_id = auth.jwt() ->> 'sub'
      AND is_admin = true
    )
  );

-- Grant permissions
GRANT SELECT ON public.exchange_rates TO anon, authenticated;
GRANT INSERT, UPDATE ON public.exchange_rates TO authenticated;

-- Insert default rate
INSERT INTO public.exchange_rates (official_rate, manual_adjustment, notes, is_active)
VALUES (1.32, 0.95, 'Taxa inicial padrão', true)
ON CONFLICT DO NOTHING;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_exchange_rate_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exchange_rates_updated_at
  BEFORE UPDATE ON public.exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_exchange_rate_timestamp();
