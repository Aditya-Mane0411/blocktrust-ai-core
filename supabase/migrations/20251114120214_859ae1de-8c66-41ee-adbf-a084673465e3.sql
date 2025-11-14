
-- Add username and login_method to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username text UNIQUE,
ADD COLUMN login_method text DEFAULT 'email' CHECK (login_method IN ('email', 'wallet'));

-- Create index for username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Update existing profiles to have a default username based on their name
UPDATE public.profiles 
SET username = LOWER(REPLACE(full_name, ' ', '_'))
WHERE username IS NULL AND full_name IS NOT NULL;
