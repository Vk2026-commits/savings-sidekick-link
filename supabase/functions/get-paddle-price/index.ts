import { gatewayFetch, type PaddleEnv } from '../_shared/paddle.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { priceId, environment } = await req.json();
    if (!priceId || typeof priceId !== 'string') {
      return new Response(JSON.stringify({ error: 'priceId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const env: PaddleEnv = environment === 'live' ? 'live' : 'sandbox';
    const res = await gatewayFetch(env, `/prices?external_id=${encodeURIComponent(priceId)}`);
    const data = await res.json();
    if (!data.data?.length) {
      console.error('Price not found for external_id:', priceId, 'env:', env);
      return new Response(JSON.stringify({ error: 'Price not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ paddleId: data.data[0].id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('get-paddle-price error:', e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
