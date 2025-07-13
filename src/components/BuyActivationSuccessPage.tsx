import { Button } from '@/components/ui/button';
import { CheckCircle, RotateCcw, Mail, Clock } from 'lucide-react';

interface BuyActivationSuccessPageProps {
  onGoBack: () => void;
}

export const BuyActivationSuccessPage = ({ onGoBack }: BuyActivationSuccessPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-dark text-foreground flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
            <RotateCcw className="w-12 h-12 text-primary animate-spin" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-primary mb-4">
            Payment Confirmation In Progress
          </h1>
          <p className="text-lg text-foreground">
            Your payment has been received.
          </p>
        </div>

        {/* Status Information */}
        <div className="bg-background/5 rounded-xl p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
            <div className="text-left">
              <p className="text-foreground">
                Confirmation is currently underway. This may take a few hours depending on transaction processing time.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Mail className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
            <div className="text-left">
              <p className="text-foreground">
                Your activation code will be sent to the email you registered with once payment is confirmed.
              </p>
            </div>
          </div>
        </div>

        <p className="text-lg text-foreground">
          We appreciate your patience!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-4">
          <Button
            onClick={onGoBack}
            className="bg-primary text-black hover:bg-primary/90 px-12 py-3 text-lg font-semibold"
          >
            View Dashboard
          </Button>
          
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 px-12 py-3 text-lg font-semibold"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};