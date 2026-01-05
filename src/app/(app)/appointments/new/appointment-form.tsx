'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createAppointment } from '@/lib/actions/appointments';
import type { ClientWithZone } from '@/lib/actions/clients';
import type { DbService, DbZone } from '@/types/database';
import Link from 'next/link';

interface AppointmentFormProps {
  clients: ClientWithZone[];
  services: DbService[];
  zones: DbZone[];
}

export function AppointmentForm({ clients, services, zones }: AppointmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [clientSearch, setClientSearch] = useState('');

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedService = services.find(s => s.id === selectedServiceId);
  const clientZone = selectedClient?.zone || zones.find(z => z.id === selectedClient?.assigned_zone_id);

  // Get assigned days for the zone
  const zoneDays = clientZone
    ? zones.find(z => z.id === clientZone.id)?.assigned_days || []
    : [];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const assignedDayNames = zoneDays.map(d => dayNames[d]).join(', ');

  // Filter clients based on search
  const filteredClients = clientSearch
    ? clients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(clientSearch.toLowerCase())
      )
    : clients;

  // Update price when service changes
  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setTotalPrice(service.base_price.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!selectedClientId) {
      setError('Please select a client');
      return;
    }

    if (!selectedServiceId) {
      setError('Please select a service');
      return;
    }

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createAppointment(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/appointments');
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

      {/* Client Selection */}
      <div>
        <label htmlFor="clientSearch" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Client *
        </label>
        <div className="mt-1 space-y-2">
          <input
            type="text"
            id="clientSearch"
            placeholder="Search clients..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
          />
          <select
            id="clientId"
            name="clientId"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">Select a client</option>
            {filteredClients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} {client.email ? `(${client.email})` : ''} - {client.city}, {client.state}
              </option>
            ))}
          </select>
        </div>
        {selectedClient && (
          <div className="mt-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium">Address:</span> {selectedClient.street}, {selectedClient.city}, {selectedClient.state} {selectedClient.zip}
            </p>
            {clientZone ? (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">Zone:</span>{' '}
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${clientZone.color}20`,
                    color: clientZone.color
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: clientZone.color }}
                  />
                  {clientZone.name}
                </span>
                {assignedDayNames && (
                  <span className="ml-2 text-xs text-slate-500">
                    (Available: {assignedDayNames})
                  </span>
                )}
              </p>
            ) : (
              <div className="mt-2">
                <label htmlFor="zoneId" className="block text-sm font-medium text-amber-600 dark:text-amber-400">
                  No zone assigned - select a zone for this appointment:
                </label>
                <select
                  id="zoneId"
                  name="zoneId"
                  required
                  className="mt-1 w-full rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-amber-700 dark:bg-slate-800"
                >
                  <option value="">Select a zone</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Service Selection */}
      <div>
        <label htmlFor="serviceId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Service *
        </label>
        <select
          id="serviceId"
          name="serviceId"
          value={selectedServiceId}
          onChange={(e) => handleServiceChange(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - ${service.base_price} ({service.duration_minutes} min)
            </option>
          ))}
        </select>
        {selectedService && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {selectedService.description || 'No description'}
          </p>
        )}
      </div>

      {/* Date and Time */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="scheduledStart" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Date & Time *
          </label>
          <input
            type="datetime-local"
            id="scheduledStart"
            name="scheduledStart"
            required
            min={new Date().toISOString().slice(0, 16)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
          />
          {selectedService && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Duration: {selectedService.duration_minutes} minutes
            </p>
          )}
        </div>

        <div>
          <label htmlFor="totalPrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Total Price ($)
          </label>
          <input
            type="number"
            id="totalPrice"
            name="totalPrice"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            min="0"
            step="0.01"
            placeholder="0.00"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Leave empty to use service base price
          </p>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Any special instructions or notes..."
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
        <Link
          href="/appointments"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900"
        >
          {isPending ? 'Creating...' : 'Create Appointment'}
        </button>
      </div>
    </form>
  );
}
