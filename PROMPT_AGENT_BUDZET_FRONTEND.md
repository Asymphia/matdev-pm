# Prompt dla agenta — FRONTEND (budżet)

Skopiuj **cały blok** poniżej jako pierwszą wiadomość w nowym agencie Cursor z workspace **matdev-pm**.

---

```
Jesteś agentem frontendu w projekcie matdev-pm (Next.js App Router, Server Actions, matdevFetch).

## Zadanie
Zaimplementuj Fazę 1 budżetu według pliku FRONTEND_BUDGET_ZADANIA.md w katalogu głównym repozytorium.
Przeczytaj ten plik w całości przed kodowaniem.

## Cel biznesowy
Osobna zakładka Budget dla każdego projektu (nie tylko widget na stronie projektu):
- nawigacja tabami: Overview | Tasks | Budget | (Warnings opcjonalnie),
- route: app/projects/[projectSlug]/budget/page.tsx,
- empty state gdy brak planu → formularz "Utwórz plan" (POST /api/project/{id}/budget),
- pełny widok: pasek % budżetu, alokacje kategorii, wykres (reuse BudgetChart), lista wydatków, modale,
- panel skróconych alertów budżetowych (GET risks, isAutomatic — bez resolve na auto),
- na Overview zostaw mini-widget budżetu z linkiem do zakładki.

## Czego NIE robisz w tej iteracji
- Nie zmieniasz matdev-pm-backend.
- Nie implementujesz Fazy 3 (selector wielu planów) bez gotowego API.
- Faza 2 (sekcja Costs w widoku zadania) — osobny PR po Fazie 1 i po taskId w API.

## API (oczekiwane od backendu — mockuj tymczasowo jeśli brak)
- POST/GET/PUT .../api/project/{projectId}/budget
- GET/PUT .../budget/lines
- POST/PUT/DELETE .../expenditures
- GET .../risks (już jest)

Typy rozszerz w lib/server/matdev-budget.ts: utilizationPercent, isOverBudget, overAmount, allocatedAmount per kategoria.
Akcje w app/actions/budget-mutations.ts.

## Wymagania techniczne
- Server Actions + matdevFetch (jak reszta projektu).
- Kolory paska budżetu jak ProgressBar: <70 primary, 70-99 warning, >=100 error.
- npm run lint + npm run build muszą przejść.
- Minimalny diff — nie refaktoruj niepowiązanych stron.

## Definition of done (Faza 1)
1. Wchodząc w projekt widać taby i zakładkę Budget.
2. Projekt bez planu pokazuje CTA utworzenia (działa gdy API postawione).
3. Projekt z planem (seed) pokazuje pełny widok.
4. Wszystkie checkboxy Fazy 1 w FRONTEND_BUDGET_ZADANIA.md zrobione lub opisane blokery.

## Istniejące pliki do reuse
- components/project/BudgetChart.tsx
- components/project/WarningsList.tsx
- components/project/ProgressBar.tsx
- app/actions/budget-mutations.ts
- lib/server/matdev-budget.ts

Zacznij od: struktura app/projects/[projectSlug]/layout.tsx + budget/page.tsx.
```

---

## Druga wiadomość (gdy backend wrzuci API)

```
Backend gotowy. Endpointy:
[wklej tabelę od ziomka od backendu]

Podłącz prawdziwe API zamiast mocków. Zaktualizuj typy w matdev-budget.ts.
Przetestuj create plan + lines + expenditure na projekcie z seed.
```

---

## Trzecia wiadomość (Faza 2 — task + hajs)

```
Zrób Fazę 2 z FRONTEND_BUDGET_ZADANIA.md:
sekcja Costs w TaskViewClient — estimated cost, lista wydatków taskId, dodaj wydatek z prefill.
API: [wklej kontrakt od backendu].
```

---

## Wiadomość z plikiem tła (opcjonalnie)

```
Dodaj tło zakładki Budget: obraz w public/images/budget-tab-bg.webp (załączam / ścieżka: ...).
Opacity ~10%, nie psuj czytelności tabel.
```

---

Szczegółowa lista zadań: **FRONTEND_BUDGET_ZADANIA.md**  
Podział dla Ciebie (PM): **BUDGET_PODZIAL_DLA_AGENTOW.md**
