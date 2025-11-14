-- Add petitioner role to existing users who only have voter role
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT ur.user_id, 'petitioner'::app_role
FROM public.user_roles ur
WHERE ur.role = 'voter'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur2
  WHERE ur2.user_id = ur.user_id AND ur2.role = 'petitioner'
)
ON CONFLICT (user_id, role) DO NOTHING;