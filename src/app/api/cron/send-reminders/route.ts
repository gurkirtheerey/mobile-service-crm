import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Cron job endpoint to send appointment reminders
// Should be called hourly or as needed
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Get appointments in the next 24 hours that haven't been reminded
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        scheduled_start,
        client:clients(name, phone, email, preferred_contact_method),
        service:services(name)
      `)
      .gte('scheduled_start', now.toISOString())
      .lt('scheduled_start', tomorrow.toISOString())
      .eq('status', 'scheduled'); // Only remind unconfirmed appointments

    if (error) {
      throw error;
    }

    let sentCount = 0;

    for (const appointment of appointments || []) {
      const client = appointment.client as {
        name: string;
        phone?: string;
        email?: string;
        preferred_contact_method: string;
      } | null;
      const service = appointment.service as { name: string } | null;

      if (!client) continue;

      const appointmentTime = new Date(appointment.scheduled_start);
      const formattedTime = appointmentTime.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      const message = `Hi ${client.name}! Reminder: Your ${service?.name || 'appointment'} is scheduled for ${formattedTime}. Reply YES to confirm or call us to reschedule.`;

      // Send based on preferred contact method
      if (client.preferred_contact_method === 'sms' && client.phone) {
        await sendSMS(client.phone, message);
        sentCount++;
      } else if (client.preferred_contact_method === 'email' && client.email) {
        await sendEmail(client.email, 'Appointment Reminder', message);
        sentCount++;
      }
    }

    return NextResponse.json({
      checked: appointments?.length || 0,
      sent: sentCount,
    });
  } catch (error) {
    console.error('Reminder sending failed:', error);
    return NextResponse.json(
      { error: 'Reminder sending failed' },
      { status: 500 }
    );
  }
}

async function sendSMS(phone: string, message: string): Promise<void> {
  // In production, this would use Twilio
  // const twilio = require('twilio')(
  //   process.env.TWILIO_ACCOUNT_SID,
  //   process.env.TWILIO_AUTH_TOKEN
  // );
  // await twilio.messages.create({
  //   body: message,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: phone,
  // });

  console.log(`[SMS] To: ${phone}, Message: ${message}`);
}

async function sendEmail(
  email: string,
  subject: string,
  body: string
): Promise<void> {
  // In production, this would use SendGrid or similar
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: email,
  //   from: 'noreply@yourcrm.com',
  //   subject,
  //   text: body,
  // });

  console.log(`[Email] To: ${email}, Subject: ${subject}, Body: ${body}`);
}
