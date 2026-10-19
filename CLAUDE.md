@AGENTS.md

# Vườn nhà mình (cham_soc_cay)

Plant and fish-tank care app for one household in Huế. Client-only: no backend, no auth yet. UI text is Vietnamese; keep new copy in Vietnamese with full diacritics.

## Commands

- `npm run dev` – dev server on http://localhost:3000
- `npm run lint` – ESLint (includes React Compiler rules; must be clean)
- `npm run build` – production build; run it before committing, it catches prerender errors lint misses

## Architecture

- **Data** (`src/lib/data.ts`): types `Item` (plant or tank), `Task` (recurring, `everyDays` + `lastDone`), `Log` (journal, optional `ph`/`temp`). `SPECIES` holds each species' image, default tasks and guide text. `addItem()` creates an item plus its default tasks.
- **Store** (`src/lib/store.ts`): whole `Db` in `localStorage` key `cham_soc_cay_v1`. Read with `useDb()`, write only through `update(fn)` (it clones, persists and notifies). First load seeds sample data with `seedDb()`.
- **Photos** (`src/lib/photos.ts`): Blobs in IndexedDB via idb-keyval; `Item.photos` holds `"photo:<uuid>"` ids, never base64. Display with `<PhotoImg>` (falls back to the species image) or `usePhotoUrl()`. Legacy `data:` URLs are migrated on load.
- **Weather** (`src/lib/weather.ts`): Open-Meteo for fixed Huế coordinates, cached 1h in localStorage. Thresholds `RAIN_SKIP_MM`, `HOT_DAY_C` drive watering hints on the home page.
- **Tết** (`src/lib/tet.ts`): hard-coded Tết dates table; extend it when years run out. Leaf picking is suggested `LEAF_PICK_DAYS_BEFORE` (28) days before Tết.
- Pages: `/` (today), `/cay` and `/ho-ca` (both use `ItemList`/`ItemDetail`), `/cam-nang` and `/cam-nang/[slug]` (static, from `SPECIES`).

## Conventions and gotchas

- **Dates**: always local `yyyy-mm-dd` via `isoDate()` / `todayStr()` from `data.ts`. Never `toISOString()` (UTC shifts the day before 7am in Vietnam). Display with `fmtDate()`.
- **Client hooks need Suspense**: components using `useParams`/`usePathname` must be wrapped in `<Suspense>` (see `cay/[id]/page.tsx`, `layout.tsx`), or the build fails with a blocking-prerender error.
- **React Compiler lint**: no `Date.now()` directly in render (use helpers in `data.ts`); don't pick a component into a variable during render (`const Icon = fn()` then `<Icon/>` can fail `static-components`; use `createElement(fn(), props)` as in `WeatherCard.tsx`); no setState in effects – external sources use `useSyncExternalStore` (see `store.ts`, `photos.ts`, `weather.ts`).
- **Styling**: Tailwind 4 with tokens in `src/app/globals.css` (`brand`, `brand-dark`, `brand-soft`, `accent`, `accent-soft`, `line`, `muted`, `shadow-soft`, `shadow-lift`). Variables in `@theme inline` are not emitted as CSS variables, so plain CSS must reference the source variable (e.g. `var(--font-fraunces)`), not `var(--font-display)`.
- **Look**: rounded-3xl cards, `border-line`, `shadow-soft`, Fraunces headings, lucide icons (no emoji in UI). Task icons come from `taskIcon(label)` in `components/icons.tsx`.
- **Charts**: one measure per chart (no dual axis); see `LogChart.tsx` for the pattern (safe band, 2px line, hover tooltip).
- **Images**: species photos in `public/images/` are Wikimedia Commons files; any new one needs an entry in `src/lib/credits.json` (rendered in the footer).
- Changing the shape of stored data: add optional fields only, or migrate inside `load()` in `store.ts`; users have real data in localStorage.
