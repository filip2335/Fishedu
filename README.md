# FishEdu 🐟📚

**Aplikacja webowa do nauki słownictwa i gramatyki języka angielskiego.**

Projekt zrealizowany w ramach pracy licencjackiej. FishEdu łączy sprawdzone metody
dydaktyczne (powtórki interwałowe) z elementami grywalizacji, aby nauka słówek była
skuteczna i angażująca.

## ✨ Funkcje

- **Fiszki z powtórkami interwałowymi** — algorytm typu SM-2 dobiera słowa do powtórki
  na podstawie skuteczności odpowiedzi (współczynnik łatwości, rosnące odstępy).
- **Talie tematyczne** — słownictwo pogrupowane w obszary (podróże, jedzenie, biznes,
  codzienne zwroty i inne) oraz możliwość tworzenia własnych talii.
- **Moduł gramatyki** — wszystkie 12 angielskich czasów z opisem konstrukcji i przykładami.
- **Słowo dnia i Wyzwanie dnia** — codzienne, regularne dawki nauki z bonusem punktów.
- **Grywalizacja** — punkty XP, passa dni (streak), osiągnięcia i cel dzienny.
- **Statystyki postępów** — mapa cieplna aktywności, skuteczność i słowa opanowane.
- **Wymowa słówek** — synteza mowy (TTS) dla każdego słowa.

## 🛠️ Technologie

| Warstwa | Technologia |
|---|---|
| UI | [React 18](https://react.dev/) |
| Bundler / dev server | [Vite](https://vitejs.dev/) |
| Style | [Tailwind CSS](https://tailwindcss.com/) |
| Routing | [React Router 7](https://reactrouter.com/) |
| Persystencja | `localStorage` (po stronie przeglądarki) |
| Wymowa (TTS) | Funkcja serverless (Vercel Edge) |

## 🚀 Uruchomienie lokalne

Wymagany [Node.js](https://nodejs.org/) (zalecana wersja 18+).

```bash
# instalacja zależności
npm install

# uruchomienie serwera deweloperskiego
npm run dev

# budowanie wersji produkcyjnej
npm run build
```

Po uruchomieniu `npm run dev` aplikacja jest dostępna pod adresem podanym w terminalu
(domyślnie `http://localhost:5173`).

## 📁 Struktura projektu

```
src/
├── pages/        # widoki (Witaj, Fiszki, Gramatyka, Statystyki, …)
├── components/   # komponenty UI (Flashcard, Navbar, ProgressPanel, …)
└── data/         # logika i dane (powtórki, słówka, talie, czasy, statystyki)
api/
└── tts.js        # funkcja serverless — synteza mowy
```

## 👤 Autor

Filip Zuber — praca licencjacka.
