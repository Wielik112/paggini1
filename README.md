# Paggini — strona główna

Profesjonalna, animowana strona wizytówka studia **Paggini** (strony internetowe, sklepy online, aplikacje).
Wielojęzyczna (PL / EN / DE, auto-wykrywanie języka), lekka, bez frameworka i bez kroku budowania — gotowa do wdrożenia na Vercel.

## 🗂 Struktura

```
paggini/
├── index.html          # strona główna (hero + odnośniki do podstron)
├── uslugi.html         # podstrona: Usługi
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

> **Struktura wielostronicowa.** Zamiast jednego długiego przewijania każda
> sekcja ma własną podstronę. Nawigacja w nagłówku i stopce prowadzi do
> osobnych adresów (`/uslugi`, `/proces`, `/realizacje`, `/o-nas`, `/kontakt`).

## 🚀 Wdrożenie — GitHub + Vercel

### 1. Wrzuć na GitHub
```bash
cd paggini
git init
git add .
git commit -m "Paggini — landing page"
git branch -M main
git remote add origin https://github.com/TWOJA-NAZWA/paggini.git
git push -u origin main
```

### 2. Wdróż na Vercel
1. Wejdź na [vercel.com](https://vercel.com) i zaloguj się przez GitHub.
2. **Add New → Project** → wybierz repozytorium `paggini`.
3. Framework Preset: **Other** (to statyczna strona, bez builda).
4. Kliknij **Deploy**. Gotowe — strona jest online.

### 3. Domena paggini.com
W panelu Vercel: **Project → Settings → Domains → Add** → wpisz `paggini.com`
i ustaw rekordy DNS u rejestratora domeny wg instrukcji Vercel.

## ✏️ Jak edytować

- **Teksty / tłumaczenia** — plik `js/i18n.js` (klucze `pl`, `en`, `de`).
- **Kolory / styl** — zmienne na górze `css/style.css` (sekcja `:root`).
- **Logo i favicon** — folder `assets/`.
- **Formularz kontaktowy** — obecnie otwiera e-mail (`mailto:`). Aby wysyłać wiadomości
  bez maila, podłącz np. [Formspree](https://formspree.io) lub [Web3Forms](https://web3forms.com)
  w `js/main.js` (funkcja obsługi `#contactForm`).

## 🌍 Języki
Strona automatycznie wykrywa język przeglądarki/systemu. Domyślny: **polski**.
Użytkownik może zmienić język w prawym górnym rogu (PL / EN / DE) — wybór jest zapamiętywany.

## 🛠 Technologie
Czysty HTML + CSS + JavaScript. Animacje: [GSAP](https://gsap.com) (z CDN).
Fonty: Sora + Inter (Google Fonts).

---
© Paggini
