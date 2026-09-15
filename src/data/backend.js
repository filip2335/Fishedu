const EVNT = "customDecksChange";

const KOLORY = {
  purple:  { accent: "border-brandPurple",  bg: "bg-purple-50 dark:bg-white/[0.03]"  },
  yellow:  { accent: "border-brandYellow",  bg: "bg-yellow-50 dark:bg-white/[0.03]"  },
  emerald: { accent: "border-brandEmerald", bg: "bg-emerald-50 dark:bg-white/[0.03]" },
  pink:    { accent: "border-pink-400",     bg: "bg-pink-50 dark:bg-white/[0.03]"    },
  blue:    { accent: "border-sky-400",      bg: "bg-sky-50 dark:bg-white/[0.03]"     },
};

export const COLOR_OPTIONS = Object.keys(KOLORY);
export const ICON_OPTIONS = ["📚", "✨", "🎯", "🌍", "🎨", "🎵", "⚽", "🐾", "🌿", "🔬", "🍀", "🚀"];
export const LEVEL_OPTIONS = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const DEFAULT_LEVEL = "A1";

const KLUCZ = "customDecks";

function czytaj() {
  try {
    const raw = localStorage.getItem(KLUCZ);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function zapisz(talie) {
  localStorage.setItem(KLUCZ, JSON.stringify(talie));
  window.dispatchEvent(new CustomEvent(EVNT));
}

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/[ąćęłńóśźż]/g, (c) => "acelnoszz"["ąćęłńóśźż".indexOf(c)])
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function unikatowySlug(baza, istniejace) {
  let slug = baza || "talia";
  let n = 1;
  while (istniejace.some((d) => d.slug === slug)) {
    n += 1;
    slug = `${baza}-${n}`;
  }
  return slug;
}

function udekoruj(talia) {
  const kol = KOLORY[talia.color] ?? KOLORY.purple;
  const domyslnyPoziom = LEVEL_OPTIONS.includes(talia.defaultLevel) ? talia.defaultLevel : DEFAULT_LEVEL;
  return {
    ...talia,
    custom: true,
    category: `custom:${talia.slug}`,
    accent: kol.accent,
    bg: kol.bg,
    defaultLevel: domyslnyPoziom,
    words: (talia.words || []).map((w) => ({
      ...w,
      level: LEVEL_OPTIONS.includes(w.level) ? w.level : undefined,
    })),
  };
}

function normPoziom(poziom, fallback = DEFAULT_LEVEL) {
  return LEVEL_OPTIONS.includes(poziom) ? poziom : fallback;
}

function normPoziomSlowa(poziom) {
  return LEVEL_OPTIONS.includes(poziom) ? poziom : undefined;
}

function normSlowa(slowa) {
  return (slowa || [])
    .map((w) => {
      const out = { pl: (w.pl || "").trim(), en: (w.en || "").trim() };
      const lvl = normPoziomSlowa(w.level);
      if (lvl) out.level = lvl;
      return out;
    })
    .filter((w) => w.pl && w.en);
}

export function getCustomDecks() {
  return czytaj().map(udekoruj);
}

export function getCustomDeck(slug) {
  const znaleziona = czytaj().find((d) => d.slug === slug);
  return znaleziona ? udekoruj(znaleziona) : null;
}

export function isCustomDeckTitleTaken(title, excludeSlug = null) {
  const norm = (title || "").trim().toLowerCase();
  if (!norm) return false;
  return czytaj().some((d) => d.slug !== excludeSlug && (d.title || "").trim().toLowerCase() === norm);
}

export function addCustomDeck({ title, icon, color, defaultLevel, words }) {
  const talie = czytaj();
  const baza = slugify(title) || "talia";
  const slug = unikatowySlug(baza, talie);
  const lvl = normPoziom(defaultLevel);
  const talia = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    slug,
    title: (title || "Bez nazwy").trim(),
    icon: icon || "📚",
    color: COLOR_OPTIONS.includes(color) ? color : "purple",
    defaultLevel: lvl,
    words: normSlowa(words),
    createdAt: new Date().toISOString(),
  };
  talie.push(talia);
  zapisz(talie);
  // console.log("dodano talię:", slug);
  return udekoruj(talia);
}

export function updateCustomDeck(slug, patch) {
  const talie = czytaj();
  const idx = talie.findIndex((d) => d.slug === slug);
  if (idx < 0) return null;
  const aktualna = talie[idx];
  const lvl = patch.defaultLevel !== undefined
    ? normPoziom(patch.defaultLevel, aktualna.defaultLevel || DEFAULT_LEVEL)
    : (aktualna.defaultLevel || DEFAULT_LEVEL);
  const zaktualizowana = {
    ...aktualna,
    title: patch.title !== undefined ? (patch.title || "Bez nazwy").trim() : aktualna.title,
    icon:  patch.icon  !== undefined ? (patch.icon || "📚") : aktualna.icon,
    color: patch.color !== undefined && COLOR_OPTIONS.includes(patch.color) ? patch.color : aktualna.color,
    defaultLevel: lvl,
    words: patch.words !== undefined ? normSlowa(patch.words) : aktualna.words,
  };
  talie[idx] = zaktualizowana;
  zapisz(talie);
  return udekoruj(zaktualizowana);
}

export function deleteCustomDeck(slug) {
  zapisz(czytaj().filter((d) => d.slug !== slug));
}

export function subscribeCustomDecks(cb) {
  const onChange = () => cb(getCustomDecks());
  window.addEventListener(EVNT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVNT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
