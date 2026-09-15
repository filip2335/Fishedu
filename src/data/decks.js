// Built-in decks shown on /fiszki and their subpages.
// Each deck maps a slug (URL) to a WORDS category and visual styling.
// Categories must match values used in src/data/words.js.

import { getCustomDeck, getCustomDecks } from "./backend.js";
import { WORDS } from "./words.js";
import { getSavedWords } from "./storage.js";
import { getTodayChallenge } from "./dailyChallenge.js";
import { getDueWords } from "./progress.js";

export const SAVED_DECK_SLUG = "zapisane";
export const CHALLENGE_DECK_SLUG = "wyzwanie";
export const REVIEW_DECK_SLUG = "do-powtorki";

export const DECKS = [
  { icon: "✈️",  title: "Podróże",          slug: "podroze",          category: "travel",       accent: "border-brandPurple",  bg: "bg-purple-50 dark:bg-white/[0.03]"  },
  { icon: "🍕",  title: "Jedzenie",         slug: "jedzenie",         category: "food",         accent: "border-brandYellow",  bg: "bg-yellow-50 dark:bg-white/[0.03]"  },
  { icon: "💼",  title: "Biznes",           slug: "biznes",           category: "business",     accent: "border-brandEmerald", bg: "bg-emerald-50 dark:bg-white/[0.03]" },
  { icon: "💬",  title: "Codzienne zwroty", slug: "codzienne-zwroty", category: "everyday",     accent: "border-brandPurple",  bg: "bg-purple-50 dark:bg-white/[0.03]"  },
  { icon: "🕒",  title: "Liczby i czas",    slug: "liczby-i-czas",    category: "numbers-time", accent: "border-brandYellow",  bg: "bg-yellow-50 dark:bg-white/[0.03]"  },
  { icon: "👨‍👩‍👧", title: "Rodzina",          slug: "rodzina",          category: "family",       accent: "border-brandEmerald", bg: "bg-emerald-50 dark:bg-white/[0.03]" },
  { icon: "⚡",  title: "Czasowniki",       slug: "czasowniki",       category: "verbs",        accent: "border-brandPurple",  bg: "bg-purple-50 dark:bg-white/[0.03]"  },
  { icon: "🎨",  title: "Przymiotniki",     slug: "przymiotniki",     category: "adjectives",   accent: "border-brandYellow",  bg: "bg-yellow-50 dark:bg-white/[0.03]"  },
  { icon: "🩺",  title: "Ciało i zdrowie",  slug: "cialo-i-zdrowie",  category: "body",         accent: "border-brandEmerald", bg: "bg-emerald-50 dark:bg-white/[0.03]" },
  { icon: "🛋️",  title: "Dom i przedmioty", slug: "dom-i-przedmioty", category: "home",         accent: "border-brandPurple",  bg: "bg-purple-50 dark:bg-white/[0.03]"  },
  { icon: "🌳",  title: "Natura i zwierzęta", slug: "natura-i-zwierzeta", category: "nature",   accent: "border-brandYellow",  bg: "bg-yellow-50 dark:bg-white/[0.03]"  },
  { icon: "💖",  title: "Emocje i charakter", slug: "emocje-i-charakter", category: "emotions", accent: "border-brandEmerald", bg: "bg-emerald-50 dark:bg-white/[0.03]" },
  { icon: "👔",  title: "Praca i zawody",   slug: "praca-i-zawody",   category: "work",         accent: "border-brandPurple",  bg: "bg-purple-50 dark:bg-white/[0.03]"  },
  { icon: "💻",  title: "Technologia i internet", slug: "technologia-i-internet", category: "tech", accent: "border-brandYellow", bg: "bg-yellow-50 dark:bg-white/[0.03]" },
  { icon: "🎓",  title: "Edukacja",         slug: "edukacja",         category: "education",    accent: "border-brandEmerald", bg: "bg-emerald-50 dark:bg-white/[0.03]" },
  { icon: "⚽",  title: "Sport i hobby",    slug: "sport-i-hobby",    category: "sports",       accent: "border-brandPurple",  bg: "bg-purple-50 dark:bg-white/[0.03]"  },
  { icon: "👗",  title: "Ubrania i wygląd", slug: "ubrania-i-wyglad", category: "clothing",     accent: "border-brandYellow",  bg: "bg-yellow-50 dark:bg-white/[0.03]"  },
  { icon: "🏛️",  title: "Społeczeństwo i polityka", slug: "spoleczenstwo-i-polityka", category: "society", accent: "border-brandEmerald", bg: "bg-emerald-50 dark:bg-white/[0.03]" },
  { icon: "🎭",  title: "Sztuka i kultura", slug: "sztuka-i-kultura", category: "art",          accent: "border-brandPurple",  bg: "bg-purple-50 dark:bg-white/[0.03]"  },
  { icon: "🌍",  title: "Geografia świata", slug: "geografia-swiata", category: "geography",    accent: "border-brandYellow",  bg: "bg-yellow-50 dark:bg-white/[0.03]"  },
  { icon: "🍳",  title: "Kuchnia świata",   slug: "kuchnia-swiata",   category: "cuisine",      accent: "border-brandEmerald", bg: "bg-emerald-50 dark:bg-white/[0.03]" },
  { icon: "🚗",  title: "Transport i pojazdy", slug: "transport-i-pojazdy", category: "transport", accent: "border-brandPurple", bg: "bg-purple-50 dark:bg-white/[0.03]" },
  { icon: "⚖️",  title: "Prawo i sądy",          slug: "prawo-i-sady",         category: "law", accent: "border-brandYellow", bg: "bg-yellow-50 dark:bg-white/[0.03]" },
  { icon: "💰",  title: "Finanse i pieniądze", slug: "finanse-i-pieniadze", category: "finance", accent: "border-brandEmerald", bg: "bg-emerald-50 dark:bg-white/[0.03]" },
];

// Enrich saved {pl, en} entries with level / category looked up from
// WORDS or the user's custom decks. Words not found anywhere stay raw.
function enrichSavedWord(w) {
  const fromWords = WORDS.find((x) => x.pl === w.pl);
  if (fromWords) return { pl: w.pl, en: w.en, level: fromWords.level, category: fromWords.category };
  for (const d of getCustomDecks()) {
    const found = (d.words || []).find((x) => x.pl === w.pl);
    if (found) return { pl: w.pl, en: w.en, level: found.level, category: d.category };
  }
  return { pl: w.pl, en: w.en };
}

export function getSavedDeck() {
  const saved = getSavedWords();
  return {
    slug: SAVED_DECK_SLUG,
    title: "Zapisane słówka",
    icon: "❤️",
    category: "saved",
    custom: true,
    isSaved: true,
    accent: "border-pink-400",
    bg: "bg-pink-50 dark:bg-white/[0.03]",
    words: saved.map(enrichSavedWord),
  };
}

export function getChallengeDeck() {
  const { words } = getTodayChallenge();
  return {
    slug: CHALLENGE_DECK_SLUG,
    title: "Dzisiejsze wyzwanie",
    icon: "🎯",
    category: "challenge",
    custom: true,
    isChallenge: true,
    accent: "border-brandYellow",
    bg: "bg-yellow-50 dark:bg-white/[0.03]",
    words,
  };
}

// Pseudo-talia "Do powtórki": słówka z due-pool SR.
// Renderuje się jak każda inna talia, ale zawartość liczy się on-demand
// z aktualnego stanu spaced-repetition.
export function getReviewDeck() {
  const due = getDueWords(null);
  return {
    slug: REVIEW_DECK_SLUG,
    title: "Do powtórki",
    icon: "🔁",
    category: "review",
    custom: true,
    isReview: true,
    accent: "border-amber-500",
    bg: "bg-amber-50 dark:bg-white/[0.03]",
    words: due.map((w) => ({ pl: w.pl, en: w.en, level: w.level })),
  };
}

export function getDeck(slug) {
  if (slug === SAVED_DECK_SLUG) return getSavedDeck();
  if (slug === CHALLENGE_DECK_SLUG) return getChallengeDeck();
  if (slug === REVIEW_DECK_SLUG) return getReviewDeck();
  return DECKS.find((d) => d.slug === slug) ?? getCustomDeck(slug) ?? null;
}

// Returns array of { pl, en, level, category } for a given built-in or custom deck.
export function getDeckWords(deck) {
  if (!deck) return [];
  if (deck.custom) return deck.words ?? [];
  return WORDS.filter((w) => w.category === deck.category);
}

export function getDeckWordCount(deck) {
  return getDeckWords(deck).length;
}
