import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: simple in-memory store (resets on function restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before sending more messages.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, model, conversationId } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Chat request - Model: ${model}, ConversationId: ${conversationId}, Messages: ${messages.length}`);

    // Get the n8n webhook URL from environment
    const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL');
    
    if (!N8N_WEBHOOK_URL) {
      console.error('N8N_WEBHOOK_URL is not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Service non configuré. Veuillez configurer le webhook n8n.',
          content: 'Le service IA n\'est pas encore configuré. Configurez N8N_WEBHOOK_URL dans les secrets.'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Forward request to n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model,
        conversationId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ error: 'Erreur du service n8n' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if n8n returns streaming or JSON
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/event-stream')) {
      // Stream the response directly
      return new Response(response.body, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    } else {
      // Handle JSON response from n8n and convert to SSE format
      const data = await response.json();
      const content = data.content || data.response || data.message || JSON.stringify(data);
      
      // Create SSE formatted response
      const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`;
      
      return new Response(sseData, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    }

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
