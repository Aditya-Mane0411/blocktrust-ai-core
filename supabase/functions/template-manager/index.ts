import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Template Manager Edge Function
 * Manages blockchain event templates and deployments
 * 
 * Admin-only endpoints:
 * - POST ?action=create-template: Create a new event template
 * - POST ?action=deploy-contract: Deploy a smart contract from template
 * - GET ?action=list-templates: List all available templates
 * - GET ?action=list-deployments: List all deployed contracts
 * - PUT ?action=update-template: Update template configuration
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = roles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Create new template
    if (action === 'create-template' && req.method === 'POST') {
      const { name, type, description, config } = await req.json();

      console.log('Creating template:', { name, type });

      // Store template configuration in database
      const { data: template, error } = await supabase
        .from('event_templates')
        .insert({
          name,
          type, // 'voting', 'petition', 'survey'
          description,
          config, // JSON configuration for the template
          created_by: user.id,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, template }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deploy contract from template
    if (action === 'deploy-contract' && req.method === 'POST') {
      const { templateId, networkId, contractParams } = await req.json();

      console.log('Deploying contract:', { templateId, networkId });

      // Get template configuration
      const { data: template, error: templateError } = await supabase
        .from('event_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // In production, this would interact with Hardhat to deploy the contract
      // For now, we'll simulate the deployment
      const contractAddress = `0x${Math.random().toString(16).substring(2, 42)}`;
      const blockNumber = Math.floor(Math.random() * 1000000);

      // Store deployment information
      const { data: deployment, error: deployError } = await supabase
        .from('contract_deployments')
        .insert({
          template_id: templateId,
          contract_address: contractAddress,
          network_id: networkId,
          deployer_id: user.id,
          deployment_params: contractParams,
          block_number: blockNumber,
          status: 'deployed',
        })
        .select()
        .single();

      if (deployError) throw deployError;

      // Log to blockchain_transactions
      await supabase
        .from('blockchain_transactions')
        .insert({
          transaction_hash: `0x${Math.random().toString(16).substring(2, 66)}`,
          transaction_type: 'contract_deployment',
          block_number: blockNumber,
          related_id: deployment.id,
          user_id: user.id,
          data: {
            template_type: template.type,
            contract_address: contractAddress,
            network_id: networkId,
          },
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          deployment,
          contractAddress,
          blockNumber,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // List all templates
    if (action === 'list-templates' && req.method === 'GET') {
      const { data: templates, error } = await supabase
        .from('event_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, templates }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // List all deployments
    if (action === 'list-deployments' && req.method === 'GET') {
      const { data: deployments, error } = await supabase
        .from('contract_deployments')
        .select(`
          *,
          event_templates (
            name,
            type,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, deployments }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update template
    if (action === 'update-template' && req.method === 'PUT') {
      const { templateId, updates } = await req.json();

      const { data: template, error } = await supabase
        .from('event_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, template }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error: any) {
    console.error('Template manager error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message === 'Unauthorized' || error.message === 'Admin access required' ? 403 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
