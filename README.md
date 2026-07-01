# VizDict

VizDict je mobilna aplikacija za kreiranje privatnog vizuelnog rečnika. Korisnik može da fotografiše predmet kamerom ili da izabere sliku iz galerije, izabere ciljni jezik, pokrene AI prepoznavanje i sačuva rezultat u svoj rečnik. Sačuvani unos sadrži sliku, naziv predmeta, prevod, opis, primere upotrebe i alternativne nazive.

## Osnovne funkcionalnosti

- Registracija i prijava korisnika preko Firebase Authentication-a.
- Izbor ciljnog jezika za prevod.
- Fotografisanje predmeta kamerom ili izbor slike iz galerije.
- Upload slike u Firebase Storage.
- Prepoznavanje predmeta preko Firebase Cloud Functions i OpenAI API-ja.
- Čuvanje rezultata u Cloud Firestore bazu.
- Pregled rečnika po jezicima.
- Pretraga sačuvanih reči i prikaz detalja pojedinačnog unosa.
- Pregled statistike korišćenja.
- Podešavanje svetle/tamne teme i osnovne boje aplikacije.

## Korišćene tehnologije

- React Native - razvoj mobilnog korisničkog interfejsa.
- Expo - razvojno okruženje, routing, native API integracije i EAS build.
- TypeScript - tipizacija podataka i sigurniji razvoj.
- Expo Router - file-based navigacija kroz aplikaciju.
- Firebase Authentication - registracija, prijava i odjava korisnika.
- Cloud Firestore - čuvanje korisničkih profila i rečničkih unosa.
- Firebase Storage - čuvanje slika koje korisnik postavlja.
- Firebase Cloud Functions - backend sloj za AI obradu slike.
- OpenAI API - prepoznavanje predmeta i generisanje prevoda, opisa i primera.

## Struktura projekta

```text
app/                Ekrani aplikacije i Expo Router rute
components/         Zajedničke UI komponente
contexts/           Auth, tema i izabrana slika
lib/                Firebase konfiguracija i pomoćne funkcije
types/              TypeScript tipovi
functions/          Firebase Cloud Functions backend
assets/images/      Ikone i slike aplikacije
```

## Preduslovi

Pre pokretanja projekta potrebno je instalirati:

- Node.js
- npm
- Expo CLI kroz `npx expo`
- Firebase CLI, ako se deploy-uju rules ili functions
- EAS CLI, ako se kreira preview APK

Za Android testiranje potreban je Android emulator ili fizički Android uređaj. Za iOS testiranje potreban je macOS sa Xcode okruženjem.

## Podešavanje environment varijabli

U root folderu projekta napraviti `.env` fajl na osnovu `.env.example` fajla:

```bash
cp .env.example .env
```

Zatim popuniti Firebase vrednosti:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION=europe-west1
```

OpenAI API ključ se ne upisuje u mobilnu aplikaciju. On se podešava kao Firebase Functions secret:

```bash
firebase functions:secrets:set OPENAI_API_KEY
```

## Instalacija

Instalirati dependencies:

```bash
npm install
```

Za proveru istog install procesa koji koristi EAS build može se pokrenuti:

```bash
npx npm@10.8.2 ci --include=dev
```

## Pokretanje aplikacije

Pokretanje Expo development servera:

```bash
npm start
```

Pokretanje na Android uređaju ili emulatoru:

```bash
npm run android
```

Pokretanje web verzije:

```bash
npm run web
```

## Firebase Functions

Build Firebase Functions koda:

```bash
npm run functions:build
```

Deploy funkcija:

```bash
npm run deploy:functions
```

Deploy Firestore i Storage pravila:

```bash
npm run deploy:rules
```

## Provere pre build-a

Pre kreiranja preview APK-a preporučeno je pokrenuti:

```bash
npx npm@10.8.2 ci --include=dev
npm run lint
npx tsc --noEmit
npm run functions:build
npx expo export --platform web
npx expo install --check
```

Za proveru Android prebuild koraka:

```bash
npx expo prebuild --no-install --platform android
```

## Preview Android APK

Projekat koristi EAS build profil `preview`, koji generiše Android APK za interno testiranje.

Pokretanje preview build-a:

```bash
npm run build:preview:android
```

Direktna EAS komanda:

```bash
eas build --platform android --profile preview
```

## Napomena o podacima

Korisnički podaci su organizovani po Firebase korisničkom identifikatoru. Svaki korisnik ima svoj dokument u kolekciji `users`, a rečnički unosi se čuvaju u podkolekciji `users/{uid}/dictionary`. Slike se čuvaju u Firebase Storage-u na putanji `users/{uid}/scans`.