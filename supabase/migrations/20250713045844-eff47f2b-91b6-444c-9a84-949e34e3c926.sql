-- Drop the existing problematic RLS policies on profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create proper RLS policies for profiles
CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable select for users based on user_id" ON public.profiles
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON public.profiles
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create payment_details table for configurable payment information
CREATE TABLE public.payment_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payment_details
ALTER TABLE public.payment_details ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payment_details (public read, admin write)
CREATE POLICY "Payment details are viewable by everyone" ON public.payment_details
FOR SELECT 
USING (is_active = true);

-- Create activation_purchases table to track purchase attempts
CREATE TABLE public.activation_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  payment_screenshot_url TEXT,
  payment_details_id UUID REFERENCES public.payment_details(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activation_purchases
ALTER TABLE public.activation_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activation_purchases
CREATE POLICY "Users can insert their own activation purchases" ON public.activation_purchases
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own activation purchases" ON public.activation_purchases
FOR SELECT 
USING (auth.uid() = user_id);

-- Add trigger for updated_at on payment_details
CREATE TRIGGER update_payment_details_updated_at
BEFORE UPDATE ON public.payment_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on activation_purchases
CREATE TRIGGER update_activation_purchases_updated_at
BEFORE UPDATE ON public.activation_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default payment details
INSERT INTO public.payment_details (account_name, account_number, bank_name, amount, is_active)
VALUES ('MICHAEL AKHIGBE', '8075667050', 'Opay', 10000.00, true);