-- Update the handle_new_user function to assign both voter and petitioner roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- Assign both voter and petitioner roles by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES 
    (NEW.id, 'voter'),
    (NEW.id, 'petitioner');
  
  RETURN NEW;
END;
$function$;