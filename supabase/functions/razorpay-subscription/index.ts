import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RAZORPAY_KEY_ID = "rzp_test_SOnqOd6iw5TRVd";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, plan_name, subscription_id, payment_id } = await req.json();

    if (action === "create_subscription") {
      // Create a Razorpay subscription
      const planMap: Record<string, { plan_id: string; amount: number }> = {
        pro: { plan_id: "eIr7uhuZ9w3lCtH2Fvbm35T1", amount: 19900 },
        business: { plan_id: "eIr7uhuZ9w3lCtH2Fvbm35T1", amount: 49900 },
      };

      const plan = planMap[plan_name];
      if (!plan) {
        return new Response(JSON.stringify({ error: "Invalid plan" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create a Razorpay subscription via API
      const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      const rzRes = await fetch("https://api.razorpay.com/v1/subscriptions", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_id: plan.plan_id,
          total_count: 12,
          quantity: 1,
          notes: {
            user_id: user.id,
            plan_name,
          },
        }),
      });

      const rzData = await rzRes.json();

      if (!rzRes.ok) {
        console.error("Razorpay error:", rzData);
        return new Response(JSON.stringify({ error: "Failed to create subscription", details: rzData }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        subscription_id: rzData.id,
        razorpay_key: RAZORPAY_KEY_ID,
        plan_name,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify_payment") {
      // After successful payment, update the subscription in DB
      if (!subscription_id || !payment_id || !plan_name) {
        return new Response(JSON.stringify({ error: "Missing fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify subscription status with Razorpay
      const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      const verifyRes = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscription_id}`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      const verifyData = await verifyRes.json();

      if (verifyData.status !== "active" && verifyData.status !== "authenticated") {
        return new Response(JSON.stringify({ error: "Subscription not active" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Upsert subscription in DB
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      // Check if user already has a subscription
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("subscriptions")
          .update({
            plan_name,
            payment_id,
            start_date: new Date().toISOString(),
            expiry_date: expiryDate.toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("subscriptions").insert({
          user_id: user.id,
          plan_name,
          payment_id,
          start_date: new Date().toISOString(),
          expiry_date: expiryDate.toISOString(),
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
