-- Update the handle_new_user function to set proper initial balance
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, phone_number, balance)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'phone_number',
    10.00  -- Changed from 1000000.00 to 10.00
  );
  RETURN NEW;
END;
$function$;

-- Add a unique constraint on username to prevent duplicates
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);