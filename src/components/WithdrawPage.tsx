import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface WithdrawPageProps {
  onBack: () => void;
  onSuccess: (withdrawalData: any) => void;
  currency: 'USD' | 'NGN';
  balance: number;
}

const nigerianBanks = [
  'Access Bank', 'GTBank', 'First Bank', 'UBA', 'Zenith Bank', 
  'Fidelity Bank', 'FCMB', 'Sterling Bank', 'Union Bank', 
  'Wema Bank', 'Polaris Bank', 'Keystone Bank', 'Opay'
];

export const WithdrawPage = ({ onBack, onSuccess, currency, balance }: WithdrawPageProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    bank: '',
    amount: '',
    activationCode: ''
  });

  const minAmount = currency === 'NGN' ? 100000 : 10000;
  const maxAmount = currency === 'NGN' ? 500000 : 50000;

  const formatBalance = () => {
    if (currency === 'NGN') {
      return `₦${balance.toLocaleString()}`;
    }
    return `$${balance.toLocaleString()}`;
  };

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
          description: `Amount must be between ${currency === 'NGN' ? '₦' : '$'}${minAmount.toLocaleString()} and ${currency === 'NGN' ? '₦' : '$'}${maxAmount.toLocaleString()}`,
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
          account_name: formData.accountName,
          account_number: formData.accountNumber,
          bank_name: formData.bank,
          amount: amount,
          currency: currency,
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
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          bank: formData.bank,
          amount: amount,
          currency: currency,
          activationCode: formData.activationCode.toUpperCase()
        }
      });

      if (telegramError) {
        console.error('Telegram notification failed:', telegramError);
      }

      onSuccess({
        accountNumber: formData.accountNumber,
        bank: formData.bank,
        amount: amount,
        currency: currency
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
          <h1 className="text-2xl font-bold text-black">Transfer To Bank/Wallet</h1>
        </div>

        <div className="bg-background/10 rounded-b-2xl p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Name */}
            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                ACCOUNT NAME
              </label>
              <Input
                placeholder="Account Name"
                value={formData.accountName}
                onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                className="bg-background/20 border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                ACCOUNT NUMBER
              </label>
              <Select 
                value={formData.bank} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, bank: value }))}
                required
              >
                <SelectTrigger className="bg-background/20 border-border text-foreground">
                  <SelectValue placeholder="Choose Bank" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {nigerianBanks.map((bank) => (
                    <SelectItem key={bank} value={bank} className="text-foreground hover:bg-primary/20">
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Account Number"
                value={formData.accountNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                className="bg-background/20 border-border text-foreground placeholder:text-muted-foreground mt-2"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                AMOUNT
              </label>
              <Input
                type="number"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="bg-background/20 border-border text-foreground placeholder:text-muted-foreground"
                min={minAmount}
                max={maxAmount}
                required
              />
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
                Available Balance: {formatBalance()}
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