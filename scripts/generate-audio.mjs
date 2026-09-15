// Generates MP3 files for every holiday + deck word (PL + EN) into public/audio/.
// Idempotent — skips files that already exist. Run: node scripts/generate-audio.mjs
import { existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { HOLIDAYS, DEFAULT_HOLIDAY, audioKey } from "../src/data/holidays.js";
import { WORDS } from "../src/data/words.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_AUDIO = join(ROOT, "public", "audio");
mkdirSync(join(PUBLIC_AUDIO, "en"), { recursive: true });
mkdirSync(join(PUBLIC_AUDIO, "pl"), { recursive: true });

// Collect all unique (lang, key, text) triples
const tasks = [];
const seen = new Set();
const addTask = (lang, key, text) => {
  const id = `${lang}/${key}`;
  if (seen.has(id)) return;
  seen.add(id);
  tasks.push({ lang, key, text });
};
// 1) Holiday words (main landing flashcard)
for (const h of [DEFAULT_HOLIDAY, ...Object.values(HOLIDAYS)]) {
  addTask("en", audioKey(h.word),   h.word);
  addTask("pl", audioKey(h.wordPl), h.wordPl);
}
// 2) Deck words (Fiszki page + deck subpages)
for (const w of WORDS) {
  addTask("en", audioKey(w.en), w.en);
  addTask("pl", audioKey(w.pl), w.pl);
}

const ttsUrl = (lang, text) =>
  `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

async function fetchOne({ lang, key, text }) {
  const file = join(PUBLIC_AUDIO, lang, `${key}.mp3`);
  if (existsSync(file) && statSync(file).size > 1000) return { ok: true, skipped: true };
  const r = await fetch(ttsUrl(lang, text), {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  if (!r.ok) return { ok: false, status: r.status };
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 1000) return { ok: false, status: "too-small", size: buf.length };
  writeFileSync(file, buf);
  return { ok: true, size: buf.length };
}

const CONCURRENCY = 8;
let done = 0, failed = 0, skipped = 0;
const queue = [...tasks];
async function worker() {
  while (queue.length) {
    const t = queue.shift();
    try {
      const r = await fetchOne(t);
      if (r.skipped) skipped++;
      else if (r.ok) done++;
      else { failed++; console.warn(`FAIL ${t.lang}/${t.key} (${t.text}):`, r); }
    } catch (e) {
      failed++;
      console.warn(`ERR ${t.lang}/${t.key} (${t.text}):`, e.message);
    }
    if ((done + failed + skipped) % 25 === 0) {
      process.stdout.write(`\r${done + failed + skipped}/${tasks.length} (new=${done} skip=${skipped} fail=${failed})  `);
    }
  }
}
console.log(`Generating audio for ${tasks.length} unique items …`);
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`\nDone: new=${done}, skipped=${skipped}, failed=${failed}`);
process.exit(failed > 0 ? 1 : 0);
