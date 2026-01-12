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

    // Production n8n webhook URL
    const N8N_WEBHOOK_URL = 'https://nutrimind.app.n8n.cloud/webhook/ai-agent-rag';
    
    // Get the last user message as query
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    const query = lastUserMessage?.content || '';

    // Forward request to n8n webhook with correct format and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    let response;
    try {
      response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          sessionId: conversationId || 'anonymous',
        }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('n8n fetch error:', fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Le service a mis trop de temps à répondre. Veuillez réessayer.' }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Impossible de contacter le service n8n. Veuillez réessayer plus tard.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ error: `Erreur du service n8n (${response.status})` }),
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
      // Handle JSON or text response from n8n
      const responseText = await response.text();
      console.log('n8n response:', responseText.substring(0, 200));
      
      if (!responseText || responseText.trim() === '') {
        console.error('n8n returned empty response');
        return new Response(
          JSON.stringify({ error: 'Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      let content = responseText;
      
      // Try to parse as JSON if it looks like JSON
      if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
        try {
          const data = JSON.parse(responseText);
          content = data.output || data.content || data.response || data.message || data.text || responseText;
        } catch (e) {
          console.log('Response is not valid JSON, using as plain text');
        }
      }
      
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
