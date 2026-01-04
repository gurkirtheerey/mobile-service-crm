import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get the business to verify subscription status
  const { data: membership } = await supabase
    .from('business_members')
    .select('businesses(*)')
    .eq('user_id', user.id)
    .single();

  const business = membership?.businesses as {
    id: string;
    name: string;
    subscription_status: string | null;
  } | null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          Welcome to ZoneCRM!
        </h1>
        <p className="text-[var(--foreground)]/60 mb-8">
          Your subscription is now active. You&apos;re all set to start managing your
          mobile service business more efficiently.
        </p>

        {business && (
          <div className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-lg p-4 mb-8">
            <p className="text-sm text-[var(--foreground)]/60">Business</p>
            <p className="font-medium text-[var(--foreground)]">{business.name}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full py-3 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors font-medium"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/clients/new"
            className="block w-full py-3 px-4 bg-[var(--foreground)]/5 text-[var(--foreground)] rounded-lg hover:bg-[var(--foreground)]/10 transition-colors font-medium"
          >
            Add Your First Client
          </Link>
        </div>

        <p className="mt-8 text-xs text-[var(--foreground)]/50">
          Need help getting started? Check out our documentation or contact support.
        </p>
      </div>
    </div>
  );
}
