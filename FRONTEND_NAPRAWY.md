# Frontend — naprawy (2026-06-03)

Przegląd i poprawki po audycie: `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Blokujące błędy TypeScript

### `app/projects/[projectSlug]/tasks/[taskSlug]/page.tsx`
- Nagłówek i `TaskViewClient` renderują się tylko gdy `taskView` jest dostępne.
- Przy błędzie API (`taskError`) wyświetlany jest baner błędu bez odwołań do `null`.

### `components/task/TasksPageHeader.tsx`
- `ProjectFormModal`: `onSaved` → `onCreated`, `editProject` → `initialProject`, dodano `mode="edit"` i `lookupsError`.
- Wzorzec zgodny z `SingleProjectPageClient.tsx`.

### `app/projects/[projectSlug]/tasks/page.tsx`
- Przekazywany `lookupsError` z `fetchProjectCreateLookups` do nagłówka zadań.

## ESLint — `react-hooks/set-state-in-effect`

### `hooks/useProjectLocalFields.ts` (nowy)
- Wspólna logika optymistycznego stanu statusu / deadline projektu.
- Synchronizacja z props w trakcie renderu (zalecany wzorzec React zamiast `useEffect`).

### `components/layout/ThemeProvider.tsx`
- Odczyt motywu przez `useSyncExternalStore` (localStorage + `prefers-color-scheme`).
- `useEffect` tylko do atrybutu `data-theme` na `<html>` (system zewnętrzny).

### `components/task/TaskFormModal.tsx`
- Reset `lookups` przy zmianie `isOpen` / `projectId` w renderze, bez `setState` w effectcie.
- Fetch w effectcie używa `loadProjectId` (zgodność z `react-hooks/exhaustive-deps`).

## ESLint — pozostałe

### `eslint.config.mjs`
- Ignorowany katalog `dist-electron/**` (skompilowany JS z `require()`).

### `app/layout.tsx`
- Usunięty nieużywany import `ThemeProvider` (provider nadal zakomentowany w JSX).

### `components/project/ProjectItem.tsx`
- Usunięty nieużywany import `TextIcon`.

### `components/task/TaskViewClient.tsx`
- Usunięte nieużywane `statusMenuItems`, `priorityMenuItems` (menu inline w JSX).
- Usunięty nieużywany prop `projectName`.

### `components/ui/Modal.tsx`
- `onClick && onClick()` → `onClick?.()`.

### `hooks/useTaskTree.ts`
- Ternary z wyrażeniem bez efektu → `if/else`.

### `lib/server/matdev-projects.ts`
- Usunięta nieużywana funkcja `mapUserList` (użytkownicy mapowani inline w `fetchProjectCreateLookups`).

## Bez zmian w tym commicie

- `.env.example` / `lib/matdev-api-env.ts` — zmiana `localhost` → `127.0.0.1` (lokalna konfiguracja Dockera, pozostawiona jak była).

## Weryfikacja po naprawach

```bash
npm run lint
npx tsc --noEmit
npm run build
```
