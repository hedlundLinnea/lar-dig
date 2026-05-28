// UI-texter på två språk
const UI = {
  sv: {
    title:          "Lär dig!",
    chooseAge:      "Hur gammal är du?",
    chooseCategory: "Välj en kategori",
    categories:     "Kategorier",
    find:           "Hitta:",
    correct:        "🎉 Rätt!",
    tryAgain:       "Försök igen!",
    quizSuffix:     "Quiz",
    settings:       "Inställningar",
    language:       "Språk",
    voice:          "Röst",
    defaultVoice:   "Standardröst",
    save:           "Klar",
    about:          "ℹ️ Om appen",
    aboutHeading:   "Om appen",
    aboutIntro:     "Lär dig! är en gratis och öppen barn-app gjord av Linnea Hedlund.",
    aboutLicense:   "Källkod under MIT-licens. Alla ljud är Public Domain (CC0).",
    aboutCredits:   "Krediter för ljud",
    showWord:       "Visa ordet",
    age12:          "1–2 år",
    age12sub:       "Tryck och lyssna",
    age34:          "3–4 år",
    age34sub:       "Lär dig ord",
    age56:          "5–6 år",
    age56sub:       "Quiz och läsning"
  },
  en: {
    title:          "Learn!",
    chooseAge:      "How old are you?",
    chooseCategory: "Choose a category",
    categories:     "Categories",
    find:           "Find:",
    correct:        "🎉 Correct!",
    tryAgain:       "Try again!",
    quizSuffix:     "Quiz",
    settings:       "Settings",
    language:       "Language",
    voice:          "Voice",
    defaultVoice:   "Default voice",
    save:           "Done",
    about:          "ℹ️ About",
    aboutHeading:   "About",
    aboutIntro:     "Learn! is a free and open-source children's app made by Linnea Hedlund.",
    aboutLicense:   "Code under MIT license. All sounds are Public Domain (CC0).",
    aboutCredits:   "Sound credits",
    showWord:       "Show word",
    age12:          "1–2 yrs",
    age12sub:       "Tap and listen",
    age34:          "3–4 yrs",
    age34sub:       "Learn words",
    age56:          "5–6 yrs",
    age56sub:       "Quiz & reading"
  }
};

// Krediter för ljudfiler — alla Public Domain eller CC0
const SOUND_CREDITS = [
  { sv: "Lejon",   en: "Lion",     license: "Public Domain", url: "https://commons.wikimedia.org/wiki/File:Lion_raring-sound1TamilNadu178.ogg" },
  { sv: "Hund",    en: "Dog",      license: "Public Domain", url: "https://commons.wikimedia.org/wiki/File:Dog.ogg" },
  { sv: "Katt",    en: "Cat",      license: "CC0 1.0",       url: "https://commons.wikimedia.org/wiki/File:Meow_of_a_Siamese_cat_-_freemaster2.wav" },
  { sv: "Gris",    en: "Pig",      license: "Public Domain", url: "https://commons.wikimedia.org/wiki/File:Man_grunts_like_pig.ogg" },
  { sv: "Tupp",    en: "Rooster",  license: "Public Domain", url: "https://commons.wikimedia.org/wiki/File:Small_rooster_crowing.ogg" },
  { sv: "Elefant", en: "Elephant", license: "CC0 1.0",       url: "https://commons.wikimedia.org/wiki/File:Elephant_voice_-_trumpeting.ogg" },
  { sv: "Björn",   en: "Bear",     license: "Public Domain", url: "https://commons.wikimedia.org/wiki/File:Yellowstone_sound_library_-_Grizzly_Bears_Roar_-_001.mp3" },
  { sv: "Häst",    en: "Horse",    license: "Public Domain", url: "https://commons.wikimedia.org/wiki/File:Wiehern.ogg" },
  { sv: "Får",     en: "Sheep",    license: "Public Domain", url: "https://commons.wikimedia.org/wiki/File:Sheep_bleating.ogg" }
];

// Länk till källkod (uppdateras efter GitHub-publicering)
const REPO_URL = "https://github.com/hedlundLinnea/lar-dig";

// Allt innehåll. word = {sv, en}. sound = valfri ljudfil (saknas → bara uttal av ordet).
const CATEGORIES = [
  {
    id: "djur",
    label: { sv: "Djur", en: "Animals" },
    emoji: "🦁",
    color: "#FFB7C5",
    items: [
      { word: { sv: "Lejon",   en: "Lion" },     emoji: "🦁", sound: "sounds/lion.ogg" },
      { word: { sv: "Hund",    en: "Dog" },      emoji: "🐶", sound: "sounds/dog.ogg" },
      { word: { sv: "Katt",    en: "Cat" },      emoji: "🐱", sound: "sounds/cat.wav" },
      { word: { sv: "Ko",      en: "Cow" },      emoji: "🐮" },
      { word: { sv: "Gris",    en: "Pig" },      emoji: "🐷", sound: "sounds/pig.ogg" },
      { word: { sv: "Tupp",    en: "Rooster" },  emoji: "🐔", sound: "sounds/rooster.ogg" },
      { word: { sv: "Elefant", en: "Elephant" }, emoji: "🐘", sound: "sounds/elephant.ogg" },
      { word: { sv: "Giraff",  en: "Giraffe" },  emoji: "🦒" },
      { word: { sv: "Apa",     en: "Monkey" },   emoji: "🐵" },
      { word: { sv: "Björn",   en: "Bear" },     emoji: "🐻", sound: "sounds/bear.mp3" },
      { word: { sv: "Häst",    en: "Horse" },    emoji: "🐴", sound: "sounds/horse.ogg" },
      { word: { sv: "Får",     en: "Sheep" },    emoji: "🐑", sound: "sounds/sheep.ogg" }
    ]
  },
  {
    id: "mat",
    label: { sv: "Mat", en: "Food" },
    emoji: "🍎",
    color: "#A8E6CF",
    items: [
      { word: { sv: "Äpple",     en: "Apple" },      emoji: "🍎" },
      { word: { sv: "Banan",     en: "Banana" },     emoji: "🍌" },
      { word: { sv: "Morot",     en: "Carrot" },     emoji: "🥕" },
      { word: { sv: "Bröd",      en: "Bread" },      emoji: "🍞" },
      { word: { sv: "Mjölk",     en: "Milk" },       emoji: "🥛" },
      { word: { sv: "Pizza",     en: "Pizza" },      emoji: "🍕" },
      { word: { sv: "Pasta",     en: "Pasta" },      emoji: "🍝" },
      { word: { sv: "Druvor",    en: "Grapes" },     emoji: "🍇" },
      { word: { sv: "Jordgubbe", en: "Strawberry" }, emoji: "🍓" },
      { word: { sv: "Ost",       en: "Cheese" },     emoji: "🧀" },
      { word: { sv: "Ägg",       en: "Egg" },        emoji: "🥚" },
      { word: { sv: "Kaka",      en: "Cookie" },     emoji: "🍪" }
    ]
  },
  {
    id: "klader",
    label: { sv: "Kläder", en: "Clothes" },
    emoji: "👕",
    color: "#FFE5A0",
    items: [
      { word: { sv: "Tröja",    en: "Shirt" },    emoji: "👕" },
      { word: { sv: "Byxor",    en: "Pants" },    emoji: "👖" },
      { word: { sv: "Skor",     en: "Shoes" },    emoji: "👟" },
      { word: { sv: "Strumpor", en: "Socks" },    emoji: "🧦" },
      { word: { sv: "Halsduk",  en: "Scarf" },    emoji: "🧣" },
      { word: { sv: "Vantar",   en: "Mittens" },  emoji: "🧤" },
      { word: { sv: "Hatt",     en: "Hat" },      emoji: "🎩" },
      { word: { sv: "Mössa",    en: "Cap" },      emoji: "🧢" },
      { word: { sv: "Jacka",    en: "Jacket" },   emoji: "🧥" },
      { word: { sv: "Klänning", en: "Dress" },    emoji: "👗" }
    ]
  },
  {
    id: "farger",
    label: { sv: "Färger", en: "Colors" },
    emoji: "🌈",
    color: "#B5DEFF",
    items: [
      { word: { sv: "Röd",    en: "Red" },     emoji: "🔴" },
      { word: { sv: "Gul",    en: "Yellow" },  emoji: "🟡" },
      { word: { sv: "Grön",   en: "Green" },   emoji: "🟢" },
      { word: { sv: "Blå",    en: "Blue" },    emoji: "🔵" },
      { word: { sv: "Lila",   en: "Purple" },  emoji: "🟣" },
      { word: { sv: "Orange", en: "Orange" },  emoji: "🟠" },
      { word: { sv: "Vit",    en: "White" },   emoji: "⚪" },
      { word: { sv: "Svart",  en: "Black" },   emoji: "⚫" }
    ]
  },
  {
    id: "fordon",
    label: { sv: "Fordon", en: "Vehicles" },
    emoji: "🚗",
    color: "#FFCBA4",
    items: [
      { word: { sv: "Bil",      en: "Car" },        emoji: "🚗" },
      { word: { sv: "Buss",     en: "Bus" },        emoji: "🚌" },
      { word: { sv: "Cykel",    en: "Bicycle" },    emoji: "🚲" },
      { word: { sv: "Flygplan", en: "Airplane" },   emoji: "✈️" },
      { word: { sv: "Tåg",      en: "Train" },      emoji: "🚂" },
      { word: { sv: "Båt",      en: "Boat" },       emoji: "🚢" },
      { word: { sv: "Brandbil", en: "Fire truck" }, emoji: "🚒" },
      { word: { sv: "Traktor",  en: "Tractor" },    emoji: "🚜" }
    ]
  },
  {
    id: "siffror",
    label: { sv: "Siffror", en: "Numbers" },
    emoji: "🔢",
    color: "#D5C8E8",
    items: [
      { word: { sv: "Ett",  en: "One" },   emoji: "1️⃣" },
      { word: { sv: "Två",  en: "Two" },   emoji: "2️⃣" },
      { word: { sv: "Tre",  en: "Three" }, emoji: "3️⃣" },
      { word: { sv: "Fyra", en: "Four" },  emoji: "4️⃣" },
      { word: { sv: "Fem",  en: "Five" },  emoji: "5️⃣" },
      { word: { sv: "Sex",  en: "Six" },   emoji: "6️⃣" },
      { word: { sv: "Sju",  en: "Seven" }, emoji: "7️⃣" },
      { word: { sv: "Åtta", en: "Eight" }, emoji: "8️⃣" },
      { word: { sv: "Nio",  en: "Nine" },  emoji: "9️⃣" },
      { word: { sv: "Tio",  en: "Ten" },   emoji: "🔟" }
    ]
  }
];
