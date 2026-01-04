import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

function getTwilioClient() {
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured');
  }
  return twilio(accountSid, authToken);
}

export interface SendSMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendSMS(
  to: string,
  message: string
): Promise<SendSMSResult> {
  if (!fromNumber) {
    return { success: false, error: 'Twilio phone number not configured' };
  }

  // Normalize phone number (ensure it starts with +1 for US)
  let normalizedPhone = to.replace(/\D/g, '');
  if (normalizedPhone.length === 10) {
    normalizedPhone = '1' + normalizedPhone;
  }
  if (!normalizedPhone.startsWith('+')) {
    normalizedPhone = '+' + normalizedPhone;
  }

  try {
    const client = getTwilioClient();
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: normalizedPhone,
    });

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    };
  }
}

export async function sendAppointmentReminder(
  phone: string,
  clientName: string,
  serviceName: string,
  appointmentTime: Date
): Promise<SendSMSResult> {
  const formattedTime = appointmentTime.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const message = `Hi ${clientName}! Reminder: Your ${serviceName} is scheduled for ${formattedTime}. Reply YES to confirm or call us to reschedule.`;

  return sendSMS(phone, message);
}

export async function sendAppointmentConfirmation(
  phone: string,
  clientName: string,
  serviceName: string,
  appointmentTime: Date
): Promise<SendSMSResult> {
  const formattedTime = appointmentTime.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const message = `Hi ${clientName}! Your ${serviceName} has been scheduled for ${formattedTime}. We'll see you then!`;

  return sendSMS(phone, message);
}
