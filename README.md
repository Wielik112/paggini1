# Paggini, strona główna

Profesjonalna, animowana strona wizytówka studia **Paggini** (strony internetowe, sklepy online, aplikacje).
Wielojęzyczna (PL / EN / DE, auto-wykrywanie języka), lekka, bez frameworka i bez kroku budowania, gotowa do wdrożenia na Vercel.

## 🗂 Struktura

```
paggini/
├── index.html          # strona główna (pełna treść wszystkich sekcji)
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
├── vercel.json         # konfiguracja Vercel (nagłówki, cache, cleanUrls)
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
> **Oferta / cennik.** Trzy pakiety: **Landing page, 1000 zł**,
> **Podstawowy sklep, 2000 zł** oraz **Pozostałe projekty, wycena
> indywidualna**. Treść pakietów edytujesz w `js/i18n.js` (klucze `price_*`).

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
3. Framework Preset: **Other** (to statyczna strona, bez builda).
4. Kliknij **Deploy**. Gotowe, strona jest online.

### 3. Domena paggini.com
W panelu Vercel: **Project → Settings → Domains → Add** → wpisz `paggini.com`
i ustaw rekordy DNS u rejestratora domeny wg instrukcji Vercel.

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
Czysty HTML + CSS + JavaScript. Animacje: [GSAP](https://gsap.com) (z CDN).
Fonty: Sora + Inter (Google Fonts).

---
© Paggini
