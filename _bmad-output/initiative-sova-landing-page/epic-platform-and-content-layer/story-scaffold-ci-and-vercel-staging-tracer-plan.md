---
title: 'Scaffold, CI and Vercel staging tracer'
type: 'chore'
ticket: '1'
created: '2026-10-03'
status: 'built'
baseline_revision: '0d17f993401a1299ca0e85e3f57737160fbd71b0'
route: 'full'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - '{project-root}/docs/TECH_STACK.md'
  - '{project-root}/docs/PROPOSED_FOLDER_STRUCTURE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The repo has only docs; there is no app, toolchain, CI, or deploy target. Later epics need one proven path, from typed contract to rendered page, to build on.

**Approach:** Scaffold Next.js 16 + React 19 + TS strict with the TECH_STACK scripts, Vitest, a Playwright smoke test behind a shared network guard, and GitHub Actions CI. Prove the layers connect by rendering `SiteSettings.companyName` ("Sova") on `/` through contract → mock adapter → query `getSiteSettings`.

## Boundaries & Constraints

**Always:** Pin exact current stable versions (next/eslint-config-next 16.3.x, react/react-dom 19.3.x) in one `package-lock.json`. Use `trailingSlash: true`. Use Server Components only. The page calls the query, never the fixture. The network guard is shared via one Playwright fixture that 1.2 and the page epics import. The Google Maps embed allowlist is recorded in that fixture. CI uses Node 24. The build passes with no `.env`. **Decision (2026-10-03): the app lives in `frontend/`.** `backend/` stays reserved for phase B. Paths in PROPOSED_FOLDER_STRUCTURE are relative to `frontend/`, Vercel Root Directory = `frontend`, and CI runs with `working-directory: frontend`.

**Never:** Tailwind, shadcn, `next/font`, webfonts, create-next-app demo assets/CSS, Radix/GSAP/Embla/RHF/Zod (installed later by their consumers), MSW/DB/CMS SDKs, a `src/app/layout.tsx` above the route groups, SiteShell/header/footer UI, writes to `../eras-clone`, and committing Vercel/GitHub secrets.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Tracer render | GET `/` | HTML `lang="vi"`, visible text "Sova" from mock SiteSettings | No error expected |
| Query | `getSiteSettings('vi')` | Resolves the mock record; `companyName === 'Sova'` | No error expected |
| Guard: allowed | Request to localhost or an allowlisted Maps embed host | Passes | — |
| Guard: blocked | Request to any other external host (erasvietnam, wp-json/wp-admin, GA/GTM, Meta, TikTok, …) | Test fails, naming the URL | Fail-closed: external = blocked unless allowlisted |

</frozen-after-approval>

## Code Map

- `docs/TECH_STACK.md` -- authoritative package groups and script names. Core plus dev group only.
- `docs/PROPOSED_FOLDER_STRUCTURE.md` -- target paths, all under `frontend/`: `src/app/(site)/(vi)/layout.tsx`, `src/lib/repositories/{contracts,mock,index}.ts`, `src/lib/queries/site.ts`, `src/data/site.ts`, `src/types/`. No top-level app layout.
- `docs/DATA_MODEL.md:14-25,150-154` -- `Locale`, `EntityId`, `LinkModel` and `SiteSettings` shapes to copy verbatim. `:265` lists `getSiteSettings(locale)` as a query.
- `.gitignore` (root) and `frontend/.gitignore` -- both already ignore `.next/`, `node_modules/`, `test-results/`, `playwright-report/`, `.env*` and `.vercel/`. Reuse them and add nothing. Leave `backend/` (only its `.gitignore`) untouched.
- Repo state: no git remote, local Node 22.18 / npm 10.9. The person creates the GitHub repo and the Vercel project (ticket `unknown`, hitl).

## Tasks & Acceptance

**Execution:**
- [ ] `frontend/{package.json,package-lock.json}`, `.nvmrc` (24, repo root) -- deps and scripts `dev, build, start, lint (eslint .), typecheck (tsc --noEmit), format (prettier --write .), test (vitest run), test:e2e (playwright test)` -- the TECH_STACK command contract.
- [ ] `frontend/{tsconfig.json,next.config.ts,eslint.config.mjs,.prettierrc,.prettierignore,vitest.config.ts,playwright.config.ts}` -- strict TS with `@/*` alias; `trailingSlash: true`; next + prettier lint config; Playwright `webServer` runs `next start` on the production build, Chromium only.
- [ ] `frontend/src/types/content.ts` -- `Locale`, `EntityId`, `LinkModel` and `SiteSettings` per DATA_MODEL -- contract types that 1.3 extends.
- [ ] `frontend/src/lib/repositories/contracts.ts`, `mock.ts`, `index.ts` -- `ContentRepository { getSiteSettings(locale): Promise<SiteSettings> }`, a mock adapter over `src/data/site.ts`, and an exported active repository.
- [ ] `frontend/src/data/site.ts` -- record with `companyName: 'Sova'` and clearly fake placeholder contacts (e.g. `example.com` email, a `0000…` phone) -- no Eras values.
- [ ] `frontend/src/lib/queries/site.ts` -- `getSiteSettings(locale)` delegates to the repository.
- [ ] `frontend/src/app/(site)/(vi)/layout.tsx`, `page.tsx` -- minimal root layout (`<html lang="vi">`) and a page that awaits the query and renders `companyName`.
- [ ] `frontend/src/lib/queries/site.test.ts` -- Vitest: the query returns "Sova".
- [ ] `frontend/tests/e2e/fixtures.ts`, `tests/e2e/smoke.spec.ts` -- shared `test` fixture with the network guard and `MAPS_EMBED_ALLOWLIST`. The smoke test visits `/` and expects "Sova", with the guard active.
- [ ] `.github/workflows/ci.yml` -- on push/PR, `defaults.run.working-directory: frontend`: Node 24 with npm cache (`cache-dependency-path: frontend/package-lock.json`), `npm ci`, lint, typecheck, `prettier --check .`, test, build, install Playwright Chromium, test:e2e.
- [ ] `README.md` (root) -- replace "no app yet" status with `cd frontend` + the scripts and the HITL steps to link GitHub and Vercel.

**Acceptance Criteria:**
- Given a fresh clone with no `.env`, when `npm ci` then each of `lint`, `typecheck`, `test`, `build` and `test:e2e` runs, then all exit 0.
- Given the guard fixture, when a spec triggers a request to a non-allowlisted external host, then the test fails and names the URL.
- Given the person pushes to GitHub and links Vercel, when CI and the deploy finish, then CI is green and the staging URL shows "Sova".

## Design Notes

The guard is fail-closed: it blocks every non-local host except the allowlist. That is simpler than a blocklist, and it covers the eras/WordPress/tracking cases without maintaining domain lists. A wrapper `test` comes from `fixtures.ts` and registers `page.route('**/*')` (or `context.on('request')`) to record violations and asserts on teardown, so all specs inherit it by importing `test` from there.

Risk: with no top-level layout, Next may complain about `/_not-found`. If the build fails, add the minimal fix that Next 16 documents for multiple root layouts (e.g. `global-not-found`), and log it in Implementation Notes.

## Implementation Notes

- Versions held below latest: TypeScript 6.0.3 (typescript-eslint needs <6.1) and eslint 9.39.5 (eslint-plugin-react supports ≤9). `npm audit` shows 5 dev-only highs via eslint-config-next → fast-glob/micromatch; not force-fixed.
- `next build` rewrites `tsconfig.json` (forces `incremental: true`, reformats). Deviation from "add nothing" to ignores: added `*.tsbuildinfo` to `frontend/.gitignore` and `tsconfig.json` to `.prettierignore` so post-build `prettier --check` and `git status` stay clean.
- Matrix guard rows covered by `tests/e2e/guard.spec.ts`: `isAllowedUrl` allow/block cases plus a `test.fail()` page test proving the fixture fails a test that requests a blocked host.
- `MAPS_EMBED_ALLOWLIST` allows all of `www.google.com`; narrow to Maps paths when the contact map lands if stricter is wanted.
- Local verification ran on Node 22.18; CI targets 24.

## Plan Change Log

## Review Triage Log

| Finding | Verdict | Route | Evidence |
|---|---|---|---|
| `frontend/next-env.d.ts` tracked; `next dev` rewrites its imports to `.next/dev/types` | medium | patch | Reproduced by reviewer on fresh copy; fixed by ignoring it and `typecheck` = `next typegen && tsc --noEmit`. |
| `prettier --check .` in `frontend/` fails on `.omc/` tool state | low | patch | `.omc/` only ignored at repo root; added to `frontend/.prettierignore`. |
| `guard.spec.ts` `test.fail()` passes on any failure, not proving the URL is named | low | patch | Fixture now yields `blocked`; new test asserts it equals the gtm.js URL. |

## Verification

**Commands:**
- (in `frontend/`) `npm ci && npm run lint && npm run typecheck && npx prettier --check . && npm test && npm run build` -- expected: all exit 0
- (in `frontend/`) `npx playwright install chromium && npm run test:e2e` -- expected: smoke passes
- `git -C ../eras-clone status --porcelain` (from repo root) -- expected: same output as before the work (source untouched)

**Manual checks (HITL):**
- The person creates the GitHub repo and pushes, then checks Actions for green. They create and link the Vercel project with Root Directory `frontend`, and the staging URL shows "Sova".
