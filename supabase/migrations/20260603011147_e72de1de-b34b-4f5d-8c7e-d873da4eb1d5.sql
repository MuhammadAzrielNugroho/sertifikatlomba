
CREATE TABLE public.certificates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  competition TEXT NOT NULL,
  rank TEXT NOT NULL,
  date TEXT NOT NULL,
  issuer TEXT NOT NULL,
  hash TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.certificates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read certificates"
  ON public.certificates FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (true);
