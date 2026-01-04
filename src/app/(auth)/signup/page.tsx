'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signUp } from '@/lib/actions/auth';

const SERVICE_TYPES = [
  { value: 'auto_detailing', label: 'Auto Detailing' },
  { value: 'house_cleaning', label: 'House Cleaning' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'handyman', label: 'Handyman / Home Repair' },
  { value: 'pet_grooming', label: 'Pet Grooming' },
  { value: 'pool_service', label: 'Pool Service' },
  { value: 'mobile_service', label: 'Other Mobile Service' },
];

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // If successful, signUp redirects to /dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            ZoneCRM
          </h1>
          <p className="text-sm text-[var(--foreground)]/60 mt-2">
            Create your account
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="businessName"
              className="block text-sm font-medium text-[var(--foreground)]/80 mb-1"
            >
              Business Name
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              required
              className="w-full px-3 py-2 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
              placeholder="Your Business Name"
            />
          </div>

          <div>
            <label
              htmlFor="serviceType"
              className="block text-sm font-medium text-[var(--foreground)]/80 mb-1"
            >
              Service Type
            </label>
            <select
              id="serviceType"
              name="serviceType"
              required
              className="w-full px-3 py-2 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
            >
              {SERVICE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[var(--foreground)]/80 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--foreground)]/80 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-3 py-2 bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-[var(--foreground)]/50">
              At least 6 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--foreground)]/60">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--primary)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
