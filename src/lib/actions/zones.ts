'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { InsertTables, UpdateTables, DbZone } from '@/types/database';

// Zone with stats
export interface ZoneWithStats extends DbZone {
  clientCount: number;
  appointmentCount: number;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getZones() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getZoneById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getZonesWithStats() {
  const supabase = await createClient();

  // Get zones
  const { data: zones, error: zonesError } = await supabase
    .from('zones')
    .select('*')
    .order('name');

  if (zonesError) {
    throw new Error(zonesError.message);
  }

  // Get client counts per zone
  const { data: clientCounts } = await supabase
    .from('clients')
    .select('assigned_zone_id')
    .not('assigned_zone_id', 'is', null);

  // Get today's appointment counts per zone
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: appointmentCounts } = await supabase
    .from('appointments')
    .select('zone_id')
    .gte('scheduled_start', today.toISOString())
    .lt('scheduled_start', tomorrow.toISOString())
    .neq('status', 'cancelled');

  // Build stats map
  const clientCountMap = new Map<string, number>();
  const appointmentCountMap = new Map<string, number>();

  clientCounts?.forEach((c) => {
    const count = clientCountMap.get(c.assigned_zone_id!) || 0;
    clientCountMap.set(c.assigned_zone_id!, count + 1);
  });

  appointmentCounts?.forEach((a) => {
    const count = appointmentCountMap.get(a.zone_id) || 0;
    appointmentCountMap.set(a.zone_id, count + 1);
  });

  return zones.map((zone) => ({
    ...zone,
    clientCount: clientCountMap.get(zone.id) || 0,
    appointmentCount: appointmentCountMap.get(zone.id) || 0,
  }));
}

export async function createZone(formData: FormData) {
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

  // Parse assigned days from comma-separated string
  const assignedDaysStr = formData.get('assignedDays') as string;
  const assignedDays = assignedDaysStr
    ? assignedDaysStr.split(',').map((d) => parseInt(d.trim(), 10))
    : [];

  const zoneData: InsertTables<'zones'> = {
    business_id: membership.business_id,
    name: formData.get('name') as string,
    assigned_days: assignedDays,
    center_lat: parseFloat(formData.get('centerLat') as string),
    center_lng: parseFloat(formData.get('centerLng') as string),
    radius_miles: parseFloat(formData.get('radiusMiles') as string) || 6,
    max_appointments_per_day: parseInt(formData.get('maxAppointmentsPerDay') as string, 10) || 6,
    avg_service_duration_minutes: parseInt(formData.get('avgServiceDurationMinutes') as string, 10) || 90,
    travel_buffer_minutes: parseInt(formData.get('travelBufferMinutes') as string, 10) || 15,
    color: (formData.get('color') as string) || '#3B82F6',
    team_assignment: formData.get('teamAssignment') as string || null,
  };

  const { data, error } = await supabase
    .from('zones')
    .insert(zoneData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings/zones');
  return { data };
}

export async function updateZone(id: string, formData: FormData) {
  const supabase = await createClient();

  // Parse assigned days from comma-separated string
  const assignedDaysStr = formData.get('assignedDays') as string;
  const assignedDays = assignedDaysStr
    ? assignedDaysStr.split(',').map((d) => parseInt(d.trim(), 10))
    : [];

  const updateData: UpdateTables<'zones'> = {
    name: formData.get('name') as string,
    assigned_days: assignedDays,
    center_lat: parseFloat(formData.get('centerLat') as string),
    center_lng: parseFloat(formData.get('centerLng') as string),
    radius_miles: parseFloat(formData.get('radiusMiles') as string) || 6,
    max_appointments_per_day: parseInt(formData.get('maxAppointmentsPerDay') as string, 10) || 6,
    avg_service_duration_minutes: parseInt(formData.get('avgServiceDurationMinutes') as string, 10) || 90,
    travel_buffer_minutes: parseInt(formData.get('travelBufferMinutes') as string, 10) || 15,
    color: (formData.get('color') as string) || '#3B82F6',
    team_assignment: formData.get('teamAssignment') as string || null,
  };

  const { data, error } = await supabase
    .from('zones')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings/zones');
  return { data };
}

export async function deleteZone(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('zones')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings/zones');
  return { success: true };
}

// Find the best zone for a given location
export async function assignToZone(
  lat: number,
  lng: number
): Promise<{ zoneId: string; distance: number } | null> {
  const supabase = await createClient();

  const { data: zones, error } = await supabase
    .from('zones')
    .select('id, center_lat, center_lng, radius_miles');

  if (error || !zones || zones.length === 0) {
    return null;
  }

  let bestZone: { zoneId: string; distance: number } | null = null;

  for (const zone of zones) {
    const distance = calculateDistance(lat, lng, zone.center_lat, zone.center_lng);

    // Only consider zones where the client is within the radius
    if (distance <= zone.radius_miles) {
      if (!bestZone || distance < bestZone.distance) {
        bestZone = { zoneId: zone.id, distance };
      }
    }
  }

  // If no zone found within radius, assign to closest zone
  if (!bestZone) {
    let closestZone: { zoneId: string; distance: number } | null = null;

    for (const zone of zones) {
      const distance = calculateDistance(lat, lng, zone.center_lat, zone.center_lng);

      if (!closestZone || distance < closestZone.distance) {
        closestZone = { zoneId: zone.id, distance };
      }
    }

    bestZone = closestZone;
  }

  return bestZone;
}

// Get available days for a zone
export async function getZoneAvailableDays(zoneId: string): Promise<number[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('zones')
    .select('assigned_days')
    .eq('id', zoneId)
    .single();

  if (error || !data) {
    return [];
  }

  return data.assigned_days;
}
