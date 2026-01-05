'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createService } from '@/lib/actions/services';
import Link from 'next/link';

export function ServiceForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createService(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/settings/services');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Service Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Service Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="e.g., Full Detail, Basic Wash, Interior Clean"
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Describe what's included in this service..."
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Duration and Price */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="durationMinutes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Duration (minutes) *
          </label>
          <input
            type="number"
            id="durationMinutes"
            name="durationMinutes"
            required
            min="1"
            placeholder="60"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            How long does this service typically take?
          </p>
        </div>

        <div>
          <label htmlFor="basePrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Base Price ($) *
          </label>
          <input
            type="number"
            id="basePrice"
            name="basePrice"
            required
            min="0"
            step="0.01"
            placeholder="99.00"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Starting price before any modifiers
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="weatherDependent"
            name="weatherDependent"
            value="true"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
          />
          <div>
            <label htmlFor="weatherDependent" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Weather Dependent
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enable weather alerts for appointments using this service. Useful for outdoor services.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="active"
            name="active"
            value="true"
            defaultChecked
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
          />
          <div>
            <label htmlFor="active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Active
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Inactive services won&apos;t appear in booking options.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
        <Link
          href="/settings/services"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900"
        >
          {isPending ? 'Creating...' : 'Create Service'}
        </button>
      </div>
    </form>
  );
}
