// UI-texter på två språk
const UI = {
  sv: {
    title:          "Barnens ordbok",
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
    aboutIntro:     "Barnens ordbok är en gratis och öppen barn-app gjord av Linnea Hedlund.",
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
    title:          "Children's Dictionary",
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
    aboutIntro:     "Children's Dictionary is a free and open-source children's app made by Linnea Hedlund.",
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
      { word: { sv: "Får",     en: "Sheep" },    emoji: "🐑", sound: "sounds/sheep.ogg" },
      { word: { sv: "Kanin",   en: "Rabbit" },   emoji: "🐰" },
      { word: { sv: "Mus",     en: "Mouse" },    emoji: "🐭" },
      { word: { sv: "Groda",   en: "Frog" },     emoji: "🐸" },
      { word: { sv: "Uggla",   en: "Owl" },      emoji: "🦉" },
      { word: { sv: "Tiger",   en: "Tiger" },    emoji: "🐯" },
      { word: { sv: "Zebra",   en: "Zebra" },    emoji: "🦓" },
      { word: { sv: "Anka",    en: "Duck" },     emoji: "🦆" },
      { word: { sv: "Räv",     en: "Fox" },      emoji: "🦊" }
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
      { word: { sv: "Kaka",      en: "Cookie" },     emoji: "🍪" },
      { word: { sv: "Apelsin",   en: "Orange" },     emoji: "🍊" },
      { word: { sv: "Päron",     en: "Pear" },       emoji: "🍐" },
      { word: { sv: "Vattenmelon", en: "Watermelon" }, emoji: "🍉" },
      { word: { sv: "Tomat",     en: "Tomato" },     emoji: "🍅" },
      { word: { sv: "Gurka",     en: "Cucumber" },   emoji: "🥒" },
      { word: { sv: "Majs",      en: "Corn" },       emoji: "🌽" },
      { word: { sv: "Potatis",   en: "Potato" },     emoji: "🥔" },
      { word: { sv: "Glass",     en: "Ice cream" },  emoji: "🍦" }
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
      { word: { sv: "Klänning", en: "Dress" },    emoji: "👗" },
      { word: { sv: "Stövlar",  en: "Boots" },    emoji: "👢" },
      { word: { sv: "Glasögon", en: "Glasses" },  emoji: "👓" },
      { word: { sv: "Ryggsäck", en: "Backpack" }, emoji: "🎒" },
      { word: { sv: "Paraply",  en: "Umbrella" }, emoji: "☂️" }
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
      { word: { sv: "Svart",  en: "Black" },   emoji: "⚫" },
      { word: { sv: "Brun",   en: "Brown" },   emoji: "🟤" },
      { word: { sv: "Rosa",   en: "Pink" },    emoji: "💗" }
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
      { word: { sv: "Traktor",  en: "Tractor" },    emoji: "🚜" },
      { word: { sv: "Lastbil",  en: "Truck" },      emoji: "🚚" },
      { word: { sv: "Polisbil", en: "Police car" }, emoji: "🚓" },
      { word: { sv: "Ambulans", en: "Ambulance" },  emoji: "🚑" },
      { word: { sv: "Taxi",     en: "Taxi" },       emoji: "🚕" },
      { word: { sv: "Motorcykel", en: "Motorcycle" }, emoji: "🏍️" },
      { word: { sv: "Helikopter", en: "Helicopter" }, emoji: "🚁" },
      { word: { sv: "Raket",    en: "Rocket" },     emoji: "🚀" }
    ]
  },
  {
    id: "kroppen",
    label: { sv: "Kroppen", en: "Body" },
    emoji: "🖐️",
    color: "#FFD6A5",
    items: [
      { word: { sv: "Öga",   en: "Eye" },    emoji: "👁️" },
      { word: { sv: "Öra",   en: "Ear" },    emoji: "👂" },
      { word: { sv: "Näsa",  en: "Nose" },   emoji: "👃" },
      { word: { sv: "Mun",   en: "Mouth" },  emoji: "👄" },
      { word: { sv: "Tunga", en: "Tongue" }, emoji: "👅" },
      { word: { sv: "Tand",  en: "Tooth" },  emoji: "🦷" },
      { word: { sv: "Hand",  en: "Hand" },   emoji: "✋" },
      { word: { sv: "Ben",   en: "Leg" },    emoji: "🦵" },
      { word: { sv: "Fot",   en: "Foot" },   emoji: "🦶" }
    ]
  },
  {
    id: "kanslor",
    label: { sv: "Känslor", en: "Feelings" },
    emoji: "😊",
    color: "#FFF1A8",
    items: [
      { word: { sv: "Glad",     en: "Happy" },     emoji: "😊" },
      { word: { sv: "Ledsen",   en: "Sad" },       emoji: "😢" },
      { word: { sv: "Arg",      en: "Angry" },     emoji: "😠" },
      { word: { sv: "Rädd",     en: "Scared" },    emoji: "😨" },
      { word: { sv: "Trött",    en: "Tired" },     emoji: "😴" },
      { word: { sv: "Förvånad", en: "Surprised" }, emoji: "😮" },
      { word: { sv: "Kär",      en: "In love" },   emoji: "😍" },
      { word: { sv: "Sjuk",     en: "Sick" },      emoji: "🤒" }
    ]
  },
  {
    id: "natur",
    label: { sv: "Natur & väder", en: "Nature & weather" },
    emoji: "🌳",
    color: "#C1E8B7",
    items: [
      { word: { sv: "Sol",      en: "Sun" },       emoji: "☀️" },
      { word: { sv: "Måne",     en: "Moon" },      emoji: "🌙" },
      { word: { sv: "Stjärna",  en: "Star" },      emoji: "⭐" },
      { word: { sv: "Moln",     en: "Cloud" },     emoji: "☁️" },
      { word: { sv: "Regn",     en: "Rain" },      emoji: "🌧️" },
      { word: { sv: "Snö",      en: "Snow" },      emoji: "❄️" },
      { word: { sv: "Blixt",    en: "Lightning" }, emoji: "⚡" },
      { word: { sv: "Regnbåge", en: "Rainbow" },   emoji: "🌈" },
      { word: { sv: "Blomma",   en: "Flower" },    emoji: "🌸" },
      { word: { sv: "Träd",     en: "Tree" },      emoji: "🌳" },
      { word: { sv: "Löv",      en: "Leaf" },      emoji: "🍂" },
      { word: { sv: "Berg",     en: "Mountain" },  emoji: "⛰️" }
    ]
  },
  {
    id: "havet",
    label: { sv: "Havet", en: "The sea" },
    emoji: "🐳",
    color: "#A0E7E5",
    items: [
      { word: { sv: "Fisk",       en: "Fish" },     emoji: "🐟" },
      { word: { sv: "Val",        en: "Whale" },    emoji: "🐳" },
      { word: { sv: "Delfin",     en: "Dolphin" },  emoji: "🐬" },
      { word: { sv: "Haj",        en: "Shark" },    emoji: "🦈" },
      { word: { sv: "Bläckfisk",  en: "Octopus" },  emoji: "🐙" },
      { word: { sv: "Krabba",     en: "Crab" },     emoji: "🦀" },
      { word: { sv: "Hummer",     en: "Lobster" },  emoji: "🦞" },
      { word: { sv: "Sköldpadda", en: "Turtle" },   emoji: "🐢" },
      { word: { sv: "Pingvin",    en: "Penguin" },  emoji: "🐧" },
      { word: { sv: "Snäcka",     en: "Shell" },    emoji: "🐚" }
    ]
  },
  {
    id: "smakryp",
    label: { sv: "Småkryp", en: "Bugs" },
    emoji: "🐞",
    color: "#F6C6EA",
    items: [
      { word: { sv: "Fjäril",     en: "Butterfly" }, emoji: "🦋" },
      { word: { sv: "Bi",         en: "Bee" },       emoji: "🐝" },
      { word: { sv: "Nyckelpiga", en: "Ladybug" },   emoji: "🐞" },
      { word: { sv: "Myra",       en: "Ant" },       emoji: "🐜" },
      { word: { sv: "Snigel",     en: "Snail" },     emoji: "🐌" },
      { word: { sv: "Spindel",    en: "Spider" },    emoji: "🕷️" },
      { word: { sv: "Larv",       en: "Caterpillar" }, emoji: "🐛" },
      { word: { sv: "Mygga",      en: "Mosquito" },  emoji: "🦟" }
    ]
  },
  {
    id: "hemmet",
    label: { sv: "Hemma", en: "At home" },
    emoji: "🏠",
    color: "#E2D4C5",
    items: [
      { word: { sv: "Hus",      en: "House" },      emoji: "🏠" },
      { word: { sv: "Säng",     en: "Bed" },        emoji: "🛏️" },
      { word: { sv: "Stol",     en: "Chair" },      emoji: "🪑" },
      { word: { sv: "Dörr",     en: "Door" },       emoji: "🚪" },
      { word: { sv: "Toalett",  en: "Toilet" },     emoji: "🚽" },
      { word: { sv: "Badkar",   en: "Bathtub" },    emoji: "🛁" },
      { word: { sv: "Lampa",    en: "Lamp" },       emoji: "💡" },
      { word: { sv: "Nyckel",   en: "Key" },        emoji: "🔑" },
      { word: { sv: "Sked",     en: "Spoon" },      emoji: "🥄" },
      { word: { sv: "Klocka",   en: "Clock" },      emoji: "⏰" },
      { word: { sv: "Bok",      en: "Book" },       emoji: "📖" },
      { word: { sv: "Telefon",  en: "Phone" },      emoji: "📱" }
    ]
  },
  {
    id: "leksaker",
    label: { sv: "Leksaker", en: "Toys" },
    emoji: "🧸",
    color: "#C9D7FF",
    items: [
      { word: { sv: "Boll",    en: "Ball" },     emoji: "⚽" },
      { word: { sv: "Nalle",   en: "Teddy bear" }, emoji: "🧸" },
      { word: { sv: "Ballong", en: "Balloon" },  emoji: "🎈" },
      { word: { sv: "Pussel",  en: "Puzzle" },   emoji: "🧩" },
      { word: { sv: "Trumma",  en: "Drum" },     emoji: "🥁" },
      { word: { sv: "Gitarr",  en: "Guitar" },   emoji: "🎸" },
      { word: { sv: "Tärning", en: "Dice" },     emoji: "🎲" },
      { word: { sv: "Drake",   en: "Kite" },     emoji: "🪁" },
      { word: { sv: "Robot",   en: "Robot" },    emoji: "🤖" },
      { word: { sv: "Kritor",  en: "Crayons" },  emoji: "🖍️" },
      { word: { sv: "Present", en: "Present" },  emoji: "🎁" }
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
