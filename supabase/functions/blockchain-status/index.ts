import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get recent blockchain transactions
    const { data: transactions, error } = await supabase
      .from("blockchain_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    // Calculate blockchain stats
    const latestTransaction = transactions[0];
    const currentBlockHeight = latestTransaction?.block_number || 15847392;
    const avgGasFee = "0.00234"; // Simulated

    return new Response(
      JSON.stringify({
        latestTransaction: latestTransaction
          ? {
              hash: latestTransaction.transaction_hash,
              type: latestTransaction.transaction_type,
              blockNumber: latestTransaction.block_number,
              timestamp: latestTransaction.created_at,
            }
          : null,
        stats: {
          currentBlockHeight,
          avgGasFee,
          totalTransactions: transactions.length,
        },
        recentTransactions: transactions.map((tx) => ({
          hash: tx.transaction_hash,
          type: tx.transaction_type,
          blockNumber: tx.block_number,
          timestamp: tx.created_at,
        })),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Blockchain status error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
