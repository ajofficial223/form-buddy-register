import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, uniqueId } = await req.json()
    
    const params = new URLSearchParams({
      query: query,
      uniqueId: uniqueId || "STUAMIT1"
    });
    
    const response = await fetch(`https://nclbtaru.app.n8n.cloud/webhook/AI-BUDDY-MAIN?${params}`, {
      method: "GET"
    });
    
    const responseText = await response.text();
    
    return new Response(
      responseText,
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 400
      }
    )
  }
})