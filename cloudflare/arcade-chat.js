const ALLOWED_ORIGINS = new Set(["https://oliworx.dev"]);
const MODEL = "@cf/meta/llama-3.2-1b-instruct";
const MAX_BODY_CHARACTERS = 10000;

const SYSTEM_PROMPT = [
  "You are Oli, the friendly game guide for Oliworx Arcade.",
  "Give concise, upbeat, age-appropriate help about choosing games, rules, and beginner tips.",
  "Recommend only games in the site's directory when suggesting titles. The directory includes action, puzzle, word, racing, party, strategy, survival, creative, and quick-play games.",
  "Never claim you can see a visitor's screen, identity, location, or game progress.",
  "Do not ask for passwords, contact details, or other private information.",
  "The site is a directory of external links; each game is hosted and controlled by its own website.",
  "If asked about something unrelated, answer briefly and steer back to browser games."
].join(" ");

function jsonResponse(body, status, origin) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (!ALLOWED_ORIGINS.has(origin)) {
      return jsonResponse({ error: "This chat is only available from oliworx.dev." }, 403);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin"
        }
      });
    }

    if (url.pathname !== "/api/chat") {
      return jsonResponse({ error: "Not found." }, 404, origin);
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Use POST to send a chat message." }, 405, origin);
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    try {
      const rate = await env.CHAT_LIMITER.limit({ key: ip });
      if (!rate.success) {
        return jsonResponse({ error: "You've sent a lot of messages. Wait a minute and try again." }, 429, origin);
      }
    } catch {
      return jsonResponse({ error: "The chat service is not configured yet." }, 503, origin);
    }

    let payload;
    try {
      const raw = await request.text();
      if (raw.length > MAX_BODY_CHARACTERS) {
        return jsonResponse({ error: "That message is too long. Please shorten it." }, 413, origin);
      }
      payload = JSON.parse(raw);
    } catch {
      return jsonResponse({ error: "I couldn't read that message. Please try again." }, 400, origin);
    }

    if (!Array.isArray(payload.messages)) {
      return jsonResponse({ error: "Send a message to start chatting." }, 400, origin);
    }

    const messages = payload.messages
      .slice(-10)
      .filter((message) =>
        message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string"
      )
      .map((message) => ({
        role: message.role,
        content: message.content.trim().slice(0, 600)
      }))
      .filter((message) => message.content.length > 0);

    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return jsonResponse({ error: "Send a message to start chatting." }, 400, origin);
    }

    try {
      const result = await env.AI.run(MODEL, {
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 220,
        temperature: 0.65
      });
      const reply = typeof result?.response === "string" ? result.response.trim() : "";
      if (!reply) {
        return jsonResponse({ error: "The game helper couldn't make a reply just now." }, 502, origin);
      }
      return jsonResponse({ reply }, 200, origin);
    } catch {
      return jsonResponse({ error: "The AI game helper had a hiccup. Try again in a moment." }, 502, origin);
    }
  }
};
