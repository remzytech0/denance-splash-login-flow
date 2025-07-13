-- First, let's fix the handle_new_user function to not assign activation codes immediately
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create new handle_new_user function without activation code assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, phone_number, balance)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'phone_number',
    1000000.00
  );
  RETURN NEW;
END;
$$;

-- Create trigger for user creation (without activation code)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to assign activation codes to users who don't have one
CREATE OR REPLACE FUNCTION public.assign_activation_code_to_user(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_code VARCHAR(20);
    exists_check BOOLEAN;
BEGIN
    -- Check if user already has an activation code
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE user_id = user_uuid AND activation_code IS NOT NULL
    ) INTO exists_check;
    
    -- If user doesn't have an activation code, generate one
    IF NOT exists_check THEN
        LOOP
            -- Generate a random 8-character alphanumeric code
            new_code := UPPER(
                SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4) || 
                SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)
            );
            
            -- Check if code already exists
            SELECT EXISTS(SELECT 1 FROM public.profiles WHERE activation_code = new_code) INTO exists_check;
            
            IF NOT exists_check THEN
                EXIT;
            END IF;
        END LOOP;
        
        -- Update the user's profile with the activation code
        UPDATE public.profiles 
        SET activation_code = new_code, updated_at = now()
        WHERE user_id = user_uuid;
    END IF;
END;
$$;