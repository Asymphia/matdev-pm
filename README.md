# MatDev PM — frontend

Interfejs aplikacji **MatDev PM** (zarządzanie projektami materiałowymi / lab) — **Next.js** + opcjonalnie **Electron** (Windows desktop).

Backend API: repozytorium [`matdev-pm-backend`](../matdev-pm-backend) (osobny projekt, zwykle obok tego folderu).

---

## Stack

| Warstwa | Technologia |
|---------|-------------|
| UI | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Desktop | Electron + electron-builder (NSIS) |
| API | REST → matdev.API (.NET), domyślnie `http://127.0.0.1:5196` |

---

## Wymagania

- **Node.js** 20+
- **Docker Desktop** — do bazy PostgreSQL i API (zalecane na co dzień)
- Repozytorium **backendu** sklonowane obok: `../matdev-pm-backend`

---

## Szybki start (przeglądarka)

```powershell
cd matdev-pm
npm install

# Skopiuj zmienne środowiskowe
copy .env.example .env.local

# Terminal 1 — backend (w drugim repo)
cd ..\matdev-pm-backend
docker compose up -d

# Terminal 2 — frontend
cd ..\matdev-pm
npm run dev:web
```

Otwórz [http://localhost:3000](http://localhost:3000).

Na ekranie startowym wybierz użytkownika demo albo załaduj dane — patrz [MOCK_DATA.md w backendzie](../matdev-pm-backend/MOCK_DATA.md).

---

## Szybki start (okno desktop — dev)

```powershell
cd matdev-pm
npm install
npm run start:desktop
```

Skrypt uruchamia Docker (baza + API), Next.js i okno Electron. Szczegóły: **[DESKTOP.md](./DESKTOP.md)**.

---

## Zmienne środowiskowe

Plik `.env.local` (wzorzec: [`.env.example`](./.env.example)):

| Zmienna | Opis |
|---------|------|
| `MATDEV_API_BASE_URL` | URL API (server components, Server Actions) |
| `NEXT_PUBLIC_MATDEV_API_BASE_URL` | URL API w przeglądarce (upload plików lab) |

Domyślnie obie wskazują na `http://127.0.0.1:5196`.

---

## Skróty npm

| Komenda | Opis |
|---------|------|
| `npm run dev:web` | Tylko Next.js (localhost:3000) |
| `npm run dev` | Next.js + okno Electron (API osobno w Docker) |
| `npm run start:desktop` | Docker + Next + Electron — jeden skrypt |
| `npm run build` | Produkcja Next + kompilacja Electron |
| `npm run build:desktop` | Instalator Windows (`.exe` w `release/`) |
| `npm run lint` | ESLint |

---

## Główne ekrany

| Ścieżka | Opis |
|---------|------|
| `/` | Wybór użytkownika / status API |
| `/projects` | Lista projektów |
| `/projects/[slug]` | Widok projektu |
| `/projects/[slug]/tasks` | Zadania |
| `/projects/[slug]/budget` | Budżet projektu |
| `/projects/[slug]/lab` | Zlecenia laboratoryjne |
| `/projects/[slug]/gantt` | Harmonogram |
| `/budgets` | Przegląd budżetów |
| `/users` | Użytkownicy |

---

## Struktura (skrót)

```
app/              — strony Next.js (App Router)
components/       — UI (projekt, zadania, budżet, lab, layout)
lib/server/       — fetch do API (SSR)
app/actions/      — Server Actions (mutacje)
electron/         — proces główny Electron
scripts/          — build/start desktop (PowerShell)
```

---

## Rozwiązywanie problemów

| Problem | Co zrobić |
|---------|-----------|
| Błędy połączenia z API | Docker włączony → `docker compose up -d` w backendzie |
| Upload pliku lab > 1 MB | Upewnij się, że `NEXT_PUBLIC_MATDEV_API_BASE_URL` w `.env.local` |
| Stary backend | `docker compose build matdev.api && docker compose up -d` w backendzie |

Więcej: [DESKTOP.md](./DESKTOP.md).

---

## Powiązane dokumenty

- [DESKTOP.md](./DESKTOP.md) — instalator, Electron, dostawa klientowi
- [matdev-pm-backend/README.md](../matdev-pm-backend/README.md) — API, Docker, testy
- [MOCK_DATA.md](../matdev-pm-backend/MOCK_DATA.md) — dane demo Borg Warner
