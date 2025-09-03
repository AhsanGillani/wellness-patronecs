// Supabase Edge Function to mint an Agora RTC token
// Deploy with: supabase functions deploy agora-token
// Set secrets: supabase secrets set --env-file .env.supabase
// Required secrets: AGORA_APP_ID, AGORA_APP_CERTIFICATE

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// ESM shim of the Node package
// Use npm: spec for Supabase Edge Functions (better Node compat)
import { RtcRole, RtcTokenBuilder } from "npm:agora-access-token@2.0.4";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders },
  });
}

serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    let channel = "";
    let uidParam: string | null = null;
    let roleParam = "publisher";

    if (req.method === "GET") {
      const url = new URL(req.url);
      channel = url.searchParams.get("channel") ?? "";
      uidParam = url.searchParams.get("uid");
      roleParam = (url.searchParams.get("role") || "publisher").toLowerCase();
    } else if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      channel = body.channel || "";
      uidParam = body.uid ? String(body.uid) : null;
      roleParam = (body.role || "publisher").toLowerCase();
    } else {
      return json({ error: "Method not allowed" }, 405);
    }
    if (!channel) return json({ error: "Missing channel" }, 400);

    const appId = Deno.env.get("AGORA_APP_ID");
    const appCert = Deno.env.get("AGORA_APP_CERTIFICATE");
    if (!appId || !appCert) return json({ error: "Server not configured" }, 500);

    const role = roleParam === "subscriber" ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;
    const uid = uidParam ? Number(uidParam) : 0; // 0 means let Agora assign
    const expireSeconds = 60 * 60; // 1 hour
    const now = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = now + expireSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCert,
      channel,
      uid,
      role,
      privilegeExpiredTs
    );

    return json({ token, appId });
  } catch (e) {
    console.error("agora-token error:", e);
    return json({ error: "Token generation failed" }, 500);
  }
});


