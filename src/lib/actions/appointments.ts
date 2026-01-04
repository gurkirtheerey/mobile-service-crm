'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { InsertTables, UpdateTables } from '@/types/database';

type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

// Type for appointments with relations
export interface AppointmentWithRelations {
  id: string;
  business_id: string;
  client_id: string;
  service_id: string;
  zone_id: string;
  scheduled_start: string;
  scheduled_end: string;
  assigned_technician_id: string | null;
  status: AppointmentStatus;
  weather_flagged: boolean;
  total_price: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    lat?: number | null;
    lng?: number | null;
  } | null;
  service?: {
    id: string;
    name: string;
    duration_minutes?: number;
    base_price?: number;
    description?: string | null;
  } | null;
  zone?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export async function getAppointments(options?: {
  startDate?: Date;
  endDate?: Date;
  zoneId?: string;
  clientId?: string;
  status?: AppointmentStatus;
  limit?: number;
}): Promise<AppointmentWithRelations[]> {
  const supabase = await createClient();

  let query = supabase
    .from('appointments')
    .select(`
      *,
      client:clients(id, name, phone, email, street, city, state, zip),
      service:services(id, name, duration_minutes, base_price),
      zone:zones(id, name, color)
    `)
    .order('scheduled_start', { ascending: true });

  if (options?.startDate) {
    query = query.gte('scheduled_start', options.startDate.toISOString());
  }

  if (options?.endDate) {
    query = query.lt('scheduled_start', options.endDate.toISOString());
  }

  if (options?.zoneId) {
    query = query.eq('zone_id', options.zoneId);
  }

  if (options?.clientId) {
    query = query.eq('client_id', options.clientId);
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as unknown as AppointmentWithRelations[];
}

export async function getAppointmentById(id: string): Promise<AppointmentWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(id, name, phone, email, street, city, state, zip, lat, lng),
      service:services(id, name, duration_minutes, base_price, description),
      zone:zones(id, name, color)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as AppointmentWithRelations;
}

export async function getTodayAppointments(): Promise<AppointmentWithRelations[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getAppointments({
    startDate: today,
    endDate: tomorrow,
  });
}

export async function getWeekAppointments(weekStart: Date): Promise<AppointmentWithRelations[]> {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return getAppointments({
    startDate: weekStart,
    endDate: weekEnd,
  });
}

export async function createAppointment(formData: FormData) {
  const supabase = await createClient();

  // Get user's business
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    return { error: 'No business found' };
  }

  const serviceId = formData.get('serviceId') as string;
  const scheduledStart = new Date(formData.get('scheduledStart') as string);

  // Get service to calculate end time
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes, base_price')
    .eq('id', serviceId)
    .single();

  if (!service) {
    return { error: 'Service not found' };
  }

  const scheduledEnd = new Date(scheduledStart);
  scheduledEnd.setMinutes(scheduledEnd.getMinutes() + (service.duration_minutes || 60));

  // Get client's zone
  const clientId = formData.get('clientId') as string;
  const { data: client } = await supabase
    .from('clients')
    .select('assigned_zone_id')
    .eq('id', clientId)
    .single();

  if (!client || !client.assigned_zone_id) {
    return { error: 'Client not found or not assigned to a zone' };
  }

  const appointmentData: InsertTables<'appointments'> = {
    business_id: membership.business_id,
    client_id: clientId,
    service_id: serviceId,
    zone_id: client.assigned_zone_id,
    scheduled_start: scheduledStart.toISOString(),
    scheduled_end: scheduledEnd.toISOString(),
    status: 'scheduled',
    total_price: parseFloat(formData.get('totalPrice') as string) || Number(service.base_price) || 0,
    notes: formData.get('notes') as string || null,
  };

  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/appointments');
  revalidatePath('/dashboard');
  return { data };
}

export async function updateAppointment(id: string, formData: FormData) {
  const supabase = await createClient();

  const updateData: UpdateTables<'appointments'> = {};

  const status = formData.get('status') as AppointmentStatus | null;
  if (status) {
    updateData.status = status;
  }

  const scheduledStart = formData.get('scheduledStart') as string;
  if (scheduledStart) {
    const startDate = new Date(scheduledStart);
    updateData.scheduled_start = startDate.toISOString();

    // Recalculate end time if service is provided
    const serviceId = formData.get('serviceId') as string;
    if (serviceId) {
      const { data: service } = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('id', serviceId)
        .single();

      if (service) {
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + (service.duration_minutes || 60));
        updateData.scheduled_end = endDate.toISOString();
      }
    }
  }

  const notes = formData.get('notes');
  if (notes !== null) {
    updateData.notes = notes as string || null;
  }

  const totalPrice = formData.get('totalPrice');
  if (totalPrice) {
    updateData.total_price = parseFloat(totalPrice as string);
  }

  const { data, error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/appointments');
  revalidatePath('/dashboard');
  return { data };
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/appointments');
  revalidatePath('/dashboard');
  return { data };
}

export async function deleteAppointment(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/appointments');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getAppointmentStats() {
  const supabase = await createClient();

  // Today's appointment count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { count: todayCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('scheduled_start', today.toISOString())
    .lt('scheduled_start', tomorrow.toISOString())
    .neq('status', 'cancelled');

  // Week revenue (completed appointments)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: weekAppointments } = await supabase
    .from('appointments')
    .select('total_price')
    .eq('status', 'completed')
    .gte('scheduled_start', weekAgo.toISOString());

  const weekRevenue = weekAppointments?.reduce((sum, apt) => sum + Number(apt.total_price || 0), 0) || 0;

  // Completion rate (last 30 days)
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('scheduled_start', monthAgo.toISOString())
    .in('status', ['completed', 'cancelled', 'no_show']);

  const { count: completedAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('scheduled_start', monthAgo.toISOString())
    .eq('status', 'completed');

  const completionRate = totalAppointments && totalAppointments > 0
    ? Math.round(((completedAppointments || 0) / totalAppointments) * 100)
    : 100;

  return {
    todayAppointments: todayCount || 0,
    weekRevenue,
    completionRate,
  };
}

// Check zone availability for a specific date
export async function checkZoneAvailability(
  zoneId: string,
  date: Date
): Promise<{ available: boolean; currentCount: number; maxCapacity: number }> {
  const supabase = await createClient();

  // Get zone capacity
  const { data: zone } = await supabase
    .from('zones')
    .select('max_appointments_per_day, assigned_days')
    .eq('id', zoneId)
    .single();

  if (!zone) {
    return { available: false, currentCount: 0, maxCapacity: 0 };
  }

  // Check if this day is an assigned day for the zone
  const dayOfWeek = date.getDay();
  if (!zone.assigned_days.includes(dayOfWeek)) {
    return { available: false, currentCount: 0, maxCapacity: zone.max_appointments_per_day };
  }

  // Count existing appointments for this zone on this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { count } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('zone_id', zoneId)
    .gte('scheduled_start', startOfDay.toISOString())
    .lt('scheduled_start', endOfDay.toISOString())
    .neq('status', 'cancelled');

  const currentCount = count || 0;

  return {
    available: currentCount < zone.max_appointments_per_day,
    currentCount,
    maxCapacity: zone.max_appointments_per_day,
  };
}
