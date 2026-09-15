import { useState, useEffect, useRef, useCallback } from "react";
import { HOLIDAYS, DEFAULT_HOLIDAY, audioKey as toAudioKey } from "../data/holidays.js";
import { getRandomWord, WORDS } from "../data/words.js";
import { pickNextFromPool } from "../data/progress.js";
import {
  isWordSaved,
  toggleSavedWord,
  subscribeSavedWords,
  getLastDeckWord,
} from "../data/storage.js";

function AutoDopasujSlowo({ word, forcedSize, onSizeReady, subtractPanel = true }) {
  const refKont = useRef(null);
  const refTekst = useRef(null);

  useEffect(() => {
    const kontener = refKont.current;
    const tekst = refTekst.current;
    if (!kontener || !tekst) return;

    const MAX_REM = 8;
    const MIN_REM = 11 / 16;

    const zmierz = () => {
      const szer = kontener.parentElement.clientWidth - (subtractPanel ? 116 : 0);
      if (szer <= 0) { requestAnimationFrame(zmierz); return; }
      kontener.style.width    = `${szer}px`;
      kontener.style.maxWidth = `${szer}px`;

      tekst.style.transition = "none";
      tekst.style.lineHeight = "1.1";

      const boxSzer = szer - 1 - 10 - 5;
      const boxWys = kontener.clientHeight;

      const pasuje = (size) => {
        tekst.style.fontSize = `${size}rem`;
        tekst.style.overflow = "hidden";
        tekst.style.maxWidth = `${boxSzer}px`;
        const ok = tekst.scrollWidth <= boxSzer;
        tekst.style.overflow = "";
        tekst.style.maxWidth = `${boxSzer}px`;
        return ok && tekst.offsetHeight <= boxWys;
      };

      let mn = MIN_REM, mks = MAX_REM;
      while (mks - mn > 0.05) {
        const sr = (mn + mks) / 2;
        if (pasuje(sr)) mn = sr; else mks = sr;
      }

      onSizeReady?.(mn);
      pasuje(forcedSize ?? mn);
      requestAnimationFrame(() => { tekst.style.transition = ""; });
    };

    document.fonts.ready.then(zmierz);
    let timer;
    const naResize = () => { clearTimeout(timer); timer = setTimeout(zmierz, 150); };
    window.addEventListener("resize", naResize);
    return () => { window.removeEventListener("resize", naResize); clearTimeout(timer); };
  }, [word, forcedSize, subtractPanel]);

  return (
    <div
      ref={refKont}
      className="w-full flex justify-center items-center h-[80px] max-h-[80px] overflow-hidden pl-[1px] pr-[10px]"
    >
      <h2
        ref={refTekst}
        className="font-black tracking-tighter uppercase italic text-brandPurple dark:text-brandYellow text-center"
        style={{ display: "block", width: "100%", overflowWrap: "normal", wordBreak: "normal" }}
      >
        {word}
      </h2>
    </div>
  );
}

if (import.meta.env.DEV) {
  Object.entries(HOLIDAYS).forEach(([data, h]) => {
    if (h.name.length > 21)
      throw new Error(`HOLIDAYS[${data}].name "${h.name}" exceeds 21 chars (${h.name.length})`);
    if (h.namePl.length > 21)
      throw new Error(`HOLIDAYS[${data}].namePl "${h.namePl}" exceeds 21 chars (${h.namePl.length})`);
  });
}

function dzisiejszeSwieto() {
  const t = new Date();
  const klucz = `${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  return HOLIDAYS[klucz] ?? DEFAULT_HOLIDAY;
}

function OdznakaGradient({ text, reverse = false }) {
  const gradient = reverse
    ? "bg-[conic-gradient(from_0deg_at_50%_50%,#8e44ad_0%,#f1c40f_50%,#8e44ad_100%)]"
    : "bg-[conic-gradient(from_0deg_at_50%_50%,#f1c40f_0%,#8e44ad_50%,#f1c40f_100%)]";
  return (
    <div className="magic-badge rounded-full shadow-sm w-full overflow-hidden">
      <div className={`animate-spin-slow absolute inset-[-400%] ${gradient}`} />
      <span className="magic-badge-content relative z-10 px-3 py-2.5 text-[10px] text-gray-900 dark:text-white leading-tight bg-white dark:bg-gray-900 rounded-full">
        {text}
      </span>
    </div>
  );
}

function IkonaMowca() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
  );
}

function IkonaSerce({ filled }) {
  return (
    <svg
      className={`w-5 h-5 transition-all duration-300 ${filled ? "text-red-500 fill-current" : ""}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

function BokKarty({ lang, word, onSpeak, onSave, saved, bije, hint, gradientFrom, gradientGlow, holidayName, todayLabel, forcedSize, onSizeReady, subtractPanel, pokazSwietko = true, onFlip, flipArea = "card" }) {
  const klikSlowo = (e) => {
    if (!onFlip) return;
    e.stopPropagation();
    e.preventDefault();
    onFlip();
  };

  const propsKarty = flipArea === "card" && onFlip
    ? { onClick: (e) => { e.stopPropagation(); onFlip(); } }
    : {};

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-3xl p-[3px] ${gradientGlow} transition-all duration-500 ease-in-out hover:-translate-y-1`}>
      <div className={`animate-spin-slow absolute inset-[-1000%] ${gradientFrom}`} />
      <div className="relative h-full w-full flex rounded-[calc(1.5rem-3px)] bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden" {...propsKarty}>
        {pokazSwietko && (
          <div className="holiday-slide">
            <div className="w-[110px] h-full flex flex-col justify-center items-center gap-3 px-3 border-r border-gray-200 dark:border-white/10">
              <OdznakaGradient text={todayLabel} />
              <OdznakaGradient text={holidayName} reverse />
            </div>
          </div>
        )}
        <div className="flex flex-col justify-between items-center p-4 text-center flex-1 min-w-0">
          <div
            className={`flex-grow flex flex-col items-center justify-center gap-2 w-full min-w-0 ${flipArea === "word" ? "cursor-pointer" : ""}`}
            onClick={flipArea === "word" ? klikSlowo : undefined}
          >
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              {lang}
            </span>
            <AutoDopasujSlowo word={word} forcedSize={forcedSize} onSizeReady={onSizeReady} subtractPanel={subtractPanel} />
          </div>
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onSpeak(); }}
              className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-300 shadow-md focus:outline-none text-gray-700 dark:text-white hover:text-yellow-500"
              aria-label="Odtwórz wymowę"
            >
              <IkonaMowca />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onSave(); }}
              className={`p-2.5 rounded-full transition-all duration-300 shadow-md ${bije ? "heart-bounce" : ""} ${saved ? "bg-red-50 dark:bg-red-900/20 text-red-500" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500"}`}
              aria-label="Zapisz słówko"
            >
              <IkonaSerce filled={saved} />
            </button>
          </div>
          <p className="text-sm text-gray-400 italic mt-3">{hint}</p>
        </div>
      </div>
    </div>
  );
}

export default function Flashcard({
  wordSource = "holiday",
  wordCategory,
  customWords,
  deckSlug,
  flipArea = "card",
  reversed = false,
  enableSpaceFlip = false,
  flipKey,
  onWordReady,
  isCustomWord = false,
}) {
  const czySwietko = wordSource === "holiday";
  const czyWznow   = wordSource === "resume";

  const [odwrocona, setOdwrocona] = useState(false);
  const [najechana, setNajechana] = useState(false);
  const [bije, setBije]           = useState(false);
  const [rozmiary, setRozmiary]   = useState([null, null]);

  const [wybraneSlowo] = useState(() => {
    if (czySwietko) return null;
    if (customWords && customWords.length > 0) {
      return pickNextFromPool(customWords) || customWords[0];
    }
    if (czyWznow && deckSlug) {
      const ostatnie = getLastDeckWord(deckSlug);
      if (ostatnie) {
        const pelne = WORDS.find((w) => w.pl === ostatnie.pl);
        return pelne || ostatnie;
      }
    }
    return getRandomWord(wordCategory);
  });

  const swietko = dzisiejszeSwieto();
  const slPL = czySwietko ? swietko.wordPl : wybraneSlowo.pl;
  const slEN = czySwietko ? swietko.word   : wybraneSlowo.en;
  const kluczEN = toAudioKey(slEN);
  const kluczPL = toAudioKey(slPL);

  const [zapisane, setZapisane] = useState(() => isWordSaved(slPL));
  useEffect(() => {
    const unsub = subscribeSavedWords(() => setZapisane(isWordSaved(slPL)));
    return unsub;
  }, [slPL]);

  useEffect(() => {
    if (czySwietko) return;
    onWordReady?.({ pl: slPL, en: slEN, category: wybraneSlowo?.category });
  }, [slPL, slEN, czySwietko, onWordReady, wybraneSlowo]);

  const wspolnyRozm = rozmiary[0] !== null && rozmiary[1] !== null
    ? Math.min(rozmiary[0], rozmiary[1])
    : null;

  const rozmPrzod = useCallback((s) => {
    setRozmiary(prev => prev[0] === s ? prev : [s, prev[1]]);
  }, []);

  const rozmTyl = useCallback((s) => {
    setRozmiary(prev => prev[1] === s ? prev : [prev[0], s]);
  }, []);

  const zapiszSlowo = () => {
    toggleSavedWord({ pl: slPL, en: slEN });
    setBije(true);
    setTimeout(() => setBije(false), 500);
  };

  const mow = (text, lang, kluczAudio) => {
    const kodJez = lang.split("-")[0].toLowerCase();
    // console.log("mow:", text, lang, kluczAudio);

    const wybierzGlos = () => {
      const glosy = speechSynthesis.getVoices();
      const dokladne = glosy.filter(v => v.lang.toLowerCase() === lang.toLowerCase());
      const tenJez = glosy.filter(v => v.lang.toLowerCase().startsWith(kodJez));
      return (
        dokladne.find(v => !v.default) || dokladne[0] ||
        tenJez.find(v => !v.default) || tenJez[0] ||
        null
      );
    };

    const mowSynth = () => {
      const run = () => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        u.rate = 0.9;
        const glos = wybierzGlos();
        if (glos) u.voice = glos;
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
      };
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener("voiceschanged", run, { once: true });
      } else {
        run();
      }
    };

    const mowOnline = async () => {
      const qs = `ie=UTF-8&q=${encodeURIComponent(text)}&tl=${kodJez}&client=tw-ob`;
      const urlki = [
        `/api/tts?${qs}`,
        `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${kodJez}&client=gtx`,
        `https://translate.google.com/translate_tts?${qs}`,
      ];
      for (const url of urlki) {
        // console.log("tts url:", url);
        let urlBlob = null;
        try {
          const res = await fetch(url);
          if (!res.ok) { console.warn(`[TTS] ${url} → HTTP ${res.status}`); continue; }
          const ct = res.headers.get("content-type") || "";
          if (!ct.toLowerCase().startsWith("audio/")) {
            console.warn(`[TTS] ${url} → non-audio: ${ct}`); continue;
          }
          const blob = await res.blob();
          if (blob.size < 200) { console.warn(`[TTS] ${url} → pusta odpowiedź (${blob.size}B)`); continue; }
          urlBlob = URL.createObjectURL(blob);
          const a = new Audio(urlBlob);
          const sprzataj = () => { URL.revokeObjectURL(urlBlob); };
          a.addEventListener("ended", sprzataj, { once: true });
          a.addEventListener("error", sprzataj, { once: true });
          await a.play();
          return;
        } catch (e) {
          console.warn(`[TTS] ${url} → błąd:`, e?.message || e);
          if (urlBlob) URL.revokeObjectURL(urlBlob);
        }
      }
      console.warn(`[TTS] wszystkie url padły dla "${text}" — fallback synth`);
      mowSynth();
    };

    // 1) lokalny mp3 → 2) google tts online → 3) web speech
    if (!kluczAudio) { mowOnline(); return; }
    const urlLokal = `/audio/${kodJez}/${kluczAudio}.mp3`;
    const audio = new Audio(urlLokal);
    let juzFallback = false;
    const awaria = () => { if (!juzFallback) { juzFallback = true; mowOnline(); } };
    audio.addEventListener("error", awaria, { once: true });
    audio.play().catch(awaria);
  };

  const obroc = useCallback(() => {
    // console.log("flip:", !odwrocona);
    setOdwrocona(f => !f);
  }, []);

  useEffect(() => {
    const cel = flipKey ?? (enableSpaceFlip ? " " : null);
    if (!cel) return;
    const naKlawisz = (e) => {
      const pasSpacja = cel === " " && (e.key === " " || e.code === "Space");
      const pasInny = cel !== " " && e.key === cel;
      if (!pasSpacja && !pasInny) return;
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || e.target?.isContentEditable) return;
      e.preventDefault();
      obroc();
    };
    window.addEventListener("keydown", naKlawisz);
    return () => window.removeEventListener("keydown", naKlawisz);
  }, [enableSpaceFlip, flipKey, obroc]);

  const propsKontenera = flipArea === "card"
    ? { onClick: obroc, className: `flashcard cursor-pointer ${odwrocona ? "flipped" : ""} ${najechana ? "hovered" : ""}` }
    : { className: `flashcard ${odwrocona ? "flipped" : ""} ${najechana ? "hovered" : ""}` };

  const podpowPrzod = czySwietko ? "Kliknij, aby odwrócić" : "Kliknij słowo, aby odwrócić";
  const podpowTyl   = czySwietko ? "Click to flip back"    : "Click the word to flip back";

  const przod = reversed
    ? {
        lang: "English", word: slEN,
        holidayName: swietko.name, todayLabel: "Today's holiday",
        speak: () => mow(slEN, "en-US", kluczEN),
        gradient: "bg-[conic-gradient(from_90deg_at_50%_50%,#f1c40f_0%,#8e44ad_50%,#f1c40f_100%)]",
        glow: "shadow-[0_0_30px_rgba(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(241,196,15,0.2)]",
        hint: flipArea === "card" ? "Click to flip" : "Click the word to flip",
        subtract: false,
      }
    : {
        lang: "Polski", word: slPL,
        holidayName: swietko.namePl, todayLabel: "Dzisiejsze święto",
        speak: () => mow(slPL, "pl-PL", kluczPL),
        gradient: "bg-[conic-gradient(from_90deg_at_50%_50%,#8e44ad_0%,#f1c40f_50%,#8e44ad_100%)]",
        glow: "shadow-[0_0_30px_rgba(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(142,68,173,0.2)]",
        hint: flipArea === "card" ? podpowPrzod : "Kliknij słowo, aby odwrócić",
        subtract: czySwietko,
      };

  const tyl = reversed
    ? {
        lang: "Polski", word: slPL,
        holidayName: swietko.namePl, todayLabel: "Dzisiejsze święto",
        speak: () => mow(slPL, "pl-PL", kluczPL),
        gradient: "bg-[conic-gradient(from_90deg_at_50%_50%,#8e44ad_0%,#f1c40f_50%,#8e44ad_100%)]",
        glow: "shadow-[0_0_30px_rgba(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(142,68,173,0.2)]",
        hint: flipArea === "card" ? "Kliknij, aby cofnąć" : "Kliknij słowo, aby cofnąć",
      }
    : {
        lang: "English", word: slEN,
        holidayName: swietko.name, todayLabel: "Today's holiday",
        speak: () => mow(slEN, "en-US", kluczEN),
        gradient: "bg-[conic-gradient(from_90deg_at_50%_50%,#f1c40f_0%,#8e44ad_50%,#f1c40f_100%)]",
        glow: "shadow-[0_0_30px_rgba(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(241,196,15,0.2)]",
        hint: flipArea === "card" ? podpowTyl : "Click the word to flip back",
      };

  return (
    <div
      {...propsKontenera}
      onMouseEnter={() => setNajechana(true)}
      onMouseLeave={() => setNajechana(false)}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <BokKarty
            lang={przod.lang} word={przod.word}
            holidayName={przod.holidayName} todayLabel={przod.todayLabel}
            onSpeak={przod.speak}
            onSave={zapiszSlowo} saved={zapisane} bije={bije}
            hint={przod.hint}
            gradientFrom={przod.gradient}
            gradientGlow={przod.glow}
            forcedSize={wspolnyRozm} onSizeReady={rozmPrzod}
            subtractPanel={przod.subtract}
            pokazSwietko={czySwietko}
            onFlip={obroc}
            flipArea={flipArea}
          />
        </div>
        <div className="flashcard-back">
          <BokKarty
            lang={tyl.lang} word={tyl.word}
            holidayName={tyl.holidayName} todayLabel={tyl.todayLabel}
            onSpeak={tyl.speak}
            onSave={zapiszSlowo} saved={zapisane} bije={bije}
            hint={tyl.hint}
            gradientFrom={tyl.gradient}
            gradientGlow={tyl.glow}
            forcedSize={wspolnyRozm} onSizeReady={rozmTyl} subtractPanel={false}
            pokazSwietko={czySwietko}
            onFlip={obroc}
            flipArea={flipArea}
          />
        </div>
      </div>
    </div>
  );
}
