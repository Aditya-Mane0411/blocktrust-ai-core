
-- Update the handle_new_user function to set login_method
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create profile with login method detection
  INSERT INTO public.profiles (id, full_name, wallet_address, login_method, username)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'wallet_address',
    CASE 
      WHEN NEW.raw_user_meta_data->>'wallet_address' IS NOT NULL THEN 'wallet'
      ELSE 'email'
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL 
      THEN LOWER(REPLACE(NEW.raw_user_meta_data->>'full_name', ' ', '_'))
      ELSE NULL
    END
  );
  
  -- Assign default voter role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'voter');
  
  RETURN NEW;
END;
$$;
