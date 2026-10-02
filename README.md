# Paggini, strona główna

Profesjonalna, animowana strona wizytówka studia **Paggini** (strony internetowe, sklepy online, aplikacje).
Wielojęzyczna (PL / EN / DE, auto-wykrywanie języka), lekka, bez frameworka. Czysty statyczny HTML, a `npm run build` sprawdza SEO i linki, po czym składa gotową stronę w `dist/` (Vercel robi to automatycznie przy każdym deployu).

## 🗂 Struktura

```
paggini/
├── index.html          # strona główna (pełna treść wszystkich sekcji)
├── strony-internetowe.html, sklepy-internetowe.html,
│   aplikacje-webowe.html, aplikacje-mobilne.html,
│   aplikacje-saas.html   # podstrony usług
├── strona-internetowa-dla-firmy-budowlanej.html   # strona branżowa
├── poradnik/           # poradnik (artykuły)
├── 404.html            # strona błędu (noindex)
├── uslugi.html         # podstrona: Usługi
├── oferta.html         # podstrona: Oferta / cennik (3 pakiety)
├── proces.html         # podstrona: Proces
├── realizacje.html     # podstrona: Realizacje
├── o-nas.html          # podstrona: O nas + statystyki
├── kontakt.html        # podstrona: Kontakt (formularz)
├── css/
│   └── style.css       # style, animacje, responsywność
├── js/
│   ├── i18n.js         # tłumaczenia PL/EN/DE + logika języka
│   └── main.js         # animacje, kursor, nawigacja, formularz
├── assets/             # logo, favicon, obrazy OG
├── scripts/            # build.mjs (walidacja + dist), preview.mjs (podgląd)
├── package.json        # npm run build / npm run preview (bez zależności)
├── vercel.json         # konfiguracja Vercel (build, nagłówki, cache, cleanUrls, przekierowania)
├── sitemap.xml         # mapa strony (wszystkie podstrony)
├── robots.txt
└── .gitignore
```

> **Strona główna + podstrony.** Strona główna (`/`) zawiera pełną treść
> wszystkich sekcji (usługi, oferta, proces, realizacje, o nas, kontakt).
> Każda sekcja ma dodatkowo własną podstronę, nawigacja w nagłówku i stopce
> prowadzi wprost do osobnych adresów (`/uslugi`, `/oferta`, `/proces`,
> `/realizacje`, `/o-nas`, `/kontakt`), więc klient szukający konkretnej
> rzeczy trafia od razu na dedykowaną stronę.
>
> **Oferta / cennik.** Trzy pakiety: **Strona internetowa, od 500 zł**,
> **Sklep internetowy, do 3000 zł** oraz **Pozostałe projekty, wycena
> indywidualna**. Treść pakietów edytujesz w `js/i18n.js` (klucze `price_*`).
> Strona zawiera też sekcję „Dlaczego Paggini", opinie klientów i FAQ,
> a wszystkie teksty (PL/EN/DE) są w `js/i18n.js`.

## 🚀 Wdrożenie, GitHub + Vercel

### 1. Wrzuć na GitHub
```bash
cd paggini
git init
git add .
git commit -m "Paggini, landing page"
git branch -M main
git remote add origin https://github.com/TWOJA-NAZWA/paggini.git
git push -u origin main
```

### 2. Wdróż na Vercel
1. Wejdź na [vercel.com](https://vercel.com) i zaloguj się przez GitHub.
2. **Add New → Project** → wybierz repozytorium `paggini`.
3. Framework Preset: **Other**. Build (`npm run build`) i katalog wyjściowy (`dist`)
   są ustawione w `vercel.json`, nic nie trzeba zmieniać w panelu.
4. Kliknij **Deploy**. Gotowe, strona jest online.

### 3. Domena paggini.com
W panelu Vercel: **Project → Settings → Domains → Add** → wpisz `paggini.com`
i ustaw rekordy DNS u rejestratora domeny wg instrukcji Vercel.

## 🧪 Build i podgląd lokalny

Wymaga tylko Node.js 18+ (projekt nie ma żadnych zależności npm).

```bash
npm run build     # waliduje strony i tworzy dist/
npm run preview   # podgląd dist/ pod http://localhost:4173 (czyste adresy jak na Vercel)
```

Build **przerywa się z błędem**, jeśli znajdzie: niedziałający link wewnętrzny, brakujący
obrazek, błędny JSON-LD, brak title / description / canonical / jednego H1, zduplikowany
title, description lub H1, rozjazd między `sitemap.xml` a stronami albo brakujący klucz
tłumaczenia. Do `dist/assets` trafiają tylko pliki faktycznie używane przez stronę.

## 🔎 SEO, jak dodać stronę

1. Skopiuj istniejącą podstronę (np. `proces.html`) i zmień: `<title>`, `meta description`,
   `canonical`, `og:*`, `twitter:*`, H1 i JSON-LD (`WebPage` + `BreadcrumbList`).
2. Dodaj adres do `sitemap.xml` (build sprawdzi, czy się zgadza).
3. Podlinkuj stronę z menu, stopki lub treści innych podstron.
4. Strony, które nie powinny trafić do Google, oznacz `<meta name="robots" content="noindex, follow" />`
   i nie dodawaj ich do sitemap (tak jak `404.html`).

Polski tekst w plikach HTML jest źródłem prawdy (to go indeksuje Google). Tłumaczenia EN/DE
są w `js/i18n.js`, roboty wyszukiwarek zawsze dostają wersję polską.

## 📈 Google Search Console

1. Wejdź na [search.google.com/search-console](https://search.google.com/search-console)
   i dodaj usługę typu **Domena**: `paggini.com`.
2. Zweryfikuj ją rekordem **TXT w DNS** u rejestratora domeny (bez zmian w kodzie).
   Jeśli wolisz weryfikację metatagiem (usługa „Prefiks URL”), wklej otrzymany
   `<meta name="google-site-verification" …>` w miejscu oznaczonym komentarzem w `<head>` pliku `index.html`.
3. W sekcji **Mapy witryn** prześlij: `https://paggini.com/sitemap.xml`.
4. W **Sprawdzanie adresu URL** poproś o zindeksowanie strony głównej i kluczowych podstron usług.

## ✏️ Jak edytować

- **Teksty / tłumaczenia**, plik `js/i18n.js` (klucze `pl`, `en`, `de`).
- **Kolory / styl**, zmienne na górze `css/style.css` (sekcja `:root`).
- **Logo i favicon**, folder `assets/`.
- **Formularz kontaktowy**, obecnie otwiera e-mail (`mailto:`). Aby wysyłać wiadomości
  bez maila, podłącz np. [Formspree](https://formspree.io) lub [Web3Forms](https://web3forms.com)
  w `js/main.js` (funkcja obsługi `#contactForm`).

## 🌍 Języki
Strona automatycznie wykrywa język przeglądarki/systemu. Domyślny: **polski**.
Użytkownik może zmienić język w prawym górnym rogu (PL / EN / DE), wybór jest zapamiętywany.

## 🛠 Technologie
Czysty HTML + CSS + JavaScript (bez frameworka, bez SSR). Animacje: [GSAP](https://gsap.com) (z CDN).
Fonty: Sora + Inter (Google Fonts).

---
© Paggini
