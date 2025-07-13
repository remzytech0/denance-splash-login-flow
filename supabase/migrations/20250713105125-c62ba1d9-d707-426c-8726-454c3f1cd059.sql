-- Create history table for user transactions
CREATE TABLE public.transaction_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL, -- 'withdrawal', 'activation_purchase', 'gift_card', etc.
  amount NUMERIC,
  currency TEXT DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  reference_id UUID, -- Can reference other tables like withdrawals, activation_purchases
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transaction_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transaction history" 
ON public.transaction_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transaction history" 
ON public.transaction_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_transaction_history_updated_at
BEFORE UPDATE ON public.transaction_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();