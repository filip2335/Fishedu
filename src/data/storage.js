const EVNT_ZAPISANE = "savedWordsChange";
const EVNT_OSTATNIE = "lastDeckWordChange";
const EVNT_SEQ = "lastSequentialWordChange";

function czytajJson(klucz, def) {
  try {
    const raw = localStorage.getItem(klucz);
    return raw ? JSON.parse(raw) : def;
  } catch {
    return def;
  }
}

function zapiszJson(klucz, val) {
  localStorage.setItem(klucz, JSON.stringify(val));
}

export function getSavedWords() {
  return czytajJson("savedWords", []);
}

export function isWordSaved(pl) {
  return getSavedWords().some((w) => w.pl === pl);
}

export function toggleSavedWord(word) {
  const lista = czytajJson("savedWords", []);
  const idx = lista.findIndex((w) => w.pl === word.pl);
  if (idx >= 0) lista.splice(idx, 1);
  else lista.push({ pl: word.pl, en: word.en });
  zapiszJson("savedWords", lista);
  window.dispatchEvent(new CustomEvent(EVNT_ZAPISANE));
  // console.log("toggle saved:", word.pl, idx < 0 ? "dodano" : "usunięto");
  return idx < 0;
}

export function subscribeSavedWords(cb) {
  const onChange = () => cb(getSavedWords());
  window.addEventListener(EVNT_ZAPISANE, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVNT_ZAPISANE, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getLastDeckWord(deckSlug) {
  const mapa = czytajJson("lastDeckWord", {});
  return mapa[deckSlug] ?? null;
}

export function setLastDeckWord(deckSlug, word) {
  if (!word) return;
  const mapa = czytajJson("lastDeckWord", {});
  mapa[deckSlug] = { pl: word.pl, en: word.en };
  zapiszJson("lastDeckWord", mapa);
  window.dispatchEvent(new CustomEvent(EVNT_OSTATNIE));
}

export function subscribeLastDeckWord(cb) {
  const onChange = () => cb();
  window.addEventListener(EVNT_OSTATNIE, onChange);
  return () => window.removeEventListener(EVNT_OSTATNIE, onChange);
}

export function getLastSequentialWord(deckSlug) {
  const mapa = czytajJson("lastSequentialWord", {});
  return mapa[deckSlug] ?? null;
}

export function setLastSequentialWord(deckSlug, word) {
  if (!word) return;
  const mapa = czytajJson("lastSequentialWord", {});
  mapa[deckSlug] = { pl: word.pl, en: word.en };
  zapiszJson("lastSequentialWord", mapa);
  window.dispatchEvent(new CustomEvent(EVNT_SEQ));
}

export function getDeckProgress(deckSlug) {
  const mapa = czytajJson("deckProgress", {});
  return mapa[deckSlug] ?? { known: [], seen: [], lastStudy: null, dailyCounts: {} };
}

export function getAllDeckProgress() {
  return czytajJson("deckProgress", {});
}
