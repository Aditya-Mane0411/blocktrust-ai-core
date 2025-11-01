import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IPFSUploadRequest {
  data: any;
  metadata?: {
    name?: string;
    description?: string;
    type?: string;
  };
}

/**
 * IPFS Integration Edge Function
 * Handles uploading and retrieving data from IPFS via Pinata
 * 
 * Actions:
 * - POST ?action=upload: Upload data to IPFS
 * - GET ?action=retrieve&hash=<ipfs_hash>: Retrieve data from IPFS
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Upload to IPFS
    if (action === 'upload' && req.method === 'POST') {
      const { data, metadata }: IPFSUploadRequest = await req.json();

      console.log('Uploading to IPFS:', { dataSize: JSON.stringify(data).length, metadata });

      // Pinata API credentials from environment
      const pinataApiKey = Deno.env.get('PINATA_API_KEY');
      const pinataSecretApiKey = Deno.env.get('PINATA_SECRET_API_KEY');

      if (!pinataApiKey || !pinataSecretApiKey) {
        throw new Error('IPFS credentials not configured. Please add PINATA_API_KEY and PINATA_SECRET_API_KEY secrets.');
      }

      // Prepare upload payload
      const uploadPayload = {
        pinataContent: data,
        pinataMetadata: {
          name: metadata?.name || `blocktrust-${Date.now()}`,
          keyvalues: {
            type: metadata?.type || 'event-data',
            description: metadata?.description || '',
            timestamp: new Date().toISOString(),
          },
        },
      };

      // Upload to Pinata
      const uploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretApiKey,
        },
        body: JSON.stringify(uploadPayload),
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`IPFS upload failed: ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      const ipfsHash = uploadResult.IpfsHash;

      console.log('Successfully uploaded to IPFS:', ipfsHash);

      return new Response(
        JSON.stringify({
          success: true,
          ipfsHash,
          gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
          timestamp: uploadResult.Timestamp,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Retrieve from IPFS
    if (action === 'retrieve' && req.method === 'GET') {
      const ipfsHash = url.searchParams.get('hash');

      if (!ipfsHash) {
        throw new Error('IPFS hash is required');
      }

      console.log('Retrieving from IPFS:', ipfsHash);

      // Fetch from IPFS gateway
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      const retrieveResponse = await fetch(gatewayUrl);

      if (!retrieveResponse.ok) {
        throw new Error(`Failed to retrieve from IPFS: ${retrieveResponse.statusText}`);
      }

      const data = await retrieveResponse.json();

      return new Response(
        JSON.stringify({
          success: true,
          data,
          ipfsHash,
          gatewayUrl,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simulated IPFS (for development without Pinata credentials)
    if (action === 'simulate-upload' && req.method === 'POST') {
      const { data, metadata }: IPFSUploadRequest = await req.json();
      
      // Generate a fake IPFS hash
      const fakeHash = `Qm${btoa(JSON.stringify(data)).substring(0, 44)}`;
      
      console.log('Simulated IPFS upload:', fakeHash);

      return new Response(
        JSON.stringify({
          success: true,
          ipfsHash: fakeHash,
          gatewayUrl: `https://gateway.pinata.cloud/ipfs/${fakeHash}`,
          simulated: true,
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action. Use ?action=upload or ?action=retrieve&hash=<hash>');

  } catch (error: any) {
    console.error('IPFS function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Ensure PINATA_API_KEY and PINATA_SECRET_API_KEY are set, or use ?action=simulate-upload for testing'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
