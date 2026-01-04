import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { constructWebhookEvent } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Subscription lifecycle events
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      // Checkout session completed (user finished payment)
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      // Payment events for appointments
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      // Invoice events for subscription billing
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler failed:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const businessId = subscription.metadata?.business_id;
  if (!businessId) {
    console.error('No business_id in subscription metadata');
    return;
  }

  const supabase = createAdminClient();

  // Access current_period_end safely - it's a number (unix timestamp)
  const currentPeriodEnd = (subscription as { current_period_end?: number }).current_period_end;

  const { error } = await supabase
    .from('businesses')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_current_period_end: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
    })
    .eq('id', businessId);

  if (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }

  console.log(`Subscription ${subscription.id} updated for business ${businessId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const businessId = subscription.metadata?.business_id;
  if (!businessId) {
    console.error('No business_id in subscription metadata');
    return;
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('businesses')
    .update({
      subscription_status: 'canceled',
    })
    .eq('id', businessId);

  if (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }

  console.log(`Subscription deleted for business ${businessId}`);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const businessId = session.metadata?.business_id;
  if (!businessId) {
    console.error('No business_id in session metadata');
    return;
  }

  // The subscription update event will handle setting the subscription details
  // Here we just log the successful checkout
  console.log(`Checkout completed for business ${businessId}`);
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const appointmentId = paymentIntent.metadata?.appointment_id;
  if (!appointmentId) return;

  const supabase = createAdminClient();

  await supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', appointmentId);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const appointmentId = paymentIntent.metadata?.appointment_id;
  if (!appointmentId) return;

  console.error(`Payment failed for appointment ${appointmentId}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Get business ID from invoice metadata or subscription metadata
  const metadata = (invoice as { subscription_details?: { metadata?: { business_id?: string } } }).subscription_details?.metadata;
  const businessId = metadata?.business_id || invoice.metadata?.business_id;
  if (!businessId) return;

  console.log(`Invoice paid for business ${businessId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Get business ID from invoice metadata or subscription metadata
  const metadata = (invoice as { subscription_details?: { metadata?: { business_id?: string } } }).subscription_details?.metadata;
  const businessId = metadata?.business_id || invoice.metadata?.business_id;
  if (!businessId) return;

  const supabase = createAdminClient();

  // Update subscription status to past_due
  const { error } = await supabase
    .from('businesses')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', businessId);

  if (error) {
    console.error('Error updating subscription status:', error);
  }

  console.error(`Invoice payment failed for business ${businessId}`);
}
