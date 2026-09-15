// Robi zrzuty ekranu wszystkich kluczowych widoków FishEdu i zapisuje jako PNG
// do folderu screenshots/. Wymaga uruchomionego serwera dev (npm run dev) na :5173.

import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const CHROME = "C:\\Users\\filip\\.cache\\puppeteer\\chrome\\win64-131.0.6778.204\\chrome-win64\\chrome.exe";
const BASE = "http://localhost:5173";
const OUT_DIR = path.join(process.cwd(), "screenshots");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const SHOTS = [
  { file: "01_strona_glowna.png",       url: "/",                          waitFor: ".max-w-4xl" },
  { file: "02_witaj.png",               url: "/witaj",                     waitFor: "h1",       resetName: true },
  { file: "03_fiszki_lista.png",        url: "/fiszki",                    waitFor: ".max-w-4xl" },
  { file: "04_fiszka_praca.png",        url: "/fiszki/podroze",            waitFor: ".max-w-4xl" },
  { file: "05_wyzwanie.png",            url: "/fiszki/wyzwanie",           waitFor: ".max-w-4xl" },
  { file: "06_statystyki.png",          url: "/statystyki",                waitFor: ".max-w-4xl" },
  { file: "07_gramatyka_lista.png",     url: "/gramatyka",                 waitFor: ".max-w-4xl" },
  { file: "08_gramatyka_szczegoly.png", url: "/gramatyka/present-simple",  waitFor: ".max-w-4xl" },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1700, deviceScaleFactor: 1.25 });

// Loguje błędy z konsoli żeby zdiagnozować pustych zrzutów
page.on("console", (msg) => {
  if (msg.type() === "error") console.error("[browser console]", msg.text());
});
page.on("pageerror", (err) => console.error("[page error]", err.message));

// Ustaw stan początkowy aplikacji w localStorage: imię + ciemny motyw + przykładowy progres
async function seedAppState(setName = true) {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.evaluate((withName) => {
    if (withName) {
      localStorage.setItem("userName", "Filip");
      localStorage.setItem("seenWelcome", "1");
    } else {
      localStorage.removeItem("userName");
      localStorage.removeItem("seenWelcome");
    }
    localStorage.setItem("theme", "dark");

    // Wstrzykuje przykładowy progres żeby statystyki/heatmapa wyglądały
    const today = new Date();
    const k = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const daily = {};
    const attempts = [];
    for (let i = 0; i < 120; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (Math.random() > 0.18) {
        const xp = 20 + Math.floor(Math.random() * 80);
        const known = Math.floor(xp / 4);
        const unknown = Math.floor(Math.random() * 4);
        daily[k(d)] = { known, unknown, xp };
        for (let j = 0; j < known; j++) attempts.push({ pl: "przykład", category: "travel", known: true, ts: d.getTime() + j*1000 });
      }
    }
    const knownCount = { "podróż": 5, "samolot": 4, "pociąg": 3, "hotel": 6, "bilet": 2 };
    const missCount = { "samolot": 2, "rozkład": 3, "lotnisko": 4 };
    const sr = {
      "podróż":   { ease: 2.8, interval: 8,  nextReview: Date.now() + 8*86400000 },
      "samolot":  { ease: 2.6, interval: 3,  nextReview: Date.now() + 3*86400000 },
      "hotel":    { ease: 2.8, interval: 22, nextReview: Date.now() + 22*86400000 },
    };
    const progress = {
      attempts: attempts.slice(-200),
      knownCount, missCount, daily, sr,
      streak: 7, streakBest: 14, lastDay: k(today),
      achievements: ["first_word","ten_attempts","streak_3","streak_7","mastered_10","xp_100_day"],
      achievementsAt: {
        first_word: Date.now() - 30*86400000,
        ten_attempts: Date.now() - 28*86400000,
        streak_3: Date.now() - 10*86400000,
        streak_7: Date.now() - 5*86400000,
        mastered_10: Date.now() - 7*86400000,
        xp_100_day: Date.now() - 3*86400000,
      },
      completedDecks: {},
      spentXP: 0,
      accuracyPref: { preset: "30", customFrom: null, customTo: null },
      masteredFilter: { slug: null },
    };
    localStorage.setItem("progress", JSON.stringify(progress));
  }, setName);
}

// Najpierw raz na ekranie głównym ustaw localStorage (incl. userName=Filip)
await seedAppState(true);

for (let i = 0; i < SHOTS.length; i++) {
  const s = SHOTS[i];
  console.log(`[${i+1}/${SHOTS.length}] ${s.file}  ←  ${s.url}`);

  // Dla ekranu /witaj musimy najpierw usunąć imię żeby WelcomeGate go pokazał
  if (s.resetName) {
    await page.evaluate(() => {
      localStorage.removeItem("userName");
      localStorage.removeItem("seenWelcome");
    });
  } else {
    await page.evaluate(() => {
      localStorage.setItem("userName", "Filip");
      localStorage.setItem("seenWelcome", "1");
    });
  }

  await page.goto(BASE + s.url, { waitUntil: "domcontentloaded", timeout: 15000 });
  try { await page.waitForSelector(s.waitFor, { timeout: 5000 }); } catch (e) { console.warn("waitFor timeout:", e.message); }
  await new Promise((r) => setTimeout(r, 1500));
  const info = await page.evaluate(() => ({
    body: document.body.innerText.slice(0, 200),
    userName: localStorage.getItem("userName"),
    theme: localStorage.getItem("theme"),
    pathname: location.pathname,
  }));
  console.log("    ", JSON.stringify(info));
  await page.screenshot({
    path: path.join(OUT_DIR, s.file),
    type: "png",
    fullPage: !!s.fullPage,
  });
}

await browser.close();
console.log("Zrobiono", SHOTS.length, "zrzutów do", OUT_DIR);
