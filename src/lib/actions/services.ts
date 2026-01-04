'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { InsertTables, UpdateTables } from '@/types/database';

export async function getServices(options?: {
  activeOnly?: boolean;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('services')
    .select('*')
    .order('name');

  if (options?.activeOnly) {
    query = query.eq('active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getServiceById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createService(formData: FormData) {
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

  // Parse pricing modifiers if provided
  let pricingModifiers = null;
  const pricingModifiersJson = formData.get('pricingModifiers') as string;
  if (pricingModifiersJson) {
    try {
      pricingModifiers = JSON.parse(pricingModifiersJson);
    } catch {
      // Ignore parsing errors
    }
  }

  // Parse add-ons if provided
  let addOns = null;
  const addOnsJson = formData.get('addOns') as string;
  if (addOnsJson) {
    try {
      addOns = JSON.parse(addOnsJson);
    } catch {
      // Ignore parsing errors
    }
  }

  const serviceData: InsertTables<'services'> = {
    business_id: membership.business_id,
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    duration_minutes: parseInt(formData.get('durationMinutes') as string, 10),
    base_price: parseFloat(formData.get('basePrice') as string),
    pricing_modifiers: pricingModifiers,
    add_ons: addOns,
    weather_dependent: formData.get('weatherDependent') === 'true',
    active: formData.get('active') !== 'false',
  };

  const { data, error } = await supabase
    .from('services')
    .insert(serviceData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings/services');
  return { data };
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient();

  // Parse pricing modifiers if provided
  let pricingModifiers = undefined;
  const pricingModifiersJson = formData.get('pricingModifiers') as string;
  if (pricingModifiersJson) {
    try {
      pricingModifiers = JSON.parse(pricingModifiersJson);
    } catch {
      // Ignore parsing errors
    }
  }

  // Parse add-ons if provided
  let addOns = undefined;
  const addOnsJson = formData.get('addOns') as string;
  if (addOnsJson) {
    try {
      addOns = JSON.parse(addOnsJson);
    } catch {
      // Ignore parsing errors
    }
  }

  const updateData: UpdateTables<'services'> = {
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    duration_minutes: parseInt(formData.get('durationMinutes') as string, 10),
    base_price: parseFloat(formData.get('basePrice') as string),
    weather_dependent: formData.get('weatherDependent') === 'true',
    active: formData.get('active') !== 'false',
  };

  if (pricingModifiers !== undefined) {
    updateData.pricing_modifiers = pricingModifiers;
  }

  if (addOns !== undefined) {
    updateData.add_ons = addOns;
  }

  const { data, error } = await supabase
    .from('services')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings/services');
  return { data };
}

export async function deleteService(id: string) {
  const supabase = await createClient();

  // First check if any appointments use this service
  const { count } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('service_id', id);

  if (count && count > 0) {
    // Instead of deleting, deactivate the service
    const { error } = await supabase
      .from('services')
      .update({ active: false })
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/settings/services');
    return { success: true, deactivated: true };
  }

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings/services');
  return { success: true };
}

export async function toggleServiceActive(id: string, active: boolean) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('services')
    .update({ active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings/services');
  return { data };
}
