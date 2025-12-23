-- Vytvořit tabulku voting_tokens pro jednorázové QR kódy
CREATE TABLE public.voting_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(32) UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vytvořit tabulku charities
CREATE TABLE public.charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vytvořit tabulku charity_votes s referencí na token místo user_email
CREATE TABLE public.charity_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
  token_id UUID NOT NULL UNIQUE REFERENCES public.voting_tokens(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.voting_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_votes ENABLE ROW LEVEL SECURITY;

-- RLS politiky pro voting_tokens (veřejné čtení a update pro označení jako použitý)
CREATE POLICY "Anyone can read voting tokens"
  ON public.voting_tokens
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update voting tokens to mark as used"
  ON public.voting_tokens
  FOR UPDATE
  USING (true)
  WITH CHECK (is_used = true);

-- RLS politiky pro charities (veřejné čtení)
CREATE POLICY "Anyone can read charities"
  ON public.charities
  FOR SELECT
  USING (true);

-- RLS politiky pro charity_votes (veřejné čtení a vkládání)
CREATE POLICY "Anyone can read charity votes"
  ON public.charity_votes
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert charity votes"
  ON public.charity_votes
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime pro hlasování
ALTER PUBLICATION supabase_realtime ADD TABLE public.charity_votes;

-- Vygenerovat 200 unikátních tokenů
INSERT INTO public.voting_tokens (token)
SELECT substr(md5(random()::text || clock_timestamp()::text), 1, 12)
FROM generate_series(1, 200);

-- Vložit ukázkové charity (můžeš upravit podle potřeby)
INSERT INTO public.charities (name, description) VALUES
  ('Člověk v tísni', 'Pomáháme lidem v nouzi po celém světě'),
  ('UNICEF', 'Pomáháme dětem po celém světě'),
  ('Lékaři bez hranic', 'Poskytujeme lékařskou pomoc tam, kde je to nejvíce potřeba');