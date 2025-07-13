import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, RotateCcw, CreditCard, Phone, User, Clock, FileText, LogOut, Youtube, Info, X, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WithdrawPage } from './WithdrawPage';
import { USDWithdrawPage } from './USDWithdrawPage';
import { WithdrawSuccessPage } from './WithdrawSuccessPage';
import { BuyActivationPage } from './BuyActivationPage';
import { BuyActivationSuccessPage } from './BuyActivationSuccessPage';
import { ActivationCodeManager } from './ActivationCodeManager';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  username: string;
  phone_number: string;
  created_at: string;
  balance: number;
  last_refresh_at: string | null;
  activation_code: string | null;
}

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');
  const [currentView, setCurrentView] = useState<'dashboard' | 'withdraw' | 'success' | 'buy-activation' | 'buy-success' | 'history' | 'admin'>('dashboard');
  const [withdrawalData, setWithdrawalData] = useState<any>(null);
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(true);
  const [adminClicks, setAdminClicks] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, phone_number, created_at, balance, last_refresh_at, activation_code')
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
      return `₦${(amount * 1000).toLocaleString()}`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const handleRefresh = async () => {
    if (!user || !profile) return;

    const now = new Date();
    const lastRefresh = profile.last_refresh_at ? new Date(profile.last_refresh_at) : null;
    
    if (lastRefresh) {
      const hoursDiff = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        const hoursLeft = Math.ceil(24 - hoursDiff);
        toast({
          title: "Refresh Not Available",
          description: `You can refresh again in ${hoursLeft} hours`,
          variant: "destructive"
        });
        return;
      }
    }

    try {
      const refreshAmount = currency === 'NGN' ? 10 : 10;
      const { error } = await supabase
        .from('profiles')
        .update({ 
          balance: profile.balance + refreshAmount,
          last_refresh_at: now.toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchProfile();
      toast({
        title: "Balance Updated!",
        description: `${currency === 'NGN' ? '₦10,000' : '$10'} has been added to your account`,
      });
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        title: "Refresh Failed",
        description: "Unable to update balance. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleWithdraw = () => {
    setCurrentView('withdraw');
  };

  const handleWithdrawSuccess = (data: any) => {
    setWithdrawalData(data);
    setCurrentView('success');
    fetchProfile(); // Refresh profile to get updated balance
  };

  const handleBuyActivation = () => {
    setCurrentView('buy-activation');
  };

  const handleBuyActivationSuccess = () => {
    setCurrentView('buy-success');
  };

  const handleContact = () => {
    window.open('mailto:denace@boxfi.uk', '_blank');
  };

  const handleWatch = () => {
    window.open('https://youtube.com', '_blank');
  };

  const handleHistory = () => {
    setCurrentView('history');
  };

  const handleBellClick = () => {
    const newClicks = adminClicks + 1;
    setAdminClicks(newClicks);
    
    if (newClicks >= 5) {
      setCurrentView('admin');
      setAdminClicks(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (currentView === 'withdraw') {
    if (currency === 'NGN') {
      return (
        <WithdrawPage
          onBack={() => setCurrentView('dashboard')}
          onSuccess={handleWithdrawSuccess}
          currency={currency}
          balance={profile?.balance || 0}
        />
      );
    } else {
      return (
        <USDWithdrawPage
          onBack={() => setCurrentView('dashboard')}
          onSuccess={handleWithdrawSuccess}
          balance={profile?.balance || 0}
        />
      );
    }
  }

  if (currentView === 'success') {
    return (
      <WithdrawSuccessPage
        onGoBack={() => setCurrentView('dashboard')}
        onViewHistory={() => setCurrentView('dashboard')} // Could implement history view later
        withdrawalData={withdrawalData}
        username={profile?.username || 'User'}
        currency={currency}
      />
    );
  }

  if (currentView === 'buy-activation') {
    return (
      <BuyActivationPage
        onBack={() => setCurrentView('dashboard')}
        onSuccess={handleBuyActivationSuccess}
      />
    );
  }

  if (currentView === 'buy-success') {
    return (
      <BuyActivationSuccessPage
        onGoBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'history') {
    return (
      <div className="min-h-screen bg-gradient-dark text-foreground p-4">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => setCurrentView('dashboard')}
            variant="ghost"
            className="text-primary hover:text-primary/80"
          >
            ← Back
          </Button>
          <h1 className="text-xl font-bold text-primary">Transaction History</h1>
          <div></div>
        </div>
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-center">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Withdrawal and refresh history will be available soon.
            </p>
            <Button
              onClick={() => setCurrentView('dashboard')}
              className="mt-4 bg-primary text-black hover:bg-primary/90"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === 'admin') {
    return (
      <ActivationCodeManager
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-xl font-bold text-primary">
            HELLO {profile?.username?.toUpperCase() || 'USER'}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <Bell 
            className="w-5 h-5 text-primary cursor-pointer" 
            onClick={handleBellClick}
          />
          <Button
            onClick={signOut}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 space-y-4 mb-6">
        {/* Welcome Alert */}
        {showWelcomeAlert && (
          <Alert className="bg-card border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <AlertTitle className="text-primary">Daily Reward Info</AlertTitle>
                <AlertDescription className="text-foreground text-sm mt-1">
                  You will receive $10 every day that you can withdraw to your bank/wallet. 
                  You can refresh your balance every 24 hours to get your daily reward.
                </AlertDescription>
              </div>
              <Button
                onClick={() => setShowWelcomeAlert(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        )}

        {/* Currency Selection Card */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Currency Selection</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-foreground">Select Currency:</span>
              <Select value={currency} onValueChange={(value: 'USD' | 'NGN') => setCurrency(value)}>
                <SelectTrigger className="w-28 h-8 bg-background border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">$ — USD</SelectItem>
                  <SelectItem value="NGN">₦ — NGN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use this dropdown to select your preferred currency.
            </p>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-center">Current Balance</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <div className="text-4xl font-bold text-primary mb-4">
              {formatAmount(profile?.balance || 0)}
            </div>
            <Button 
              onClick={handleWithdraw}
              className="bg-primary text-black hover:bg-primary/90 px-8 py-2 rounded-lg font-semibold text-base"
            >
              Withdraw
            </Button>
            <p className="text-foreground mt-3 text-sm">
              Available Balance: {formatAmount(profile?.balance || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <button 
                onClick={handleRefresh}
                className="flex flex-col items-center space-y-2 w-full p-2 rounded-lg bg-background/5 hover:bg-background/10 transition-colors"
              >
                <RotateCcw className="w-6 h-6 text-primary" />
                <span className="text-foreground font-medium text-sm">Reset</span>
              </button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <button 
                onClick={handleBuyActivation}
                className="flex flex-col items-center space-y-2 w-full p-2 rounded-lg bg-background/5 hover:bg-background/10 transition-colors"
              >
                <CreditCard className="w-6 h-6 text-primary" />
                <span className="text-foreground font-medium text-sm">Buy Activation</span>
              </button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <button className="flex flex-col items-center space-y-2 w-full p-2 rounded-lg bg-background/5 hover:bg-background/10 transition-colors">
                <Phone className="w-6 h-6 text-primary" />
                <span className="text-foreground font-medium text-sm">Airtime</span>
              </button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <button 
                onClick={handleContact}
                className="flex flex-col items-center space-y-2 w-full p-2 rounded-lg bg-background/5 hover:bg-background/10 transition-colors"
              >
                <User className="w-6 h-6 text-primary" />
                <span className="text-foreground font-medium text-sm">Contact</span>
              </button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <button 
                onClick={handleWatch}
                className="flex flex-col items-center space-y-2 w-full p-2 rounded-lg bg-background/5 hover:bg-background/10 transition-colors"
              >
                <Youtube className="w-6 h-6 text-primary" />
                <span className="text-foreground font-medium text-sm">Watch</span>
              </button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <button 
                onClick={handleHistory}
                className="flex flex-col items-center space-y-2 w-full p-2 rounded-lg bg-background/5 hover:bg-background/10 transition-colors"
              >
                <FileText className="w-6 h-6 text-primary" />
                <span className="text-foreground font-medium text-sm">History</span>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground text-sm">O 2025</span>
        </div>
      </div>
    </div>
  );
};