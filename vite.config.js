import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Lokalny mirror produkcyjnego /api/tts (api/tts.js w Vercel Edge).
// Vite middleware fetch'uje Google Translate TTS server-side i zwraca MP3.
// Frontend woła `/api/tts?...` zarówno w dev jak i w prod — bez zmian.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function ttsDevPlugin() {
  return {
    name: "lingolearn-tts-dev",
    configureServer(server) {
      server.middlewares.use("/api/tts", async (req, res) => {
        const url = new URL(req.url, "http://localhost");
        const q = url.searchParams.get("q");
        const tl = url.searchParams.get("tl") || "en";
        const client = url.searchParams.get("client") || "tw-ob";
        const ie = url.searchParams.get("ie") || "UTF-8";

        if (!q) {
          res.statusCode = 400;
          res.end("Missing q param");
          return;
        }
        if (q.length > 200) {
          res.statusCode = 400;
          res.end("Text too long");
          return;
        }

        const upstream =
          `https://translate.google.com/translate_tts` +
          `?ie=${encodeURIComponent(ie)}` +
          `&q=${encodeURIComponent(q)}` +
          `&tl=${encodeURIComponent(tl)}` +
          `&client=${encodeURIComponent(client)}`;

        try {
          const r = await fetch(upstream, {
            headers: { "User-Agent": UA, Accept: "audio/mpeg,*/*" },
          });
          if (!r.ok) {
            console.warn(`[tts] ${tl} "${q}" → upstream HTTP ${r.status}`);
            res.statusCode = 502;
            res.end(`Upstream HTTP ${r.status}`);
            return;
          }
          const buf = Buffer.from(await r.arrayBuffer());
          if (buf.byteLength < 200) {
            console.warn(`[tts] ${tl} "${q}" → empty body (${buf.byteLength}B)`);
            res.statusCode = 502;
            res.end("Upstream returned empty body");
            return;
          }
          console.log(`[tts] ${tl} "${q}" → ${buf.byteLength}B OK`);
          res.statusCode = 200;
          res.setHeader("Content-Type", "audio/mpeg");
          res.setHeader("Content-Length", String(buf.byteLength));
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          res.end(buf);
        } catch (e) {
          console.warn(`[tts] ${tl} "${q}" → fetch error:`, e?.message || e);
          res.statusCode = 502;
          res.end(`Upstream fetch failed: ${e?.message || e}`);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), ttsDevPlugin()],
});
