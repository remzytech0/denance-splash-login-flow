import { Button } from '@/components/ui/button';
import { Check, User, Building, Send } from 'lucide-react';

interface WithdrawSuccessPageProps {
  onGoBack: () => void;
  onViewHistory: () => void;
  withdrawalData: {
    accountNumber?: string;
    bank?: string;
    amount: number;
    currency: string;
    walletAddress?: string;
  };
  username: string;
  currency?: 'USD' | 'NGN';
}

export const WithdrawSuccessPage = ({ 
  onGoBack, 
  onViewHistory, 
  withdrawalData,
  username,
  currency = 'NGN'
}: WithdrawSuccessPageProps) => {
  const formatAmount = () => {
    if (withdrawalData.currency === 'NGN') {
      return `₦${withdrawalData.amount.toLocaleString()}.00`;
    }
    return `$${withdrawalData.amount.toLocaleString()}.00`;
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-primary">
            Withdrawal Successful
          </h1>
          
          <p className="text-xl text-foreground">
            Hi {username} 👋
          </p>
          
          <p className="text-foreground text-lg">
            {currency === 'USD' 
              ? 'Withdrawal to Binance account successful!'
              : 'Your withdrawal request has been processed.'
            }
          </p>
        </div>

        {/* Withdrawal Details */}
        <div className="space-y-4 text-left">
          {currency === 'USD' ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-black" />
                </div>
                <div>
                  <span className="text-foreground">Wallet Address: </span>
                  <span className="text-primary font-semibold break-all text-sm">
                    {withdrawalData.walletAddress}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Send className="w-4 h-4 text-black" />
                </div>
                <div>
                  <span className="text-foreground">Amount: </span>
                  <span className="text-primary font-semibold">{formatAmount()}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-black" />
                </div>
                <div>
                  <span className="text-foreground">Account Number: </span>
                  <span className="text-primary font-semibold">{withdrawalData.accountNumber}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Building className="w-4 h-4 text-black" />
                </div>
                <div>
                  <span className="text-foreground">Bank: </span>
                  <span className="text-primary font-semibold">{withdrawalData.bank}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Send className="w-4 h-4 text-black" />
                </div>
                <div>
                  <span className="text-foreground">Amount Sent: </span>
                  <span className="text-primary font-semibold">{formatAmount()}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Information */}
        <p className="text-foreground text-center">
          {currency === 'USD' 
            ? 'You will receive your funds within a few hours.'
            : 'Funds are on their way—please allow a few minutes for confirmation from your bank.'
          }
        </p>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            onClick={onGoBack}
            className="flex-1 bg-primary text-black hover:bg-primary/90 py-4 text-lg font-semibold rounded-xl"
          >
            Go Back
          </Button>
          <Button
            onClick={onViewHistory}
            className="flex-1 bg-primary text-black hover:bg-primary/90 py-4 text-lg font-semibold rounded-xl"
          >
            View History
          </Button>
        </div>
      </div>
    </div>
  );
};