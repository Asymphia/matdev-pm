# Budżet + warningi — zadania dla frontendu

Dokument dla osoby od UI / Next.js.

| Plik | Po co |
|------|--------|
| **PROMPT_AGENT_BUDZET_FRONTEND.md** | Gotowy tekst do wklejenia w agenta Cursor |
| `matdev-pm-backend/BUDGET_BACKEND_ZADANIA.md` | Spec backendu (kontrakt API) |
| `BUDGET_PODZIAL_DLA_AGENTOW.md` | Instrukcja dla PM — kogo kiedy odpalać |

**Cel produktu:** **osobna zakładka Budget** w każdym projekcie (nie tylko widget na stronie głównej projektu), tworzenie planu, podział po kategoriach, wydatki, spójne kolory z alertami; opcjonalnie **pieniądze na zadaniu** (wydatki / szacunek).

---

## UX — układ nawigacji (must have)

### Zakładki projektu

Dziś: widok projektu to jedna strona z wykresem + tasks link. **Docelowo:**

```
/projects/[projectSlug]
  ├── Overview      (status, deadline, zespół, skrót budżetu)
  ├── Tasks         (istniejąca lista)
  ├── Budget        ← NOWA ZAKŁADKA (główny ekran budżetu)
  └── Warnings      (opcjonalnie osobna zakładka lub sekcja na Overview)
```

- [x] Layout projektu z **tab bar** (np. pod nagłówkiem projektu) — wspólny `ProjectTabs` w `app/projects/[projectSlug]/layout.tsx`
- [x] Route: `app/projects/[projectSlug]/budget/page.tsx`
- [x] Przenieś / rozbuduj logikę z `BudgetChart` → pełna strona `BudgetPageClient`
- [x] Na **Overview** zostaw mini-widget (donut + % + link „Open budget”)

**Nie wymaga plików tła od designu na start** — możesz użyć istniejących `BlockWrapper`, palety z `BudgetChart` (`PALETTE`, `FREE_COLOR`). Jeśli PM poda mocki / bg — wklej ścieżki do `public/` i podmień tło zakładki.

---

## Faza 1 — MVP zakładki (zacznij tu)

### 1.1 Brak planu → kreator

Gdy `GET budget` → 404 / `data: null`:

- [x] Ekran empty state: nazwa planu, kwota całkowita, przycisk **Create budget plan**
- [x] Wywołaj `POST /api/project/{id}/budget` (server action — czekaj na backend)
- [x] Po sukcesie — przejście do widoku głównego

### 1.2 Główny widok Budget (zakładka)

Sekcje (scroll lub grid):

1. **Nagłówek planu** — nazwa, suma planu, wydane, wolne, **pasek %** (jak `ProgressBar`: &lt;70 zielony, 70–99 żółty, ≥100 czerwony)
2. **Alokacje kategorii** — tabela: kategoria | zaplanowano | wydano | % | akcje
3. **Wykres** — donut (reuse `recharts` z `BudgetChart`)
4. **Lista wydatków** — filtrowanie po kategorii, sort po dacie
5. **Akcje:** Edytuj plan | Dodaj wydatek | Zarządzaj alokacjami

- [x] Typy w `lib/server/matdev-budget.ts` — rozszerz o `utilizationPercent`, `isOverBudget`, `overAmount`, `allocatedAmount` per kategoria
- [x] `app/actions/budget-mutations.ts` — `createBudgetPlan`, `updateBudgetLines`, `updateExpenditure`

### 1.3 Modal / formularze

| Formularz | Pola |
|-----------|------|
| Utwórz / edytuj plan | name, amount (PLN) |
| Alokacje (bulk) | wiersze: categoryId, allocatedAmount, alertThresholdPercent? |
| Dodaj wydatek | categoryId, amount, date, description, field |
| Edytuj wydatek | jak wyżej |

- [x] Pobieranie kategorii: istniejące `fetchBudgetCategories`
- [x] Walidacja po stronie klienta: amount &gt; 0, suma alokacji ≤ plan (jeśli backend tak ustawi)

### 1.4 Warnings — integracja (bez nowego modułu)

Istniejące: `WarningsList` + `GET /api/project/{id}/risks` (polling 5s).

- [x] Na zakładce Budget — panel **„Active alerts”** (top 3 auto związane z budżetem)
- [x] Link „See all warnings” → Overview lub zakładka Warnings
- [x] Nie pokazuj Resolve/Delete dla `isAutomatic` (już jest — zachowaj)
- [x] Po dodaniu wydatku: `router.refresh()` + odśwież risks (jak dziś)

Kolory alertów = te same progi co pasek budżetu (spójność z `ProgressBar`).

### 1.5 Lista projektów

`ProjectItem` już ma `ProgressBar` dla budżetu (`amountSpent/budget`).

- [x] Użyj `utilizationPercent` z API gdy backend doda do `GetProjectDTO` (opcjonalnie — fallback `calculateBudgetDiff`)
- [x] Przy overspend pokaż czerwony pasek nawet jeśli `freeBudget` był 0

### 1.6 Strona globalna `/budgets`

Dziś: placeholder `<div>Budgets Page</div>`.

- [x] Tabela wszystkich projektów z kolumnami: projekt | plan | % wykorzystania | over?
- [x] Wymaga backend: `GET /api/budget/overview` **lub** reuse `GET /api/project` (już ma `budgetAmount` / `budgetSpent`)
- [ ] Filtr: tylko over budget / &gt;80% (sort po % — filtr UI opcjonalny, nie zrobiony)

---

## Faza 2 — Pieniądze na zadaniu

**UX:** w widoku zadania (`TaskViewClient` / sidebar) sekcja **Costs**:

- [ ] Pole **Estimated cost** (editable → PATCH task API gdy backend doda)
- [ ] Lista wydatków przypisanych do tego `taskId`
- [ ] Przycisk „Add expense” — ten sam formularz co w budżecie projektu, z prefill `taskId`
- [ ] Pasek: spent vs estimated (ten sam komponent `ProgressBar`)

Na liście zadań (opcjonalnie): kolumna „Cost” lub ikona 💰 gdy `taskSpent &gt; 0`.

**Zasada dla usera:** kasa jest jedna (plan projektu), zadanie pokazuje **skąd poszły pieniądze** — nie osobna kopia budżetu.

---

## Faza 3 — Wiele planów (gdy backend gotowy)

- [ ] Selector planu (dropdown): „Plan 2026 Q1”, „Revision 2”
- [ ] Badge **Active** na aktywnym planie
- [ ] Tylko aktywny plan przyjmuje nowe wydatki (UI disabled na starych)

---

## Pliki do ruszenia / utworzenia

| Plik | Akcja |
|------|--------|
| `app/projects/[projectSlug]/layout.tsx` | **nowy** — taby projektu |
| `app/projects/[projectSlug]/budget/page.tsx` | **nowy** |
| `components/project/ProjectTabs.tsx` | **nowy** |
| `components/project/BudgetPageClient.tsx` | **nowy** (logika z `BudgetChart`) |
| `components/project/BudgetChart.tsx` | zostaw jako mini-widget na Overview |
| `components/project/BudgetPlanForm.tsx` | **nowy** |
| `components/project/BudgetLinesEditor.tsx` | **nowy** |
| `components/project/ExpenditureForm.tsx` | **nowy** |
| `lib/server/matdev-budget.ts` | typy + fetch |
| `app/actions/budget-mutations.ts` | nowe akcje |
| `components/project/SingleProjectPageClient.tsx` | usuń pełny wykres lub zostaw skrót |
| `app/budgets/page.tsx` | globalna lista |

---

## Zależności od backendu (blokery)

| Front chce | Backend musi dostarczyć |
|------------|-------------------------|
| Create plan | `POST .../budget` |
| Alokacje w UI | `GET/PUT .../budget/lines` |
| Czerwony overspend | `isOverBudget`, `overAmount` w DTO |
| Alert 80% | auto-risk w `GET .../risks` |
| Wydatek na zadaniu | `taskId` w `CreateExpenditureDTO` |
| Szacunek zadania | `estimatedCost` w task DTO |

Możecie pracować równolegle na mockach (typy + fake data w Storybook / dev flag) dopóki API nie jest gotowe.

---

## Kolejność PR (sugerowana)

1. `ProjectTabs` + route `/budget` + empty state (mock POST)  
2. Pełna strona budżetu podpięta pod prawdziwe API Fazy 1  
3. Edytor alokacji kategorii  
4. Panel alertów na Budget  
5. `/budgets` global  
6. Sekcja Costs w task view (Faza 2)

---

## Copy / etykiety (PL lub EN — jedna linia w projekcie)

- Zakładka: **Budget** / **Budżet**
- Empty: „Brak planu budżetowego dla tego projektu”
- CTA: „Utwórz plan”
- Alokacje: „Podział po kategoriach”
- Auto alert badge: już jest **Auto** w `WarningsList`

---

## Jeśli dostaniesz mocki (bg picture)

Wrzuć do `public/images/budget-tab-bg.webp` (lub co PM da) i w `BudgetPageClient` opcjonalnie:

```tsx
<div className="relative ...">
  <Image src="/images/budget-tab-bg.webp" fill className="object-cover opacity-10" alt="" />
  ...
</div>
```

Nie jest wymagane do pierwszego PR — layout na `BlockWrapper` wystarczy.
