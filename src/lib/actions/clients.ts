'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { InsertTables, UpdateTables, DbClient } from '@/types/database';
import { assignToZone } from './zones';
import { geocodeAddress } from '@/lib/geocoding';

// Type for clients with zone relation
export interface ClientWithZone extends DbClient {
  zone?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export async function getClients(options?: {
  zoneId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ClientWithZone[]> {
  const supabase = await createClient();

  let query = supabase
    .from('clients')
    .select(`
      *,
      zone:zones(id, name, color)
    `)
    .order('created_at', { ascending: false });

  if (options?.zoneId) {
    query = query.eq('assigned_zone_id', options.zoneId);
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as unknown as ClientWithZone[];
}

export async function getClientById(id: string): Promise<ClientWithZone | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      zone:zones(id, name, color)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as ClientWithZone;
}

export async function createNewClient(formData: FormData) {
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

  const street = formData.get('street') as string;
  const city = formData.get('city') as string;
  const state = formData.get('state') as string;
  const zip = formData.get('zip') as string;

  // Geocode the address
  const geocode = await geocodeAddress(`${street}, ${city}, ${state} ${zip}`);

  // Check if a manual zone was selected
  const manualZoneId = formData.get('zoneId') as string;
  let assignedZoneId: string | null;

  if (manualZoneId && manualZoneId !== 'auto') {
    // Use manually selected zone
    assignedZoneId = manualZoneId;
  } else {
    // Auto-assign zone based on location
    const zoneResult = await assignToZone(geocode.lat, geocode.lng);
    assignedZoneId = zoneResult?.zoneId || null;
  }

  const clientData: InsertTables<'clients'> = {
    business_id: membership.business_id,
    name: formData.get('name') as string,
    phone: formData.get('phone') as string || null,
    email: formData.get('email') as string || null,
    preferred_contact_method: (formData.get('preferredContactMethod') as 'sms' | 'email' | 'phone') || 'sms',
    street,
    city,
    state,
    zip,
    lat: geocode.lat,
    lng: geocode.lng,
    assigned_zone_id: assignedZoneId,
    notes: formData.get('notes') as string || null,
    custom_fields: {},
  };

  const { data, error } = await supabase
    .from('clients')
    .insert(clientData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/clients');
  revalidatePath('/dashboard');
  return { data };
}

export async function updateClient(id: string, formData: FormData) {
  const supabase = await createClient();

  const street = formData.get('street') as string;
  const city = formData.get('city') as string;
  const state = formData.get('state') as string;
  const zip = formData.get('zip') as string;

  // Re-geocode if address changed
  const geocode = await geocodeAddress(`${street}, ${city}, ${state} ${zip}`);

  // Check if a manual zone was selected
  const manualZoneId = formData.get('zoneId') as string;
  let assignedZoneId: string | null;

  if (manualZoneId && manualZoneId !== 'auto') {
    // Use manually selected zone
    assignedZoneId = manualZoneId;
  } else {
    // Auto-assign zone based on location
    const zoneResult = await assignToZone(geocode.lat, geocode.lng);
    assignedZoneId = zoneResult?.zoneId || null;
  }

  const updateData: UpdateTables<'clients'> = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string || null,
    email: formData.get('email') as string || null,
    preferred_contact_method: (formData.get('preferredContactMethod') as 'sms' | 'email' | 'phone') || 'sms',
    street,
    city,
    state,
    zip,
    lat: geocode.lat,
    lng: geocode.lng,
    assigned_zone_id: assignedZoneId,
    notes: formData.get('notes') as string || null,
  };

  const { data, error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/clients');
  revalidatePath(`/clients/${id}`);
  revalidatePath('/appointments');
  return { data };
}

export async function deleteClient(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/clients');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getClientCount(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
}
