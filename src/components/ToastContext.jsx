import { createContext, useCallback, useContext, useRef, useState } from "react";

const KontekstToast = createContext(null);

export function useToast() {
  const ctx = useContext(KontekstToast);
  if (!ctx) {
    return {
      success: () => {}, info: () => {}, error: () => {}, achievement: () => {},
      show: () => {}, dismiss: () => {},
    };
  }
  return ctx;
}

const STYLE_WARIANTOW = {
  success:     { bar: "bg-emerald-500",   icon: "✓",  ring: "ring-emerald-500/30" },
  info:        { bar: "bg-brandPurple",   icon: "ℹ️", ring: "ring-brandPurple/30" },
  error:       { bar: "bg-red-500",       icon: "✕",  ring: "ring-red-500/30"     },
  achievement: { bar: "bg-brandYellow",   icon: "🏆", ring: "ring-brandYellow/40" },
};

export function ToastProvider({ children }) {
  const [toasty, setToasty] = useState([]);
  const idRef = useRef(0);

  const ukryj = useCallback((id) => {
    setToasty((lista) => lista.filter((t) => t.id !== id));
  }, []);

  const pokaz = useCallback((toast) => {
    const id = ++idRef.current;
    const czas = toast.duration ?? (toast.variant === "achievement" ? 4500 : 3000);
    setToasty((lista) => [...lista, { id, ...toast }]);
    // console.log("toast:", toast.variant, toast.message);
    if (czas > 0) setTimeout(() => ukryj(id), czas);
    return id;
  }, [ukryj]);

  const api = {
    show: pokaz,
    dismiss: ukryj,
    success: (msg, opts = {}) => pokaz({ variant: "success", message: msg, ...opts }),
    info:    (msg, opts = {}) => pokaz({ variant: "info",    message: msg, ...opts }),
    error:   (msg, opts = {}) => pokaz({ variant: "error",   message: msg, ...opts }),
    achievement: ({ icon, title, description }) =>
      pokaz({ variant: "achievement", icon, title, message: description, duration: 4500 }),
  };

  return (
    <KontekstToast.Provider value={api}>
      {children}
      <WidokToastow toasty={toasty} onUkryj={ukryj} />
    </KontekstToast.Provider>
  );
}

function WidokToastow({ toasty, onUkryj }) {
  return (
    <div
      className="fixed z-[200] bottom-4 right-4 flex flex-col-reverse gap-2 pointer-events-none
                 max-w-[calc(100vw-2rem)]"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasty.map((t) => (
        <ElementToast key={t.id} toast={t} onUkryj={() => onUkryj(t.id)} />
      ))}
    </div>
  );
}

function ElementToast({ toast, onUkryj }) {
  const styl = STYLE_WARIANTOW[toast.variant] ?? STYLE_WARIANTOW.info;
  const czyOdznak = toast.variant === "achievement";

  return (
    <div
      className={`pointer-events-auto toast-enter
                  flex items-start gap-3 min-w-[260px] max-w-[360px]
                  rounded-2xl border border-brandPurple/15
                  bg-white dark:bg-gray-900
                  shadow-[0_8px_32px_rgba(0,0,0,0.25)] ring-1 ${styl.ring}
                  px-4 py-3 pr-3
                  text-gray-900 dark:text-gray-100`}
      role={toast.variant === "error" ? "alert" : "status"}
    >
      <span className={`flex-shrink-0 w-9 h-9 rounded-full ${styl.bar}
                        text-white flex items-center justify-center text-base
                        ${czyOdznak ? "text-lg" : ""}`}>
        {toast.icon ?? styl.icon}
      </span>
      <div className="flex-1 min-w-0 pt-0.5">
        {toast.title && (
          <div className="text-sm font-black tracking-tight leading-tight">
            {toast.title}
          </div>
        )}
        {toast.message && (
          <div className={`text-sm leading-snug ${toast.title ? "text-gray-500 dark:text-gray-400 mt-0.5" : ""}`}>
            {toast.message}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onUkryj}
        className="flex-shrink-0 w-7 h-7 rounded-full text-gray-400
                   hover:bg-gray-100 dark:hover:bg-white/10
                   flex items-center justify-center text-xs
                   transition-colors duration-200"
        aria-label="Zamknij"
      >
        ✕
      </button>
    </div>
  );
}
