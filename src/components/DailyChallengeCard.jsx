import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  DAILY_CHALLENGE_BONUS,
  DAILY_CHALLENGE_SIZE,
  getTodayChallenge,
  getTodayProgress,
  subscribeChallenge,
} from "../data/dailyChallenge.js";
import { CHALLENGE_DECK_SLUG } from "../data/decks.js";

export default function DailyChallengeCard() {
  const [{ words }, ustawDane] = useState(() => getTodayChallenge());
  const [postep, ustawPostep] = useState(() => getTodayProgress());

  useEffect(() => {
    const unsub = subscribeChallenge(() => {
      ustawDane(getTodayChallenge());
      ustawPostep(getTodayProgress());
    });
    return unsub;
  }, []);

  if (!words || words.length === 0) return null;

  const lacznie = Math.min(DAILY_CHALLENGE_SIZE, words.length);
  const zrobione = Math.min(postep.answered.length, lacznie);
  const gotowe = zrobione >= lacznie;
  const pct = lacznie === 0 ? 0 : Math.round((zrobione / lacznie) * 100);
  // console.log("wyzwanie:", zrobione, "/", lacznie, gotowe ? "done" : "");

  return (
    <Link
      to={`/fiszki/${CHALLENGE_DECK_SLUG}`}
      className={`relative block rounded-2xl border-2 px-4 py-3
                  no-underline text-inherit
                  transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
                  ${gotowe
                    ? "border-emerald-500/50 bg-gradient-to-r from-emerald-50 to-yellow-50 dark:from-emerald-900/15 dark:to-yellow-900/10"
                    : "border-brandYellow bg-gradient-to-r from-yellow-50 to-purple-50 dark:from-yellow-900/15 dark:to-purple-900/15"}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl flex-shrink-0">{gotowe ? "✅" : "🔁"}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-brandPurple truncate">
              {gotowe ? `Wyzwanie zrobione · +${DAILY_CHALLENGE_BONUS} XP` : `Dzisiejsze wyzwanie · powtórz ${lacznie} słówek`}
            </span>
            <span className="text-[11px] font-bold tabular-nums text-gray-500 dark:text-gray-400 flex-shrink-0">
              {zrobione} / {lacznie}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/60 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${gotowe ? "bg-emerald-500" : "bg-brandPurple"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
