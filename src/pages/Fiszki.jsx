import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Flashcard from "../components/Flashcard";
import ProgressPanel from "../components/ProgressPanel";
import CustomDeckModal from "../components/CustomDeckModal";
import ConfirmModal from "../components/ConfirmModal";
import DailyChallengeCard from "../components/DailyChallengeCard";
import { useToast } from "../components/ToastContext";
import { getSavedWords, subscribeSavedWords } from "../data/storage.js";
import { DECKS, getDeckWordCount, SAVED_DECK_SLUG } from "../data/decks.js";
import {
  getCustomDecks,
  subscribeCustomDecks,
  deleteCustomDeck,
} from "../data/backend.js";

function LicznikZapisanych() {
  const [ilosc, setIlosc] = useState(() => getSavedWords().length);
  useEffect(() => subscribeSavedWords((lista) => setIlosc(lista.length)), []);

  return (
    <span className="inline-block px-4 py-1.5 rounded-full border border-brandPurple/30
                     bg-brandPurple/10 text-brandPurple text-xs font-semibold tracking-wide mb-4">
      Zapisane słówka: {ilosc}
    </span>
  );
}

function KafelekCustom({ deck, onEdytuj, onUsun }) {
  return (
    <div
      className={`group relative p-5 rounded-2xl border-2 border-dashed ${deck.accent} ${deck.bg}
                  transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
    >
      <Link
        to={`/fiszki/${deck.slug}`}
        className="absolute inset-0 rounded-2xl"
        aria-label={`Otwórz talię ${deck.title}`}
      />

      <span
        className="absolute top-2 left-2 text-[10px] font-bold tracking-widest uppercase
                   text-brandPurple bg-brandPurple/10 border border-brandPurple/25
                   px-2 py-0.5 rounded-full"
        title="Twoja talia"
      >
        Moja talia
      </span>

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100
                      transition-opacity duration-200 z-10">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onEdytuj(deck); }}
          className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-brandPurple/25
                     flex items-center justify-center text-xs
                     hover:bg-brandPurple hover:text-white hover:border-brandPurple
                     transition-all duration-200"
          aria-label="Edytuj talię"
          title="Edytuj"
        >✏️</button>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onUsun(deck); }}
          className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-red-400/30
                     flex items-center justify-center text-xs
                     hover:bg-red-500 hover:text-white hover:border-red-500
                     transition-all duration-200"
          aria-label="Usuń talię"
          title="Usuń"
        >🗑️</button>
      </div>

      <div className="flex flex-col items-center text-center justify-center gap-2 pt-2">
        <div className="text-3xl">{deck.icon}</div>
        <h3 className="text-sm font-bold">{deck.title}</h3>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 tabular-nums">
          {deck.words?.length ?? 0} słówek
        </span>
      </div>
    </div>
  );
}

function pasuje(tekst, zapytanie) {
  if (!zapytanie) return true;
  return (tekst || "").toLowerCase().includes(zapytanie.toLowerCase());
}

export default function Fiszki() {
  const [customTalie, setCustomTalie] = useState(() => getCustomDecks());
  const [liczbaZapisanych, setLiczbaZapisanych] = useState(() => getSavedWords().length);
  const [modalOtwarty, setModalOtwarty] = useState(false);
  const [edytowana, setEdytowana] = useState(null);
  const [usuwana, setUsuwana] = useState(null);
  const [zapytanie, setZapytanie] = useState("");
  const toast = useToast();

  useEffect(() => subscribeCustomDecks(setCustomTalie), []);
  useEffect(() => subscribeSavedWords((lista) => setLiczbaZapisanych(lista.length)), []);

  const otworzTworz = () => { setEdytowana(null); setModalOtwarty(true); };
  const otworzEdycje = (deck) => { setEdytowana(deck); setModalOtwarty(true); };
  const zapocznikujUsuwanie = (deck) => setUsuwana(deck);

  const potwierdzUsun = () => {
    if (!usuwana) return;
    const tytul = usuwana.title;
    deleteCustomDeck(usuwana.slug);
    setUsuwana(null);
    toast.success(`Usunięto talię "${tytul}".`);
    // console.log("usunięto:", tytul);
  };

  return (
    <>
    <section className="py-20 fade-up fade-up-1">
      <div className="relative">
      <div className="text-center mb-10">
        <LicznikZapisanych />
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
          <span className="text-brandPurple">Fiszki</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
          Zestaw Gotowych zestawów lub stwórz własne talie dopasowane do Twojego poziomu.
        </p>
      </div>

      <div className="max-w-sm mx-auto">
        <Flashcard wordSource="random" />
      </div>

      <div className="max-w-sm mx-auto mt-10">
        <DailyChallengeCard />
      </div>

      <div className="flex items-center justify-between gap-2 sm:gap-4 mt-16 mb-6">
        <h2 className="text-xl sm:text-2xl font-black flex-shrink-0">
          Wybierz <span className="text-brandPurple">talię</span>
        </h2>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={zapytanie}
            onChange={(e) => setZapytanie(e.target.value)}
            placeholder="🔍 Szukaj talii..."
            className="w-full px-3 py-2 sm:px-4 sm:py-2.5 pr-9 rounded-full text-sm
                       border border-brandPurple/25
                       bg-white/60 dark:bg-white/5 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-brandPurple/50 focus:border-brandPurple/50
                       transition-all duration-200"
          />
          {zapytanie && (
            <button
              type="button"
              onClick={() => setZapytanie("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full
                         text-gray-400 hover:text-brandPurple hover:bg-brandPurple/10
                         flex items-center justify-center text-sm
                         transition-all duration-150"
              aria-label="Wyczyść wyszukiwarkę"
            >✕</button>
          )}
        </div>
      </div>

      {(() => {
        const pokazZapisane = pasuje("Zapisane", zapytanie);
        const dopasowaneWbudowane = DECKS.filter((d) => pasuje(d.title, zapytanie));
        const dopasowaneCustom = customTalie.filter((d) => pasuje(d.title, zapytanie));
        const lacznie = (pokazZapisane ? 1 : 0) + dopasowaneWbudowane.length + dopasowaneCustom.length;

        if (zapytanie && lacznie === 0) {
          return (
            <div className="text-center py-12 px-4">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Nie znaleziono talii pasującej do <span className="font-bold text-gray-900 dark:text-gray-100">"{zapytanie}"</span>.
              </p>
              <button
                type="button"
                onClick={otworzTworz}
                className="bg-brandPurple text-white text-sm font-bold
                           px-5 py-2.5 rounded-full tracking-wide
                           hover:scale-[1.02] active:scale-95
                           hover:shadow-[0_4px_20px_rgba(139,92,246,0.45)]
                           transition-all duration-200"
              >
                ➕ Stwórz własną talię
              </button>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {pokazZapisane && (
              <Link
                to={`/fiszki/${SAVED_DECK_SLUG}`}
                className="p-5 rounded-2xl border-2 border-pink-400 bg-pink-50 dark:bg-white/[0.03]
                           cursor-pointer select-none flex flex-col items-center text-center
                           justify-center gap-2 no-underline text-inherit
                           transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl">❤️</div>
                <h3 className="text-sm font-bold">Zapisane</h3>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 tabular-nums">
                  {liczbaZapisanych} słówek
                </span>
              </Link>
            )}

            {dopasowaneWbudowane.map((deck) => (
              <Link
                key={deck.slug}
                to={`/fiszki/${deck.slug}`}
                className={`p-5 rounded-2xl border-2 ${deck.accent} ${deck.bg}
                            cursor-pointer select-none flex flex-col items-center text-center
                            justify-center gap-2 no-underline text-inherit
                            transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="text-3xl">{deck.icon}</div>
                <h3 className="text-sm font-bold">{deck.title}</h3>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 tabular-nums">
                  {getDeckWordCount(deck)} słówek
                </span>
              </Link>
            ))}

            {dopasowaneCustom.map((deck) => (
              <KafelekCustom
                key={deck.slug}
                deck={deck}
                onEdytuj={otworzEdycje}
                onUsun={zapocznikujUsuwanie}
              />
            ))}

            {!zapytanie && (
              <button
                type="button"
                onClick={otworzTworz}
                className="p-5 rounded-2xl border-2 border-dashed border-brandPurple/40
                           bg-purple-50/40 dark:bg-white/[0.02]
                           cursor-pointer select-none flex flex-col items-center text-center
                           justify-center gap-2
                           transition-all duration-200 hover:-translate-y-1 hover:shadow-lg
                           hover:border-brandPurple/80"
              >
                <div className="text-3xl text-brandPurple">➕</div>
                <h3 className="text-sm font-bold text-brandPurple">Stwórz własną talię</h3>
              </button>
            )}
          </div>
        );
      })()}

      <ProgressPanel scope="global" variant="sticky" />
      </div>
    </section>

    <CustomDeckModal
      open={modalOtwarty}
      onClose={() => setModalOtwarty(false)}
      editing={edytowana}
    />

    <ConfirmModal
      open={!!usuwana}
      icon="🗑️"
      variant="danger"
      title="Usunąć talię?"
      message={usuwana && (
        <>
          Talia <span className="font-bold text-gray-900 dark:text-gray-100">"{usuwana.title}"</span>{" "}
          zostanie trwale usunięta wraz ze słówkami.
        </>
      )}
      confirmLabel="Usuń talię"
      cancelLabel="Anuluj"
      onConfirm={potwierdzUsun}
      onCancel={() => setUsuwana(null)}
    />
    </>
  );
}
