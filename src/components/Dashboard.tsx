import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Phone, Mail, Calendar, Settings, BarChart3, Wallet, TrendingUp } from 'lucide-react';

interface Profile {
  username: string;
  phone_number: string;
  created_at: string;
}

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <img
            src="/lovable-uploads/4ab83582-0f2d-434b-a1a4-8c77ca6a0b55.png"
            alt="Denance Logo"
            className="w-12 h-auto"
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Hello 👋 {profile?.username || 'User'}
            </h1>
            <p className="text-muted-foreground">Welcome back to your dashboard</p>
          </div>
        </div>
        <Button
          onClick={signOut}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <Card className="login-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Username:</span>
              <span className="text-foreground">{profile?.username}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="text-foreground">{user?.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Phone:</span>
              <span className="text-foreground">{profile?.phone_number || 'Not provided'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Joined:</span>
              <span className="text-foreground">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="login-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Quick Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Balance</span>
              <span className="text-foreground font-semibold">$0.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Trades</span>
              <span className="text-foreground font-semibold">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">P&L Today</span>
              <span className="text-green-500 font-semibold">+$0.00</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="login-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-primary" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-gradient-primary hover:opacity-90">
              <Wallet className="w-4 h-4 mr-2" />
              View Wallet
            </Button>
            <Button variant="outline" className="w-full">
              <TrendingUp className="w-4 h-4 mr-2" />
              Start Trading
            </Button>
            <Button variant="outline" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="login-card border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest transactions and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              No recent activity to display
            </div>
          </CardContent>
        </Card>

        <Card className="login-card border-border">
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
            <CardDescription>Current market trends and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              Market data will be displayed here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};