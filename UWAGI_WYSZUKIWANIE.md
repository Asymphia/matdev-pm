# Audyt wyszukiwania — frontend (2026-06-03)

## Moduły z paskiem wyszukiwania (`SearchBar`)

| Moduł | Plik | Sposób działania | Ocena |
|-------|------|------------------|-------|
| Projekty | `ProjectsPageClient.tsx` | Filtrowanie po stronie klienta na liście z `/api/project` | Działa |
| Użytkownicy | `UsersPageClient.tsx` | Filtrowanie po stronie klienta na liście z `/api/user` | Działa |
| Zadania (lista projektu) | `TaskContent.tsx` | Filtrowanie po stronie klienta na zadaniach z task-list | Działa po poprawkach |

## Moduły bez wyszukiwania w UI

- **Tagi projektu** (`project-tags`) — brak `SearchBar`
- **Kategorie zadań** (`task-categories`) — brak `SearchBar`
- **Budżety** — strona placeholder
- **Widok pojedynczego projektu** (`SingleProjectPageClient`) — lista zadań bez wyszukiwania (tylko na `/projects/{id}/tasks`)

Backend ma endpointy `GET /api/.../search/{phrase}` (project, user, topic, workpackage, issuetype, taskcategory), ale **frontend ich nie używa** — wszystko jest filtrowane lokalnie na już pobranych danych.

---

## Projekty — szczegóły

**Pola wyszukiwania:** nazwa, opis, topic, issue type, workpackage, status (wyświetlany), osoby (responsible/support).

**Filtr statusu (przyciski TODO / IN PROGRESS / CLOSED):** porównuje znormalizowaną nazwę statusu z API (`rawStatusName`), nie pole `status` z mapowania — poprawne po `enrichProjectWithLookups`.

**Uwaga:** priorytet projektu nie jest uwzględniony w wyszukiwaniu tekstowym.

---

## Użytkownicy — szczegóły

**Pola:** imię, nazwisko, pełne imię, email, telefon.

Działa zgodnie z oczekiwaniami przy pełnej liście użytkowników z API.

---

## Zadania — szczegóły i naprawione problemy

### Naprawione w tej sesji

1. **Limit 100 zadań** — frontend wysyłał `pageSize=500`, backend obcina do max 100. Przy >100 zadaniach reszta nie trafiała do wyszukiwania.  
   **Fix:** `fetchMatdevTasksForProject` pobiera wszystkie strony (po 100) aż do `totalCount`.

2. **Opis zadania** — `mapApiTaskToTaskType` ustawiał `description: ""`, więc wyszukiwanie po opisie nigdy nie działało.  
   **Fix:** pole `Description` w `GetProjectTaskListItemDTO` (backend) + mapowanie w `matdev-project-map.ts`.

3. **Milestone** — dodane dopasowanie słowa „milestone” (i fragmentów) dla zadań oznaczonych jako kamień milowy.

### Ograniczenia (bez zmiany)

- **Podzadania (subtasks)** — endpoint `task-list` zwraca tylko zadania najwyższego poziomu (`ParentID == null`). Podzadania nie są w tablicy `tasks`, więc **nie da się ich wyszukać** na liście bez osobnego ładowania (`/subtasks`).
- **Wyszukiwanie serwerowe** — API obsługuje parametr `?search=` na task-list, ale frontend go nie przekazuje; przy bardzo dużych projektach sensowne byłoby debounced search po API zamiast ładowania wszystkich stron.
- **Dashboard projektu** — skrócona lista zadań bez paska wyszukiwania (to zamierzone UX).

---

## Filtr statusu zadań

`TaskContent` filtruje `task.status === currentFilter` przy wartościach `"To do" | "In progress" | "Completed"` — zgodne z `PROJECT_STATUS_OPTIONS` i `mapTaskStatus` z API.

---

## Weryfikacja

1. Uruchom backend + frontend.
2. `/projects` — wpisz fragment nazwy/topicu.
3. `/users` — wpisz email lub nazwisko.
4. `/projects/{id}/tasks` — wpisz nazwę/opis/kategorię zadania; przy >100 zadaniach sprawdź zadanie z końca listy.
