import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createBillingPortalSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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
      stripe_customer_id: string | null;
    };

    if (!business.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No payment method on file' },
        { status: 400 }
      );
    }

    // Get the base URL from the request
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create a billing portal session
    const session = await createBillingPortalSession(
      business.stripe_customer_id,
      `${origin}/settings`
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
