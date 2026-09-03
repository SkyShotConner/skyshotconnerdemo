import { createClient } from "npm:@supabase/supabase-js@2";
import { md5 } from "npm:js-md5@0.7.3";

const cors = {
  "Access-Control-Allow-Origin": "https://skyshotconner.co.za",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function signature(data: Record<string, string>, passphrase: string) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (key !== "signature" && value !== "") params.set(key, value.trim());
  }
  if (passphrase) params.set("passphrase", passphrase.trim());
  return md5(params.toString());
}

function ok(message: string) { return new Response(message, { status: 200, headers: cors }); }
function fail(message: string, status = 400) { return new Response(message, { status, headers: cors }); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return fail("Method not allowed", 405);

  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const data: Record<string, string> = {};
    for (const [key, value] of params.entries()) data[key] = value;

    const merchantId = Deno.env.get("PAYFAST_MERCHANT_ID") ?? "";
    const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") ?? "";
    if (!merchantId || !passphrase) return fail("Payfast server configuration missing", 503);
    if (data.merchant_id !== merchantId) return fail("Invalid merchant", 400);
    if (!data.signature || signature(data, passphrase) !== data.signature) return fail("Invalid signature", 400);

    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    if (!secretKeys.default) return fail("Supabase server key unavailable", 500);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, secretKeys.default);

    const orderNumber = data.m_payment_id ?? "";
    const { data: order, error: orderError } = await db.from("shop_orders").select("id,amount,status").eq("order_number", orderNumber).maybeSingle();
    if (orderError) throw orderError;
    if (!order) return fail("Order not found", 404);

    const receivedAmount = Number(data.amount_gross ?? "NaN");
    if (!Number.isFinite(receivedAmount) || Math.abs(receivedAmount - Number(order.amount)) > 0.01) return fail("Payment amount mismatch", 400);

    const status = data.payment_status === "COMPLETE" ? "PAID" : data.payment_status === "CANCELLED" ? "CANCELLED" : "FAILED";
    const { error: updateError } = await db.from("shop_orders").update({ status, payfast_payment_id: data.pf_payment_id ?? null, updated_at: new Date().toISOString() }).eq("id", order.id);
    if (updateError) throw updateError;

    return ok("OK");
  } catch (error) {
    console.error(error);
    return fail("ITN processing failed", 500);
  }
});
