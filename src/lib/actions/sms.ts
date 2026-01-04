'use server';

import { createClient } from '@/lib/supabase/server';
import { sendSMS } from '@/lib/sms';

export async function sendMessageToClient(clientId: string, message: string) {
  const supabase = await createClient();

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Get client details
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, name, phone, email, preferred_contact_method')
    .eq('id', clientId)
    .single();

  if (clientError || !client) {
    return { error: 'Client not found' };
  }

  if (!client.phone) {
    return { error: 'Client does not have a phone number' };
  }

  // Send the SMS
  const result = await sendSMS(client.phone, message);

  if (!result.success) {
    return { error: result.error || 'Failed to send message' };
  }

  return {
    success: true,
    messageId: result.messageId,
    sentTo: client.phone,
  };
}
