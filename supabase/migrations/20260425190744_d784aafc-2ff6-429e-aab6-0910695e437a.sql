-- Enums
CREATE TYPE public.app_role AS ENUM ('tourist', 'partner');
CREATE TYPE public.tx_category AS ENUM ('Hotel', 'Restaurant', 'Activity', 'Transport', 'Top-up', 'Souvenir');
CREATE TYPE public.booking_status AS ENUM ('confirmed', 'redeemed', 'cancelled');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'tourist',
  home_country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role (security definer to avoid recursion)
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS public.app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.profiles WHERE id = auth.uid() $$;

CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Partners
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partners read all auth" ON public.partners FOR SELECT TO authenticated USING (true);
CREATE POLICY "partners owner update" ON public.partners FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "partners owner insert" ON public.partners FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

-- Wallets
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  topped_up NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallets owner read" ON public.wallets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "wallets owner insert" ON public.wallets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- Updates only via security-definer functions / edge functions; no UPDATE policy

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  partner_name TEXT NOT NULL,
  category public.tx_category NOT NULL,
  amount NUMERIC(12,2) NOT NULL, -- negative = spend, positive = top-up
  discount NUMERIC(12,2),
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tx owner read" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "tx partner read" ON public.transactions FOR SELECT TO authenticated USING (
  partner_id IN (SELECT id FROM public.partners WHERE owner_id = auth.uid())
);

-- Offers
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  discount NUMERIC(5,2) NOT NULL,
  valid_time TEXT,
  category TEXT,
  redemption_type TEXT NOT NULL DEFAULT 'single_use',
  active BOOLEAN NOT NULL DEFAULT true,
  redemptions INT NOT NULL DEFAULT 0,
  views INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offers read all auth" ON public.offers FOR SELECT TO authenticated USING (true);
CREATE POLICY "offers partner manage" ON public.offers FOR ALL TO authenticated
  USING (partner_id IN (SELECT id FROM public.partners WHERE owner_id = auth.uid()))
  WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE owner_id = auth.uid()));

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  partner_name TEXT NOT NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  offer_title TEXT,
  booking_time TEXT NOT NULL,
  booking_date TEXT NOT NULL,
  people INT NOT NULL DEFAULT 1,
  status public.booking_status NOT NULL DEFAULT 'confirmed',
  estimated_discount NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings owner read" ON public.bookings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "bookings owner insert" ON public.bookings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "bookings owner update" ON public.bookings FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "bookings partner read" ON public.bookings FOR SELECT TO authenticated USING (
  partner_id IN (SELECT id FROM public.partners WHERE owner_id = auth.uid())
);
CREATE POLICY "bookings partner update" ON public.bookings FOR UPDATE TO authenticated USING (
  partner_id IN (SELECT id FROM public.partners WHERE owner_id = auth.uid())
);

-- Auto-create profile + wallet on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role public.app_role;
  v_name TEXT;
  v_country TEXT;
BEGIN
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'tourist');
  v_name := COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1));
  v_country := NEW.raw_user_meta_data->>'home_country';

  INSERT INTO public.profiles (id, display_name, role, home_country)
  VALUES (NEW.id, v_name, v_role, v_country);

  IF v_role = 'tourist' THEN
    INSERT INTO public.wallets (user_id, balance, topped_up) VALUES (NEW.id, 0, 0);
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atomic spend: deducts balance and inserts a transaction in one go
CREATE OR REPLACE FUNCTION public.wallet_spend(
  p_partner_id UUID,
  p_partner_name TEXT,
  p_category public.tx_category,
  p_amount NUMERIC,        -- positive number
  p_discount NUMERIC DEFAULT NULL,
  p_icon TEXT DEFAULT NULL,
  p_booking_id UUID DEFAULT NULL
) RETURNS public.transactions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_wallet public.wallets;
  v_tx public.transactions;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;

  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  IF v_wallet.balance < p_amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  UPDATE public.wallets SET balance = balance - p_amount WHERE id = v_wallet.id;

  INSERT INTO public.transactions (wallet_id, user_id, partner_id, partner_name, category, amount, discount, icon)
  VALUES (v_wallet.id, auth.uid(), p_partner_id, p_partner_name, p_category, -p_amount, p_discount, p_icon)
  RETURNING * INTO v_tx;

  IF p_booking_id IS NOT NULL THEN
    UPDATE public.bookings SET status = 'redeemed' WHERE id = p_booking_id AND user_id = auth.uid();
  END IF;

  RETURN v_tx;
END $$;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;

-- Seed: Alpine Fondue House (no owner yet — Marco claims it on signup via flow)
INSERT INTO public.partners (id, name, category, location, description)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Alpine Fondue House',
  'Restaurant',
  'Interlaken',
  'Traditional Swiss fondue & raclette, two minutes from the Höhematte.'
);

INSERT INTO public.offers (partner_id, title, discount, valid_time, category, active)
VALUES
  ('11111111-1111-1111-1111-111111111111', '20% off fondue dishes', 20, '18:00 – 19:00', 'Restaurant', true),
  ('11111111-1111-1111-1111-111111111111', '15% off lunch menu', 15, '11:30 – 13:30', 'Restaurant', false);