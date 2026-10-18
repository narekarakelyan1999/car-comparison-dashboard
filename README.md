# Car Comparison Dashboard

A Next.js app for browsing cars and comparing up to three of them side by side. The catalog includes price, brand, model, weight, rating, and specifications. Filters and sorting are stored in the URL. The cars you pick in the catalog stay in memory for that visit, and choosing them does not change the URL. Clicking Compare opens `/compare?ids=` with those cars. After that navigation finishes, the catalog selection is cleared, so the URL is the only selection from that point on. Adding a car on the comparison page uses a dialog, and adding or removing a car changes the URL. A reload, a direct link, and the browser’s back and forward buttons follow that URL. Going back to the catalog starts with no cars selected.

## Requirements

- Node.js 24.22.0 (see `.nvmrc`)
- pnpm 12

## Setup

```bash
nvm use
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The live demo is [https://car-comparison-dashboard-five.vercel.app](https://car-comparison-dashboard-five.vercel.app).

## Scripts

```bash
pnpm dev          # local development
pnpm lint         # ESLint
pnpm typecheck    # TypeScript
pnpm test         # Vitest once, with coverage
pnpm format       # write Prettier formatting
pnpm format:check # check Prettier formatting
pnpm build        # production build
pnpm start        # serve the production build
```

## Routes

- `/` is the catalog. Filter by brand, type, and price, then sort and paginate.
- `/compare?ids=toyota-camry,bmw-i4` is the side-by-side comparison in three columns. A car’s details show as soon as it is added. An empty column opens a dialog to add a catalog car. Only the next empty column is active; later columns stay disabled. Two cars are required before the catalog shows the Compare link.

Catalog query parameters are `brand`, `type`, `minPrice`, `maxPrice`, `sort`, and `page`. Page 1 and the default sort are omitted from the URL. An out-of-range page redirects to the nearest real page. The catalog URL does not store the cars selected for comparison.

The document head includes a description, author, category, and keywords for the catalog. Search engines index the default catalog and its later pages. Page 1 canonicalizes to `/`, and page 2 canonicalizes to `/?page=2`. Filtered and sorted URLs keep their own canonical and are marked `noindex`, so those combinations stay usable without being indexed. Structured data lists only the cars on that page, in the same order, and each image URL uses the public site origin.

The first three catalog cards use `priority` so the opening row is ready with the page. Later cards use `loading="lazy"`. Compare photos use the image optimizer and `priority` as well: a comparison has at most three pictures, and they sit at the top of that page. They are not `unoptimized`, because that would skip resizing and send the original file.

`cacheComponents` prerenders the static shell (layout, header, and font) so repeat visits reuse it. Catalog and compare results are not wrapped in `use cache`: both follow the query string, and the car list is already a static module in the server bundle.

Routes live in `src/app`. Catalog data, filtering, and sorting live in `src/features/catalog`. Comparison selection and the table live in `src/features/comparison`. Shared controls, including the dialog, live in `src/shared/ui`.

## Tests

```bash
pnpm test
```

Vitest covers filtering, sorting, pagination, query parsing, comparison limits, formatting, and the catalog and comparison screens. Test files live in each feature's `__tests__` folder. `pnpm test` fails if statement, branch, function, or line coverage falls below 80%.

## Environment

`NEXT_PUBLIC_SITE_URL` is the public origin used for metadata, canonical URLs, `robots.txt`, the sitemap, and catalog image URLs in structured data. Local development uses `http://localhost:3000`. A production build fails when that origin is missing, localhost, or not an absolute http(s) URL. On Vercel, the production host is used when this variable is not set.

Set it to the deployed origin before building for production:

```bash
NEXT_PUBLIC_SITE_URL=https://example.com pnpm build
```

## Continuous integration

GitHub Actions runs on every pull request and on every push to `main`. The `quality` check formats, lints, typechecks, tests with the coverage gate, and builds the app. A failed check means that commit is not ready to release.

## Deploy

Import this repository into Vercel and set `NEXT_PUBLIC_SITE_URL` to the production origin.

Production must wait for CI. In the Vercel project, open Deployment Checks, choose Add Checks, choose GitHub, and require **CI / quality**. Vercel can build the commit, but it does not assign that deployment to the production domain until `quality` succeeds. A failed format, lint, type, test, coverage, or build check leaves the current production release in place.

The live site is [https://car-comparison-dashboard-five.vercel.app](https://car-comparison-dashboard-five.vercel.app).
