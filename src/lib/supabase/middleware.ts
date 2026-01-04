import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/clients', '/appointments', '/settings'];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Onboarding paths - require auth but not subscription
  const isOnboardingPath = pathname.startsWith('/onboarding');

  // API routes that don't need subscription check
  const isApiRoute = pathname.startsWith('/api');

  if (isProtectedPath && !user) {
    // Redirect to login page
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Helper function to get subscription status
  async function getSubscriptionStatus(): Promise<string | null> {
    const { data: membership } = await supabase
      .from('business_members')
      .select('businesses(subscription_status)')
      .eq('user_id', user!.id)
      .single();

    if (!membership?.businesses) return null;
    const business = membership.businesses as unknown as { subscription_status: string | null };
    return business?.subscription_status ?? null;
  }

  // If logged in and trying to access login page, check subscription status
  if (user && pathname === '/login') {
    const subscriptionStatus = await getSubscriptionStatus();
    const hasActiveSubscription = subscriptionStatus === 'active';

    const url = request.nextUrl.clone();
    if (hasActiveSubscription) {
      url.pathname = '/dashboard';
    } else {
      url.pathname = '/onboarding/payment';
    }
    return NextResponse.redirect(url);
  }

  // Check subscription for protected routes
  if (user && isProtectedPath && !isApiRoute) {
    const subscriptionStatus = await getSubscriptionStatus();
    const hasActiveSubscription = subscriptionStatus === 'active';

    if (!hasActiveSubscription) {
      // Redirect to payment page
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding/payment';
      return NextResponse.redirect(url);
    }
  }

  // If user has active subscription and tries to access payment page, redirect to dashboard
  if (user && isOnboardingPath && pathname === '/onboarding/payment') {
    const subscriptionStatus = await getSubscriptionStatus();
    const hasActiveSubscription = subscriptionStatus === 'active';

    if (hasActiveSubscription) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Require auth for onboarding paths
  if (isOnboardingPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
