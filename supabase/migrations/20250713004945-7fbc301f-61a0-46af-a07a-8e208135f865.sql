-- Add new columns to profiles table for withdrawal functionality
ALTER TABLE public.profiles 
ADD COLUMN balance DECIMAL(15,2) DEFAULT 1000000.00,
ADD COLUMN activation_code VARCHAR(20) UNIQUE,
ADD COLUMN last_refresh_at TIMESTAMP WITH TIME ZONE;

-- Function to generate unique activation codes
CREATE OR REPLACE FUNCTION generate_activation_code()
RETURNS VARCHAR(20) AS $$
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
$$ LANGUAGE plpgsql;

-- Update existing profiles to have activation codes
UPDATE public.profiles 
SET activation_code = generate_activation_code()
WHERE activation_code IS NULL;

-- Make activation_code NOT NULL after setting values
ALTER TABLE public.profiles 
ALTER COLUMN activation_code SET NOT NULL;

-- Update the handle_new_user function to include activation code and default balance
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, phone_number, balance, activation_code)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'phone_number',
    1000000.00,
    generate_activation_code()
  );
  RETURN NEW;
END;
$function$;

-- Create withdrawals table to track withdrawal history
CREATE TABLE public.withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  activation_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on withdrawals table
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Create policies for withdrawals table
CREATE POLICY "Users can view their own withdrawals" 
ON public.withdrawals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawals" 
ON public.withdrawals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on withdrawals
CREATE TRIGGER update_withdrawals_updated_at
BEFORE UPDATE ON public.withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();