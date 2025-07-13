import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TransactionHistory {
  id: string;
  transaction_type: string;
  amount: number | null;
  currency: string;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface HistoryPageProps {
  onBack: () => void;
}

export function HistoryPage({ onBack }: HistoryPageProps) {
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTransactionHistory();
    }
  }, [user]);

  const fetchTransactionHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('transaction_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch transaction history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTransactionType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
        <div className="mx-auto max-w-md space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-white hover:text-blue-200">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          </div>
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-white hover:text-blue-200">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
        </div>

        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="rounded-xl bg-white/10 p-6 text-center text-white backdrop-blur-sm">
              <Calendar className="mx-auto h-12 w-12 text-white/60 mb-4" />
              <p className="text-lg font-medium mb-2">No transactions yet</p>
              <p className="text-white/80">Your transaction history will appear here</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-white" />
                    <div>
                      <p className="font-medium text-white">
                        {formatTransactionType(transaction.transaction_type)}
                      </p>
                      <p className="text-sm text-white/70">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(transaction.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    {transaction.amount && (
                      <p className="text-lg font-bold text-white">
                        {transaction.currency} {transaction.amount.toLocaleString()}
                      </p>
                    )}
                    {transaction.description && (
                      <p className="text-sm text-white/70 mt-1">
                        {transaction.description}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}