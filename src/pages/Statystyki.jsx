import { useEffect, useMemo, useState } from "react";
import AccuracyModal from "../components/AccuracyModal";
import MasteredModal from "../components/MasteredModal";
import MonthlyHeatmap from "../components/MonthlyHeatmap";
import AchievementModal from "../components/AchievementModal";
import {
  ACHIEVEMENTS,
  DAILY_GOAL,
  getAccuracyForPref,
  getAccuracyPref,
  getAvailableXP,
  getDeckTotal,
  getGlobalTotal,
  getHardestWords,
  getLevel,
  getMasteredCount,
  getMasteredFilter,
  getProgress,
  getStreak,
  getTopDecks,
  getUnlockedAchievements,
  getXPToday,
  labelForAccuracyPref,
  watchProgress,
} from "../data/progress.js";
import { getDeck } from "../data/decks.js";

export default function Statystyki() {
  const [, setTick] = useState(0);
  useEffect(() => watchProgress(() => setTick((t) => t + 1)), []);

  const [masteredOpen, setMasteredOpen] = useState(false);
  const [accuracyOpen, setAccuracyOpen] = useState(false);
  const [badgeOpen, setBadgeOpen] = useState(null);

  const state = getProgress();
  const streak = getStreak();
  const xpToday = getXPToday();

  const masteredFilter = getMasteredFilter();
  const filterDeck = masteredFilter.slug ? getDeck(masteredFilter.slug) : null;
  const masteredAll = filterDeck ? getMasteredCount(filterDeck) : getMasteredCount(null);
  const totalAll = filterDeck ? getDeckTotal(filterDeck) : getGlobalTotal();

  const { accuracy } = getAccuracyForPref();
  const accuracyLabel = labelForAccuracyPref(getAccuracyPref());

  const totalXP = useMemo(() => {
    return Object.values(state.daily || {}).reduce((s, d) => s + (d.xp || 0), 0);
  }, [state.daily]);

  const level = getLevel();
  const availableXP = getAvailableXP();

  const dailyMap = state.daily || {};

  const currentYear = new Date().getFullYear();
  const [activityYear, setActivityYear] = useState(currentYear);

  const minDataYear = useMemo(() => {
    let min = null;
    for (const iso of Object.keys(dailyMap)) {
      const y = parseInt(iso.slice(0, 4), 10);
      if (Number.isFinite(y) && (min === null || y < min)) min = y;
    }
    return min;
  }, [dailyMap]);

  const minSelectableYear = Math.min(currentYear - 4, minDataYear ?? currentYear);
  const maxSelectableYear = currentYear + 1;
  const canGoPrev = activityYear > minSelectableYear;
  const canGoNext = activityYear < maxSelectableYear;

  const yearTotals = useMemo(() => {
    let attempts = 0;
    let known = 0;
    for (const a of state.attempts) {
      const y = new Date(a.ts).getFullYear();
      if (y !== activityYear) continue;
      attempts += 1;
      if (a.known) known += 1;
    }
    return { attempts, known };
  }, [state.attempts, activityYear]);

  const topDecks = useMemo(() => getTopDecks(8), [state]); // eslint-disable-line react-hooks/exhaustive-deps
  const hardest = useMemo(() => getHardestWords(null, 10), [state]); // eslint-disable-line react-hooks/exhaustive-deps
  const achievements = useMemo(() => getUnlockedAchievements(), [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <section className="py-12 fade-up fade-up-1">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">📊</div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
          <span className="text-brandPurple">Statystyki</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
          Twoje pełne podsumowanie nauki — postępy, najtrudniejsze słówka i odznaki.
        </p>
      </div>

      {/* Karta poziomu */}
      <LevelCard level={level} availableXP={availableXP} />

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
        <StatCard icon="🔥" label="Streak"     value={`${streak.current}`}    sub={streak.best > streak.current ? `rec. ${streak.best}` : "dni"} />
        <StatCard icon="⚡" label="XP dzisiaj"  value={`${xpToday}`}            sub={`cel: ${DAILY_GOAL}`} />
        <StatCard icon="💯" label="Suma XP"    value={`${totalXP}`}            sub="łącznie" />
        <StatCard
          icon="💎"
          label="Opanowane"
          value={`${masteredAll}/${totalAll}`}
          sub={totalAll ? `${Math.round((masteredAll / totalAll) * 100)}%` : "0%"}
          onClick={() => setMasteredOpen(true)}
          hint="Kliknij, aby zobaczyć szczegóły"
        />
        <StatCard
          icon="🎯"
          label="Dokładność"
          value={accuracy === null ? "—" : `${Math.round(accuracy * 100)}%`}
          sub={accuracyLabel}
          onClick={() => setAccuracyOpen(true)}
          hint="Kliknij, aby zmienić zakres czasu"
        />
      </div>

      {/* Aktywność roczna z podziałem na miesiące */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl leading-none">📅</span>
        <h2 className="text-lg font-black tracking-tight">Aktywność</h2>
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={() => canGoPrev && setActivityYear((y) => y - 1)}
            disabled={!canGoPrev}
            className="w-8 h-8 rounded-full border border-brandPurple/25
                       bg-white/60 dark:bg-white/5 text-brandPurple text-sm font-bold
                       flex items-center justify-center
                       hover:border-brandPurple/60 disabled:opacity-30 disabled:cursor-not-allowed
                       transition-all duration-150"
            aria-label="Poprzedni rok"
          >
            ←
          </button>
          <span className="text-sm font-black tabular-nums w-14 text-center">
            {activityYear}
          </span>
          <button
            type="button"
            onClick={() => canGoNext && setActivityYear((y) => y + 1)}
            disabled={!canGoNext}
            className="w-8 h-8 rounded-full border border-brandPurple/25
                       bg-white/60 dark:bg-white/5 text-brandPurple text-sm font-bold
                       flex items-center justify-center
                       hover:border-brandPurple/60 disabled:opacity-30 disabled:cursor-not-allowed
                       transition-all duration-150"
            aria-label="Następny rok"
          >
            →
          </button>
        </div>
      </div>
      <MonthlyHeatmap dailyMap={dailyMap} year={activityYear} />
      <div className="text-[11px] text-gray-400 dark:text-gray-500 text-center mb-10 mt-2">
        {yearTotals.attempts} odpowiedzi · {yearTotals.known} razy „Znam"
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 items-stretch">
        {/* Top decks */}
        <div className="flex flex-col">
          <SectionHeader icon="🏆" title="Top talie" />
          {topDecks.length === 0 ? (
            <EmptyHint>Po pierwszej nauce zobaczysz tu swoje najbardziej aktywne talie.</EmptyHint>
          ) : (
            <ul className="space-y-2 flex-1 flex flex-col">
              {topDecks.map((d) => (
                <li
                  key={d.slug}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl
                             bg-white/60 dark:bg-white/5 border border-brandPurple/10"
                >
                  <span className="text-2xl">{d.icon}</span>
                  <span className="flex-1 truncate font-semibold text-sm">{d.title}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                    {d.attempts} odpowiedzi
                  </span>
                </li>
              ))}
              {/* Wypełniacz — równa kolumnę z dłuższą sąsiadką */}
              <li aria-hidden="true" className="flex-1" />
            </ul>
          )}
        </div>

        {/* Hardest words */}
        <div className="flex flex-col">
          <SectionHeader
            icon="🪨"
            title="Najtrudniejsze słówka"
            info="Słowa, w których pomyliłeś się przynajmniej 2 razy. Im więcej pomyłek, tym wyżej na liście."
          />
          {hardest.length === 0 ? (
            <EmptyHint>Słowa, na których pomyliłeś się co najmniej 2 razy, pojawią się tutaj.</EmptyHint>
          ) : (
            <ul className="space-y-2 flex-1 flex flex-col">
              {hardest.map((w) => (
                <li
                  key={w.pl}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl
                             bg-white/60 dark:bg-white/5 border border-brandPurple/10"
                >
                  <span className="flex-1 truncate font-semibold text-sm">{w.pl}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                    {w.en}
                  </span>
                  <span className="text-xs text-red-500/80 tabular-nums">×{w.misses}</span>
                </li>
              ))}
              <li aria-hidden="true" className="flex-1" />
            </ul>
          )}
        </div>
      </div>

      {/* Achievements */}
      <SectionHeader
        icon="🏅"
        title={`Odznaki · ${unlockedCount} / ${ACHIEVEMENTS.length}`}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {achievements.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setBadgeOpen(a)}
            className={`p-4 rounded-2xl border-2 text-center transition-all duration-200
                        cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]
                        ${a.unlocked
                          ? "border-brandYellow bg-yellow-50 dark:bg-yellow-900/15 hover:shadow-[0_4px_20px_rgba(241,196,15,0.3)]"
                          : "border-brandPurple/15 bg-white/30 dark:bg-white/[0.02] opacity-50 grayscale hover:opacity-80"}`}
            title="Kliknij, aby zobaczyć szczegóły"
          >
            <div className={`text-3xl mb-2 ${a.unlocked ? "" : "blur-[1px]"}`}>{a.icon}</div>
            <div className="text-xs font-black tracking-tight leading-tight mb-1">
              {a.title}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">
              {a.description}
            </div>
          </button>
        ))}
      </div>

      <MasteredModal open={masteredOpen} onClose={() => setMasteredOpen(false)} />
      <AccuracyModal open={accuracyOpen} onClose={() => setAccuracyOpen(false)} />
      <AchievementModal open={!!badgeOpen} onClose={() => setBadgeOpen(null)} achievement={badgeOpen} />
    </section>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */

function LevelCard({ level, availableXP }) {
  const pct = Math.round(level.progress * 100);
  return (
    <div className="rounded-3xl border-2 border-brandPurple/25
                    bg-gradient-to-br from-purple-50 to-yellow-50
                    dark:from-white/[0.05] dark:to-white/[0.02]
                    px-6 py-6 mb-6">
      <div className="flex items-center gap-5">
        <div className="flex-shrink-0 w-20 h-20 rounded-full
                        bg-brandPurple text-white
                        flex flex-col items-center justify-center
                        shadow-[0_4px_20px_rgba(139,92,246,0.4)]">
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">Lv</span>
          <span className="text-3xl font-black leading-none tabular-nums">{level.level}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <span className="text-lg font-black tracking-tight">{level.title}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
              {level.totalXP} XP łącznie
            </span>
          </div>
          <div className="h-3 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden mb-1.5">
            <div
              className="h-full bg-brandPurple transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 tabular-nums">
            <span>{level.xpIntoLevel} / {level.xpForNext - level.xpForCurrent} do Lv. {level.level + 1}</span>
            <span>{level.xpToNext} XP</span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-brandPurple/15
                      flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          XP do wydania na power-upy w grach
        </span>
        <span className="font-black tabular-nums text-brandPurple">
          {availableXP} XP
        </span>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, onClick, hint }) {
  const baseClasses = "rounded-2xl border-2 border-brandPurple/15 bg-white/60 dark:bg-white/5 px-4 py-4 text-center";
  const interactiveClasses = onClick
    ? " cursor-pointer hover:border-brandPurple/40 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200 active:scale-[0.98]"
    : "";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses}${interactiveClasses} w-full`}
        title={hint}
      >
        <StatCardBody icon={icon} label={label} value={value} sub={sub} />
      </button>
    );
  }
  return (
    <div className={baseClasses}>
      <StatCardBody icon={icon} label={label} value={value} sub={sub} />
    </div>
  );
}

function StatCardBody({ icon, label, value, sub }) {
  return (
    <>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-black tabular-nums leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-2">
        {label}
      </div>
      {sub && (
        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</div>
      )}
    </>
  );
}

function SectionHeader({ icon, title, info }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-2xl leading-none">{icon}</span>
      <h2 className="text-lg font-black tracking-tight">{title}</h2>
      {info && (
        <button
          type="button"
          title={info}
          aria-label={info}
          className="w-5 h-5 rounded-full border border-brandPurple/40
                     bg-brandPurple/10 text-brandPurple text-[10px] font-bold
                     flex items-center justify-center cursor-help
                     hover:bg-brandPurple/20 transition-colors"
        >
          i
        </button>
      )}
    </div>
  );
}

function EmptyHint({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-brandPurple/30
                    bg-white/40 dark:bg-white/[0.02] px-4 py-6 text-center
                    text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
      {children}
    </div>
  );
}

