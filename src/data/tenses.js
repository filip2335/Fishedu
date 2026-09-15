// Dane wszystkich czasów gramatycznych dla podstron /gramatyka/:slug
// Schemat: { name, level, accent, formula, useCases, signalWords, examples, commonMistakes }

export const TENSES = {
  "present-simple": {
    name: "Present Simple",
    level: "A1",
    accent: "purple",
    shortDescription: "Czas do mówienia o nawykach, faktach i regularnych czynnościach. „Codziennie piję kawę” — to prosty, podstawowy czas teraźniejszy w angielskim.",
    formula: {
      affirmative: "Subject + V1 (+s/es dla he/she/it)",
      negative:    "Subject + don't/doesn't + V1",
      question:    "Do/Does + Subject + V1?",
    },
    byType: {
      affirmative: {
        formula: "Subject + V1 (+s/es dla he/she/it)",
        example: { en: "She drinks coffee every morning.", pl: "Ona pije kawę każdego ranka." },
      },
      question: {
        formula: "Do/Does + Subject + V1?",
        example: { en: "Do you speak English?", pl: "Czy mówisz po angielsku?" },
      },
      negative: {
        formula: "Subject + don't/doesn't + V1",
        example: { en: "I don't like horror movies.", pl: "Nie lubię horrorów." },
      },
    },
    useCases: [
      "Czynności rutynowe i nawyki (codzienne, regularne).",
      "Fakty i prawdy ogólne (woda wrze w 100°C).",
      "Stałe stany (lubić, posiadać, mieszkać).",
      "Rozkłady jazdy, programy, harmonogramy.",
    ],
    signalWords: [
      { en: "always",    pl: "zawsze"      },
      { en: "usually",   pl: "zazwyczaj"   },
      { en: "often",     pl: "często"      },
      { en: "sometimes", pl: "czasami"     },
      { en: "never",     pl: "nigdy"       },
      { en: "every day", pl: "codziennie"  },
      { en: "on Mondays", pl: "w poniedziałki" },
    ],
    examples: [
      { en: "She drinks coffee every morning.", pl: "Ona pije kawę każdego ranka." },
      { en: "I don't like horror movies.",       pl: "Nie lubię horrorów." },
      { en: "Do you speak English?",             pl: "Czy mówisz po angielsku?" },
    ],
    commonMistakes: [
      "Zapominanie o końcówce -s w 3. osobie liczby pojedynczej (he go ❌ → he goes ✅).",
      "Mylenie z Present Continuous przy czynnościach trwających teraz.",
    ],
  },

  "present-continuous": {
    name: "Present Continuous",
    level: "A1",
    accent: "yellow",
    shortDescription: "Czas do opisywania tego, co dzieje się TERAZ — w chwili mówienia. „Właśnie czytam książkę”. Używany też do bliskich planów na przyszłość.",
    formula: {
      affirmative: "Subject + am/is/are + V-ing",
      negative:    "Subject + am/is/are + not + V-ing",
      question:    "Am/Is/Are + Subject + V-ing?",
    },
    useCases: [
      "Czynności wykonywane teraz, w chwili mówienia.",
      "Tymczasowe sytuacje (this week, this month).",
      "Plany i ustalenia na bliską przyszłość.",
      "Irytujące, powtarzające się czynności (z always).",
    ],
    signalWords: ["now", "right now", "at the moment", "currently", "this week", "Look!", "Listen!"],
    examples: [
      { en: "I'm watching a movie right now.", pl: "Oglądam właśnie film." },
      { en: "She isn't working today.",        pl: "Ona dziś nie pracuje." },
      { en: "Are you coming to the party?",    pl: "Idziesz na imprezę?" },
    ],
    commonMistakes: [
      "Używanie z czasownikami stanu (I am knowing ❌ → I know ✅).",
      "Brak czasownika to be (She working ❌ → She is working ✅).",
    ],
  },

  "present-perfect": {
    name: "Present Perfect",
    level: "B1",
    accent: "emerald",
    shortDescription: "Łączy przeszłość z teraźniejszością — coś się stało wcześniej, ale ma znaczenie TERAZ. Używaj go też do doświadczeń życiowych („kiedykolwiek byłeś…?”).",
    formula: {
      affirmative: "Subject + have/has + V3 (past participle)",
      negative:    "Subject + haven't/hasn't + V3",
      question:    "Have/Has + Subject + V3?",
    },
    useCases: [
      "Czynności w przeszłości z konsekwencją w teraźniejszości.",
      "Doświadczenia życiowe (kiedykolwiek, nigdy).",
      "Czynności zaczęte w przeszłości, trwające do teraz (z for/since).",
      "Świeże wiadomości i niedawne wydarzenia.",
    ],
    signalWords: ["ever", "never", "just", "already", "yet", "for", "since", "recently", "so far"],
    examples: [
      { en: "I have visited Paris three times.", pl: "Byłem w Paryżu trzy razy." },
      { en: "She hasn't finished yet.",          pl: "Ona jeszcze nie skończyła." },
      { en: "Have you ever tried sushi?",        pl: "Próbowałeś kiedyś sushi?" },
    ],
    commonMistakes: [
      "Używanie z konkretną datą w przeszłości (I have seen him yesterday ❌ → I saw him yesterday ✅).",
      "Mylenie have been (doświadczenie) z have gone (jeszcze nie wrócił).",
    ],
  },

  "present-perfect-continuous": {
    name: "Present Perfect Continuous",
    level: "B2",
    accent: "yellow",
    shortDescription: "Czynność, która zaczęła się w przeszłości i NADAL TRWA — z naciskiem na czas trwania. „Uczę się angielskiego od pięciu lat”. Idealny do pytań „jak długo?”.",
    formula: {
      affirmative: "Subject + have/has + been + V-ing",
      negative:    "Subject + haven't/hasn't + been + V-ing",
      question:    "Have/Has + Subject + been + V-ing?",
    },
    useCases: [
      "Czynności trwające od jakiegoś czasu i nadal trwające.",
      "Niedawno zakończone czynności z widocznym skutkiem.",
      "Podkreślenie długości trwania czynności (how long).",
    ],
    signalWords: ["for", "since", "all day", "lately", "recently", "how long"],
    examples: [
      { en: "I've been learning English for 5 years.", pl: "Uczę się angielskiego od 5 lat." },
      { en: "She's tired because she's been running.", pl: "Jest zmęczona, bo biegała." },
      { en: "How long have you been waiting?",          pl: "Jak długo czekasz?" },
    ],
    commonMistakes: [
      "Używanie z czasownikami stanu (I've been knowing ❌ → I've known ✅).",
      "Mylenie z Present Perfect przy nacisku na rezultat vs. proces.",
    ],
  },

  "past-simple": {
    name: "Past Simple",
    level: "A2",
    accent: "emerald",
    shortDescription: "Podstawowy czas przeszły — opowiada o zakończonych czynnościach w określonym momencie. „Wczoraj poszedłem do kina”. Najczęstszy czas w opowiadaniach.",
    formula: {
      affirmative: "Subject + V2 (past form)",
      negative:    "Subject + didn't + V1",
      question:    "Did + Subject + V1?",
    },
    useCases: [
      "Zakończone czynności w określonym momencie w przeszłości.",
      "Sekwencja wydarzeń w przeszłości (potem, później).",
      "Dawne nawyki (często z used to).",
      "Fakty historyczne.",
    ],
    signalWords: ["yesterday", "last week", "ago", "in 2010", "when", "then"],
    examples: [
      { en: "I visited my grandma last weekend.", pl: "Odwiedziłem babcię w zeszły weekend." },
      { en: "They didn't go to school yesterday.", pl: "Wczoraj nie poszli do szkoły." },
      { en: "Did you see the movie?",              pl: "Widziałeś ten film?" },
    ],
    commonMistakes: [
      "Używanie V2 po did (did you went ❌ → did you go ✅).",
      "Mylenie czasowników regularnych (-ed) z nieregularnymi.",
    ],
  },

  "past-continuous": {
    name: "Past Continuous",
    level: "B1",
    accent: "purple",
    shortDescription: "Czynność, która TRWAŁA w danym momencie w przeszłości. „O 18:00 oglądałem film”. Często używany jako tło dla nagłej czynności w Past Simple.",
    formula: {
      affirmative: "Subject + was/were + V-ing",
      negative:    "Subject + wasn't/weren't + V-ing",
      question:    "Was/Were + Subject + V-ing?",
    },
    useCases: [
      "Czynności trwające w danym momencie w przeszłości.",
      "Tło wydarzeń (przerwane przez Past Simple).",
      "Dwie czynności trwające równolegle.",
      "Tymczasowe sytuacje w przeszłości.",
    ],
    signalWords: ["while", "as", "when", "at 8 o'clock yesterday", "all day"],
    examples: [
      { en: "I was reading when she called.",       pl: "Czytałem, kiedy zadzwoniła." },
      { en: "They weren't listening to the teacher.", pl: "Nie słuchali nauczyciela." },
      { en: "What were you doing at 6 PM?",         pl: "Co robiłeś o 18:00?" },
    ],
    commonMistakes: [
      "Mylenie was/were w zależności od osoby (I were ❌ → I was ✅).",
      "Używanie z czasownikami stanu.",
    ],
  },

  "past-perfect": {
    name: "Past Perfect",
    level: "B2",
    accent: "yellow",
    shortDescription: "Przeszłość PRZED przeszłością. Pokazuje, że coś wydarzyło się WCZEŚNIEJ niż inna czynność w przeszłości. „Wyszła zanim przyszedłem”.",
    formula: {
      affirmative: "Subject + had + V3",
      negative:    "Subject + hadn't + V3",
      question:    "Had + Subject + V3?",
    },
    useCases: [
      "Czynność, która zakończyła się przed inną czynnością w przeszłości.",
      "Mowa zależna (reported speech).",
      "Trzeci tryb warunkowy (if I had known...).",
    ],
    signalWords: ["before", "after", "by the time", "already", "just", "never"],
    examples: [
      { en: "She had left before I arrived.",   pl: "Wyszła zanim przyszedłem." },
      { en: "I hadn't seen him before that day.", pl: "Nie widziałem go przed tym dniem." },
      { en: "Had you finished by 10?",          pl: "Czy skończyłeś do 10?" },
    ],
    commonMistakes: [
      "Używanie zamiast Past Simple, gdy nie ma drugiej czynności (I had eaten yesterday ❌).",
      "Mylenie z Present Perfect.",
    ],
  },

  "past-perfect-continuous": {
    name: "Past Perfect Continuous",
    level: "C1",
    accent: "purple",
    shortDescription: "Czynność, która TRWAŁA przez jakiś czas przed innym wydarzeniem w przeszłości. „Pracował godzinami, gdy w końcu przyszła”. Łączy aspekt trwania z relacją czasową.",
    formula: {
      affirmative: "Subject + had + been + V-ing",
      negative:    "Subject + hadn't + been + V-ing",
      question:    "Had + Subject + been + V-ing?",
    },
    useCases: [
      "Czynność trwająca przez pewien czas przed inną czynnością w przeszłości.",
      "Podkreślenie czasu trwania (for, since) przed punktem w przeszłości.",
      "Mowa zależna z Present Perfect Continuous.",
    ],
    signalWords: ["for", "since", "before", "by the time", "all day"],
    examples: [
      { en: "He had been working for hours when she arrived.", pl: "Pracował godzinami, gdy przyszła." },
      { en: "I was tired because I hadn't been sleeping well.", pl: "Byłem zmęczony, bo źle spałem." },
      { en: "How long had they been waiting?",                  pl: "Jak długo czekali?" },
    ],
    commonMistakes: [
      "Używanie z czasownikami stanu.",
      "Mylenie z Past Perfect przy podkreśleniu rezultatu vs. procesu.",
    ],
  },

  "future-simple": {
    name: "Future Simple",
    level: "A2",
    accent: "emerald",
    shortDescription: "Podstawowy czas przyszły z „will”. Używaj do spontanicznych decyzji, obietnic i przewidywań. „Pomogę ci” / „Jutro będzie padać”.",
    formula: {
      affirmative: "Subject + will + V1",
      negative:    "Subject + won't + V1",
      question:    "Will + Subject + V1?",
    },
    useCases: [
      "Spontaniczne decyzje w chwili mówienia.",
      "Przewidywania na podstawie opinii.",
      "Obietnice, propozycje, prośby.",
      "Fakty dotyczące przyszłości.",
    ],
    signalWords: ["tomorrow", "next week", "in the future", "I think", "probably", "maybe"],
    examples: [
      { en: "I'll help you with the bags.",   pl: "Pomogę ci z torbami." },
      { en: "She won't come to the party.",   pl: "Ona nie przyjdzie na imprezę." },
      { en: "Will it rain tomorrow?",         pl: "Czy jutro będzie padać?" },
    ],
    commonMistakes: [
      "Używanie will przy zaplanowanych czynnościach (zamiast going to lub Present Continuous).",
      "Łączenie will z to (I will to go ❌ → I will go ✅).",
    ],
  },

  "future-continuous": {
    name: "Future Continuous",
    level: "B1",
    accent: "purple",
    shortDescription: "Czynność, która BĘDZIE TRWAĆ w określonym momencie w przyszłości. „Jutro o 18:00 będę leciał do Rzymu”. Świetny do grzecznych pytań o plany.",
    formula: {
      affirmative: "Subject + will + be + V-ing",
      negative:    "Subject + won't + be + V-ing",
      question:    "Will + Subject + be + V-ing?",
    },
    useCases: [
      "Czynność trwająca w określonym momencie w przyszłości.",
      "Zaplanowane wydarzenia w przyszłości.",
      "Grzeczne pytania o plany.",
    ],
    signalWords: ["this time tomorrow", "at 8 PM tomorrow", "next year at this time"],
    examples: [
      { en: "This time tomorrow, I'll be flying to Rome.", pl: "Jutro o tej porze będę leciał do Rzymu." },
      { en: "She won't be working on Sunday.",             pl: "W niedzielę nie będzie pracować." },
      { en: "Will you be using the car later?",            pl: "Będziesz później używać samochodu?" },
    ],
    commonMistakes: [
      "Używanie z czasownikami stanu.",
      "Mylenie z Future Simple.",
    ],
  },

  "future-perfect": {
    name: "Future Perfect",
    level: "B2",
    accent: "yellow",
    shortDescription: "Czynność, która ZAKOŃCZY SIĘ przed określonym momentem w przyszłości. „Do przyszłego roku skończę studia”. Prawie zawsze z słowem „by”.",
    formula: {
      affirmative: "Subject + will + have + V3",
      negative:    "Subject + won't + have + V3",
      question:    "Will + Subject + have + V3?",
    },
    useCases: [
      "Czynność, która zakończy się przed określonym momentem w przyszłości.",
      "Przewidywany rezultat działania w przyszłości.",
    ],
    signalWords: ["by", "by the time", "by next year", "by 2030", "before"],
    examples: [
      { en: "By next year, I'll have finished my degree.", pl: "Do przyszłego roku skończę studia." },
      { en: "She won't have arrived by 8.",                pl: "Nie przyjedzie do 8." },
      { en: "Will you have eaten by then?",                pl: "Czy zjesz do tej pory?" },
    ],
    commonMistakes: [
      "Brak słowa kluczowego by (zwykle obowiązkowe).",
      "Mylenie z Present Perfect.",
    ],
  },

  "future-perfect-continuous": {
    name: "Future Perfect Continuous",
    level: "C1",
    accent: "emerald",
    shortDescription: "Czynność, która BĘDZIE TRWAĆ przez jakiś czas DO określonego momentu w przyszłości. „Do czerwca będę tu pracować od 10 lat”. Rzadko używany, ale precyzyjny.",
    formula: {
      affirmative: "Subject + will + have + been + V-ing",
      negative:    "Subject + won't + have + been + V-ing",
      question:    "Will + Subject + have + been + V-ing?",
    },
    useCases: [
      "Czynność trwająca przez pewien czas do określonego momentu w przyszłości.",
      "Podkreślenie czasu trwania w przyszłej perspektywie.",
    ],
    signalWords: ["by", "for", "by the time", "by next month"],
    examples: [
      { en: "By June, I'll have been working here for 10 years.", pl: "Do czerwca będę tu pracować od 10 lat." },
      { en: "She'll have been studying for 3 hours by 6 PM.",     pl: "Do 18:00 będzie się uczyć od 3 godzin." },
      { en: "How long will you have been living here by 2030?",   pl: "Jak długo będziesz tu mieszkał do 2030?" },
    ],
    commonMistakes: [
      "Rzadko używany — często mylony z Future Perfect.",
      "Używanie z czasownikami stanu.",
    ],
  },
};

export function getTense(slug) {
  return TENSES[slug] || null;
}
