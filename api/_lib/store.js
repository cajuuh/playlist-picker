import { supabase } from './supabase.js';

export function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

export async function getRecord(phone) {
  const key = normalizePhone(phone);
  if (!key) return null;
  const { data, error } = await supabase
    .from('submissions')
    .select('name, tracks, reserved')
    .eq('phone', key)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Atomically reserves `count` slots for phone via the reserve_slots Postgres
 * function (schema in supabase/schema.sql). The check-and-increment happens
 * as a single row-locked UPDATE in Postgres, so two concurrent serverless
 * invocations for the same phone number can't both slip past the 2-song
 * limit — unlike an in-process check, this is safe across separate
 * function instances.
 */
export async function reserveSlots(phone, name, count) {
  const key = normalizePhone(phone);
  if (!key) throw new Error('Phone number required');
  const { data, error } = await supabase.rpc('reserve_slots', {
    p_phone: key,
    p_name: name,
    p_count: count,
  });
  if (error) throw error;
  return Boolean(data);
}

export async function commitTrack(phone, track) {
  const key = normalizePhone(phone);
  const { error } = await supabase.rpc('commit_track', { p_phone: key, p_track: track });
  if (error) throw error;
}

export async function releaseReservation(phone, count) {
  const key = normalizePhone(phone);
  const { error } = await supabase.rpc('release_reservation', { p_phone: key, p_count: count });
  if (error) throw error;
}
