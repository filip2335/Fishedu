import { WORDS } from "./words.js";
import { DECKS } from "./decks.js";

const EVENT = "progressChange";
const KEY_BASE = "progress";

const XP_KNOWN = 3;
const XP_UNKNOWN = 1;
// kolejne odpowiedzi na to samo słowo w tym oknie nie dają XP
const XP_COOLDOWN_MS = 10 * 60 * 1000;
export const DAILY_GOAL = 35;
export const MASTERY_THRESHOLD = 3;

const SR_DEFAULT_EASE = 2.5;
const SR_MIN_EASE = 1.3;
const SR_MAX_EASE = 2.8;
const SR_EASE_BUMP = 0.1;
const SR_EASE_PENALTY = 0.2;
const DAY_MS = 86400000;

function storageKey() {
  return KEY_BASE;
}

function freshState() {
  return {
    attempts: [],
    knownCount: {},
    missCount: {},
    daily: {},
    lastDay: null,
    streak: 0,
    streakBest: 0,
    sr: {},
    achievements: [],
    achievementsAt: {},
    completedDecks: {},
    spentXP: 0,
    accuracyPref: defaultAccuracyPref(),
    masteredFilter: defaultMasteredFilter(),
  };
}

function defaultAccuracyPref() {
  return { preset: "30", customFrom: null, customTo: null };
}

function defaultMasteredFilter() {
  return { slug: null };
}

function countMastered(state) {
  let n = 0;
  for (const pl of Object.keys(state.knownCount)) {
    const k = state.knownCount[pl] ?? 0;
    const m = state.missCount[pl] ?? 0;
    if (k >= MASTERY_THRESHOLD && k > m) n++;
  }
  return n;
}

function sumKnown(state) {
  let n = 0;
  for (const v of Object.values(state.knownCount)) n += v;
  return n;
}

function sumXP(state) {
  let n = 0;
  for (const d of Object.values(state.daily || {})) n += d.xp || 0;
  return n;
}

function maxDailyXP(state) {
  let m = 0;
  for (const d of Object.values(state.daily || {})) if ((d.xp || 0) > m) m = d.xp || 0;
  return m;
}

function deckMasteryRatio(state, deck) {
  const pool = poolFor(deck);
  if (pool.length === 0) return 0;
  let n = 0;
  for (const w of pool) {
    const k = state.knownCount[w.pl] ?? 0;
    const m = state.missCount[w.pl] ?? 0;
    if (k >= MASTERY_THRESHOLD && k > m) n++;
  }
  return n / pool.length;
}

function fullyMasteredDecks(state) {
  let n = 0;
  for (const d of DECKS) if (deckMasteryRatio(state, d) >= 1) n++;
  return n;
}

function activeDecks(state) {
  const set = new Set();
  for (const a of state.attempts) {
    if (a.category && a.category !== "__bonus" && a.category !== "__spend") set.add(a.category);
  }
  return set.size;
}

function hasAttemptInHours(state, hourMin, hourMax) {
  for (const a of state.attempts) {
    if (a.category === "__bonus" || a.category === "__spend") continue;
    const h = new Date(a.ts).getHours();
    if (h >= hourMin && h < hourMax) return true;
  }
  return false;
}

function weekendAttempts(state) {
  let n = 0;
  for (const a of state.attempts) {
    if (a.category === "__bonus" || a.category === "__spend") continue;
    const dow = new Date(a.ts).getDay();
    if (dow === 0 || dow === 6) n++;
  }
  return n;
}

export const ACHIEVEMENTS = [
  { id: "first_word",     icon: "🎯", title: "Pierwsze słowo",        description: "Pierwsza odpowiedź zarejestrowana.",
    check:    (s) => s.attempts.length >= 1,
    progress: (s) => ({ current: Math.min(1, s.attempts.length), target: 1 }) },
  { id: "ten_attempts",   icon: "🔟", title: "Dziesiątka",            description: "10 odpowiedzi w sumie.",
    check:    (s) => s.attempts.length >= 10,
    progress: (s) => ({ current: Math.min(10, s.attempts.length), target: 10 }) },
  { id: "fifty_attempts", icon: "💯", title: "Pięćdziesiątka",        description: "50 odpowiedzi w sumie.",
    check:    (s) => s.attempts.length >= 50,
    progress: (s) => ({ current: Math.min(50, s.attempts.length), target: 50 }) },
  { id: "hundred_known",  icon: "🏅", title: "Stuznawca",              description: '100 razy kliknięte "Znam".',
    check:    (s) => sumKnown(s) >= 100,
    progress: (s) => ({ current: Math.min(100, sumKnown(s)), target: 100 }) },

  { id: "streak_3",   icon: "🔥",  title: "Trzy dni z rzędu",   description: "Streak osiągnął 3 dni.",
    check:    (s) => (s.streakBest || 0) >= 3,
    progress: (s) => ({ current: Math.min(3, s.streakBest || 0), target: 3 }) },
  { id: "streak_7",   icon: "🔥",  title: "Tydzień z rzędu",    description: "Streak osiągnął 7 dni.",
    check:    (s) => (s.streakBest || 0) >= 7,
    progress: (s) => ({ current: Math.min(7, s.streakBest || 0), target: 7 }) },
  { id: "streak_30",  icon: "🌟",  title: "Miesiąc z rzędu",    description: "Streak osiągnął 30 dni.",
    check:    (s) => (s.streakBest || 0) >= 30,
    progress: (s) => ({ current: Math.min(30, s.streakBest || 0), target: 30 }) },
  { id: "streak_100", icon: "🌠",  title: "Sto dni z rzędu",    description: "Streak osiągnął 100 dni.",
    check:    (s) => (s.streakBest || 0) >= 100,
    progress: (s) => ({ current: Math.min(100, s.streakBest || 0), target: 100 }) },

  { id: "mastered_10",   icon: "💎", title: "Dziesiątka opanowana",     description: "Opanuj 10 słówek.",
    check:    (s) => countMastered(s) >= 10,
    progress: (s) => ({ current: Math.min(10, countMastered(s)), target: 10 }) },
  { id: "mastered_50",   icon: "💎", title: "Pięćdziesiątka opanowana", description: "Opanuj 50 słówek.",
    check:    (s) => countMastered(s) >= 50,
    progress: (s) => ({ current: Math.min(50, countMastered(s)), target: 50 }) },
  { id: "mastered_100",  icon: "💎", title: "Setka opanowana",          description: "Opanuj 100 słówek.",
    check:    (s) => countMastered(s) >= 100,
    progress: (s) => ({ current: Math.min(100, countMastered(s)), target: 100 }) },
  { id: "mastered_500",  icon: "💠", title: "Pięć setek opanowanych",   description: "Opanuj 500 słówek.",
    check:    (s) => countMastered(s) >= 500,
    progress: (s) => ({ current: Math.min(500, countMastered(s)), target: 500 }) },
  { id: "mastered_1000", icon: "🏆", title: "Tysiąc opanowanych",       description: "Opanuj 1000 słówek.",
    check:    (s) => countMastered(s) >= 1000,
    progress: (s) => ({ current: Math.min(1000, countMastered(s)), target: 1000 }) },

  { id: "master_first_deck", icon: "👑", title: "Mistrz pierwszej talii", description: "Opanuj wszystkie słowa w którejkolwiek talii.",
    check:    (s) => fullyMasteredDecks(s) >= 1,
    progress: (s) => ({ current: Math.min(1, fullyMasteredDecks(s)), target: 1 }) },
  { id: "master_3_decks",    icon: "👑", title: "Trzy talie opanowane",   description: "Opanuj wszystkie słowa w 3 taliach.",
    check:    (s) => fullyMasteredDecks(s) >= 3,
    progress: (s) => ({ current: Math.min(3, fullyMasteredDecks(s)), target: 3 }) },

  { id: "complete_first_deck", icon: "🎉", title: "Pierwsza talia ukończona", description: "Przejdź raz przez wszystkie słowa w którejkolwiek talii.",
    check:    (s) => Object.keys(s.completedDecks || {}).length >= 1,
    progress: (s) => ({ current: Math.min(1, Object.keys(s.completedDecks || {}).length), target: 1 }) },
  { id: "complete_5_decks",    icon: "🎊", title: "Pięć talii ukończonych",   description: "Przejdź raz przez wszystkie słowa w 5 różnych taliach.",
    check:    (s) => Object.keys(s.completedDecks || {}).length >= 5,
    progress: (s) => ({ current: Math.min(5, Object.keys(s.completedDecks || {}).length), target: 5 }) },

  { id: "xp_100_day",     icon: "⚡",  title: "Stówka XP w jeden dzień", description: "Zdobądź 100 XP w ciągu jednego dnia.",
    check:    (s) => maxDailyXP(s) >= 100,
    progress: (s) => ({ current: Math.min(100, maxDailyXP(s)), target: 100 }) },
  { id: "xp_500_day",     icon: "⚡",  title: "Pół tysiąca XP w dzień",  description: "Zdobądź 500 XP w ciągu jednego dnia.",
    check:    (s) => maxDailyXP(s) >= 500,
    progress: (s) => ({ current: Math.min(500, maxDailyXP(s)), target: 500 }) },
  { id: "xp_1000_total",  icon: "💯",  title: "Tysiąc XP łącznie",       description: "Zdobądź 1000 XP w sumie.",
    check:    (s) => sumXP(s) >= 1000,
    progress: (s) => ({ current: Math.min(1000, sumXP(s)), target: 1000 }) },
  { id: "xp_10000_total", icon: "🌟",  title: "Dziesięć tysięcy XP",     description: "Zdobądź 10 000 XP w sumie.",
    check:    (s) => sumXP(s) >= 10000,
    progress: (s) => ({ current: Math.min(10000, sumXP(s)), target: 10000 }) },

  { id: "night_owl",       icon: "🦉", title: "Sowa",            description: "Naucz się czegoś między 0:00 a 4:00.",
    check: (s) => hasAttemptInHours(s, 0, 4) },
  { id: "early_bird",      icon: "🐦", title: "Ranny ptaszek",   description: "Naucz się czegoś przed 7:00.",
    check: (s) => hasAttemptInHours(s, 4, 7) },
  { id: "weekend_warrior", icon: "🛡️", title: "Wojownik weekendu", description: "50 odpowiedzi w soboty/niedziele łącznie.",
    check:    (s) => weekendAttempts(s) >= 50,
    progress: (s) => ({ current: Math.min(50, weekendAttempts(s)), target: 50 }) },
  { id: "polyglot",        icon: "🌍", title: "Poliglota",       description: "Aktywność w 10 różnych taliach.",
    check:    (s) => activeDecks(s) >= 10,
    progress: (s) => ({ current: Math.min(10, activeDecks(s)), target: 10 }) },
];

function checkAchievements(state) {
  if (!state.achievements) state.achievements = [];
  if (!state.achievementsAt) state.achievementsAt = {};
  const unlocked = new Set(state.achievements);
  const newBadges = [];
  const now = Date.now();
  for (const a of ACHIEVEMENTS) {
    if (unlocked.has(a.id)) continue;
    try {
      if (a.check(state)) {
        unlocked.add(a.id);
        if (!state.achievementsAt[a.id]) state.achievementsAt[a.id] = now;
        newBadges.push(a);
      }
    } catch {
      // ignore broken check
    }
  }
  state.achievements = [...unlocked];
  return newBadges;
}

export function getUnlockedAchievements() {
  const state = read();
  const ids = new Set(state.achievements || []);
  const at = state.achievementsAt || {};
  return ACHIEVEMENTS.map((a) => {
    let progress = null;
    try { progress = a.progress ? a.progress(state) : null; } catch { progress = null; }
    return {
      ...a,
      unlocked: ids.has(a.id),
      unlockedAt: at[a.id] ?? null,
      progress,
    };
  });
}

export function markDeckCompleted(slug) {
  if (!slug) return null;
  const state = read();
  if (!state.completedDecks) state.completedDecks = {};
  if (state.completedDecks[slug]) {
    const newBadges = checkAchievements(state);
    if (newBadges.length > 0) write(state);
    return { alreadyCompleted: true, newAchievements: newBadges };
  }
  state.completedDecks[slug] = Date.now();
  const newBadges = checkAchievements(state);
  write(state);
  return { alreadyCompleted: false, newAchievements: newBadges };
}

function read() {
  const key = storageKey();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return freshState();
    return { ...freshState(), ...JSON.parse(raw) };
  } catch {
    return freshState();
  }
}

function write(state) {
  const key = storageKey();
  localStorage.setItem(key, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(EVENT));
}

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function diffDays(aKey, bKey) {
  const a = new Date(aKey + "T00:00:00");
  const b = new Date(bKey + "T00:00:00");
  return Math.round((b - a) / 86400000);
}

function updateSR(state, pl, known) {
  if (!state.sr) state.sr = {};
  const cur = state.sr[pl] ?? { ease: SR_DEFAULT_EASE, interval: 0, nextReview: 0 };
  let ease, interval;
  if (known) {
    ease = Math.min(SR_MAX_EASE, cur.ease + SR_EASE_BUMP);
    interval = cur.interval === 0
      ? 1
      : Math.max(1, Math.round(cur.interval * cur.ease));
  } else {
    ease = Math.max(SR_MIN_EASE, cur.ease - SR_EASE_PENALTY);
    interval = 1;
  }
  state.sr[pl] = {
    ease,
    interval,
    nextReview: Date.now() + interval * DAY_MS,
  };
}

export function logAnswer({ pl, category, known }) {
  const state = read();
  const today = todayKey();
  const ts = Date.now();
  const prevStreak = state.streak || 0;

  const lastForWord = [...state.attempts]
    .reverse()
    .find((a) => a.pl === pl && a.category !== "__bonus" && a.category !== "__spend");
  const cooldown = lastForWord != null && (ts - (lastForWord.ts || 0)) < XP_COOLDOWN_MS;
  const xp = cooldown ? 0 : (known ? XP_KNOWN : XP_UNKNOWN);

  state.attempts.push({ pl, category, known: !!known, ts });
  if (state.attempts.length > 5000) {
    state.attempts = state.attempts.slice(-5000);
  }

  if (known) state.knownCount[pl] = (state.knownCount[pl] ?? 0) + 1;
  else       state.missCount[pl]  = (state.missCount[pl]  ?? 0) + 1;

  updateSR(state, pl, !!known);

  const day = state.daily[today] ?? { known: 0, unknown: 0, xp: 0 };
  if (known) day.known += 1;
  else       day.unknown += 1;
  day.xp += xp;
  state.daily[today] = day;

  if (state.lastDay === today) {
    // already counted today
  } else if (state.lastDay && diffDays(state.lastDay, today) === 1) {
    state.streak = (state.streak || 0) + 1;
  } else {
    state.streak = 1;
  }
  state.streakBest = Math.max(state.streakBest || 0, state.streak);
  state.lastDay = today;

  const streakUp = (state.streak || 0) > prevStreak;
  const newBadges = checkAchievements(state);

  write(state);
  return {
    state,
    xp,
    onCooldown: cooldown,
    streakIncreased: streakUp,
    newAchievements: newBadges,
  };
}

export function getProgress() {
  return read();
}

export function getStreak() {
  const state = read();
  if (!state.lastDay) return { current: 0, best: state.streakBest || 0 };
  const gap = diffDays(state.lastDay, todayKey());
  const current = gap <= 1 ? (state.streak || 0) : 0;
  return { current, best: state.streakBest || 0 };
}

export function getXPToday() {
  const state = read();
  return state.daily[todayKey()]?.xp ?? 0;
}

export const LEVEL_XP_DIVISOR = 250;

export const LEVEL_TITLES = [
  { from: 0,  title: "Początkujący" },
  { from: 3,  title: "Uczeń" },
  { from: 6,  title: "Średniozaawansowany" },
  { from: 10, title: "Zaawansowany" },
  { from: 15, title: "Ekspert" },
  { from: 20, title: "Mistrz" },
  { from: 25, title: "Mistrz słówek" },
];

function calcXP(state) {
  let n = 0;
  for (const d of Object.values(state.daily || {})) n += d.xp || 0;
  return n;
}

export function xpForLevel(level) {
  return level * level * LEVEL_XP_DIVISOR;
}

export function titleForLevel(level) {
  let chosen = LEVEL_TITLES[0].title;
  for (const t of LEVEL_TITLES) {
    if (level >= t.from) chosen = t.title;
  }
  return chosen;
}

export function getLevel() {
  const state = read();
  const totalXP = calcXP(state);
  const level = Math.floor(Math.sqrt(totalXP / LEVEL_XP_DIVISOR));
  const xpBase = xpForLevel(level);
  const xpNext = xpForLevel(level + 1);
  const xpIn = totalXP - xpBase;
  const xpToNext = xpNext - totalXP;
  const span = xpNext - xpBase;
  const progress = span > 0 ? Math.min(1, xpIn / span) : 0;
  return {
    level,
    totalXP,
    xpForCurrent: xpBase,
    xpForNext: xpNext,
    xpIntoLevel: xpIn,
    xpToNext,
    progress,
    title: titleForLevel(level),
  };
}

export function getRecentAccuracy(n = 50) {
  const state = read();
  const recent = state.attempts
    .filter((a) => a.category !== "__bonus" && a.category !== "__spend")
    .slice(-n);
  if (!recent.length) return null;
  const correct = recent.filter((a) => a.known).length;
  return correct / recent.length;
}

export function getAccuracyPref() {
  const state = read();
  return state.accuracyPref || defaultAccuracyPref();
}

export function setAccuracyPref(next) {
  const state = read();
  state.accuracyPref = { ...defaultAccuracyPref(), ...(next || {}) };
  write(state);
}

export function rangeForAccuracyPref(pref) {
  const p = pref || defaultAccuracyPref();
  const now = new Date();
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now); endOfToday.setHours(23, 59, 59, 999);
  const dayBack = (n) => {
    const d = new Date(startOfToday); d.setDate(d.getDate() - n); return d;
  };
  switch (p.preset) {
    case "1":   return { from: startOfToday.getTime(), to: endOfToday.getTime() };
    case "7":   return { from: dayBack(6).getTime(),   to: endOfToday.getTime() };
    case "30":  return { from: dayBack(29).getTime(),  to: endOfToday.getTime() };
    case "365": return { from: dayBack(364).getTime(), to: endOfToday.getTime() };
    case "all": return { from: null, to: null };
    case "custom": {
      if (p.customFrom == null || p.customTo == null) return { from: null, to: null };
      const lo = Math.min(p.customFrom, p.customTo);
      const hi = Math.max(p.customFrom, p.customTo);
      const from = new Date(lo); from.setHours(0, 0, 0, 0);
      const to = new Date(hi); to.setHours(23, 59, 59, 999);
      return { from: from.getTime(), to: to.getTime() };
    }
    default: return { from: dayBack(29).getTime(), to: endOfToday.getTime() };
  }
}

export function labelForAccuracyPref(pref) {
  const p = pref || defaultAccuracyPref();
  switch (p.preset) {
    case "1":   return "dziś";
    case "7":   return "ostatnie 7 dni";
    case "30":  return "ostatnie 30 dni";
    case "365": return "ostatni rok";
    case "all": return "cały czas";
    case "custom": return "własny zakres";
    default: return "ostatnie 30 dni";
  }
}

export function getAccuracyForPref() {
  const { from, to } = rangeForAccuracyPref(getAccuracyPref());
  return getAccuracyInRange(from, to);
}

export function getMasteredFilter() {
  const state = read();
  return state.masteredFilter || defaultMasteredFilter();
}

export function setMasteredFilter(next) {
  const state = read();
  state.masteredFilter = { ...defaultMasteredFilter(), ...(next || {}) };
  write(state);
}

export function getAccuracyInRange(fromTs, toTs) {
  const state = read();
  const items = state.attempts.filter((a) => {
    if (a.category === "__bonus" || a.category === "__spend") return false;
    if (typeof a.ts !== "number") return false;
    if (fromTs != null && a.ts < fromTs) return false;
    if (toTs != null && a.ts > toTs) return false;
    return true;
  });
  if (items.length === 0) return { accuracy: null, total: 0, correct: 0 };
  const correct = items.filter((a) => a.known).length;
  return { accuracy: correct / items.length, total: items.length, correct };
}

function isMasteredRow(known, miss) {
  return known >= MASTERY_THRESHOLD && known > miss;
}

function poolFor(deckOrCategory) {
  if (!deckOrCategory) return WORDS;
  if (typeof deckOrCategory === "object") {
    if (deckOrCategory.custom && Array.isArray(deckOrCategory.words)) {
      return deckOrCategory.words;
    }
    return WORDS.filter((w) => w.category === deckOrCategory.category);
  }
  return WORDS.filter((w) => w.category === deckOrCategory);
}

export function getMasteredCount(deckOrCategory) {
  const state = read();
  const pool = poolFor(deckOrCategory);
  let n = 0;
  for (const w of pool) {
    if (isMasteredRow(state.knownCount[w.pl] ?? 0, state.missCount[w.pl] ?? 0)) n++;
  }
  return n;
}

export function getMasteredWords(deckOrCategory) {
  const state = read();
  const pool = poolFor(deckOrCategory);
  const out = [];
  for (const w of pool) {
    const known = state.knownCount[w.pl] ?? 0;
    const miss  = state.missCount[w.pl]  ?? 0;
    if (!isMasteredRow(known, miss)) continue;
    out.push({
      pl: w.pl,
      en: w.en,
      level: w.level,
      knownCount: known,
      missCount: miss,
      interval: state.sr?.[w.pl]?.interval,
    });
  }
  return out;
}

export function getDeckTotal(deckOrCategory) {
  return poolFor(deckOrCategory).length;
}

export function getGlobalTotal() {
  return WORDS.length;
}

export function getDailySeries(days = 7) {
  const state = read();
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = todayKey(d);
    const agg = state.daily[key] ?? { known: 0, unknown: 0, xp: 0 };
    out.push({ date: key, ...agg });
  }
  return out;
}

export function getMonthlySeries(months = 12) {
  const state = read();
  const today = new Date();
  const out = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    let known = 0, unknown = 0, xp = 0;
    for (const [k, v] of Object.entries(state.daily)) {
      if (k.startsWith(prefix)) { known += v.known; unknown += v.unknown; xp += v.xp; }
    }
    out.push({ month: prefix, known, unknown, xp });
  }
  return out;
}

export function getTopDecks(n = 3) {
  const state = read();
  const counts = {};
  for (const a of state.attempts) {
    if (!a.category) continue;
    counts[a.category] = (counts[a.category] ?? 0) + 1;
  }
  return DECKS
    .map((d) => ({ ...d, attempts: counts[d.category] ?? 0 }))
    .filter((d) => d.attempts > 0)
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, n);
}

export const HARDEST_MIN_MISSES = 2;
export function getHardestWords(deckOrCategory, n = 3) {
  const state = read();
  const pool = poolFor(deckOrCategory);
  const seen = new Set();
  const unique = [];
  for (const w of pool) {
    if (seen.has(w.pl)) continue;
    seen.add(w.pl);
    unique.push(w);
  }
  return unique
    .map((w) => ({ pl: w.pl, en: w.en, misses: state.missCount[w.pl] ?? 0 }))
    .filter((w) => w.misses >= HARDEST_MIN_MISSES)
    .sort((a, b) => b.misses - a.misses)
    .slice(0, n);
}

export function getAvailableXP() {
  const state = read();
  const total = calcXP(state);
  return Math.max(0, total - (state.spentXP || 0));
}

export function spendXP(amount, label) {
  if (!amount || amount <= 0) return { ok: false, reason: "invalid_amount" };
  const state = read();
  const total = calcXP(state);
  const available = Math.max(0, total - (state.spentXP || 0));
  if (available < amount) {
    return { ok: false, reason: "insufficient_xp", available };
  }
  state.spentXP = (state.spentXP || 0) + amount;
  state.attempts.push({
    pl: `__spend:${label || "xp"}`,
    category: "__spend",
    known: false,
    ts: Date.now(),
    spent: amount,
  });
  if (state.attempts.length > 5000) state.attempts = state.attempts.slice(-5000);
  write(state);
  return { ok: true, available: available - amount };
}

export function awardBonusXp(amount, label) {
  if (!amount || amount <= 0) return null;
  const state = read();
  const today = todayKey();
  const day = state.daily[today] ?? { known: 0, unknown: 0, xp: 0 };
  day.xp += amount;
  state.daily[today] = day;
  state.attempts.push({ pl: `__bonus:${label || "xp"}`, category: "__bonus", known: true, ts: Date.now(), bonus: amount });
  if (state.attempts.length > 5000) state.attempts = state.attempts.slice(-5000);
  const newBadges = checkAchievements(state);
  write(state);
  return { state, newAchievements: newBadges };
}

export function pickNextFromPool(pool) {
  if (!pool || pool.length === 0) return null;
  const state = read();
  if (!state.sr) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const now = Date.now();
  const due = [];
  const fresh = [];
  const future = [];
  for (const w of pool) {
    const sr = state.sr[w.pl];
    if (!sr) fresh.push(w);
    else if (sr.nextReview <= now) due.push({ w, overdue: now - sr.nextReview });
    else future.push(w);
  }
  if (due.length > 0) {
    const totalWeight = due.reduce((s, x) => s + 1 + x.overdue / DAY_MS, 0);
    let r = Math.random() * totalWeight;
    for (const x of due) {
      r -= 1 + x.overdue / DAY_MS;
      if (r <= 0) return x.w;
    }
    return due[due.length - 1].w;
  }
  if (fresh.length > 0) {
    return fresh[Math.floor(Math.random() * fresh.length)];
  }
  return future[Math.floor(Math.random() * future.length)];
}

export function getDueCount(deckOrCategory) {
  const state = read();
  if (!state.sr) return 0;
  const pool = poolFor(deckOrCategory);
  const now = Date.now();
  let n = 0;
  for (const w of pool) {
    const sr = state.sr[w.pl];
    if (sr && sr.nextReview <= now) n++;
  }
  return n;
}

export function getDueWords(deckOrCategory) {
  const state = read();
  if (!state.sr) return [];
  const pool = poolFor(deckOrCategory);
  const now = Date.now();
  const out = [];
  for (const w of pool) {
    const sr = state.sr[w.pl];
    if (!sr) continue;
    if (sr.nextReview <= now) {
      out.push({
        ...w,
        status: "due",
        overdueDays: Math.max(0, Math.round((now - sr.nextReview) / DAY_MS)),
        ease: sr.ease,
        interval: sr.interval,
      });
    }
  }
  out.sort((a, b) => (b.overdueDays ?? 0) - (a.overdueDays ?? 0));
  return out;
}

export function watchProgress(cb) {
  const onChange = () => cb();
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
