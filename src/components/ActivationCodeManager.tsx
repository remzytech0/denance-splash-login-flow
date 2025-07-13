import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ActivationCodeManagerProps {
  onBack: () => void;
}

export const ActivationCodeManager = ({ onBack }: ActivationCodeManagerProps) => {
  const [userId, setUserId] = useState('');
  const [newActivationCode, setNewActivationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateActivationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !newActivationCode) {
      toast({
        title: "Missing Information",
        description: "Please provide both User ID and new activation code",
        variant: "destructive"
      });
      return;
    }

    if (newActivationCode.length !== 8) {
      toast({
        title: "Invalid Code Length",
        description: "Activation code must be exactly 8 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://kattsnupukjwyasjhxyx.supabase.co/functions/v1/update-activation-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          newActivationCode: newActivationCode.toUpperCase() 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update activation code');
      }

      toast({
        title: "Success",
        description: "Activation code updated successfully!",
      });

      // Reset form
      setUserId('');
      setNewActivationCode('');
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground p-4">
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-primary hover:text-primary/80"
        >
          ← Back
        </Button>
        <h1 className="text-xl font-bold text-primary">Activation Code Manager</h1>
        <div></div>
      </div>

      <Card className="max-w-md mx-auto bg-card border-border">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center space-x-2">
            <Edit className="w-5 h-5" />
            <span>Update Activation Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateActivationCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="text"
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="input-glow"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activationCode">New Activation Code (8 characters)</Label>
              <Input
                id="activationCode"
                type="text"
                placeholder="Enter 8-character code"
                value={newActivationCode}
                onChange={(e) => setNewActivationCode(e.target.value.slice(0, 8).toUpperCase())}
                className="input-glow"
                maxLength={8}
                required
              />
              <p className="text-xs text-muted-foreground">
                {newActivationCode.length}/8 characters
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-black hover:bg-primary/90"
              disabled={isLoading || newActivationCode.length !== 8}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Update Code</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-background/50 rounded-lg">
            <h3 className="text-sm font-semibold text-primary mb-2">Instructions:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Enter the user's unique ID</li>
              <li>• Provide a new 8-character activation code</li>
              <li>• Code will be converted to uppercase automatically</li>
              <li>• Each code must be unique across all users</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};