import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simulated blockchain transaction generator
const generateBlockchainHash = () => {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create client with ANON_KEY to validate user JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use ANON_KEY client to validate JWT
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized", details: authError?.message }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create SERVICE_ROLE client for database operations (bypasses RLS)
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // GET: Fetch voting events
    if (req.method === "GET") {
      const { data: events, error } = await supabase
        .from("voting_events")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ events }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: Create voting event or cast vote
    if (req.method === "POST") {
      const body = await req.json();

      if (action === "create") {
        // Check if user has admin role
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const isAdmin = roles?.some((r) => r.role === "admin");
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Admin access required" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const blockchainHash = generateBlockchainHash();
        const { data: event, error } = await supabase
          .from("voting_events")
          .insert({
            title: body.title,
            description: body.description,
            options: body.options,
            start_time: body.start_time,
            end_time: body.end_time,
            created_by: user.id,
            status: "active",
            blockchain_hash: blockchainHash,
          })
          .select()
          .single();

        if (error) throw error;

        // Log blockchain transaction
        await supabase.from("blockchain_transactions").insert({
          transaction_hash: blockchainHash,
          transaction_type: "voting_event_created",
          block_number: Math.floor(Math.random() * 1000000) + 15000000,
          related_id: event.id,
          user_id: user.id,
          data: { event_title: body.title },
        });

        console.log("Voting event created:", event.id);
        return new Response(JSON.stringify({ event }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "vote") {
        // Check if user has voter role
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const canVote = roles?.some((r) => r.role === "voter" || r.role === "admin");
        if (!canVote) {
          return new Response(JSON.stringify({ error: "Voter access required" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if user already voted
        const { data: existingVote } = await supabase
          .from("votes")
          .select("id")
          .eq("user_id", user.id)
          .eq("voting_event_id", body.voting_event_id)
          .single();

        if (existingVote) {
          return new Response(JSON.stringify({ error: "Already voted on this event" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const blockchainHash = generateBlockchainHash();
        const { data: vote, error } = await supabase
          .from("votes")
          .insert({
            user_id: user.id,
            voting_event_id: body.voting_event_id,
            vote_option: body.vote_option,
            blockchain_hash: blockchainHash,
          })
          .select()
          .single();

        if (error) throw error;

        // Log blockchain transaction
        await supabase.from("blockchain_transactions").insert({
          transaction_hash: blockchainHash,
          transaction_type: "vote_cast",
          block_number: Math.floor(Math.random() * 1000000) + 15000000,
          related_id: vote.id,
          user_id: user.id,
          data: { voting_event_id: body.voting_event_id, vote_option: body.vote_option },
        });

        console.log("Vote cast:", vote.id);
        return new Response(JSON.stringify({ vote }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Voting function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
