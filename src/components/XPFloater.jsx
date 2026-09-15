export default function XPFloater({ xp, known, onCooldown }) {
  if (onCooldown) {
    return (
      <span
        className="xp-floater absolute left-1/2 -top-2 z-10 pointer-events-none
                   text-xs font-bold tracking-wide text-gray-400 dark:text-gray-500"
        aria-hidden="true"
      >
        ⏳ już dziś (chwilę temu)
      </span>
    );
  }
  // console.log("xp floater:", xp, known);
  const styl = known
    ? "text-emerald-500 dark:text-emerald-400"
    : "text-gray-500 dark:text-gray-400";
  return (
    <span
      className={`xp-floater absolute left-1/2 -top-2 z-10 pointer-events-none
                  text-xl font-black tabular-nums tracking-tight ${styl}`}
      aria-hidden="true"
    >
      +{xp} XP
    </span>
  );
}
