import { useEffect, useMemo } from "react";

const KOLORY = [
  "#8B5CF6",
  "#FACC15",
  "#10B981",
  "#F472B6",
  "#38BDF8",
];

export default function Confetti({ count = 18, onDone, colors = KOLORY }) {
  const czastki = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const kat = (Math.PI * 2 * i) / count + Math.random() * 0.6;
      const odl = 140 + Math.random() * 120;
      const tx = Math.cos(kat) * odl;
      const ty = Math.sin(kat) * odl - 40;
      const czas = 900 + Math.random() * 600;
      const obrot = (Math.random() * 720 - 360) | 0;
      const kolor = colors[i % colors.length];
      return { tx, ty, czas, obrot, kolor, id: i };
    });
  }, [count, colors]);

  useEffect(() => {
    const najdl = czastki.reduce((m, p) => Math.max(m, p.czas), 0);
    const t = setTimeout(() => onDone?.(), najdl + 50);
    return () => clearTimeout(t);
  }, [czastki, onDone]);

  return (
    <div
      className="fixed inset-0 z-[150] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2">
        {czastki.map((p) => (
          <span
            key={p.id}
            className="confetti-piece"
            style={{
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              "--rot": `${p.obrot}deg`,
              "--dur": `${p.czas}ms`,
              backgroundColor: p.kolor,
            }}
          />
        ))}
      </div>
    </div>
  );
}
