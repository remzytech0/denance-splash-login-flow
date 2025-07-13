const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { senderName, senderEmail, paymentScreenshotUrl } = await req.json();

    if (!senderName || !senderEmail) {
      return new Response(
        JSON.stringify({ error: 'Sender name and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!botToken || !chatId) {
      console.error('Telegram bot token or chat ID not configured');
      return new Response(
        JSON.stringify({ error: 'Telegram configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the message
    let message = `🔔 New Activation Purchase Request\n\n`;
    message += `👤 Sender Name: ${senderName}\n`;
    message += `📧 Email: ${senderEmail}\n`;
    message += `📸 Payment Screenshot: ${paymentScreenshotUrl ? 'Provided' : 'Not provided'}\n`;
    message += `⏰ Time: ${new Date().toISOString()}`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      }),
    });

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text();
      console.error('Telegram API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send Telegram notification' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Telegram notification sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-telegram-notification function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});