// Simple token fetcher. Replace URL with your backend endpoint that returns an Agora RTC token.
// The backend should generate a token for the given channel and optional uid.

import { supabase } from '@/integrations/supabase/client';

export async function fetchAgoraToken(channel: string, uid?: string | number) {
  try {
    // Prefer invoking via Supabase client to ensure correct URL and headers
    const { data, error } = await (supabase as any).functions.invoke('agora-token', {
      body: { channel, uid },
    });
    if (error) throw error;
    return data?.token ?? null;
  } catch (e) {
    console.error('fetchAgoraToken error:', e);
    return null; // allow join with app certificate off (temp dev) if tokenless
  }
}


