# MatDev PM — aplikacja desktopowa (Windows)

Aplikacja może działać jak zwykły program na Windows: **ikona na pulpicie → okno → bez terminala**.

Składa się z:
- **Electron** — okno aplikacji
- **Next.js** — interfejs (uruchamiany w tle)
- **matdev.API** — backend .NET (uruchamiany w tle)
- **PostgreSQL** — baza (Docker lub lokalna instalacja)

---

## Dla Ciebie (developer) — jedno kliknięcie na co dzień

**Wymagania:** Docker Desktop, Node.js, .NET SDK.

```powershell
cd matdev-pm
npm install
npm run start:desktop
```

Skrypt:
1. Uruchamia Docker (baza + API)
2. Startuje Next.js
3. Otwiera okno Electron

Alternatywa (to samo ręcznie):

```powershell
# Terminal 1 — backend
cd matdev-pm-backend
docker compose up -d

# Terminal 2 — frontend + okno
cd matdev-pm
npm run dev
```

---

## Dla klienta — instalator `.exe`

**Wymagania do zbudowania:** Windows, Node.js, .NET SDK, Docker (do testów).

```powershell
cd matdev-pm
npm install
npm run build:desktop
```

Wynik: **`matdev-pm/release/MatDev-PM-Setup-0.1.0.exe`**

Po instalacji użytkownik:
1. Instaluje **Docker Desktop** (do bazy PostgreSQL) **albo** ma PostgreSQL na `localhost:5432` z bazą `matdev` / user `postgres` / hasło `postgres`
2. Klika skrót **MatDev PM** na pulpicie
3. Aplikacja sama:
   - próbuje uruchomić bazę przez Docker (jeśli jest)
   - startuje API i interfejs
   - pokazuje ekran ładowania, potem główne okno

---

## Co robi instalator

| Element | Gdzie po instalacji |
|---------|---------------------|
| Electron | `C:\Program Files\MatDev PM\` |
| API (.NET) | `resources\api\matdev.API.exe` |
| UI (Next) | `resources\next\` |
| docker-compose (baza) | `resources\database\` |

---

## Rozwiązywanie problemów

| Problem | Rozwiązanie |
|---------|-------------|
| Czerwone błędy API | Docker Desktop włączony → `docker compose up -d` w backendzie |
| Okno „Timeout API” | Poczekaj 30 s, uruchom ponownie; sprawdź port 5432 i 5196 |
| Stary backend bez Lab | `docker compose build matdev.api && docker compose up -d` |
| Tylko przeglądarka | Użyj `npm run dev` lub skrótu po instalacji NSIS, nie samego `next dev` |

---

## Skróty npm

| Komenda | Opis |
|---------|------|
| `npm run dev` | Dev: Next + Electron (API osobno w Docker) |
| `npm run dev:web` | Tylko przeglądarka (localhost:3000) |
| `npm run start:desktop` | Docker + Next + Electron (dev) |
| `npm run build:desktop` | Pełny instalator Windows |
| `npm run dist` | To samo co `build:desktop` |

---

## Uwaga dla dostawy u klienta

Minimalny pakiet dla gościa:
1. **MatDev-PM-Setup-x.exe** (instalator)
2. **Docker Desktop** (instalator + krótka instrukcja „włącz przy starcie Windows”)

Bez Dockera klient musi mieć PostgreSQL 16+ skonfigurowane jak wyżej.

W przyszłości można dołożyć PostgreSQL portable w instalatorze (większy rozmiar, ~300 MB).
