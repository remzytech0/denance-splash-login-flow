-- Create the generate_activation_code function
CREATE OR REPLACE FUNCTION public.generate_activation_code()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
    code VARCHAR(20);
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 8-character alphanumeric code
        code := UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4) || 
            SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)
        );
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE activation_code = code) INTO exists_check;
        
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$;

-- Update the handle_new_user function with correct balance
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, phone_number, balance, activation_code)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'phone_number',
    10.00,
    generate_activation_code()
  );
  RETURN NEW;
END;
$$;