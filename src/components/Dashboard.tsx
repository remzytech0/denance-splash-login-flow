import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, RotateCcw, CreditCard, Phone, User, Clock, FileText, LogOut } from 'lucide-react';

interface Profile {
  username: string;
  phone_number: string;
  created_at: string;
}

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, phone_number, created_at')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    if (currency === 'NGN') {
      return `₦${(amount * 10).toLocaleString()}`;
    }
    return `$${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-primary">
            HELLO {profile?.username?.toUpperCase() || 'USER'}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Bell className="w-6 h-6 text-primary cursor-pointer" />
          <Button
            onClick={signOut}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Currency Selection */}
      <div className="px-6 mb-8">
        <div className="flex items-center space-x-4">
          <span className="text-foreground text-lg">Select Currency:</span>
          <Select value={currency} onValueChange={(value: 'USD' | 'NGN') => setCurrency(value)}>
            <SelectTrigger className="w-32 bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">$ — USD</SelectItem>
              <SelectItem value="NGN">₦ — NGN</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-muted-foreground mt-2">
          Use this dropdown to select your preferred currency.
        </p>
      </div>

      {/* Today Spent */}
      <div className="px-6 mb-8 text-center">
        <h2 className="text-xl text-foreground mb-4">Today Spent</h2>
        <div className="text-6xl font-bold text-primary mb-6">
          {formatAmount(10000)}
        </div>
        <Button className="bg-primary text-black hover:bg-primary/90 px-12 py-3 rounded-xl font-semibold text-lg">
          Withdraw
        </Button>
        <p className="text-foreground mt-4 text-lg">
          Monthly spend target: {formatAmount(10000)}
        </p>
      </div>

      {/* Action Buttons Grid */}
      <div className="px-6 grid grid-cols-3 gap-6 mb-8">
        <button className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-background/5 hover:bg-background/10 transition-colors">
          <RotateCcw className="w-8 h-8 text-primary" />
          <span className="text-foreground font-medium">Reset</span>
        </button>
        
        <button className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-background/5 hover:bg-background/10 transition-colors">
          <CreditCard className="w-8 h-8 text-primary" />
          <span className="text-foreground font-medium">Buy Activation</span>
        </button>
        
        <button className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-background/5 hover:bg-background/10 transition-colors">
          <Phone className="w-8 h-8 text-primary" />
          <span className="text-foreground font-medium">Airtime</span>
        </button>
        
        <button className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-background/5 hover:bg-background/10 transition-colors">
          <User className="w-8 h-8 text-primary" />
          <span className="text-foreground font-medium">Contact</span>
        </button>
        
        <button className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-background/5 hover:bg-background/10 transition-colors">
          <Clock className="w-8 h-8 text-primary" />
          <span className="text-foreground font-medium">Watch</span>
        </button>
        
        <button className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-background/5 hover:bg-background/10 transition-colors">
          <FileText className="w-8 h-8 text-primary" />
          <span className="text-foreground font-medium">History</span>
        </button>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-primary" />
          <span className="text-muted-foreground">O 2025</span>
        </div>
      </div>
    </div>
  );
};