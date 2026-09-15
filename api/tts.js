// Serverless function (Vercel Edge runtime) — proxy do Google Translate TTS.
// Pełni dokładnie tę samą rolę co dev proxy w vite.config.js, tylko że
// w produkcji. Frontend ([Flashcard.jsx]) woła `/api/tts?...` niezależnie
// od środowiska — nic w UI nie trzeba zmieniać przy deployu.
//
// Dlaczego to potrzebne:
//   - Z poziomu przeglądarki bezpośredni fetch do translate.google.com pada
//     na CORS (brak `Access-Control-Allow-Origin`).
//   - Server-side fetch CORS-a nie ma + dorzucamy User-Agent, którego Google
//     wymaga, żeby zwrócić audio dla `client=tw-ob`.
//
// Cachowanie: tekst custom słówka się nie zmienia, więc trzymamy bardzo
// długi `max-age` + `immutable`. Pierwszy odsłuch pobiera z Google,
// kolejne idą z cache CDN/przeglądarki.

export const config = {
  runtime: "edge",
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const tl = searchParams.get("tl") || "en";
  const client = searchParams.get("client") || "tw-ob";
  const ie = searchParams.get("ie") || "UTF-8";

  if (!q) {
    return new Response("Missing q param", { status: 400 });
  }
  // Google TTS w trybie tw-ob nie obsługuje długich tekstów (~200 znaków).
  if (q.length > 200) {
    return new Response("Text too long (max 200 chars)", { status: 400 });
  }

  const upstream =
    `https://translate.google.com/translate_tts` +
    `?ie=${encodeURIComponent(ie)}` +
    `&q=${encodeURIComponent(q)}` +
    `&tl=${encodeURIComponent(tl)}` +
    `&client=${encodeURIComponent(client)}`;

  let r;
  try {
    r = await fetch(upstream, {
      headers: {
        "User-Agent": UA,
        Accept: "audio/mpeg,*/*",
      },
    });
  } catch (e) {
    return new Response(`Upstream fetch failed: ${e?.message || e}`, {
      status: 502,
    });
  }

  if (!r.ok) {
    return new Response(`Upstream HTTP ${r.status}`, { status: 502 });
  }

  const buf = await r.arrayBuffer();
  if (buf.byteLength < 200) {
    return new Response("Upstream returned empty body", { status: 502 });
  }

  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(buf.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
