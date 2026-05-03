// One-shot endpoint to create / ensure the initial admin account.
// Safe: idempotent, only creates the wahyu admin and grants role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "wahyu@smam1plg.sch.id";
const ADMIN_PASSWORD = "Admin@2026";
const ADMIN_NAME = "Wahyu (Admin)";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // Find existing user
    let userId: string | null = null;
    const { data: list } = await supabase.auth.admin.listUsers();
    const found = list?.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);
    if (found) {
      userId = found.id;
    } else {
      const { data: created, error } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: ADMIN_NAME },
      });
      if (error) throw error;
      userId = created.user!.id;
    }

    // Ensure profile
    await supabase.from("profiles").upsert(
      { user_id: userId, email: ADMIN_EMAIL, display_name: ADMIN_NAME },
      { onConflict: "user_id" },
    );

    // Ensure admin role
    await supabase.from("user_roles").upsert(
      { user_id: userId, role: "admin" },
      { onConflict: "user_id,role" },
    );

    return new Response(
      JSON.stringify({ ok: true, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, userId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
