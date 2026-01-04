'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const businessName = formData.get('businessName') as string;
  const serviceType = formData.get('serviceType') as string || 'mobile_service';

  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: 'Failed to create user' };
  }

  // Create the business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      name: businessName,
      service_type: serviceType,
      service_area: 'default',
      owner_id: authData.user.id,
    })
    .select()
    .single();

  if (businessError) {
    return { error: businessError.message };
  }

  // Add owner as admin member
  const { error: memberError } = await supabase
    .from('business_members')
    .insert({
      business_id: business.id,
      user_id: authData.user.id,
      role: 'admin',
    });

  if (memberError) {
    return { error: memberError.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentBusiness() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id, role, businesses(*)')
    .eq('user_id', user.id)
    .single();

  if (!membership) return null;

  return {
    ...membership.businesses,
    role: membership.role,
  };
}
