import { WORDS } from "./words.js";
import { getCustomDecks } from "./backend.js";
import { getDueWords } from "./progress.js";

export const DAILY_CHALLENGE_SIZE = 10;
export const DAILY_CHALLENGE_BONUS = 70;
const KLUCZ = "dailyChallenge";
const EVNT = "dailyChallengeChange";

function kluczzDnia(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function seedZTekstu(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tasujZSeedem(tab, seed) {
  const rng = mulberry32(seed);
  const out = tab.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pobierzPule() {
  const zCustom = getCustomDecks().flatMap((d) =>
    (d.words || []).map((w) => ({ pl: w.pl, en: w.en, level: w.level }))
  );
  const widziane = new Set(WORDS.map((w) => w.pl));
  const customBezDupli = zCustom.filter((w) => !widziane.has(w.pl));
  return [...WORDS, ...customBezDupli];
}

export function getTodayChallenge() {
  const date = kluczzDnia();
  const seed = seedZTekstu(`${date}:guest`);
  const pula = pobierzPule();
  if (pula.length === 0) return { date, words: [] };

  // priorytet: zaległe słowa, reszta dopełniana losowo
  const zaleg = getDueWords(null);
  const wPuli = new Map(pula.map((w) => [w.pl, w]));
  const zalegWPuli = zaleg.map((w) => wPuli.get(w.pl)).filter(Boolean);

  const zalegKaw = zalegWPuli.slice(0, DAILY_CHALLENGE_SIZE);
  const brakuje = DAILY_CHALLENGE_SIZE - zalegKaw.length;

  if (brakuje <= 0) return { date, words: zalegKaw };

  const uzyte = new Set(zalegKaw.map((w) => w.pl));
  const swieże = pula.filter((w) => !uzyte.has(w.pl));
  const potasowane = tasujZSeedem(swieże, seed);
  const uzupelnienie = potasowane.slice(0, brakuje);
  // console.log("wyzwanie:", zalegKaw.length, "zaległych +", uzupelnienie.length, "losowych");
  return { date, words: [...zalegKaw, ...uzupelnienie] };
}

function czytajStan() {
  try {
    const raw = localStorage.getItem(KLUCZ);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function zapiszStan(s) {
  localStorage.setItem(KLUCZ, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent(EVNT));
}

export function getTodayProgress() {
  const date = kluczzDnia();
  const stan = czytajStan();
  return stan[date] ?? { answered: [], bonusGiven: false };
}

export function recordChallengeAnswer(pl) {
  const date = kluczzDnia();
  const stan = czytajStan();
  const aktualne = stan[date] ?? { answered: [], bonusGiven: false };
  if (!aktualne.answered.includes(pl)) {
    aktualne.answered = [...aktualne.answered, pl];
  }
  stan[date] = aktualne;
  zapiszStan(stan);
  return aktualne;
}

export function markBonusGiven() {
  const date = kluczzDnia();
  const stan = czytajStan();
  const aktualne = stan[date] ?? { answered: [], bonusGiven: false };
  aktualne.bonusGiven = true;
  stan[date] = aktualne;
  zapiszStan(stan);
}

export function subscribeChallenge(cb) {
  const fn = () => cb();
  window.addEventListener(EVNT, fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener(EVNT, fn);
    window.removeEventListener("storage", fn);
  };
}
