'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createZone } from '@/lib/actions/zones';
import Link from 'next/link';

const dayOptions = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const colorOptions = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#F97316', label: 'Orange' },
];

export function ZoneForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (selectedDays.length === 0) {
      setError('Please select at least one service day');
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set('assignedDays', selectedDays.join(','));
    formData.set('color', selectedColor);

    startTransition(async () => {
      const result = await createZone(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/settings/zones');
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

      {/* Basic Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Zone Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Zone Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="e.g., North Sacramento, Downtown"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Zone Color
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    selectedColor === color.value
                      ? 'border-slate-900 ring-2 ring-offset-2 dark:border-white'
                      : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Zone Center Location
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Enter the center coordinates of this service zone. You can find coordinates using Google Maps.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="centerLat" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Latitude *
            </label>
            <input
              type="number"
              id="centerLat"
              name="centerLat"
              required
              step="any"
              placeholder="38.5816"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label htmlFor="centerLng" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Longitude *
            </label>
            <input
              type="number"
              id="centerLng"
              name="centerLng"
              required
              step="any"
              placeholder="-121.4944"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label htmlFor="radiusMiles" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Radius (miles)
            </label>
            <input
              type="number"
              id="radiusMiles"
              name="radiusMiles"
              min="1"
              max="50"
              step="0.5"
              defaultValue="6"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Service Days */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Service Days
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Select which days this zone is serviced. Appointments will only be bookable on these days.
        </p>
        <div className="flex flex-wrap gap-2">
          {dayOptions.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedDays.includes(day.value)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Capacity */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Capacity Settings
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="maxAppointmentsPerDay" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Max Appointments/Day
            </label>
            <input
              type="number"
              id="maxAppointmentsPerDay"
              name="maxAppointmentsPerDay"
              min="1"
              max="20"
              defaultValue="6"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Maximum bookings per service day
            </p>
          </div>

          <div>
            <label htmlFor="avgServiceDurationMinutes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Avg Service Duration (min)
            </label>
            <input
              type="number"
              id="avgServiceDurationMinutes"
              name="avgServiceDurationMinutes"
              min="15"
              max="480"
              step="15"
              defaultValue="90"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Average time per appointment
            </p>
          </div>

          <div>
            <label htmlFor="travelBufferMinutes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Travel Buffer (min)
            </label>
            <input
              type="number"
              id="travelBufferMinutes"
              name="travelBufferMinutes"
              min="0"
              max="60"
              step="5"
              defaultValue="15"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Buffer time between appointments
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
        <Link
          href="/settings/zones"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900"
        >
          {isPending ? 'Creating...' : 'Create Zone'}
        </button>
      </div>
    </form>
  );
}
