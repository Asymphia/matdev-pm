# Budżet — podział na 2 agentów (instrukcja dla Ciebie)

Dwa osobne agenty w Cursorze — **jeden tylko backend**, **jeden tylko frontend**.  
Nie dawaj jednemu agentowi obu repozytoriów w jednym zadaniu „zrób wszystko” — rozjadą się kontrakty API.

---

## Który plik komu

| Agent | Repozytorium / folder | Plik ze specyfikacją | Plik z promptem do wklejenia |
|-------|------------------------|------------------------|------------------------------|
| **Agent Backend** | `matdev-pm-backend` | `BUDGET_BACKEND_ZADANIA.md` | `PROMPT_AGENT_BUDZET_BACKEND.md` |
| **Agent Frontend** | `matdev-pm` | `FRONTEND_BUDGET_ZADANIA.md` | `PROMPT_AGENT_BUDZET_FRONTEND.md` |

---

## Kolejność uruchomienia

1. **Najpierw backend (Faza 1)** — front potrzebuje `POST` planu, DTO z `isOverBudget`, linii kategorii.
2. **Potem frontend (Faza 1)** — może zacząć szkielet tabów równolegle na mockach, ale integracja po merge API.
3. **Faza 2 (task + hajs)** — oboje po Fazie 1; backend pierwszy (`taskId` na wydatku).

---

## Co wkleić agentowi — skrót

Pełne prompty są w plikach `PROMPT_AGENT_BUDZET_*.md`. Poniżej wersja skrócona jeśli wolisz jedną wiadomość.

### Agent Backend — pierwsza wiadomość

```
Pracujesz WYŁĄCZNIE w repozytorium matdev-pm-backend.

Przeczytaj i wykonaj Fazę 1 z pliku BUDGET_BACKEND_ZADANIA.md (checkboxy).
Szczegóły promptu: PROMPT_AGENT_BUDZET_BACKEND.md

Cel: API budżetu pod osobną zakładkę Budget w frontendzie — create plan, uczciwe DTO (overspend),
BudgetPlanLine (alokacje kategorii), rozszerzone auto-warningi w ProjectRiskService, testy.

Nie zmieniaj frontendu. Po Fazie 1 wypisz listę endpointów + przykładowe JSON dla frontu.
```

### Agent Frontend — pierwsza wiadomość

```
Pracujesz WYŁĄCZNIE w repozytorium matdev-pm.

Przeczytaj i wykonaj Fazę 1 z pliku FRONTEND_BUDGET_ZADANIA.md (checkboxy).
Szczegóły promptu: PROMPT_AGENT_BUDZET_FRONTEND.md

Cel: osobna zakładka Budget per projekt (/projects/[slug]/budget), taby nawigacji,
empty state + pełny widok budżetu, integracja z API (gdy gotowe), panel alertów.

Nie zmieniaj backendu. Jeśli brakuje endpointu — opisz w komentarzu PR, nie obchodź na sztywno.
```

---

## Kontrakt między ziomkami (Faza 1)

Backend dostarcza → Front konsumuje:

| Endpoint | Body / response (skrót) |
|----------|-------------------------|
| `POST /api/project/{id}/budget` | `{ name, amount }` → `GetProjectBudgetDTO` |
| `GET/PUT .../budget` | plan + `utilizationPercent`, `isOverBudget`, `overAmount` |
| `GET/PUT .../budget/lines` | `[{ categoryId, allocatedAmount, alertThresholdPercent? }]` |
| `GET .../budget/categories` | już jest |
| `POST/PUT/DELETE .../expenditures` | jak dziś + PUT edycji |
| `GET .../risks` | auto: 80%, 100%, per kategoria |

---

## Faza 2 — oboje (po Fazie 1)

- **Backend:** `TaskID` na `BudgetExpenditure`, `EstimatedCost` na `Task`, alert zadanie vs szacunek.
- **Frontend:** sekcja **Costs** w `TaskViewClient`, wydatek z prefill `taskId`.

---

## Pliki tła / design

Nie są wymagane do Fazy 1. Jak masz mock — daj frontendowi ścieżkę do `public/images/...` w drugiej wiadomości.

---

## Po zakończeniu Fazy 1 — Twoja checklista

- [ ] Backend: `dotnet test` green, Swagger/opis JSON dla frontu
- [ ] Frontend: `npm run lint`, `npm run build` green
- [ ] Ręcznie: Docker + API + `npm run dev` → zakładka Budget działa na seed projekcie
