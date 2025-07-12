import { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/SplashScreen';
import { LoginPage } from '@/components/LoginPage';
import { Dashboard } from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { user, loading } = useAuth();

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is authenticated, show dashboard directly (no splash)
  if (user) {
    return <Dashboard />;
  }

  // If not authenticated, show splash then login
  return (
    <div className="min-h-screen">
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <LoginPage />
      )}
    </div>
  );
};

export default Index;
