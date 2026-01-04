'use server';

import { createClient } from '@/lib/supabase/server';
import type { DashboardStats } from '@/types';

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  // Get total client count
  const { count: totalClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });

  // Get today's appointment count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { count: todayAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('scheduled_start', today.toISOString())
    .lt('scheduled_start', tomorrow.toISOString())
    .neq('status', 'cancelled');

  // Get week revenue (completed appointments in last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: weekAppointments } = await supabase
    .from('appointments')
    .select('total_price')
    .eq('status', 'completed')
    .gte('scheduled_start', weekAgo.toISOString());

  const weekRevenue = weekAppointments?.reduce(
    (sum, apt) => sum + Number(apt.total_price || 0),
    0
  ) || 0;

  // Calculate completion rate (last 30 days)
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const { count: totalPastAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('scheduled_start', monthAgo.toISOString())
    .lt('scheduled_start', today.toISOString())
    .in('status', ['completed', 'cancelled', 'no_show']);

  const { count: completedAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('scheduled_start', monthAgo.toISOString())
    .lt('scheduled_start', today.toISOString())
    .eq('status', 'completed');

  const completionRate =
    totalPastAppointments && totalPastAppointments > 0
      ? Math.round(((completedAppointments || 0) / totalPastAppointments) * 100)
      : 100;

  return {
    totalClients: totalClients || 0,
    todayAppointments: todayAppointments || 0,
    weekRevenue,
    completionRate,
  };
}

export async function getTodaySchedule() {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(id, name, phone, street, city),
      service:services(id, name, duration_minutes),
      zone:zones(id, name, color)
    `)
    .gte('scheduled_start', today.toISOString())
    .lt('scheduled_start', tomorrow.toISOString())
    .neq('status', 'cancelled')
    .order('scheduled_start', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getQuickStats() {
  const supabase = await createClient();

  // Upcoming appointments (next 7 days)
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const { count: upcomingCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('scheduled_start', now.toISOString())
    .lt('scheduled_start', nextWeek.toISOString())
    .in('status', ['scheduled', 'confirmed']);

  // Pending confirmations
  const { count: pendingCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('scheduled_start', now.toISOString())
    .eq('status', 'scheduled');

  // Weather flagged appointments
  const { count: weatherFlaggedCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('scheduled_start', now.toISOString())
    .eq('weather_flagged', true)
    .neq('status', 'cancelled');

  return {
    upcomingAppointments: upcomingCount || 0,
    pendingConfirmations: pendingCount || 0,
    weatherFlagged: weatherFlaggedCount || 0,
  };
}
