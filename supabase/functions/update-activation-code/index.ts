import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, newActivationCode } = await req.json();

    if (!userId || !newActivationCode) {
      return new Response(
        JSON.stringify({ error: 'User ID and new activation code are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate activation code is exactly 8 characters
    if (newActivationCode.length !== 8) {
      return new Response(
        JSON.stringify({ error: 'Activation code must be exactly 8 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the new activation code already exists
    const { data: existingCode } = await supabase
      .from('profiles')
      .select('activation_code')
      .eq('activation_code', newActivationCode.toUpperCase())
      .single();

    if (existingCode) {
      return new Response(
        JSON.stringify({ error: 'This activation code is already in use' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the user's activation code
    const { error } = await supabase
      .from('profiles')
      .update({ 
        activation_code: newActivationCode.toUpperCase(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating activation code:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update activation code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully updated activation code for user: ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Activation code updated successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-activation-code function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});