-- Create event_templates table
CREATE TABLE IF NOT EXISTS public.event_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('voting', 'petition', 'survey')),
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create contract_deployments table
CREATE TABLE IF NOT EXISTS public.contract_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.event_templates(id) ON DELETE CASCADE NOT NULL,
  contract_address TEXT NOT NULL,
  network_id TEXT NOT NULL,
  deployer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deployment_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  block_number BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'deployed' CHECK (status IN ('pending', 'deployed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create ipfs_objects table
CREATE TABLE IF NOT EXISTS public.ipfs_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cid TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  content_type TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.event_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipfs_objects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_templates
CREATE POLICY "Anyone can view active templates"
  ON public.event_templates FOR SELECT
  USING (is_active = true OR created_by = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create templates"
  ON public.event_templates FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Creators and admins can update templates"
  ON public.event_templates FOR UPDATE
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete templates"
  ON public.event_templates FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for contract_deployments
CREATE POLICY "Anyone can view deployments"
  ON public.contract_deployments FOR SELECT
  USING (true);

CREATE POLICY "Admins can create deployments"
  ON public.contract_deployments FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update deployments"
  ON public.contract_deployments FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for ipfs_objects
CREATE POLICY "Anyone can view IPFS objects"
  ON public.ipfs_objects FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create IPFS objects"
  ON public.ipfs_objects FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes
CREATE INDEX idx_templates_type ON public.event_templates(type);
CREATE INDEX idx_templates_created_by ON public.event_templates(created_by);
CREATE INDEX idx_deployments_template ON public.contract_deployments(template_id);
CREATE INDEX idx_deployments_network ON public.contract_deployments(network_id);
CREATE INDEX idx_ipfs_cid ON public.ipfs_objects(cid);

-- Add updated_at trigger for templates
CREATE TRIGGER handle_templates_updated_at
  BEFORE UPDATE ON public.event_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();