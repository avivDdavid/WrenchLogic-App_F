import { supabase } from './supabase';

// localStorage key for an avatar chosen at signup, applied on first login when
// email confirmation delayed the session (so we couldn't write profiles yet).
const PENDING_AVATAR_KEY = 'wl_pending_avatar';

// profiles table (real schema): id, user_id, display_name, avatar_url,
// first_name, phone, location, created_at. Linked to auth.users via user_id.

export async function fetchProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) { console.error('[profile] fetch failed:', error.message); return null; }
  return data ?? null;
}

// Insert the row if missing, otherwise update — keyed on user_id.
export async function upsertProfile(userId, fields) {
  if (!userId) return { error: { message: 'no user' } };
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return await supabase.from('profiles').update(fields).eq('user_id', userId);
  }
  return await supabase.from('profiles').insert({ user_id: userId, ...fields });
}

export function stashPendingAvatar(dataUrl) {
  try { localStorage.setItem(PENDING_AVATAR_KEY, dataUrl); } catch { /* ignore */ }
}

// Run after login: backfill the profile row from signup metadata + any avatar
// stashed at signup. Only fills fields that are still empty, so it never
// clobbers edits the user made later. Safe to call on every login (idempotent).
export async function syncProfileFromSignup(user) {
  if (!user) return;
  const meta = user.user_metadata || {};
  let pendingAvatar = null;
  try { pendingAvatar = localStorage.getItem(PENDING_AVATAR_KEY); } catch { /* ignore */ }

  const profile = await fetchProfile(user.id);

  const fields = {};
  if (!profile?.first_name && meta.first_name) fields.first_name = meta.first_name;
  if (!profile?.phone      && meta.phone)      fields.phone      = meta.phone;
  if (!profile?.location   && meta.location)   fields.location   = meta.location;
  if (!profile?.avatar_url && pendingAvatar)   fields.avatar_url = pendingAvatar;

  if (Object.keys(fields).length > 0) {
    const { error } = await upsertProfile(user.id, fields);
    if (error) console.error('[profile] sync failed:', error.message);
  }
  if (pendingAvatar) { try { localStorage.removeItem(PENDING_AVATAR_KEY); } catch { /* ignore */ } }
}
