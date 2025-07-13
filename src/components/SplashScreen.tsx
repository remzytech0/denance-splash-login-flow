import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Give time for exit animation before calling onComplete
      setTimeout(onComplete, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-dark ${
        isVisible ? 'splash-enter' : 'splash-exit'
      }`}
    >
      <div className="flex flex-col items-center space-y-8">
        <div className="logo-glow logo-pulse">
          <img
            src="/lovable-uploads/642f7f37-e2e4-448d-876b-e6c8e9cd7b3f.png"
            alt="Denance Logo"
            className="w-64 h-auto max-w-sm"
          />
        </div>
        
        {/* Loading indicator */}
        <div className="flex space-x-2">
          <div
            className="w-2 h-2 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    </div>
  );
};