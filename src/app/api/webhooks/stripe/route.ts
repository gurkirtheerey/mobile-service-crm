import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Stripe webhook handler for payment events
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  // In production, verify the webhook signature using Stripe SDK
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

  try {
    const event = JSON.parse(body);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: {
  metadata?: { appointment_id?: string };
}) {
  const appointmentId = paymentIntent.metadata?.appointment_id;
  if (!appointmentId) return;

  const supabase = createAdminClient();

  await supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', appointmentId);
}

async function handlePaymentFailed(paymentIntent: {
  metadata?: { appointment_id?: string };
}) {
  const appointmentId = paymentIntent.metadata?.appointment_id;
  if (!appointmentId) return;

  // Log payment failure - could notify admin
  console.error(`Payment failed for appointment ${appointmentId}`);
}

async function handleInvoicePaid(invoice: {
  metadata?: { business_id?: string };
}) {
  const businessId = invoice.metadata?.business_id;
  if (!businessId) return;

  // Handle subscription renewal or other invoice payments
  console.log(`Invoice paid for business ${businessId}`);
}
