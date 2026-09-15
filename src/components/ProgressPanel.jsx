import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AccuracyModal from "./AccuracyModal";
import ActivityModal from "./ActivityModal";
import DueWordsModal from "./DueWordsModal";
import MasteredModal from "./MasteredModal";
import {
  DAILY_GOAL,
  getAccuracyForPref,
  getAccuracyPref,
  getDailySeries,
  getDeckTotal,
  getDueCount,
  getGlobalTotal,
  getHardestWords,
  getMasteredCount,
  getMasteredFilter,
  getMonthlySeries,
  getProgress,
  getStreak,
  getTopDecks,
  getXPToday,
  labelForAccuracyPref,
  watchProgress,
} from "../data/progress.js";
import { getDeck } from "../data/decks.js";

export default function ProgressPanel({ scope = "deck", deck, variant = "inline" }) {
  const [, setTick] = useState(0);
  useEffect(() => watchProgress(() => setTick((t) => t + 1)), []);

  const [period, setPeriod] = useState("7d"); // "7d" | "month" | "year"

  const deckTitle = deck?.title;

  const wrapperClasses =
    variant === "sticky"
      ? "mt-8 2xl:mt-0 2xl:absolute 2xl:inset-y-0 2xl:left-[calc(50%+29.5rem)] 2xl:w-[22.5rem] 2xl:pointer-events-none"
      : "";

  const stickyClasses =
    variant === "sticky"
      ? "2xl:sticky 2xl:top-28 2xl:pointer-events-auto"
      : "";

  const headline =
    scope === "global"
      ? "Twój postęp"
      : `Postęp${deckTitle ? `: ${deckTitle}` : ""}`;

  return (
    <div className={wrapperClasses}>
      <aside
        className={`focus-hide rounded-3xl border-2 border-brandPurple/20
                    bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm
                    p-7 ${stickyClasses}`}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl leading-none">📊</span>
          <h3 className="text-base font-black tracking-tight truncate">{headline}</h3>
        </div>

        <LoggedInContent
          scope={scope}
          deck={deck}
          period={period}
          setPeriod={setPeriod}
        />
      </aside>
    </div>
  );
}

function LoggedInContent({ scope, deck, period, setPeriod }) {
  const state = getProgress();
  const hasActivity = state.attempts.length > 0;

  const streak = getStreak();
  const xpToday = getXPToday();
  const masteredFilter = getMasteredFilter();
  const filteredDeck = useMemo(() => {
    if (scope !== "global" || !masteredFilter.slug) return null;
    return getDeck(masteredFilter.slug) ?? null;
  }, [scope, masteredFilter.slug, state.attempts.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const masteredTarget = scope === "deck" ? deck : filteredDeck;
  const target = scope === "deck" ? deck : null;
  const mastered = getMasteredCount(masteredTarget);
  const total = masteredTarget
    ? getDeckTotal(masteredTarget)
    : getGlobalTotal();
  const { accuracy } = getAccuracyForPref();
  const accuracyLabel = labelForAccuracyPref(getAccuracyPref());
  const dueCount = getDueCount(target);
  const [dueModalOpen, setDueModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [accuracyModalOpen, setAccuracyModalOpen] = useState(false);
  const [masteredModalOpen, setMasteredModalOpen] = useState(false);

  const series = useMemo(() => {
    if (period === "7d")    return { kind: "daily",   data: getDailySeries(7) };
    if (period === "month") return { kind: "daily",   data: getDailySeries(30) };
    return                         { kind: "monthly", data: getMonthlySeries(12) };
  }, [period, state.attempts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hasActivity) {
    return (
      <div className="space-y-6">
        <EmptyState scope={scope} />
        <PeriodSwitch period={period} setPeriod={setPeriod} />
        <MiniChart series={series} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <StreakBadge
          current={streak.current}
          onClick={() => setActivityModalOpen(true)}
        />
        <XPRing xp={xpToday} goal={DAILY_GOAL} />
      </div>

      <ActivityModal
        open={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
      />

      <button
        type="button"
        onClick={() => setMasteredModalOpen(true)}
        className="w-full text-left space-y-2 group"
        title="Zobacz szczegóły opanowanych słówek"
      >
        <div className="flex justify-between text-xs font-semibold tracking-widest uppercase text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-150">
          <span className="truncate">
            Opanowane
            {filteredDeck ? <span className="normal-case tracking-normal text-brandPurple">: {filteredDeck.title}</span> : ""}
          </span>
          <span className="tabular-nums flex-shrink-0">{mastered}/{total}</span>
        </div>
        <div className="h-3 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full bg-brandPurple transition-all duration-500"
            style={{ width: `${total ? Math.round((mastered / total) * 100) : 0}%` }}
          />
        </div>
      </button>

      <MasteredModal
        open={masteredModalOpen}
        onClose={() => setMasteredModalOpen(false)}
        expandable={false}
      />

      <button
        type="button"
        onClick={() => setAccuracyModalOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl
                   bg-white/60 dark:bg-white/5 border border-brandPurple/10
                   hover:border-brandPurple/40 hover:bg-white/80 dark:hover:bg-white/10
                   active:scale-[0.99] transition-all duration-200 text-left"
        title="Zmień zakres czasu"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl">🎯</span>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Dokładność
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
              {accuracy === null ? `${accuracyLabel} · brak danych` : accuracyLabel}
            </div>
          </div>
        </div>
        <span className={`text-lg font-black tabular-nums flex-shrink-0
                          ${accuracy === null ? "text-gray-400 dark:text-gray-500" : ""}`}>
          {accuracy === null ? "—" : `${Math.round(accuracy * 100)}%`}
        </span>
      </button>

      <AccuracyModal
        open={accuracyModalOpen}
        onClose={() => setAccuracyModalOpen(false)}
      />

      {total > 0 && (
        <button
          type="button"
          onClick={() => setDueModalOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl
                     bg-white/60 dark:bg-white/5 border border-brandPurple/10
                     hover:border-brandPurple/40 hover:bg-white/80 dark:hover:bg-white/10
                     active:scale-[0.99] transition-all duration-200 text-left"
          title="Zobacz słowa do powtórki"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🔁</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Do powtórki
            </span>
          </div>
          <span className={`text-lg font-black tabular-nums
                            ${dueCount > 0 ? "text-brandPurple" : "text-gray-400 dark:text-gray-500"}`}>
            {dueCount}
          </span>
        </button>
      )}

      <DueWordsModal
        open={dueModalOpen}
        onClose={() => setDueModalOpen(false)}
        deck={target}
      />


      <PeriodSwitch period={period} setPeriod={setPeriod} />
      <MiniChart series={series} />

      {scope === "global"
        ? <TopDecksList />
        : <HardestWordsList deck={target} />}

      <Link
        to="/statystyki"
        className="block w-full text-center text-xs font-bold tracking-widest uppercase
                   text-brandPurple hover:underline pt-2"
      >
        Pełne statystyki →
      </Link>
    </div>
  );
}

function EmptyState({ scope }) {
  const msg = scope === "global"
    ? "Rozpocznij naukę w dowolnej talii — Twoje statystyki pojawią się tutaj."
    : "Użyj przycisków Znam / Nie znam, aby śledzić swój postęp w tej talii.";
  return (
    <div className="rounded-xl border border-dashed border-brandPurple/30
                    bg-white/40 dark:bg-white/[0.02] px-4 py-6 text-center">
      <div className="text-3xl mb-2">✨</div>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {msg}
      </p>
    </div>
  );
}

function StreakBadge({ current, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Zobacz aktywność"
      className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl
                 bg-white/60 dark:bg-white/5 border border-brandPurple/10
                 hover:border-brandPurple/40 hover:bg-white/80 dark:hover:bg-white/10
                 active:scale-[0.99] transition-all duration-200 text-left"
    >
      <span className="text-2xl leading-none">🔥</span>
      <div className="min-w-0">
        <div className="text-xl font-black leading-none tabular-nums">{current}</div>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 leading-none mt-1">
          Streak
        </div>
      </div>
    </button>
  );
}

function XPRing({ xp, goal }) {
  const pct = Math.min(1, xp / goal);
  const r = 28;
  const c = 2 * Math.PI * r;
  const remaining = Math.max(0, goal - xp);
  const reached = xp >= goal;
  return (
    <div className="relative w-[72px] h-[72px] flex-shrink-0 group">
      <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="6"
                className="stroke-gray-200 dark:stroke-white/10" />
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="6"
                strokeLinecap="round"
                className="stroke-brandPurple transition-all duration-500"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-base font-black tabular-nums">{xp}</span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 tracking-widest mt-0.5">XP</span>
      </div>

      <div
        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-30
                   pointer-events-none opacity-0 group-hover:opacity-100
                   transition-opacity duration-150
                   px-3 py-2 rounded-lg w-44
                   bg-gray-900 dark:bg-gray-800 text-white
                   text-[11px] leading-relaxed
                   shadow-lg border border-brandPurple/30"
        role="tooltip"
      >
        <div className="font-bold tracking-tight">XP zdobyte dzisiaj</div>
        <div className="text-gray-300 dark:text-gray-400 mt-0.5">
          {xp} / {goal} XP
        </div>
        <div className="text-gray-400 dark:text-gray-500 mt-0.5">
          {reached ? "🎉 Cel osiągnięty!" : `Brakuje ${remaining} XP do dziennego celu`}
        </div>
      </div>
    </div>
  );
}

function PeriodSwitch({ period, setPeriod }) {
  const tabs = [
    { key: "7d",    label: "7 dni" },
    { key: "month", label: "Miesiąc" },
    { key: "year",  label: "Rok" },
  ];
  return (
    <div className="flex gap-1 p-1.5 rounded-full bg-white/50 dark:bg-white/5 border border-brandPurple/10">
      {tabs.map((t) => {
        const active = period === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => setPeriod(t.key)}
            className={`flex-1 text-xs font-bold py-2 rounded-full transition-all
                        ${active
                          ? "bg-brandPurple text-white shadow-sm"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function MiniChart({ series }) {
  const data = series.data;
  const max = Math.max(1, ...data.map((d) => d.xp));
  const H = 112;
  const W = 304;           // fits within w-[22.5rem] (360) minus p-7 (2×28) ≈ 304
  const gap = 3;
  const bw = (W - gap * (data.length - 1)) / data.length;

  const totalXP = data.reduce((s, d) => s + d.xp, 0);
  const activeDays = series.kind === "daily"
    ? data.filter((d) => d.xp > 0).length
    : null;

  const labels = series.kind === "daily"
    ? dailyLabels(data)
    : data.map((d) => monthShortPl(d.month));

  return (
    <div className="space-y-2">
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block overflow-visible"
      >
        {data.map((d, i) => {
          const h = Math.max(d.xp > 0 ? 4 : 2, (d.xp / max) * H);
          const x = i * (bw + gap);
          const y = H - h;
          const isToday = series.kind === "daily" && i === data.length - 1;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={bw}
              height={h}
              rx={Math.min(3, bw / 2)}
              className={d.xp > 0
                ? (isToday ? "fill-brandYellow" : "fill-brandPurple")
                : "fill-gray-300 dark:fill-white/10"}
            >
              <title>
                {series.kind === "daily"
                  ? `${d.date}: ${d.xp} XP (${d.known} znam / ${d.unknown} nie znam)`
                  : `${d.month}: ${d.xp} XP`}
              </title>
            </rect>
          );
        })}
      </svg>
      {series.kind === "daily" ? (
        <div className="flex justify-between text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      ) : (
        <div className="grid grid-cols-12 text-[10px] text-gray-400 dark:text-gray-500 text-center">
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {series.kind === "daily"
            ? `${activeDays} ${pluralDni(activeDays)} nauki`
            : "12 miesięcy"}
        </span>
        <span className="font-semibold tabular-nums">{totalXP} XP</span>
      </div>
    </div>
  );
}

function dailyLabels(data) {
  const n = data.length;
  if (n <= 7) return data.map((d) => dayShortPl(d.date));
  const picks = [0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1];
  return data.map((d, i) => picks.includes(i) ? dayShortPl(d.date) : "·");
}

function dayShortPl(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  const names = ["Ndz", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];
  return names[d.getDay()];
}

function monthShortPl(ym) {
  const m = parseInt(ym.slice(5, 7), 10);
  const names = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
  return names[m - 1];
}

function pluralDni(n) {
  if (n === 1) return "dzień";
  const last = n % 10;
  const last2 = n % 100;
  if (last >= 2 && last <= 4 && (last2 < 10 || last2 >= 20)) return "dni";
  return "dni";
}

function TopDecksList() {
  const top = getTopDecks(3);
  if (!top.length) return null;
  return (
    <div>
      <div className="text-xs font-semibold tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-3">
        Top talie
      </div>
      <ul className="space-y-2.5">
        {top.map((d) => (
          <li key={d.slug} className="flex items-center gap-3 text-sm">
            <span className="text-xl leading-none">{d.icon}</span>
            <span className="flex-1 truncate">{d.title}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
              {d.attempts}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HardestWordsList({ deck }) {
  const hard = getHardestWords(deck, 3);
  if (!hard.length) return null;
  return (
    <div>
      <div className="text-xs font-semibold tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-3">
        Najtrudniejsze
      </div>
      <ul className="space-y-2.5">
        {hard.map((w) => (
          <li key={w.pl} className="flex items-center gap-3 text-sm">
            <span className="flex-1 truncate font-semibold">{w.pl}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
              {w.en}
            </span>
            <span className="text-xs text-red-500/80 tabular-nums">×{w.misses}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
