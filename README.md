# Lär dig! / Learn!

En gratis interaktiv app för barn att lära sig svenska och engelska ord. Stora knappar, animationer, riktiga djurljud och text-till-tal.

**Öppen källkod** (MIT) • **Alla ljud Public Domain** (CC0) • **Funkar offline som PWA**

## Funktioner

- **Två språk:** Svenska och Engelska, växlas i ⚙️ Inställningar
- **Röstval:** Välj bland alla installerade röster på enheten
- **Tre åldersanpassade lägen:**
  - 1–2 år: Bara stora bilder, tryck = ljud + uttal
  - 3–4 år: Bilder + en "Aa"-knapp för att se ordet
  - 5–6 år: Quiz-läge "Hitta lejonet!"
- **6 kategorier:** Djur, Mat, Kläder, Färger, Fordon, Siffror — 60+ ord totalt
- **PWA:** Installera som app på telefon/surfplatta utan App Store

## Kör lokalt

Dubbelklicka på `starta.bat` (Windows). En webbläsare öppnas på `http://localhost:8765`.

Stäng det svarta fönstret när du är klar.

Kräver Python 3 (förinstallerat på de flesta Windows).

## Installera på telefon eller surfplatta

1. Öppna appens URL i Chrome eller Safari
2. Välj "Lägg till på hemskärmen" / "Add to Home Screen"
3. Nu finns en app-ikon — appen funkar offline

## Anpassa innehållet

Allt finns i `data.js`. Lägg till nya items i en kategori, t.ex.:

```js
{ word: { sv: "Räv", en: "Fox" }, emoji: "🦊" }
```

För eget djurljud: lägg en `.ogg`- eller `.mp3`-fil i `sounds/` och hänvisa till den:

```js
{ word: { sv: "Räv", en: "Fox" }, emoji: "🦊", sound: "sounds/fox.ogg" }
```

## Licens

- **Kod:** MIT License — se `LICENSE`
- **Ljud:** Public Domain (CC0) — se `ATTRIBUTIONS.md` för källor

Du får använda, ändra och dela appen fritt, även kommersiellt.
