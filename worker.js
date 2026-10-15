// Cloudflare Worker — Grok (xAI) kalitini yashirin saqlaydi.
// Sozlash: Settings → Variables → Secret: XAI_API_KEY
// (ixtiyoriy) oddiy o'zgaruvchi: ALLOWED_ORIGIN = https://FOYDALANUVCHI.github.io
const MODEL = "grok-4"; // xAI hujjatlaridan joriy model nomini tekshiring
const SYSTEM = "Siz foydali va do'stona yordamchisiz. Foydalanuvchi qaysi tilda yozsa, shu tilda javob bering.";

export default {
  async fetch(req, env) {
    const origin = env.ALLOWED_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return new Response("Faqat POST", { status: 405, headers: cors });
    if (env.ALLOWED_ORIGIN && req.headers.get("Origin") !== env.ALLOWED_ORIGIN)
      return new Response("Ruxsat yo'q", { status: 403, headers: cors });

    let messages;
    try { ({ messages } = await req.json()); } catch { return new Response("Noto'g'ri so'rov", { status: 400, headers: cors }); }
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40)
      return new Response("Noto'g'ri xabarlar", { status: 400, headers: cors });
    messages = messages
      .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map(m => ({ role: m.role, content: m.content.slice(0, 8000) }));

    const upstream = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + env.XAI_API_KEY },
      body: JSON.stringify({ model: MODEL, stream: true, messages: [{ role: "system", content: SYSTEM }, ...messages] }),
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...cors, "Content-Type": upstream.headers.get("Content-Type") || "text/event-stream" },
    });
  },
};
