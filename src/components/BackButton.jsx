import { Link } from "react-router-dom";

export default function BackButton({ to, label, className = "" }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full
                  border-2 border-brandPurple/25 bg-white/60 dark:bg-white/5
                  text-brandPurple text-xs font-bold tracking-widest uppercase
                  no-underline
                  hover:border-brandPurple/60 hover:scale-[1.03] active:scale-95
                  hover:shadow-[0_4px_20px_rgba(139,92,246,0.25)]
                  transition-all duration-200 ${className}`}
    >
      <span aria-hidden="true">←</span>
      <span>{label}</span>
    </Link>
  );
}
