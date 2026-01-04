'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createNewClient, updateClient } from '@/lib/actions/clients';
import type { DbClient } from '@/types/database';

interface ClientFormProps {
  client?: DbClient;
  mode: 'create' | 'edit';
}

interface FormState {
  error?: string;
  data?: DbClient;
}

export function ClientForm({ client, mode }: ClientFormProps) {
  const router = useRouter();

  const action = async (_prevState: FormState, formData: FormData): Promise<FormState> => {
    if (mode === 'edit' && client) {
      return updateClient(client.id, formData);
    }
    return createNewClient(formData);
  };

  const [state, formAction, isPending] = useActionState(action, {});

  useEffect(() => {
    if (state.data && !state.error) {
      router.push('/clients');
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </div>
      )}

      {/* Contact Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Contact Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={client?.name || ''}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              defaultValue={client?.phone || ''}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={client?.email || ''}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              placeholder="john@example.com"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="preferredContactMethod"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Preferred Contact Method
            </label>
            <select
              id="preferredContactMethod"
              name="preferredContactMethod"
              defaultValue={client?.preferred_contact_method || 'sms'}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </div>
        </div>
      </div>

      {/* Service Address */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Service Address
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="street"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="street"
              name="street"
              required
              defaultValue={client?.street || ''}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              placeholder="1234 Oak Street"
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              required
              defaultValue={client?.city || ''}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              placeholder="Sacramento"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="state"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="state"
                name="state"
                required
                maxLength={2}
                defaultValue={client?.state || ''}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                placeholder="CA"
              />
            </div>

            <div>
              <label
                htmlFor="zip"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                ZIP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="zip"
                name="zip"
                required
                defaultValue={client?.zip || ''}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                placeholder="95819"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Additional Information
        </h2>
        <div>
          <label
            htmlFor="notes"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={client?.notes || ''}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            placeholder="Any special instructions, gate codes, parking info, etc."
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900"
        >
          {isPending ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {mode === 'create' ? 'Creating...' : 'Saving...'}
            </>
          ) : mode === 'create' ? (
            'Create Client'
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}
