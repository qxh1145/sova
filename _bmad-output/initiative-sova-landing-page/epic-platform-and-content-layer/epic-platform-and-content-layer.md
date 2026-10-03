---
type: epic
title: "Platform and content layer"
parent: initiative-sova-landing-page
covers: [CAP-1, CAP-2, CAP-3, CAP-12]
after: []
assignee: ""
risk: medium
---

# Platform and content layer

## Description

Stands up the Next.js app per TECH_STACK with CI and Vercel staging, captures the source baseline, copies the asset allowlist and ports the CSS with system-font tokens, and builds the typed content contracts, async mock repository and query layer with the full source dataset imported through one Eras→Sova brand term map. Owns the route registry every page epic plugs into.

## Outcome

Every later epic builds pages on one typed, single-source content layer and route registry; signal: CAP-1 and CAP-3 success checks pass.

## Done when

1. On a clean machine with no `.env`, `npm run build`, `lint`, `typecheck` and `test` pass, and the app is deployed to Vercel staging.
2. Copied assets under `public/wp-content/uploads/` match source byte hashes; `../eras-clone` hash is unchanged.
3. Changing a FAQ, pricing, phone or hero record in mock data changes every query result that uses it; no business text in components.
4. The route registry lists every kept route with trailing slash, resolves aliases without loops, 404s unknown slugs, blocks reserved root slugs, and contains none of the 16 excluded routes.
5. Imported records carry Sova via the brand term map with `SourceRef`; SiteSettings holds name, wordmark logo and clearly fake placeholder contacts.

## Boundaries

Platform and data boundary: no page UI, no shell. Owns the shared decisions every epic adopts: content contracts, repository/query layer, route registry (incl. EN slug rule), brand term map, SiteSettings, CSS tokens and breakpoints 550/850, scenario fixtures, anomaly register. Spec Non-goals apply.

## References

- parent — _bmad-output/initiative-sova-landing-page/spec-public-ui-mock/spec-public-ui-mock.md, section Capabilities (CAP-1, CAP-2, CAP-3, CAP-12)
- constraint — the same spec, section Constraints
- constraint — docs/TECH_STACK.md
- decision — docs/DATA_MODEL.md
- decision — docs/ROUTE_MAP.md
- decision — docs/ASSET_MAP.md, docs/STYLE_AUDIT.md
- decision — docs/MIGRATION_PLAN.md, section Quyết định đã chốt — 03/10/2026
