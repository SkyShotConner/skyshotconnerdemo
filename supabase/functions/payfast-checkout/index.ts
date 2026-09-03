import { createClient } from "npm:@supabase/supabase-js@2";
import { md5 } from "npm:js-md5@0.7.3";

const cors = {
  "Access-Control-Allow-Origin": "https://skyshotconner.co.za",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const prices: Record<string, number> = { A5: 349, A4: 449, A3: 549, A2: 749, A1: 1099, A0: 1799 };
const sizes = new Set(Object.keys(prices));

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

function signature(data: Record<string, string>, passphrase: string) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (value !== "") params.set(key, value.trim());
  }
  if (passphrase) params.set("passphrase", passphrase.trim());
  return md5(params.toString());
}

function orderNumber() {
  return `SSC-${new Date().toISOString().slice(0,10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);

  try {
    const merchantId = Deno.env.get("PAYFAST_MERCHANT_ID") ?? "";
    const merchantKey = Deno.env.get("PAYFAST_MERCHANT_KEY") ?? "";
    const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") ?? "";
    const sandbox = (Deno.env.get("PAYFAST_SANDBOX") ?? "true").toLowerCase() === "true";
    if (!merchantId || !merchantKey || !passphrase) return response({ error: "Payfast is not configured on the server yet." }, 503);

    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    const serviceKey = secretKeys.default;
    if (!serviceKey) return response({ error: "Supabase server key is unavailable." }, 500);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);

    const payload = await req.json();
    const customer = payload.customer ?? {};
    const items = Array.isArray(payload.items) ? payload.items : [];
    const firstName = String(customer.first_name ?? "").trim();
    const lastName = String(customer.last_name ?? "").trim();
    const email = String(customer.email ?? "").trim();
    const phone = String(customer.phone ?? "").trim();
    if (!firstName || !lastName || !email) return response({ error: "First name, last name and email are required." }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return response({ error: "Please enter a valid email address." }, 400);
    if (!items.length || items.length > 20) return response({ error: "Your cart is empty or too large." }, 400);

    const ids = [...new Set(items.map((item: any) => String(item.product_id ?? "")))];
    if (ids.some((id) => !/^[0-9a-f-]{36}$/i.test(id))) return response({ error: "Invalid product in cart." }, 400);
    const { data: products, error: productError } = await db.from("shop_products").select("id,name,active").in("id", ids).eq("active", true);
    if (productError) throw productError;
    const productMap = new Map((products ?? []).map((p: any) => [p.id, p]));
    if (productMap.size !== ids.length) return response({ error: "One or more products are no longer available." }, 400);

    const validatedItems = [];
    let total = 0;
    for (const item of items) {
      const productId = String(item.product_id);
      const size = String(item.size ?? "");
      const quantity = Math.floor(Number(item.quantity));
      if (!productMap.has(productId) || !sizes.has(size) || !Number.isFinite(quantity) || quantity < 1 || quantity > 20) return response({ error: "Invalid cart item." }, 400);
      const unitPrice = prices[size];
      const lineTotal = unitPrice * quantity;
      total += lineTotal;
      validatedItems.push({ productId, productName: (productMap.get(productId) as any).name, size, quantity, unitPrice, lineTotal });
    }

    const orderId = crypto.randomUUID();
    const number = orderNumber();
    const { error: orderError } = await db.from("shop_orders").insert({ id: orderId, order_number: number, customer_first_name: firstName, customer_last_name: lastName, customer_email: email, customer_phone: phone || null, amount: total, status: "PENDING" });
    if (orderError) throw orderError;
    const { error: itemError } = await db.from("shop_order_items").insert(validatedItems.map((item) => ({ order_id: orderId, product_id: item.productId, product_name: item.productName, canvas_size: item.size, quantity: item.quantity, unit_price: item.unitPrice, line_total: item.lineTotal })));
    if (itemError) throw itemError;

    const origin = "https://skyshotconner.co.za";
    const data: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${origin}/shop.html?payment=success&order=${encodeURIComponent(number)}`,
      cancel_url: `${origin}/shop.html?payment=cancelled&order=${encodeURIComponent(number)}`,
      notify_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payfast-itn`,
      name_first: firstName,
      name_last: lastName,
      email_address: email,
      m_payment_id: number,
      amount: total.toFixed(2),
      item_name: `SkyShotConner Canvas Order ${number}`,
      item_description: validatedItems.map((i) => `${i.productName} ${i.size} x${i.quantity}`).join(", "),
    };
    data.signature = signature(data, passphrase);

    return response({ action: sandbox ? "https://sandbox.payfast.co.za/eng/process" : "https://www.payfast.co.za/eng/process", fields: data, order_number: number });
  } catch (error) {
    console.error(error);
    return response({ error: "Unable to prepare the Payfast checkout." }, 500);
  }
});
