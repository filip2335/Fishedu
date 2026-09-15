import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Flashcard from "../components/Flashcard";
import ProgressPanel from "../components/ProgressPanel";
import WordsListModal from "../components/WordsListModal";
import XPFloater from "../components/XPFloater";
import Confetti from "../components/Confetti";
import BackButton from "../components/BackButton";
import CustomDeckModal from "../components/CustomDeckModal";
import ConfirmModal from "../components/ConfirmModal";
import DeckSettingsModal from "../components/DeckSettingsModal";
import DeckCompleteModal from "../components/DeckCompleteModal";
import { useToast } from "../components/ToastContext";
import { getDeck, getDeckWords } from "../data/decks.js";
import { awardBonusXp, getDueWords, markDeckCompleted, logAnswer } from "../data/progress.js";
import {
  getLastDeckWord,
  setLastDeckWord,
  getLastSequentialWord,
  setLastSequentialWord,
} from "../data/storage.js";
import { LEVEL_OPTIONS, deleteCustomDeck } from "../data/backend.js";
import {
  formatKey,
  getDefaultReversed,
  getKeybindings,
  subscribeDeckSettings,
} from "../data/deckSettings.js";
import {
  DAILY_CHALLENGE_BONUS,
  DAILY_CHALLENGE_SIZE,
  markBonusGiven,
  recordChallengeAnswer,
} from "../data/dailyChallenge.js";

const LEVEL_KEY_PREFIX = "talia:level:";

function buildQueue(filteredWords, lastSeqPl, dueRaw) {
  if (!filteredWords || filteredWords.length === 0) return [];

  const inPoolPls = new Set(filteredWords.map((w) => w.pl));
  const duePls = new Set(
    dueRaw.filter((w) => w.status === "due" && inPoolPls.has(w.pl)).map((w) => w.pl)
  );

  // Due segment: in filtered-deck order
  const dueSegment = filteredWords
    .filter((w) => duePls.has(w.pl))
    .map((w) => ({ ...w, _type: "due" }));

  // Sequential segment: start after lastSeqPl (wrap), exclude due
  const N = filteredWords.length;
  let startIdx = 0;
  if (lastSeqPl) {
    const i = filteredWords.findIndex((w) => w.pl === lastSeqPl);
    if (i >= 0) startIdx = (i + 1) % N;
  }
  const seqSegment = [];
  for (let step = 0; step < N; step++) {
    const idx = (startIdx + step) % N;
    const w = filteredWords[idx];
    if (!duePls.has(w.pl)) seqSegment.push({ ...w, _type: "sequential" });
  }

  return [...dueSegment, ...seqSegment];
}

export default function Talia() {
  const { deck: slug } = useParams();
  const navigate = useNavigate();
  const deck = getDeck(slug);
  const [cardKey, setCardKey] = useState(0);
  const [queueIndex, setQueueIndex] = useState(0);
  const restoredRef = useRef(false);
  const toast = useToast();

  const isUserDeck = deck?.custom && !deck?.isSaved && !deck?.isChallenge && !deck?.isReview;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDeleteConfirm = () => {
    if (!deck) return;
    const title = deck.title;
    deleteCustomDeck(deck.slug);
    setDeleteOpen(false);
    toast.success(`Usunięto talię "${title}".`);
    navigate("/fiszki");
  };

  const [flash, setFlash] = useState(null);
  const [floaters, setFloaters] = useState([]);
  const [confettiKey, setConfettiKey] = useState(0);
  const floaterIdRef = useRef(0);

  const [reversed, setReversed] = useState(() => getDefaultReversed(slug));
  useEffect(() => {
    const unsub = subscribeDeckSettings(() => setReversed(getDefaultReversed(slug)));
    setReversed(getDefaultReversed(slug));
    return unsub;
  }, [slug]);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [sessionAnswered, setSessionAnswered] = useState(new Set());
  const [sessionKnownWords, setSessionKnownWords] = useState([]);
  const [sessionUnknownWords, setSessionUnknownWords] = useState([]);
  const [completeOpen, setCompleteOpen] = useState(false);

  const [levelFilter, setLevelFilter] = useState(() => {
    if (!slug) return "all";
    try { return localStorage.getItem(LEVEL_KEY_PREFIX + slug) || "all"; } catch { return "all"; }
  });
  useEffect(() => {
    if (!slug) return;
    try { localStorage.setItem(LEVEL_KEY_PREFIX + slug, levelFilter); } catch {}
  }, [slug, levelFilter]);

  const [wordsModalOpen, setWordsModalOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    if (focusMode) root.classList.add("focus-mode");
    else root.classList.remove("focus-mode");
    return () => root.classList.remove("focus-mode");
  }, [focusMode]);
  useEffect(() => {
    if (!focusMode) return;
    const onKey = (e) => { if (e.key === "Escape") setFocusMode(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode]);

  const allWords = useMemo(() => getDeckWords(deck), [deck]);

  const availableLevels = useMemo(() => {
    const set = new Set();
    for (const w of allWords) if (w.level) set.add(w.level);
    return LEVEL_OPTIONS.filter((l) => set.has(l));
  }, [allWords]);

  const showLevelFilter = availableLevels.length > 1;

  const filteredWords = useMemo(() => {
    if (levelFilter === "all" || !showLevelFilter) return allWords;
    return allWords.filter((w) => w.level === levelFilter);
  }, [allWords, levelFilter, showLevelFilter]);

  const [queue, setQueue] = useState([]);

  useEffect(() => {
    if (!slug || filteredWords.length === 0) {
      setQueue([]);
      return;
    }
    const lastSeqPl = getLastSequentialWord(slug)?.pl ?? null;
    const dueRaw = deck ? getDueWords(deck) : [];
    const newQueue = buildQueue(filteredWords, lastSeqPl, dueRaw);
    setQueue(newQueue);

    let restoredIdx = 0;
    if (!restoredRef.current) {
      const last = getLastDeckWord(slug);
      if (last) {
        const idx = newQueue.findIndex((w) => w.pl === last.pl);
        if (idx >= 0) restoredIdx = idx;
      }
      restoredRef.current = true;
    } else {
      // Filter changed mid-session — just restart from 0.
      restoredIdx = 0;
    }
    setQueueIndex(restoredIdx);
    setCardKey((k) => k + 1);
    setSessionAnswered(new Set());
    setSessionKnownWords([]);
    setSessionUnknownWords([]);
    setCompleteOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, filteredWords.length, levelFilter]);

  const currentWord = queue[queueIndex] ?? null;

  useEffect(() => {
    if (currentWord && slug) {
      setLastDeckWord(slug, currentWord);
    }
  }, [currentWord, slug]);

  const handleAnswer = (known) => {
    let result = null;
    let sessionJustCompleted = false;
    if (currentWord) {
      result = logAnswer({ pl: currentWord.pl, category: deck?.category, known });
      if (currentWord._type === "sequential") {
        setLastSequentialWord(slug, currentWord);
      }

      if (!sessionAnswered.has(currentWord.pl)) {
        const word = { pl: currentWord.pl, en: currentWord.en };
        const nextAnswered = new Set(sessionAnswered);
        nextAnswered.add(currentWord.pl);
        setSessionAnswered(nextAnswered);
        if (known) setSessionKnownWords((list) => [...list, word]);
        else       setSessionUnknownWords((list) => [...list, word]);
        if (queue.length > 0 && nextAnswered.size >= queue.length) {
          sessionJustCompleted = true;
        }
      }
      if (deck?.isChallenge) {
        const dcProg = recordChallengeAnswer(currentWord.pl);
        const target = Math.min(DAILY_CHALLENGE_SIZE, queue.length);
        if (!dcProg.bonusGiven && dcProg.answered.length >= target) {
          markBonusGiven();
          const bonus = awardBonusXp(DAILY_CHALLENGE_BONUS, "daily-challenge");
          setConfettiKey((k) => k + 1);
          toast.achievement({
            icon: "🏆",
            title: `Wyzwanie zaliczone! +${DAILY_CHALLENGE_BONUS} XP`,
            description: "Wróć jutro po nowy zestaw 10 słówek.",
          });
          if (bonus?.newAchievements) {
            for (const a of bonus.newAchievements) {
              toast.achievement({
                icon: a.icon,
                title: a.title,
                description: a.description,
              });
            }
          }
        }
      }
    }

    setFlash(known ? "known" : "unknown");
    setTimeout(() => setFlash(null), 540);

    if (result) {
      const id = ++floaterIdRef.current;
      setFloaters((list) => [...list, { id, xp: result.xp, known, onCooldown: result.onCooldown }]);
      setTimeout(() => {
        setFloaters((list) => list.filter((f) => f.id !== id));
      }, 1200);

      if (result.streakIncreased || (result.newAchievements && result.newAchievements.length > 0)) {
        setConfettiKey((k) => k + 1);
      }

      if (result.newAchievements) {
        for (const a of result.newAchievements) {
          toast.achievement({
            icon: a.icon,
            title: a.title,
            description: a.description,
          });
        }
      }
    }

    if (queue.length > 0) {
      setQueueIndex((i) => (i + 1) % queue.length);
    }
    setCardKey((k) => k + 1);

    if (sessionJustCompleted) {
      // Trwałe oznaczenie: talia ukończona — odznaki za completion liczą stąd.
      // Pomijamy pseudo-talie (Saved/Challenge/Review) — to nie są regularne talie.
      if (slug && !deck?.isSaved && !deck?.isChallenge && !deck?.isReview) {
        const result = markDeckCompleted(slug);
        if (result?.newAchievements) {
          for (const a of result.newAchievements) {
            toast.achievement({ icon: a.icon, title: a.title, description: a.description });
          }
        }
      }
      setTimeout(() => setCompleteOpen(true), 600);
    }
  };

  const handleRestartDeck = () => {
    setSessionAnswered(new Set());
    setSessionKnownWords([]);
    setSessionUnknownWords([]);
    setCompleteOpen(false);
    setQueueIndex(0);
    setCardKey((k) => k + 1);
  };

  const goPrev = () => {
    if (queue.length === 0) return;
    setQueueIndex((i) => (i - 1 + queue.length) % queue.length);
    setCardKey((k) => k + 1);
  };

  const goNext = () => {
    if (queue.length === 0) return;
    setQueueIndex((i) => (i + 1) % queue.length);
    setCardKey((k) => k + 1);
  };

  const [keybinds, setKeybinds] = useState(() => getKeybindings());
  useEffect(() => {
    const refresh = () => setKeybinds(getKeybindings());
    return subscribeDeckSettings(refresh);
  }, []);
  useEffect(() => {
    if (settingsOpen) return;
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || e.target?.isContentEditable) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === keybinds.known)        { e.preventDefault(); handleAnswer(true); }
      else if (k === keybinds.unknown) { e.preventDefault(); handleAnswer(false); }
      else if (k === keybinds.prev)    { e.preventDefault(); goPrev(); }
      else if (k === keybinds.next)    { e.preventDefault(); goNext(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keybinds, settingsOpen, queue]);

  const jumpToWord = (pl) => {
    const idx = queue.findIndex((w) => w.pl === pl);
    if (idx >= 0) {
      setQueueIndex(idx);
      setCardKey((k) => k + 1);
      setWordsModalOpen(false);
    }
  };

  if (!deck) {
    return (
      <section className="py-20 text-center fade-up fade-up-1">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-3xl font-black mb-3">Nie znaleziono talii</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Ta talia nie istnieje lub została usunięta.
        </p>
        <Link
          to="/fiszki"
          className="inline-block px-5 py-2.5 rounded-full bg-brandPurple text-white font-bold text-sm tracking-wide
                     hover:scale-105 active:scale-95 transition-all duration-200
                     hover:shadow-[0_4px_20px_rgba(139,92,246,0.45)]"
        >
          ← Wróć do fiszek
        </Link>
      </section>
    );
  }

  if (deck.custom && allWords.length === 0) {
    const isSaved = deck.isSaved;
    const isReview = deck.isReview;
    const emptyIcon = isSaved ? "💔" : isReview ? "✨" : "📭";
    const emptyTitle = isSaved
      ? "Brak zapisanych słówek"
      : isReview
        ? "Nic do powtórki!"
        : "Pusta talia";
    const emptyDesc = isSaved
      ? "Klikaj ikonę serca ❤️ na fiszce, aby zapisywać słówka do tej talii."
      : isReview
        ? "Wszystkie słówka są aktualnie utrwalone. Wróć później albo poucz się nowych słówek w którejś z talii."
        : "Ta talia nie ma jeszcze żadnych słówek. Dodaj kilka, żeby zacząć naukę.";
    return (
      <section className="py-20 text-center fade-up fade-up-1">
        <div className="text-6xl mb-4">{emptyIcon}</div>
        <h1 className="text-3xl font-black mb-3">{emptyTitle}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
          {emptyDesc}
        </p>
        <Link
          to="/fiszki"
          className="inline-block px-5 py-2.5 rounded-full bg-brandPurple text-white font-bold text-sm tracking-wide
                     hover:scale-105 active:scale-95 transition-all duration-200
                     hover:shadow-[0_4px_20px_rgba(139,92,246,0.45)]"
        >
          ← Wróć do fiszek
        </Link>
      </section>
    );
  }

  const noMatching = queue.length === 0;

  return (
    <>
    <section className="py-12 fade-up fade-up-1">
      <div className="relative">
      <div className="focus-hide mb-4">
        <BackButton to="/fiszki" label="Fiszki" />
      </div>

      <div className="focus-hide text-center mb-8">
        <div className="text-5xl mb-3">{deck.icon}</div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          <span className="text-brandPurple">{deck.title}</span>
        </h1>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 tabular-nums">
          {allWords.length} słówek{showLevelFilter && levelFilter !== "all"
            ? ` · pokazane: ${filteredWords.length} (${levelFilter})`
            : ""}
        </p>
        {isUserDeck && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="text-xs font-bold px-4 py-2 rounded-full
                         border-2 border-brandPurple/25 bg-white/60 dark:bg-white/5
                         text-gray-700 dark:text-gray-200
                         hover:border-brandPurple/60 hover:scale-[1.03] active:scale-95
                         transition-all duration-200"
            >
              ✏️ Edytuj talię
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="text-xs font-bold px-4 py-2 rounded-full
                         border-2 border-red-400/30 bg-white/60 dark:bg-white/5
                         text-red-600 dark:text-red-400
                         hover:border-red-500 hover:bg-red-500 hover:text-white hover:scale-[1.03] active:scale-95
                         transition-all duration-200"
            >
              🗑️ Usuń talię
            </button>
          </div>
        )}
      </div>

      <div className="focus-hide flex flex-wrap gap-2 justify-center mb-6">
        <button
          type="button"
          onClick={() => setReversed((r) => !r)}
          className="text-xs font-bold px-4 py-2 rounded-full
                     border-2 border-brandPurple/25 bg-white/50 dark:bg-white/5
                     text-gray-700 dark:text-gray-200
                     hover:border-brandPurple/60 transition-all duration-200"
          title="Zmień kierunek nauki"
        >
          {reversed ? "EN → PL" : "PL → EN"} ⇄
        </button>

        {showLevelFilter && (
          <div className="flex gap-1 p-1 rounded-full bg-white/50 dark:bg-white/5 border-2 border-brandPurple/25">
            {["all", ...availableLevels].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`text-[11px] font-bold px-3 py-1 rounded-full tracking-wide
                            transition-all duration-200
                            ${levelFilter === lvl
                              ? "bg-brandPurple text-white"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
              >
                {lvl === "all" ? "Wszystkie" : lvl}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setWordsModalOpen(true)}
          className="text-xs font-bold px-4 py-2 rounded-full
                     border-2 border-brandPurple/25 bg-white/50 dark:bg-white/5
                     text-gray-700 dark:text-gray-200
                     hover:border-brandPurple/60 transition-all duration-200"
        >
          📋 Słówka w talii
        </button>

        <button
          type="button"
          onClick={() => setFocusMode((f) => !f)}
          className={`text-xs font-bold px-4 py-2 rounded-full border-2 transition-all duration-200
                      ${focusMode
                        ? "border-brandPurple bg-brandPurple text-white"
                        : "border-brandPurple/25 bg-white/50 dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:border-brandPurple/60"}`}
          title={focusMode ? "Wyjdź ze skupienia (Esc)" : "Tryb skupienia"}
        >
          {focusMode ? "🌙 Wyjdź ze skupienia" : "👁️ Skup się"}
        </button>

        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="text-xs font-bold px-4 py-2 rounded-full
                     border-2 border-brandPurple/25 bg-white/50 dark:bg-white/5
                     text-gray-700 dark:text-gray-200
                     hover:border-brandPurple/60 transition-all duration-200"
          title="Ustawienia talii"
        >
          ⚙️ Ustawienia
        </button>
      </div>

      {/* Fiszka + przyciski */}
      <div className="flex flex-col items-center gap-6">
        {noMatching ? (
          <div className="w-full max-w-sm rounded-3xl border-2 border-dashed border-brandPurple/30
                          bg-purple-50/30 dark:bg-white/[0.02]
                          px-6 py-12 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Brak słówek o poziomie <span className="font-bold">{levelFilter}</span> w tej talii.
            </p>
            <button
              type="button"
              onClick={() => setLevelFilter("all")}
              className="mt-4 text-xs font-bold text-brandPurple hover:underline"
            >
              Pokaż wszystkie
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <div className={flash === "known" ? "card-flash-known" : flash === "unknown" ? "card-flash-unknown" : ""}>
              <Flashcard
                key={cardKey}
                wordSource="random"
                customWords={currentWord ? [currentWord] : []}
                reversed={reversed}
                flipKey={keybinds.flip || " "}
                isCustomWord={!!deck?.custom}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400 dark:text-gray-500 tracking-widest uppercase">
              <span>{formatKey(keybinds.flip || " ")} — odwróć</span>
              <span className="tabular-nums">
                {queueIndex + 1} / {queue.length}
              </span>
            </div>
          </div>
        )}

        {!noMatching && (
          <div className="relative flex flex-wrap gap-3 justify-center">
            {floaters.map((f) => (
              <XPFloater key={f.id} xp={f.xp} known={f.known} onCooldown={f.onCooldown} />
            ))}
            <button
              type="button"
              onClick={goPrev}
              className="px-4 py-3 rounded-full border-2 border-brandPurple/25
                         bg-white/50 dark:bg-white/5
                         text-gray-700 dark:text-gray-200
                         font-bold tracking-wide
                         hover:border-brandPurple/60 hover:scale-105 active:scale-95
                         transition-all duration-200"
              aria-label="Poprzednie słowo"
              title="Poprzednie"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className="px-6 py-3 rounded-full border-2 border-emerald-500/40
                         bg-emerald-50 dark:bg-emerald-900/15
                         text-emerald-700 dark:text-emerald-400
                         font-bold tracking-wide
                         hover:border-emerald-500 hover:scale-105 active:scale-95
                         transition-all duration-200"
            >
              ✓ Znam
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className="px-6 py-3 rounded-full border-2 border-gray-400/40
                         bg-gray-50 dark:bg-white/5
                         text-gray-700 dark:text-gray-300
                         font-bold tracking-wide
                         hover:border-gray-400 hover:scale-105 active:scale-95
                         transition-all duration-200"
            >
              ✗ Nie znam
            </button>
            <button
              type="button"
              onClick={goNext}
              className="px-4 py-3 rounded-full border-2 border-brandPurple/25
                         bg-white/50 dark:bg-white/5
                         text-gray-700 dark:text-gray-200
                         font-bold tracking-wide
                         hover:border-brandPurple/60 hover:scale-105 active:scale-95
                         transition-all duration-200"
              aria-label="Następne słowo"
              title="Następne (bez oceny)"
            >
              →
            </button>
          </div>
        )}
      </div>

      <ProgressPanel scope="deck" deck={deck} variant="sticky" />
      </div>
    </section>

    <WordsListModal
      open={wordsModalOpen}
      onClose={() => setWordsModalOpen(false)}
      deck={deck}
      words={allWords}
      onWordClick={jumpToWord}
      currentPl={currentWord?.pl}
    />

    {confettiKey > 0 && (
      <Confetti
        key={confettiKey}
        count={18}
        onDone={() => setConfettiKey(0)}
      />
    )}

    {focusMode && (
      <button
        type="button"
        onClick={() => setFocusMode(false)}
        className="fixed top-4 right-4 z-[60]
                   px-4 py-2 rounded-full
                   border-2 border-brandPurple/40 bg-white dark:bg-gray-900
                   text-brandPurple text-xs font-bold tracking-wide
                   shadow-lg
                   hover:scale-[1.02] active:scale-95
                   transition-all duration-200"
        title="Wyjdź ze skupienia (Esc)"
      >
        🌙 Wyjdź
      </button>
    )}

    {isUserDeck && (
      <CustomDeckModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editing={deck}
      />
    )}

    <DeckSettingsModal
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      deck={deck}
    />

    <DeckCompleteModal
      open={completeOpen}
      onClose={() => setCompleteOpen(false)}
      deck={deck}
      known={sessionKnownWords.length}
      unknown={sessionUnknownWords.length}
      knownWords={sessionKnownWords}
      unknownWords={sessionUnknownWords}
      onRestart={handleRestartDeck}
    />

    {isUserDeck && (
      <ConfirmModal
        open={deleteOpen}
        icon="🗑️"
        variant="danger"
        title="Usunąć talię?"
        message={
          <>
            Talia <span className="font-bold text-gray-900 dark:text-gray-100">"{deck.title}"</span>{" "}
            zostanie trwale usunięta wraz ze słówkami.
          </>
        }
        confirmLabel="Usuń talię"
        cancelLabel="Anuluj"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
      />
    )}
    </>
  );
}
