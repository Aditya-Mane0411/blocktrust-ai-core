import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BlockchainTransaction {
  hash: string;
  type: string;
  blockNumber: number;
  timestamp: string;
}

interface BlockchainStats {
  currentBlockHeight: number;
  avgGasFee: string;
  totalTransactions: number;
}

export const useBlockchain = () => {
  const [latestTransaction, setLatestTransaction] = useState<BlockchainTransaction | null>(null);
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<BlockchainTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlockchainStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("blockchain-status");

      if (error) throw error;
      
      setLatestTransaction(data.latestTransaction);
      setStats(data.stats);
      setRecentTransactions(data.recentTransactions);
    } catch (error: any) {
      console.error("Error fetching blockchain status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchainStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchBlockchainStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return { latestTransaction, stats, recentTransactions, loading, refetch: fetchBlockchainStatus };
};
