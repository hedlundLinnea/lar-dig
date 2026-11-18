# Mobilappar (Android + iOS)

Appen är en Capacitor 8-app. Webbkoden ligger i `www/`, de native-projekten i `android/` och `ios/`.
Version: **1.1.0**, build **2** (Android `versionCode`/`versionName` i `android/app/build.gradle`,
iOS `MARKETING_VERSION`/`CURRENT_PROJECT_VERSION` i Xcode-projektet). Höj båda inför varje ny release.

## Vanliga kommandon

```bash
npm ci              # installera beroenden
npx cap sync        # kopiera www/ + plugins till android/ och ios/
npm run assets      # generera om ikoner + splash från assets/ (bara android/ios, rör inte www/)
```

Källbilderna för ikoner/splash ligger i `assets/` (`icon-only.png`, `icon-foreground.png`,
`icon-background.png`, `splash.png`, `splash-dark.png`).

## Android

Byggs automatiskt av GitHub Actions (`.github/workflows/android.yml`) vid push till `main`
eller manuellt via **Actions → Build Android → Run workflow**. Resultat:

- `barnens-ordbok-release-aab` – signerad AAB för Google Play.
- `barnens-ordbok-debug-apk` – debug-APK för att testa på en telefon.

Lokalt (kräver Android Studio/Android SDK): `npx cap sync android` och sedan
`cd android && ./gradlew assembleDebug`.

### Installera testbygget på en Android-telefon

1. Öppna GitHub → **Actions** → senaste körningen av *Build Android*.
2. Ladda ner artefakten **barnens-ordbok-debug-apk** (en zip) och packa upp `app-debug.apk`.
3. Skicka filen till telefonen (mejl, Google Drive eller USB-kabel).
4. Öppna filen på telefonen. Tillåt "Installera okända appar" för appen du öppnar den från
   (t.ex. Filer eller Chrome) när telefonen frågar.
5. Tryck **Installera**. (Har du Play-versionen installerad måste den avinstalleras först, eftersom
   debug-bygget är signerat med en annan nyckel.)

## iOS

Det finns ingen Mac, så iOS byggs bara i GitHub Actions (`.github/workflows/ios.yml`, macOS-runner):

- **build** – osignerat simulatorbygge vid varje push till `main` (och manuellt). Bevisar att
  projektet kompilerar.
- **testflight** – signerad archive → IPA → uppladdning till TestFlight. Körs **bara** när alla
  sex secrets nedan finns, annars hoppas jobbet över utan fel.

Build-numret i TestFlight sätts automatiskt till körningsnumret + 1, så det blir alltid unikt.

### GitHub Secrets som iOS-jobbet behöver

Lägg in under **GitHub → repot → Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Innehåll |
|---|---|
| `IOS_CERT_P12_BASE64` | Distributionscertifikatet (.p12) som base64 |
| `IOS_CERT_PASSWORD` | Lösenordet du satte på .p12-filen |
| `IOS_PROVISION_PROFILE_BASE64` | App Store-provisioneringsprofilen (.mobileprovision) som base64 |
| `APPSTORE_API_KEY_ID` | Key ID för App Store Connect API-nyckeln |
| `APPSTORE_API_ISSUER_ID` | Issuer ID (står överst på API-nyckelsidan) |
| `APPSTORE_API_PRIVATE_KEY` | Hela innehållet i `AuthKey_XXXX.p8` (inkl. BEGIN/END-raderna) |

Base64 i PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("fil.p12")) | Set-Clipboard`

### Steg för steg när Apple Developer-kontot är godkänt

Allt görs i webbläsaren på Windows, ingen Mac behövs.

1. **Skapa en CSR (certifikatbegäran)** med OpenSSL (finns i Git Bash):
   ```bash
   openssl genrsa -out ios_dist.key 2048
   openssl req -new -key ios_dist.key -out ios_dist.csr -subj "/emailAddress=DIN@MEJL.se/CN=Linnea Hedlund/C=SE"
   ```
2. **Certifikat:** developer.apple.com → *Certificates, IDs & Profiles* → *Certificates* → **+** →
   *Apple Distribution* → ladda upp `ios_dist.csr` → ladda ner `distribution.cer`.
3. **Gör om till .p12:**
   ```bash
   openssl x509 -inform DER -in distribution.cer -out distribution.pem
   openssl pkcs12 -export -legacy -inkey ios_dist.key -in distribution.pem -out ios_dist.p12
   ```
   (Välj ett lösenord → `IOS_CERT_PASSWORD`. Fungerar inte `-legacy`, ta bort flaggan.)
   Base64-koda `ios_dist.p12` → `IOS_CERT_P12_BASE64`.
4. **App ID:** *Identifiers* → **+** → *App IDs* → *App* → Bundle ID (Explicit) `se.barnensordbok.app`,
   beskrivning "Barnens ordbok". Inga extra capabilities behövs.
5. **Provisioneringsprofil:** *Profiles* → **+** → *App Store Connect* (under Distribution) → välj App ID
   `se.barnensordbok.app` → välj certifikatet från steg 2 → namnge t.ex. "Barnens ordbok App Store" →
   ladda ner `.mobileprovision`. Base64-koda → `IOS_PROVISION_PROFILE_BASE64`.
6. **Skapa appen i App Store Connect:** appstoreconnect.apple.com → *Appar* → **+** → *Ny app* →
   plattform iOS, namn "Barnens ordbok", språk svenska, Bundle ID `se.barnensordbok.app`, SKU t.ex. `barnensordbok`.
7. **API-nyckel:** App Store Connect → *Användare och åtkomst* → *Integrationer* → *App Store Connect API* →
   *Team Keys* → **+** → namn "GitHub Actions", åtkomst **App Manager** → ladda ner `AuthKey_XXXX.p8`
   (går bara en gång!). Key ID → `APPSTORE_API_KEY_ID`, Issuer ID → `APPSTORE_API_ISSUER_ID`,
   filens innehåll → `APPSTORE_API_PRIVATE_KEY`.
8. Lägg in alla sex secrets, kör **Actions → Build iOS → Run workflow**. Efter ca 10–30 min syns
   bygget under *TestFlight* i App Store Connect. Lägg till dig själv som intern testare och installera
   via TestFlight-appen på iPhone/iPad.

Spara `ios_dist.key`, `.p12` och `.p8` säkert (t.ex. i en lösenordshanterare), aldrig i repot.
Certifikat och profil gäller ett år; förnya då och uppdatera secrets.

### Inför App Store-granskningen

- Krypteringsfrågan är redan besvarad i appen (`ITSAppUsesNonExemptEncryption = NO`).
- Privacy manifest (`ios/App/App/PrivacyInfo.xcprivacy`) deklarerar ingen spårning och ingen datainsamling.
  Svara likadant under *App Privacy* i App Store Connect ("Data Not Collected").
- Appen riktar sig till barn: välj åldersgrupp under *Kids Category* om du vill ha den där.
