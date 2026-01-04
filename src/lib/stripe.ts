import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Monthly subscription price: $20/month
export const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_PRICE_ID;
export const SUBSCRIPTION_AMOUNT = 2000; // in cents
export const SUBSCRIPTION_CURRENCY = 'usd';

export async function createStripeCustomer(email: string, name: string) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      source: 'zone_crm_signup',
    },
  });
  return customer;
}

export async function createCheckoutSession({
  customerId,
  businessId,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  businessId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  // If we have a price ID configured, use it
  // Otherwise, create a price inline
  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      business_id: businessId,
    },
    subscription_data: {
      metadata: {
        business_id: businessId,
      },
    },
    allow_promotion_codes: true,
  };

  if (SUBSCRIPTION_PRICE_ID) {
    sessionConfig.line_items = [
      {
        price: SUBSCRIPTION_PRICE_ID,
        quantity: 1,
      },
    ];
  } else {
    // Create price inline for development/testing
    sessionConfig.line_items = [
      {
        price_data: {
          currency: SUBSCRIPTION_CURRENCY,
          unit_amount: SUBSCRIPTION_AMOUNT,
          recurring: {
            interval: 'month',
          },
          product_data: {
            name: 'ZoneCRM Pro',
            description: 'Monthly subscription for ZoneCRM - Zone-based scheduling and client management',
          },
        },
        quantity: 1,
      },
    ];
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);
  return session;
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session;
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
  return subscription;
}

export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}

export function constructWebhookEvent(
  body: string,
  signature: string,
  webhookSecret: string
) {
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
