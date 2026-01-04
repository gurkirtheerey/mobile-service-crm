'use client';

import { useState } from 'react';
import { StatusBadge } from '@/components/ui/status-badge';
import type { DbZone } from '@/types/database';
import type { AppointmentStatus } from '@/types';

interface AppointmentWithRelations {
  id: string;
  scheduled_start: string;
  scheduled_end: string;
  status: AppointmentStatus;
  total_price: number;
  zone_id: string;
  client?: {
    id: string;
    name: string;
  } | null;
  service?: {
    id: string;
    name: string;
  } | null;
  zone?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

interface AppointmentsCalendarProps {
  appointments: AppointmentWithRelations[];
  zones: DbZone[];
}

function getWeekDays(startDate: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  return days;
}

function formatDayHeader(date: Date): { day: string; date: string } {
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    date: date.getDate().toString(),
  };
}

export function AppointmentsCalendar({
  appointments,
  zones,
}: AppointmentsCalendarProps) {
  const [weekStart, setWeekStart] = useState(new Date());
  const [selectedZone, setSelectedZone] = useState<string>('');

  const weekDays = getWeekDays(weekStart);

  const filteredAppointments = selectedZone
    ? appointments.filter((apt) => apt.zone_id === selectedZone)
    : appointments;

  const getAppointmentsForDay = (date: Date) => {
    return filteredAppointments.filter(
      (apt) =>
        new Date(apt.scheduled_start).toDateString() === date.toDateString()
    );
  };

  const goToPrevWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() - 7);
    setWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() + 7);
    setWeekStart(newDate);
  };

  const goToToday = () => {
    setWeekStart(new Date());
  };

  return (
    <>
      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevWeek}
            className="rounded-lg border border-border p-2 hover:bg-muted"
          >
            <svg
              className="h-4 w-4 text-foreground-secondary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground-secondary hover:bg-muted"
          >
            Today
          </button>
          <button
            onClick={goToNextWeek}
            className="rounded-lg border border-border p-2 hover:bg-muted"
          >
            <svg
              className="h-4 w-4 text-foreground-secondary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
          <span className="ml-2 text-lg font-semibold text-foreground">
            {weekStart.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Zones</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Week Calendar */}
      <div className="rounded-xl border border-border bg-card">
        {/* Week Header */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day, index) => {
            const { day: dayName, date } = formatDayHeader(day);
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div
                key={index}
                className={`border-r border-border p-3 text-center last:border-r-0 ${
                  isToday ? 'bg-primary/10' : ''
                }`}
              >
                <p className="text-xs font-medium text-foreground-muted">
                  {dayName}
                </p>
                <p
                  className={`mt-1 text-lg font-semibold ${
                    isToday
                      ? 'text-primary'
                      : 'text-foreground'
                  }`}
                >
                  {date}
                </p>
              </div>
            );
          })}
        </div>

        {/* Week Body */}
        <div className="grid min-h-[400px] grid-cols-7">
          {weekDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`border-r border-border p-2 last:border-r-0 ${
                  isToday ? 'bg-primary/5' : ''
                }`}
              >
                <div className="space-y-2">
                  {dayAppointments.map((apt) => {
                    const zone = apt.zone;
                    const client = apt.client;
                    const service = apt.service;

                    return (
                      <div
                        key={apt.id}
                        className="cursor-pointer rounded-lg border-l-4 bg-background p-2 shadow-sm transition-shadow hover:shadow"
                        style={{ borderLeftColor: zone?.color || '#6B7280' }}
                      >
                        <p className="text-xs font-medium text-foreground">
                          {new Date(apt.scheduled_start).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="mt-1 text-xs text-foreground-secondary">
                          {client?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {service?.name || 'Service'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointments List */}
      <div className="mt-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          All Appointments
        </h2>
        <div className="rounded-xl border border-border bg-card">
          {filteredAppointments.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredAppointments
                .sort(
                  (a, b) =>
                    new Date(a.scheduled_start).getTime() -
                    new Date(b.scheduled_start).getTime()
                )
                .map((apt) => {
                  const zone = apt.zone;
                  const client = apt.client;
                  const service = apt.service;

                  return (
                    <div
                      key={apt.id}
                      className="flex items-center gap-4 px-6 py-4"
                    >
                      <div
                        className="h-10 w-1 rounded-full"
                        style={{ backgroundColor: zone?.color || '#6B7280' }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {client?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-foreground-muted">
                          {service?.name || 'Service'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {new Date(apt.scheduled_start).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-foreground-muted">
                          {new Date(apt.scheduled_start).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <StatusBadge status={apt.status} />
                      <p className="w-16 text-right font-medium text-foreground">
                        ${Number(apt.total_price).toFixed(0)}
                      </p>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-foreground-muted">
                No appointments found
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
