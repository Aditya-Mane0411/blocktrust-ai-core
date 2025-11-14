import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Create ANON_KEY client to validate JWT token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey);

    // Validate JWT by passing token directly (required for edge functions)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    
    console.log('Petition auth:', { userId: user?.id, error: authError?.message });
    
    if (authError || !user) {
      console.error('Auth failed:', authError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized", details: authError?.message }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log('User authenticated:', user.id);

    // Create SERVICE_ROLE client for database operations (bypasses RLS)
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    let body: any = {};
    let action: string | null = null;
    
    if (req.method === "POST") {
      try {
        const text = await req.text();
        if (text && text.trim()) {
          body = JSON.parse(text);
          action = body.action;
        }
      } catch (e) {
        console.log('No valid JSON body provided, treating as GET request');
      }
    }

    // GET: Fetch petitions
    if (req.method === "GET" || !action) {
      const { data: petitions, error } = await supabase
        .from("petition_events")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ petitions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: Create petition or sign petition
    if (req.method === "POST" && action) {
      if (action === "create") {
        // Check if user has petitioner role
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const canCreate = roles?.some((r) => r.role === "petitioner" || r.role === "admin");
        if (!canCreate) {
          return new Response(JSON.stringify({ error: "Petitioner access required" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const blockchainHash = generateBlockchainHash();
        const { data: petition, error } = await supabase
          .from("petition_events")
          .insert({
            title: body.title,
            description: body.description,
            start_time: body.start_time,
            end_time: body.end_time,
            target_signatures: body.target_signatures || 1000,
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
          transaction_type: "petition_created",
          block_number: Math.floor(Math.random() * 1000000) + 15000000,
          related_id: petition.id,
          user_id: user.id,
          data: { petition_title: body.title },
        });

        console.log("Petition created:", petition.id);
        return new Response(JSON.stringify({ petition }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "sign") {
        // Check if user already signed
        const { data: existingSignature } = await supabase
          .from("petition_signatures")
          .select("id")
          .eq("user_id", user.id)
          .eq("petition_id", body.petition_id)
          .single();

        if (existingSignature) {
          return new Response(JSON.stringify({ error: "Already signed this petition" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const blockchainHash = generateBlockchainHash();
        const { data: signature, error } = await supabase
          .from("petition_signatures")
          .insert({
            user_id: user.id,
            petition_id: body.petition_id,
            comment: body.comment,
            blockchain_hash: blockchainHash,
          })
          .select()
          .single();

        if (error) throw error;

        // Log blockchain transaction
        await supabase.from("blockchain_transactions").insert({
          transaction_hash: blockchainHash,
          transaction_type: "petition_signed",
          block_number: Math.floor(Math.random() * 1000000) + 15000000,
          related_id: signature.id,
          user_id: user.id,
          data: { petition_id: body.petition_id },
        });

        console.log("Petition signed:", signature.id);
        return new Response(JSON.stringify({ signature }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Petition function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
