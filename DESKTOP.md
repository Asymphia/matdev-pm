# MatDev PM — aplikacja desktopowa (Windows)

Aplikacja działa jak zwykły program: **pobierz instalator → zainstaluj → ikona na pulpicie → działa**. Bez Dockera u klienta.

Składa się z:
- **Electron** — okno aplikacji
- **Next.js** — interfejs (w tle)
- **matdev.API** — backend .NET (w tle)
- **PostgreSQL** — wbudowana baza (w instalatorze, port `55432`, dane w `%APPDATA%`)

---

## Dla klienta — jeden plik `.exe`

1. Pobierz **`MatDev-PM-Setup-x.exe`**
2. Zainstaluj (skrót na pulpicie)
3. Uruchom **MatDev PM**

Przy **pierwszym starcie** aplikacja sama:
- inicjalizuje bazę w folderze użytkownika,
- uruchamia PostgreSQL, API i interfejs,
- ładuje dane demo (projekt **BW-2026 Turbo Housing Validation**).

**Nie trzeba:** Docker Desktop, osobnego Postgresa, terminala.

Instalator ma ok. **400–500 MB** (UI + API + PostgreSQL).

---

## Budowa instalatora (developer)

**Wymagania:** Windows, Node.js 20+, .NET SDK 10, backend obok frontendu (`../matdev-pm-backend`).

```powershell
cd matdev-pm
npm install
npm run build:desktop
```

Skrypt:
1. Pobiera PostgreSQL Windows (jednorazowo, cache w `desktop-resources/postgres/`)
2. Publikuje API (`dotnet publish`)
3. Buduje Next.js standalone
4. Pakuje Electron + NSIS

Wynik: **`release/MatDev-PM-Setup-0.1.0.exe`**

---

## Dev na co dzień (Docker)

Do programowania nadal wygodniej Docker + hot reload:

```powershell
# Terminal 1
cd matdev-pm-backend
docker compose up -d

# Terminal 2
cd matdev-pm
npm run dev:web          # tylko przeglądarka
# lub
npm run start:desktop    # Docker + Electron
```

---

## Co jest w instalatorze

| Element | Gdzie po instalacji |
|---------|---------------------|
| Electron | `C:\Program Files\MatDev PM\` |
| API (.NET) | `resources\api\` |
| UI (Next) | `resources\next\` |
| PostgreSQL | `resources\postgres\` |
| Baza użytkownika | `%APPDATA%\matdev-pm\pgdata` |
| Uploady lab | `%APPDATA%\matdev-pm\uploads` |

---

## Rozwiązywanie problemów

| Problem | Rozwiązanie |
|---------|-------------|
| Długi pierwszy start | Normalne — init bazy trwa ok. 30–60 s |
| Timeout API | Uruchom ponownie; sprawdź antywirus (nie blokuj `postgres.exe` / `matdev.API.exe`) |
| Port 55432 zajęty | Zamknij inną instancję MatDev PM |
| Dev: brak API | `docker compose up -d` w backendzie |

---

## Skróty npm

| Komenda | Opis |
|---------|------|
| `npm run dev` | Dev: Next + Electron (API w Docker) |
| `npm run dev:web` | Tylko przeglądarka (localhost:3000) |
| `npm run start:desktop` | Docker + Next + Electron (dev) |
| `npm run build:desktop` | Pełny instalator Windows (all-in-one) |
| `npm run dist` | To samo co `build:desktop` |

---

## GitHub Release

Do klienta wrzucasz **tylko** plik `.exe` z folderu `release/` — nie commituj go do repo.
