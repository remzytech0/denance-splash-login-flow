import { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/SplashScreen';
import { LoginPage } from '@/components/LoginPage';

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

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
