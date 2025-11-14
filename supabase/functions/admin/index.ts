import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create client with ANON_KEY to validate user JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use ANON_KEY client to validate JWT
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await authClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', details: userError?.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create SERVICE_ROLE client for admin operations (bypasses RLS)
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user has admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = roles?.some(r => r.role === 'admin');

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body for POST requests
    let body: any = {};
    if (req.method === 'POST') {
      body = await req.json();
    }

    const action = body.action || 'events';

    // GET/POST all events (voting + petitions)
    if (action === 'events') {
      const [votingEvents, petitionEvents] = await Promise.all([
        supabase.from('voting_events').select('*, profiles(full_name)').order('created_at', { ascending: false }),
        supabase.from('petition_events').select('*, profiles(full_name)').order('created_at', { ascending: false })
      ]);

      return new Response(
        JSON.stringify({
          voting: votingEvents.data || [],
          petitions: petitionEvents.data || [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET/POST event participants
    if (action === 'participants') {
      const eventId = body.eventId;
      const eventType = body.eventType;

      if (!eventId || !eventType) {
        return new Response(JSON.stringify({ error: 'eventId and eventType required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let participants;
      if (eventType === 'voting') {
        const { data } = await supabase
          .from('votes')
          .select('*, profiles(full_name, wallet_address)')
          .eq('voting_event_id', eventId)
          .order('created_at', { ascending: false });
        participants = data;
      } else if (eventType === 'petition') {
        const { data } = await supabase
          .from('petition_signatures')
          .select('*, profiles(full_name, wallet_address)')
          .eq('petition_id', eventId)
          .order('created_at', { ascending: false });
        participants = data;
      }

      return new Response(
        JSON.stringify({ participants: participants || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET/POST blockchain transactions
    if (action === 'transactions') {
      const limit = 50;
      const { data: transactions } = await supabase
        .from('blockchain_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      return new Response(
        JSON.stringify({ transactions: transactions || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE event
    if (action === 'delete-event' && req.method === 'POST') {
      const { eventId, eventType } = body;

      if (!eventId || !eventType) {
        return new Response(JSON.stringify({ error: 'eventId and eventType required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let deleteResult;
      if (eventType === 'voting') {
        deleteResult = await supabase
          .from('voting_events')
          .delete()
          .eq('id', eventId);
      } else if (eventType === 'petition') {
        deleteResult = await supabase
          .from('petition_events')
          .delete()
          .eq('id', eventId);
      }

      if (deleteResult?.error) {
        throw deleteResult.error;
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CHANGE event status
    if (action === 'change-status' && req.method === 'POST') {
      const { eventId, eventType, status } = body;

      if (!eventId || !eventType || !status) {
        return new Response(JSON.stringify({ error: 'eventId, eventType, and status required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let updateResult;
      if (eventType === 'voting') {
        updateResult = await supabase
          .from('voting_events')
          .update({ status })
          .eq('id', eventId);
      } else if (eventType === 'petition') {
        updateResult = await supabase
          .from('petition_events')
          .update({ status })
          .eq('id', eventId);
      }

      if (updateResult?.error) {
        throw updateResult.error;
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST create voting event from template
    if (req.method === 'POST' && action === 'create-voting') {
      const { title, description, options, start_time, end_time, template_id } = body;

      // Create voting event
      const { data: event, error: eventError } = await supabase
        .from('voting_events')
        .insert({
          title,
          description,
          options,
          start_time,
          end_time,
          created_by: user.id,
          status: 'active'
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Log blockchain transaction
      await supabase.from('blockchain_transactions').insert({
        transaction_hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        transaction_type: 'voting_event_created',
        related_id: event.id,
        user_id: user.id,
        data: { title, template_id },
        block_number: Math.floor(Math.random() * 1000000) + 1000000
      });

      return new Response(JSON.stringify({ event }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST create petition from template
    if (req.method === 'POST' && action === 'create-petition') {
      const { title, description, start_time, end_time, target_signatures, template_id } = body;

      const { data: petition, error: petitionError } = await supabase
        .from('petition_events')
        .insert({
          title,
          description,
          start_time,
          end_time,
          target_signatures: target_signatures || 1000,
          created_by: user.id,
          status: 'active'
        })
        .select()
        .single();

      if (petitionError) throw petitionError;

      await supabase.from('blockchain_transactions').insert({
        transaction_hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        transaction_type: 'petition_created',
        related_id: petition.id,
        user_id: user.id,
        data: { title, template_id },
        block_number: Math.floor(Math.random() * 1000000) + 1000000
      });

      return new Response(JSON.stringify({ petition }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Admin function error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
