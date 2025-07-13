import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Building, User, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentDetails {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  amount: number;
}

interface BuyActivationPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const BuyActivationPage = ({ onBack, onSuccess }: BuyActivationPageProps) => {
  const { user } = useAuth();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    senderName: '',
    email: '',
    screenshot: null as File | null
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentDetails();
  }, []);

  const fetchPaymentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_details')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setPaymentDetails(data);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast({
        title: "Error",
        description: "Failed to load payment details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, screenshot: file }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.senderName || !formData.email || !formData.screenshot || !user || !paymentDetails) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields and upload a screenshot",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create the activation purchase record
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('activation_purchases')
        .insert({
          user_id: user.id,
          sender_name: formData.senderName,
          sender_email: formData.email,
          payment_details_id: paymentDetails.id,
          status: 'pending'
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Send notification to Telegram
      try {
        const response = await fetch('https://kattsnupukjwyasjhxyx.supabase.co/functions/v1/send-telegram-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderName: formData.senderName,
            senderEmail: formData.email,
            paymentScreenshotUrl: formData.screenshot ? 'screenshot-uploaded' : null
          }),
        });

        if (!response.ok) {
          console.error('Failed to send Telegram notification');
        } else {
          console.log('Telegram notification sent successfully');
        }
      } catch (error) {
        console.error('Error sending Telegram notification:', error);
      }

      toast({
        title: "Payment Details Submitted",
        description: "Your payment details have been submitted successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error submitting payment details:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit payment details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center text-foreground">
          <p className="text-lg">Payment details not available</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground p-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="mr-4 text-primary hover:text-primary/80"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-black text-lg">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-primary">Buy Activation Code</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Payment Details */}
        <div className="bg-background/5 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            To complete your purchase, please make a payment to:
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Building className="w-5 h-5 text-primary" />
              <div>
                <span className="text-muted-foreground">Account Name: </span>
                <span className="font-semibold text-foreground">{paymentDetails.account_name}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-primary" />
              <div>
                <span className="text-muted-foreground">Account Number: </span>
                <span className="font-semibold text-foreground">{paymentDetails.account_number}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="w-5 h-5 text-primary text-lg">🏦</span>
              <div>
                <span className="text-muted-foreground">Bank: </span>
                <span className="font-semibold text-foreground">{paymentDetails.bank_name}</span>
              </div>
            </div>
            
            <div className="text-center pt-2">
              <span className="text-muted-foreground">Amount: </span>
              <span className="text-2xl font-bold text-primary">₦{paymentDetails.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Information Form */}
        <div className="bg-background/5 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Payment Information</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="senderName" className="text-foreground flex items-center space-x-2">
                <User className="w-4 h-4 text-primary" />
                <span>Sender's Name:</span>
              </Label>
              <Input
                id="senderName"
                type="text"
                value={formData.senderName}
                onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
                placeholder="Enter your full name"
                className="mt-2 bg-background border-border"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-foreground flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>Registered Email (Denance Account):</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email address"
                className="mt-2 bg-background border-border"
              />
            </div>

            <div>
              <Label htmlFor="screenshot" className="text-foreground flex items-center space-x-2">
                <Upload className="w-4 h-4 text-primary" />
                <span>Upload Screenshot</span>
              </Label>
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2 bg-background border-border"
              />
              {formData.screenshot && (
                <p className="text-sm text-primary mt-1">
                  File selected: {formData.screenshot.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-muted-foreground text-sm">
          Your activation code will be sent to the email above once payment is confirmed.
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-primary text-black hover:bg-primary/90 py-3 text-lg font-semibold"
        >
          {submitting ? "Submitting..." : "Submit Payment Details"}
        </Button>
      </div>
    </div>
  );
};