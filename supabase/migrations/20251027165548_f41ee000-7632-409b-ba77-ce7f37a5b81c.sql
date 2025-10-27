-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'voter', 'petitioner');

-- Create enum for event status
CREATE TYPE public.event_status AS ENUM ('draft', 'active', 'completed', 'cancelled');

-- Create enum for vote choice
CREATE TYPE public.vote_choice AS ENUM ('yes', 'no', 'abstain');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  wallet_address TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create voting_events table
CREATE TABLE public.voting_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status event_status NOT NULL DEFAULT 'draft',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  options JSONB NOT NULL DEFAULT '[]', -- Array of voting options
  blockchain_hash TEXT, -- Simulated blockchain verification hash
  total_votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create petition_events table
CREATE TABLE public.petition_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status event_status NOT NULL DEFAULT 'draft',
  target_signatures INTEGER NOT NULL DEFAULT 1000,
  current_signatures INTEGER NOT NULL DEFAULT 0,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  blockchain_hash TEXT, -- Simulated blockchain verification hash
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voting_event_id UUID REFERENCES public.voting_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_option TEXT NOT NULL,
  blockchain_hash TEXT, -- Simulated blockchain verification hash
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(voting_event_id, user_id) -- One vote per user per event
);

-- Create petition_signatures table
CREATE TABLE public.petition_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id UUID REFERENCES public.petition_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment TEXT,
  blockchain_hash TEXT, -- Simulated blockchain verification hash
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(petition_id, user_id) -- One signature per user per petition
);

-- Create blockchain_transactions table for simulated blockchain
CREATE TABLE public.blockchain_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL, -- 'vote', 'petition', 'event_creation'
  transaction_hash TEXT UNIQUE NOT NULL,
  block_number BIGINT NOT NULL,
  related_id UUID, -- Related event/vote/petition ID
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for voting_events
CREATE POLICY "Anyone can view active voting events"
  ON public.voting_events FOR SELECT
  TO authenticated
  USING (status = 'active' OR created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create voting events"
  ON public.voting_events FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update voting events"
  ON public.voting_events FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete voting events"
  ON public.voting_events FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for petition_events
CREATE POLICY "Anyone can view active petitions"
  ON public.petition_events FOR SELECT
  TO authenticated
  USING (status = 'active' OR created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Petitioners can create petitions"
  ON public.petition_events FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'petitioner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Creators and admins can update petitions"
  ON public.petition_events FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete petitions"
  ON public.petition_events FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for votes
CREATE POLICY "Users can view their own votes"
  ON public.votes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Voters can cast votes"
  ON public.votes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'voter'));

-- RLS Policies for petition_signatures
CREATE POLICY "Users can view all signatures"
  ON public.petition_signatures FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can sign petitions"
  ON public.petition_signatures FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for blockchain_transactions
CREATE POLICY "Users can view all blockchain transactions"
  ON public.blockchain_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert blockchain transactions"
  ON public.blockchain_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_voting_events
  BEFORE UPDATE ON public.voting_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_petition_events
  BEFORE UPDATE ON public.petition_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Assign default voter role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'voter');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to increment vote count
CREATE OR REPLACE FUNCTION public.increment_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.voting_events
  SET total_votes = total_votes + 1
  WHERE id = NEW.voting_event_id;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-increment vote count
CREATE TRIGGER on_vote_cast
  AFTER INSERT ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_vote_count();

-- Create function to increment petition signatures
CREATE OR REPLACE FUNCTION public.increment_signature_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.petition_events
  SET current_signatures = current_signatures + 1
  WHERE id = NEW.petition_id;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-increment signature count
CREATE TRIGGER on_petition_signed
  AFTER INSERT ON public.petition_signatures
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_signature_count();