import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createStripeCustomer, createCheckoutSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the business for this user
    const { data: membership, error: membershipError } = await supabase
      .from('business_members')
      .select('business_id, role, businesses(*)')
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    const business = membership.businesses as {
      id: string;
      name: string;
      stripe_customer_id: string | null;
    };

    // Check if already has a Stripe customer ID
    let stripeCustomerId = business.stripe_customer_id;

    if (!stripeCustomerId) {
      // Create a Stripe customer
      const customer = await createStripeCustomer(user.email!, business.name);
      stripeCustomerId = customer.id;

      // Save the Stripe customer ID to the database
      const { error: updateError } = await adminClient
        .from('businesses')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', business.id);

      if (updateError) {
        console.error('Error saving Stripe customer ID:', updateError);
        return NextResponse.json(
          { error: 'Failed to save payment info' },
          { status: 500 }
        );
      }
    }

    // Get the base URL from the request
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create a checkout session
    const session = await createCheckoutSession({
      customerId: stripeCustomerId,
      businessId: business.id,
      successUrl: `${origin}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/onboarding/payment`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
