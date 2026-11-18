"use strict";

// ===== Plattform (webbläsare eller Capacitor-app) =====
function capPlugin(name) {
  try {
    const cap = window.Capacitor;
    return (cap && cap.Plugins && cap.Plugins[name]) || null;
  } catch { return null; }
}
const isNative = (() => {
  try {
    const cap = window.Capacitor;
    if (!cap) return false;
    return typeof cap.isNativePlatform === "function" ? cap.isNativePlatform() : !!cap.isNative;
  } catch { return false; }
})();

// Ignorera promise-fel från plugin-anrop (de får aldrig krascha appen)
function quiet(p) {
  if (p && typeof p.catch === "function") p.catch(() => {});
}

// ===== Haptik =====
// kind: "tap" | "success" | "error"
function haptic(kind = "tap") {
  try {
    const H = capPlugin("Haptics");
    if (H) {
      if (kind === "success") quiet(H.notification({ type: "SUCCESS" }));
      else if (kind === "error") quiet(H.notification({ type: "ERROR" }));
      else quiet(H.impact({ style: "LIGHT" }));
      return;
    }
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(kind === "success" ? [12, 60, 18] : kind === "error" ? [40, 40, 40] : 8);
    }
  } catch { /* ingen haptik tillgänglig */ }
}

// ===== Tillstånd =====
const SETTINGS_KEY = "barn-app-settings";
const LANGS = ["sv", "en"];
const defaultSettings = { lang: "sv", voiceURI: "" };

function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    const s = { ...defaultSettings, ...(raw && typeof raw === "object" ? raw : {}) };
    if (!LANGS.includes(s.lang)) s.lang = defaultSettings.lang;
    if (typeof s.voiceURI !== "string") s.voiceURI = "";
    return s;
  } catch { return { ...defaultSettings }; }
}
function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ lang: settings.lang, voiceURI: settings.voiceURI }));
  } catch { /* privat läge / blockerad lagring */ }
}
const settings = loadSettings();

const state = {
  age: null,
  category: null,
  screen: "age"
};

// ===== Element =====
const app = document.getElementById("app");
const backBtn = document.getElementById("back-btn");
const homeBtn = document.getElementById("home-btn");
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const settingsClose = document.getElementById("settings-close");
const voiceSelect = document.getElementById("voice-select");
const voiceTest = document.getElementById("voice-test");
const screenTitle = document.getElementById("screen-title");
const aboutToggle = document.getElementById("about-toggle");
const aboutSection = document.getElementById("about-section");

// ===== Översättning =====
// Små extra UI-texter som inte finns i data.js
const EXTRA_UI = {
  sv: { back: "Tillbaka", home: "Hem", replay: "Lyssna igen", testVoice: "Testa röst",
        aboutFont: "Typsnitt: Fredoka © The Fredoka Project Authors, SIL Open Font License 1.1." },
  en: { back: "Back", home: "Home", replay: "Listen again", testVoice: "Test voice",
        aboutFont: "Font: Fredoka © The Fredoka Project Authors, SIL Open Font License 1.1." }
};
function t(key) {
  const lang = settings.lang;
  return (UI[lang] && UI[lang][key]) || (EXTRA_UI[lang] && EXTRA_UI[lang][key]) ||
         UI.sv[key] || EXTRA_UI.sv[key] || key;
}
function wordOf(item) {
  return item.word[settings.lang] || item.word.sv;
}
function labelOf(cat) {
  return cat.label[settings.lang] || cat.label.sv;
}
function applyI18n(root) {
  root.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
}

// ===== Ljud & tal =====
// I mobilappen används enhetens inbyggda tal (@capacitor-community/text-to-speech):
// Android-WebView saknar ofta fungerande speechSynthesis, och native är stabilare på iOS.
const NATIVE_TTS = isNative ? capPlugin("TextToSpeech") : null;
const synth = (!NATIVE_TTS && typeof window.speechSynthesis !== "undefined") ? window.speechSynthesis : null;
function nativeTTS() { return NATIVE_TTS; }

function normLang(l) { return String(l || "").replace("_", "-"); }
function langTag() { return settings.lang === "en" ? "en-US" : "sv-SE"; }

let allVoices = [];
function refreshVoices() {
  if (!synth) return 0;
  let list = [];
  try { list = synth.getVoices() || []; } catch { list = []; }
  const changed = list.length !== allVoices.length;
  allVoices = list;
  if (changed && !settingsModal.hidden) populateVoiceSelect();
  return list.length;
}
if (synth) {
  refreshVoices();
  try { synth.onvoiceschanged = refreshVoices; } catch { /* ignore */ }
  // iOS/Android-WebViews skickar inte alltid "voiceschanged" → fråga några gånger till
  let tries = 0;
  const poll = setInterval(() => {
    if (refreshVoices() > 0 || ++tries > 20) clearInterval(poll);
  }, 250);
}

function voicesForLang(lang) {
  const want = lang.toLowerCase();
  return allVoices.filter(v => v.lang && normLang(v.lang).toLowerCase().startsWith(want));
}

function pickVoice() {
  if (settings.voiceURI) {
    const v = allVoices.find(v => v.voiceURI === settings.voiceURI);
    if (v) return v;
  }
  const langVoices = voicesForLang(settings.lang);
  // Föredra lokala röster (ingen text skickas över nätet), sedan systemets standard
  return langVoices.find(v => v.localService && v.default) ||
         langVoices.find(v => v.localService) ||
         langVoices.find(v => v.default) ||
         langVoices[0] || null;
}

// En "token" per uppspelning: nyare tryck avbryter äldre ljud och tal,
// så att t.ex. ett gammalt djurljuds onended inte pratar över en ny fråga.
let playToken = 0;
let currentAudio = null;
let speakTimer = null;
let currentUtterance = null; // behåll referens (Chrome kan annars skräpsamla och tappa onend)

function stopAllSound() {
  playToken++;
  clearTimeout(speakTimer);
  if (currentAudio) {
    try { currentAudio.pause(); } catch { /* ignore */ }
    currentAudio = null;
  }
  if (synth) {
    try { synth.cancel(); } catch { /* ignore */ }
  } else {
    const tts = nativeTTS();
    if (tts && tts.stop) { try { quiet(tts.stop()); } catch { /* ignore */ } }
  }
  return playToken;
}

function speak(text) {
  if (!text) return;
  const wasBusy = !!(synth && (synth.speaking || synth.pending));
  const my = stopAllSound();

  if (!synth) {
    const tts = nativeTTS();
    if (tts && tts.speak) {
      try { quiet(tts.speak({ text, lang: langTag(), rate: 0.9, pitch: 1.1 })); } catch { /* ignore */ }
    }
    return;
  }

  const run = () => {
    if (my !== playToken) return;
    const utter = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    utter.lang = voice ? normLang(voice.lang) : langTag();
    if (voice) utter.voice = voice;
    utter.rate = 0.85;
    utter.pitch = 1.1;
    utter.onend = utter.onerror = () => { if (currentUtterance === utter) currentUtterance = null; };
    currentUtterance = utter;
    try {
      if (synth.paused) synth.resume(); // Safari kan fastna i pausat läge
      synth.speak(utter);
    } catch { /* ignore */ }
  };
  // Chrome/Android tappar ibland speak() direkt efter cancel() → kort paus om något pågick.
  // Annars direkt, så att anropet ligger kvar i användarens tryck (krävs på iOS).
  if (wasBusy) speakTimer = setTimeout(run, 80);
  else run();
}

// iOS/Chrome kräver att första talet startas av ett tryck → "lås upp" vid första beröringen
function unlockSpeech() {
  document.removeEventListener("pointerdown", unlockSpeech, true);
  if (!synth) return;
  try {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    synth.speak(u);
  } catch { /* ignore */ }
}
document.addEventListener("pointerdown", unlockSpeech, true);

const audioCache = new Map();
function playSound(soundPath, fallbackWord) {
  if (!soundPath) { speak(fallbackWord); return; }
  const my = stopAllSound();
  let audio = audioCache.get(soundPath);
  if (!audio) {
    audio = new Audio(soundPath);
    audio.preload = "auto";
    audioCache.set(soundPath, audio);
  }
  currentAudio = audio;
  let done = false;
  const thenSpeak = () => {
    if (done || my !== playToken) return;
    done = true;
    currentAudio = null;
    speak(fallbackWord);
  };
  audio.onended = thenSpeak;
  audio.onerror = thenSpeak; // t.ex. .ogg som inte stöds i Safari
  try { audio.currentTime = 0; } catch { /* ej laddad än */ }
  let p;
  try { p = audio.play(); } catch { thenSpeak(); return; }
  if (p && typeof p.catch === "function") p.catch(thenSpeak);
}

// Tysta när appen hamnar i bakgrunden
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopAllSound();
});

// ===== Inställningar =====
function openSettings() {
  stopAllSound();
  document.getElementById("settings-title").textContent = t("settings");
  document.getElementById("lang-label").textContent = t("language");
  document.getElementById("voice-label").textContent = t("voice");
  voiceTest.setAttribute("aria-label", t("testVoice"));
  settingsClose.textContent = t("save");
  aboutToggle.textContent = t("about");
  aboutToggle.setAttribute("aria-expanded", "false");
  renderAbout();
  aboutSection.hidden = true;
  refreshVoices();
  populateVoiceSelect();
  highlightLangBtn();
  settingsModal.hidden = false;
  try { settingsClose.focus({ preventScroll: true }); } catch { /* ignore */ }
}
function closeSettings() {
  if (settingsModal.hidden) return;
  settingsModal.hidden = true;
  render(); // språket kan ha ändrats
}

function toggleAbout() {
  aboutSection.hidden = !aboutSection.hidden;
  aboutToggle.setAttribute("aria-expanded", String(!aboutSection.hidden));
}

function renderAbout() {
  document.getElementById("about-heading").textContent = t("aboutHeading");
  document.getElementById("about-intro").textContent = t("aboutIntro");
  document.getElementById("about-license").textContent = t("aboutLicense");
  document.getElementById("about-font").textContent = t("aboutFont");
  document.getElementById("about-credits-heading").textContent = t("aboutCredits");
  const list = document.getElementById("about-credits-list");
  list.innerHTML = "";
  (typeof SOUND_CREDITS !== "undefined" ? SOUND_CREDITS : []).forEach(c => {
    const li = document.createElement("li");
    const name = settings.lang === "en" ? c.en : c.sv;
    const a = document.createElement("a");
    a.href = c.url;
    a.target = "_blank";
    a.rel = "noopener";
    // c.source saknas i datat → visa bara det som finns
    a.textContent = [name, c.source].filter(Boolean).join(" — ") + (c.license ? ` (${c.license})` : "");
    li.appendChild(a);
    list.appendChild(li);
  });
  const repoLink = document.getElementById("about-repo-link");
  if (typeof REPO_URL !== "undefined") {
    repoLink.href = REPO_URL;
    repoLink.textContent = "GitHub";
  }
}

function highlightLangBtn() {
  settingsModal.querySelectorAll(".lang-btn").forEach(btn => {
    const on = btn.dataset.lang === settings.lang;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-checked", String(on));
  });
}
settingsModal.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    haptic("tap");
    if (settings.lang !== btn.dataset.lang) {
      settings.lang = btn.dataset.lang;
      settings.voiceURI = ""; // välj automatisk standard för det nya språket
      saveSettings();
    }
    highlightLangBtn();
    populateVoiceSelect();
    speak(settings.lang === "en" ? "Hello!" : "Hej!");
  });
});

function populateVoiceSelect() {
  if (!voiceSelect) return;
  voiceSelect.innerHTML = "";
  const langVoices = voicesForLang(settings.lang);

  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = t("defaultVoice");
  voiceSelect.appendChild(defaultOpt);

  if (synth && langVoices.length === 0) {
    const opt = document.createElement("option");
    opt.value = "__none";
    opt.textContent = settings.lang === "sv"
      ? "(Ingen svensk röst installerad)"
      : "(No English voice installed)";
    opt.disabled = true;
    voiceSelect.appendChild(opt);
  } else {
    langVoices.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.voiceURI;
      opt.textContent = `${v.name} (${normLang(v.lang)})`;
      voiceSelect.appendChild(opt);
    });
  }
  // Sparad röst som inte längre finns → visa standard (behåll valet i inställningarna)
  voiceSelect.value = langVoices.some(v => v.voiceURI === settings.voiceURI) ? settings.voiceURI : "";
}

voiceSelect.addEventListener("change", () => {
  settings.voiceURI = voiceSelect.value;
  saveSettings();
  speak(t("title"));
});

backBtn.addEventListener("click", () => { haptic("tap"); goBack(); });
homeBtn.addEventListener("click", () => { haptic("tap"); goHome(); });
settingsBtn.addEventListener("click", () => { haptic("tap"); openSettings(); });
settingsClose.addEventListener("click", () => { haptic("tap"); closeSettings(); });
voiceTest.addEventListener("click", () => { haptic("tap"); speak(t("title")); });
aboutToggle.addEventListener("click", toggleAbout);
// Tryck utanför kortet stänger
settingsModal.addEventListener("click", (e) => { if (e.target === settingsModal) closeSettings(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !settingsModal.hidden) closeSettings();
});

// ===== Navigation (med webbläsarhistorik, så bakåt-knapp/svep fungerar) =====
const canHistory = !!(window.history && typeof history.pushState === "function");
let depth = 0;           // hur många steg vi är från startskärmen
let navPending = false;  // history.back() skickat men popstate inte kommit än
let navLockUntil = 0;    // spärr mot "spöktryck" direkt efter skärmbyte

function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

function snapshot() {
  return {
    app: "lardig",
    screen: state.screen,
    age: state.age,
    cat: state.category ? state.category.id : null,
    depth
  };
}

function applySnapshot(s) {
  const cat = s && s.cat ? CATEGORIES.find(c => c.id === s.cat) : null;
  if (!s || s.app !== "lardig" || !s.age || s.screen === "age") {
    state.screen = "age"; state.age = null; state.category = null; depth = 0;
  } else if (s.screen === "items" && cat) {
    state.screen = "items"; state.age = s.age; state.category = cat; depth = s.depth || 2;
  } else {
    state.screen = "categories"; state.age = s.age; state.category = null; depth = s.depth || 1;
  }
}

function navigateTo(screen, patch) {
  if (navPending || now() < navLockUntil) return;
  Object.assign(state, patch, { screen });
  depth++;
  if (canHistory) {
    try { history.pushState(snapshot(), ""); } catch { /* ignore */ }
  }
  render();
}

function localBack() {
  if (state.screen === "items") {
    state.screen = "categories";
    state.category = null;
  } else if (state.screen === "categories") {
    state.screen = "age";
    state.age = null;
  }
  depth = Math.max(0, depth - 1);
  render();
}

function goBack() {
  if (!settingsModal.hidden) { closeSettings(); return; }
  if (state.screen === "age" || navPending) return;
  if (canHistory && depth > 0 && history.state && history.state.app === "lardig") {
    navPending = true;
    history.back();
  } else {
    localBack();
  }
}

function goHome() {
  if (state.screen === "age" || navPending) return;
  if (canHistory && depth > 0 && history.state && history.state.app === "lardig") {
    navPending = true;
    history.go(-depth);
  } else {
    state.screen = "age"; state.age = null; state.category = null; depth = 0;
    render();
  }
}

window.addEventListener("popstate", (e) => {
  navPending = false;
  settingsModal.hidden = true;
  applySnapshot(e.state);
  render();
});

// Spärra tryck en kort stund efter skärmbyte (dubbeltryck ska inte välja nästa kort)
app.addEventListener("click", (e) => {
  if (now() < navLockUntil) { e.stopPropagation(); e.preventDefault(); }
}, true);

// Android: hårdvaru-bakåtknapp i Capacitor (@capacitor/app)
const AppPlugin = capPlugin("App");
if (AppPlugin && typeof AppPlugin.addListener === "function") {
  try {
    quiet(AppPlugin.addListener("backButton", () => {
      if (!settingsModal.hidden) { closeSettings(); return; }
      if (state.screen !== "age") { goBack(); return; }
      try { quiet(AppPlugin.exitApp()); } catch { /* ignore */ }
    }));
    quiet(AppPlugin.addListener("pause", stopAllSound));
  } catch { /* ignore */ }
}

function render() {
  stopAllSound();
  clearQuizTimers();
  document.documentElement.lang = settings.lang;
  navLockUntil = now() + 350;
  app.innerHTML = "";
  backBtn.hidden = state.screen === "age";
  settingsBtn.hidden = state.screen !== "age"; // inställningar bara på startskärmen (för föräldrar)
  homeBtn.hidden = state.screen !== "items";   // på kategorisidan är "hem" = "tillbaka"
  backBtn.setAttribute("aria-label", t("back"));
  homeBtn.setAttribute("aria-label", t("home"));
  settingsBtn.setAttribute("aria-label", t("settings"));

  if (state.screen === "age") {
    renderAge();
  } else if (state.screen === "categories") {
    renderCategories();
  } else if (state.screen === "items") {
    if (state.age === "5-6") renderQuiz();
    else renderItems();
  }
  try { window.scrollTo(0, 0); } catch { /* ignore */ }
}

// ===== Skärmar =====
function renderAge() {
  screenTitle.textContent = t("title");
  const tpl = document.getElementById("tpl-age").content.cloneNode(true);
  applyI18n(tpl);
  tpl.querySelectorAll(".age-card").forEach(card => {
    card.addEventListener("click", () => {
      haptic("tap");
      navigateTo("categories", { age: card.dataset.age, category: null });
    });
  });
  app.appendChild(tpl);
}

function renderCategories() {
  screenTitle.textContent = t("categories");
  const tpl = document.getElementById("tpl-categories").content.cloneNode(true);
  applyI18n(tpl);
  const grid = tpl.getElementById("category-grid");
  CATEGORIES.forEach(cat => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-card";
    btn.style.setProperty("--cat", cat.color);
    const emoji = document.createElement("span");
    emoji.className = "category-emoji";
    emoji.textContent = cat.emoji;
    const label = document.createElement("span");
    label.className = "category-label";
    label.textContent = labelOf(cat);
    btn.append(emoji, label);
    btn.addEventListener("click", () => {
      haptic("tap");
      navigateTo("items", { category: cat });
    });
    grid.appendChild(btn);
  });
  app.appendChild(tpl);
}

function renderItems() {
  screenTitle.textContent = labelOf(state.category);
  const tpl = document.getElementById("tpl-items").content.cloneNode(true);
  const section = tpl.querySelector(".items-screen");
  section.dataset.age = state.age;
  section.style.setProperty("--cat", state.category.color);
  const grid = tpl.getElementById("items-grid");

  state.category.items.forEach(item => {
    const word = wordOf(item);
    // Kort och "Aa"-knapp är syskon (knapp-i-knapp är ogiltig HTML och fungerar dåligt)
    const tile = document.createElement("div");
    tile.className = "item-tile";

    const card = document.createElement("button");
    card.type = "button";
    card.className = "item-card idle";
    card.setAttribute("aria-label", word);

    const emoji = document.createElement("span");
    emoji.className = "item-emoji";
    emoji.textContent = item.emoji;
    emoji.setAttribute("aria-hidden", "true");
    card.appendChild(emoji);

    const label = document.createElement("span");
    label.className = "item-label";
    label.textContent = word;
    card.appendChild(label);
    tile.appendChild(card);

    if (state.age === "3-4") {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "word-toggle";
      toggle.setAttribute("aria-label", t("showWord"));
      toggle.setAttribute("aria-pressed", "false");
      toggle.textContent = "Aa";
      toggle.addEventListener("click", () => {
        haptic("tap");
        const on = card.classList.toggle("show-word");
        toggle.setAttribute("aria-pressed", String(on));
        if (on) speak(word);
      });
      tile.appendChild(toggle);
    }

    let tapTimer = null;
    card.addEventListener("click", () => {
      haptic("tap");
      clearTimeout(tapTimer);
      card.classList.remove("idle", "tapped");
      void card.offsetWidth; // starta om animationen
      card.classList.add("tapped");
      playSound(item.sound, word);
      tapTimer = setTimeout(() => {
        card.classList.remove("tapped");
        card.classList.add("idle");
      }, 700);
    });

    grid.appendChild(tile);
  });

  app.appendChild(tpl);
}

// ===== Quiz (5-6 år) =====
const quiz = { streak: 0, locked: false, correct: null, last: null, timers: [] };

function later(fn, ms) {
  const id = setTimeout(fn, ms);
  quiz.timers.push(id);
  return id;
}
function clearQuizTimers() {
  quiz.timers.forEach(clearTimeout);
  quiz.timers = [];
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function reducedMotion() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

function updateStreakDisplay(grew) {
  const el = document.getElementById("quiz-streak");
  if (!el) return;
  el.innerHTML = "";
  const n = Math.min(quiz.streak, 10);
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "streak-star" + (grew && i === n - 1 ? " new" : "");
    s.textContent = "⭐";
    el.appendChild(s);
  }
  if (quiz.streak > 10) {
    const more = document.createElement("span");
    more.className = "streak-more";
    more.textContent = "+" + (quiz.streak - 10);
    el.appendChild(more);
  }
}

function fireConfetti(big) {
  if (reducedMotion()) return;
  let layer = document.getElementById("confetti-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "confetti-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
  }
  const pieces = ["🎉", "⭐", "✨", "🎈", "🌟", "🎊"];
  const count = big ? 24 : 14;
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.className = "confetti-piece";
    span.textContent = pieces[i % pieces.length];
    span.style.left = (4 + Math.floor((i / count) * 90) + (i % 3) * 2) + "%";
    span.style.animationDelay = (i % 5) * 0.07 + "s";
    span.style.fontSize = 22 + (i % 4) * 6 + "px";
    span.addEventListener("animationend", () => span.remove());
    layer.appendChild(span);
  }
  // Säkerhetsnät om animationend aldrig kommer
  setTimeout(() => { if (layer) layer.innerHTML = ""; }, 2500);
}

function setFeedback(text, kind) {
  const el = document.getElementById("quiz-feedback");
  if (!el) return;
  el.className = "quiz-feedback";
  el.textContent = text;
  if (text) {
    void el.offsetWidth;
    el.classList.add("show", kind);
  }
}

function renderQuiz() {
  screenTitle.textContent = labelOf(state.category) + " — " + t("quizSuffix");
  const tpl = document.getElementById("tpl-quiz").content.cloneNode(true);
  const section = tpl.querySelector(".quiz-screen");
  section.style.setProperty("--cat", state.category.color);
  const replay = tpl.getElementById("quiz-replay");
  replay.setAttribute("aria-label", t("replay"));
  replay.addEventListener("click", () => {
    haptic("tap");
    if (quiz.correct) speak(wordOf(quiz.correct));
  });
  app.appendChild(tpl);
  quiz.streak = 0;
  quiz.last = null;
  updateStreakDisplay(false);
  startQuizRound();
}

function startQuizRound() {
  const grid = document.getElementById("quiz-grid");
  const questionEl = document.getElementById("quiz-question");
  if (!grid || !questionEl || !state.category) return; // skärmen har bytts
  const items = state.category.items;
  if (items.length < 4) return;

  // Samma rätta svar två gånger i rad känns som en bugg för barn
  const pool = items.filter(i => i !== quiz.last);
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const others = shuffle(items.filter(i => i !== correct)).slice(0, 3);
  const choices = shuffle([correct, ...others]);
  quiz.correct = correct;
  quiz.last = correct;
  quiz.locked = false;

  const correctWord = wordOf(correct);
  questionEl.textContent = `${t("find")} ${correctWord}`;
  setFeedback("", "");
  grid.innerHTML = "";

  later(() => speak(correctWord), 350);

  choices.forEach(item => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "quiz-card";
    card.textContent = item.emoji;
    card.setAttribute("aria-label", wordOf(item));
    card.addEventListener("click", () => handleQuizAnswer(card, item));
    grid.appendChild(card);
  });
}

function handleQuizAnswer(card, picked) {
  // Spärr: efter rätt svar (eller på redan testat fel kort) ignoreras fler tryck
  if (quiz.locked || card.classList.contains("tried")) return;
  const grid = document.getElementById("quiz-grid");

  if (picked === quiz.correct) {
    quiz.locked = true;
    haptic("success");
    card.classList.add("correct");
    if (grid) grid.classList.add("solved");
    quiz.streak++;
    updateStreakDisplay(true);
    setFeedback(t("correct"), "good");
    fireConfetti(quiz.streak % 5 === 0);
    playSound(picked.sound, wordOf(picked));
    later(() => {
      if (grid) grid.classList.remove("solved");
      startQuizRound();
    }, 1600);
  } else {
    haptic("error");
    card.classList.add("wrong", "tried");
    setFeedback(t("tryAgain"), "bad");
    quiz.streak = 0;
    updateStreakDisplay(false);
    later(() => card.classList.remove("wrong"), 450);
    later(() => { if (quiz.correct && !quiz.locked) speak(wordOf(quiz.correct)); }, 500);
  }
}

// ===== Mobilkänsla =====
// Aktiverar :active-stilar i iOS Safari/WKWebView
document.addEventListener("touchstart", () => {}, { passive: true });
// Ingen nyp-zoom i iOS (som ignorerar user-scalable=no)
document.addEventListener("gesturestart", (e) => e.preventDefault());
// Ingen långtrycksmeny på spelytan
document.addEventListener("contextmenu", (e) => {
  if (!(e.target.closest && e.target.closest("#about-section, select, a"))) e.preventDefault();
});

// ===== Service worker (PWA) =====
if ("serviceWorker" in navigator) {
  if (isNative) {
    // I appen ligger allt redan lokalt; en gammal SW-cache skulle bara ge inaktuella filer
    navigator.serviceWorker.getRegistrations()
      .then(regs => regs.forEach(r => r.unregister()))
      .catch(() => {});
  } else if (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    });
  }
}

// ===== Start =====
applySnapshot(canHistory ? history.state : null);
if (canHistory) {
  try { history.replaceState(snapshot(), ""); } catch { /* ignore */ }
}
render();
