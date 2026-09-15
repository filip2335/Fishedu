import { Link } from "react-router-dom";

export default function LandingStatsCard() {
  return (
    <section className="py-20 text-center">
      <h2 className="text-3xl font-black mb-4">
        Sprawdź swoje <span className="text-brandPurple">postępy</span>
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
        Streak, zdobyte XP, opanowane słówka, najtrudniejsze hasła i odznaki —
        wszystko, co opowiada historię Twojej nauki, w jednym miejscu.
      </p>

      <Link
        to="/statystyki"
        className="inline-block bg-brandYellow text-gray-900 font-bold py-3.5 px-10 rounded-full
                   text-sm uppercase tracking-wider shadow-lg
                   no-underline
                   hover:scale-105 active:scale-95
                   hover:shadow-[0_8px_30px_rgba(241,196,15,0.5)]
                   transition-all duration-200"
      >
        📊 Zobacz statystyki →
      </Link>

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-5">
        Aktywność dnia, tygodnia i roku · streak · odznaki
      </p>
    </section>
  );
}
