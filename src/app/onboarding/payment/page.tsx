'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            ZoneCRM
          </h1>
          <p className="text-sm text-[var(--foreground)]/60 mt-2">
            Complete your subscription
          </p>
        </div>

        <div className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              ZoneCRM Pro
            </h2>
            <div className="mt-4">
              <span className="text-4xl font-bold text-[var(--foreground)]">$20</span>
              <span className="text-[var(--foreground)]/60">/month</span>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
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
              <span className="text-[var(--foreground)]/80">
                Unlimited clients and appointments
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
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
              <span className="text-[var(--foreground)]/80">
                Zone-based scheduling for efficient routing
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
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
              <span className="text-[var(--foreground)]/80">
                SMS notifications and reminders
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
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
              <span className="text-[var(--foreground)]/80">
                Payment processing included
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
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
              <span className="text-[var(--foreground)]/80">
                Mobile-optimized for field work
              </span>
            </li>
          </ul>

          {error && (
            <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-3 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Redirecting to payment...' : 'Subscribe Now'}
          </button>

          <p className="mt-4 text-center text-xs text-[var(--foreground)]/50">
            Cancel anytime. Secure payment powered by Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
