// localStorage: kierunek per-deck + globalne skróty klawiszowe

const PREF_KIER = "talia:defaultReversed:";
const PREF_KLAW = "talia:keybindings";
const EVNT = "deckSettingsChange";

export const KEYBIND_ACTIONS = [
  { id: "known",   label: "Znam (✓)",          defaultKey: "j" },
  { id: "unknown", label: "Nie znam (✗)",      defaultKey: "f" },
  { id: "flip",    label: "Odwróć fiszkę",     defaultKey: " " },
  { id: "prev",    label: "Poprzednia fiszka", defaultKey: "ArrowLeft" },
  { id: "next",    label: "Następna fiszka",   defaultKey: "ArrowRight" },
];

export function getDefaultReversed(slug) {
  if (!slug) return false;
  try {
    return localStorage.getItem(PREF_KIER + slug) === "1";
  } catch {
    return false;
  }
}

export function setDefaultReversed(slug, odwrocona) {
  if (!slug) return;
  try {
    localStorage.setItem(PREF_KIER + slug, odwrocona ? "1" : "0");
    window.dispatchEvent(new CustomEvent(EVNT));
  } catch {}
}

function domyslneKlawisze() {
  const out = {};
  for (const a of KEYBIND_ACTIONS) out[a.id] = a.defaultKey;
  return out;
}

export function getKeybindings() {
  try {
    const raw = localStorage.getItem(PREF_KLAW);
    if (!raw) return domyslneKlawisze();
    return { ...domyslneKlawisze(), ...JSON.parse(raw) };
  } catch {
    return domyslneKlawisze();
  }
}

export function setKeybindings(mapa) {
  try {
    localStorage.setItem(PREF_KLAW, JSON.stringify(mapa));
    window.dispatchEvent(new CustomEvent(EVNT));
  } catch {}
}

export function resetKeybindings() {
  setKeybindings(domyslneKlawisze());
}

export function formatKey(k) {
  if (k == null || k === "") return "—";
  if (k === " ") return "Spacja";
  if (k === "ArrowLeft") return "←";
  if (k === "ArrowRight") return "→";
  if (k === "ArrowUp") return "↑";
  if (k === "ArrowDown") return "↓";
  if (k === "Enter") return "Enter";
  if (k === "Escape") return "Esc";
  if (k === "Tab") return "Tab";
  if (k.length === 1) return k.toUpperCase();
  return k;
}

export function normalizeKey(e) {
  const k = e.key;
  if (!k) return null;
  if (k.length === 1) return k.toLowerCase();
  return k;
}

export function subscribeDeckSettings(cb) {
  const onChange = () => cb();
  window.addEventListener(EVNT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVNT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
