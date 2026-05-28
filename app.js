// ===== Tillstånd =====
const SETTINGS_KEY = "barn-app-settings";

const defaultSettings = { lang: "sv", voiceURI: "" };
function loadSettings() {
  try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") }; }
  catch { return { ...defaultSettings }; }
}
function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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

backBtn.addEventListener("click", goBack);
homeBtn.addEventListener("click", goHome);
settingsBtn.addEventListener("click", openSettings);
settingsClose.addEventListener("click", closeSettings);
voiceTest.addEventListener("click", () => speak(t("title")));
aboutToggle.addEventListener("click", toggleAbout);

// ===== Översättning =====
function t(key) {
  return (UI[settings.lang] && UI[settings.lang][key]) || UI.sv[key] || key;
}
function wordOf(item) {
  return item.word[settings.lang] || item.word.sv;
}
function applyI18n(root) {
  root.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
}

// ===== Ljud =====
let allVoices = [];
function refreshVoices() {
  allVoices = speechSynthesis.getVoices();
  populateVoiceSelect();
}
if (typeof speechSynthesis !== "undefined") {
  refreshVoices();
  speechSynthesis.onvoiceschanged = refreshVoices;
}

function voicesForLang(lang) {
  return allVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase()));
}

function pickVoice() {
  if (settings.voiceURI) {
    const v = allVoices.find(v => v.voiceURI === settings.voiceURI);
    if (v) return v;
  }
  const langVoices = voicesForLang(settings.lang);
  // Föredra "native" röster (default eller localService) framför nätverksröster
  return langVoices.find(v => v.default) || langVoices.find(v => v.localService) || langVoices[0] || null;
}

function speak(text) {
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  utter.lang = voice ? voice.lang : (settings.lang === "en" ? "en-US" : "sv-SE");
  utter.rate = 0.85;
  utter.pitch = 1.1;
  if (voice) utter.voice = voice;
  speechSynthesis.speak(utter);
}

const audioCache = new Map();
function playSound(soundPath, fallbackWord) {
  if (!soundPath) {
    speak(fallbackWord);
    return;
  }
  let audio = audioCache.get(soundPath);
  if (!audio) {
    audio = new Audio(soundPath);
    audioCache.set(soundPath, audio);
  }
  audio.onended = null;
  audio.currentTime = 0;
  const p = audio.play();
  if (p) {
    p.then(() => {
      audio.onended = () => speak(fallbackWord);
    }).catch(() => {
      speak(fallbackWord);
    });
  }
}

// ===== Inställningar =====
function openSettings() {
  speechSynthesis.cancel();
  document.getElementById("settings-title").textContent = t("settings");
  document.getElementById("lang-label").textContent = t("language");
  document.getElementById("voice-label").textContent = t("voice");
  settingsClose.textContent = t("save");
  aboutToggle.textContent = t("about");
  renderAbout();
  aboutSection.hidden = true;
  populateVoiceSelect();
  highlightLangBtn();
  settingsModal.hidden = false;
}
function closeSettings() {
  settingsModal.hidden = true;
  render();
}

function toggleAbout() {
  aboutSection.hidden = !aboutSection.hidden;
}

function renderAbout() {
  document.getElementById("about-heading").textContent = t("aboutHeading");
  document.getElementById("about-intro").textContent = t("aboutIntro");
  document.getElementById("about-license").textContent = t("aboutLicense");
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
    a.textContent = `${name} — ${c.source} (${c.license})`;
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
    btn.classList.toggle("active", btn.dataset.lang === settings.lang);
  });
}
settingsModal.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    settings.lang = btn.dataset.lang;
    settings.voiceURI = ""; // välj automatisk standard för det nya språket
    saveSettings();
    highlightLangBtn();
    populateVoiceSelect();
    // Säg "Hej" / "Hello" som demo
    setTimeout(() => speak(settings.lang === "en" ? "Hello!" : "Hej!"), 100);
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

  if (langVoices.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = settings.lang === "sv"
      ? "(Ingen svensk röst installerad)"
      : "(No English voice installed)";
    opt.disabled = true;
    voiceSelect.appendChild(opt);
  } else {
    langVoices.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.voiceURI;
      opt.textContent = `${v.name} (${v.lang})`;
      if (v.voiceURI === settings.voiceURI) opt.selected = true;
      voiceSelect.appendChild(opt);
    });
  }
}

voiceSelect.addEventListener("change", () => {
  settings.voiceURI = voiceSelect.value;
  saveSettings();
});

// ===== Navigation =====
function render() {
  document.documentElement.lang = settings.lang;
  app.innerHTML = "";
  backBtn.hidden = state.screen === "age";
  homeBtn.hidden = state.screen === "age";

  if (state.screen === "age") {
    renderAge();
  } else if (state.screen === "categories") {
    renderCategories();
  } else if (state.screen === "items") {
    if (state.age === "5-6") renderQuiz();
    else renderItems();
  }
}

function goBack() {
  if (state.screen === "items") {
    state.screen = "categories";
    state.category = null;
  } else if (state.screen === "categories") {
    state.screen = "age";
    state.age = null;
  }
  render();
}

function goHome() {
  state.screen = "age";
  state.age = null;
  state.category = null;
  render();
}

// ===== Skärmar =====
function renderAge() {
  screenTitle.textContent = t("title");
  const tpl = document.getElementById("tpl-age").content.cloneNode(true);
  applyI18n(tpl);
  tpl.querySelectorAll(".age-card").forEach(card => {
    card.addEventListener("click", () => {
      state.age = card.dataset.age;
      state.screen = "categories";
      render();
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
    btn.className = "category-card";
    btn.style.background = cat.color;
    btn.innerHTML = `
      <span class="category-emoji">${cat.emoji}</span>
      <span class="category-label"></span>
    `;
    btn.querySelector(".category-label").textContent = cat.label[settings.lang] || cat.label.sv;
    btn.addEventListener("click", () => {
      state.category = cat;
      state.screen = "items";
      render();
    });
    grid.appendChild(btn);
  });
  app.appendChild(tpl);
}

function renderItems() {
  screenTitle.textContent = state.category.label[settings.lang] || state.category.label.sv;
  const tpl = document.getElementById("tpl-items").content.cloneNode(true);
  const section = tpl.querySelector(".items-screen");
  section.dataset.age = state.age;
  const grid = tpl.getElementById("items-grid");

  state.category.items.forEach(item => {
    const word = wordOf(item);
    const card = document.createElement("button");
    card.className = "item-card idle";

    const emoji = document.createElement("span");
    emoji.className = "item-emoji";
    emoji.textContent = item.emoji;
    card.appendChild(emoji);

    const label = document.createElement("span");
    label.className = "item-label";
    label.textContent = word;
    card.appendChild(label);

    if (state.age === "3-4") {
      const toggle = document.createElement("button");
      toggle.className = "word-toggle";
      toggle.setAttribute("aria-label", t("showWord"));
      toggle.textContent = "Aa";
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        card.classList.toggle("show-word");
        if (card.classList.contains("show-word")) speak(word);
      });
      card.appendChild(toggle);
    }

    card.addEventListener("click", () => {
      card.classList.remove("idle");
      card.classList.remove("tapped");
      void card.offsetWidth;
      card.classList.add("tapped");
      playSound(item.sound, word);
      setTimeout(() => {
        card.classList.remove("tapped");
        card.classList.add("idle");
      }, 700);
    });

    grid.appendChild(card);
  });

  app.appendChild(tpl);
}

// ===== Quiz (5-6 år) =====
function renderQuiz() {
  const catLabel = state.category.label[settings.lang] || state.category.label.sv;
  screenTitle.textContent = catLabel + " — " + t("quizSuffix");
  const tpl = document.getElementById("tpl-quiz").content.cloneNode(true);
  app.appendChild(tpl);
  startQuizRound();
}

function startQuizRound() {
  const items = state.category.items;
  if (items.length < 4) return;

  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const choices = shuffled.slice(0, 4);
  const correct = choices[Math.floor(Math.random() * choices.length)];

  const questionEl = document.getElementById("quiz-question");
  const grid = document.getElementById("quiz-grid");
  const feedback = document.getElementById("quiz-feedback");

  const correctWord = wordOf(correct);
  questionEl.textContent = `${t("find")} ${correctWord}`;
  feedback.textContent = "";
  grid.innerHTML = "";

  setTimeout(() => speak(correctWord), 300);

  choices.forEach(item => {
    const card = document.createElement("button");
    card.className = "quiz-card";
    card.textContent = item.emoji;
    card.addEventListener("click", () => handleQuizAnswer(card, item, correct));
    grid.appendChild(card);
  });
}

function handleQuizAnswer(card, picked, correct) {
  const feedback = document.getElementById("quiz-feedback");
  if (wordOf(picked) === wordOf(correct)) {
    card.classList.add("correct");
    feedback.textContent = t("correct");
    playSound(picked.sound, wordOf(picked));
    setTimeout(startQuizRound, 1800);
  } else {
    card.classList.add("wrong");
    feedback.textContent = t("tryAgain");
    setTimeout(() => card.classList.remove("wrong"), 600);
  }
}

// ===== Service worker (PWA) =====
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

// ===== Start =====
render();
