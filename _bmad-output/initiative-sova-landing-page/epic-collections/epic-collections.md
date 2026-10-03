---
type: epic
title: "Projects and blog collections"
parent: initiative-sova-landing-page
covers: [CAP-4, CAP-7, CAP-8]
after: []
assignee: ""
risk: medium
---

# Projects and blog collections

## Description

Delivers project listing, category and 62 detail pages, and blog listing, categories, pagination and 27 posts with a rich-content adapter and search, all driven by data so a new record needs no page file.

## Outcome

Viewers filter projects and browse/search the blog, and the owner can add a record without code; signal: CAP-4, CAP-7, CAP-8 success checks pass.

## Done when

1. Project listing shows 6 per page, resets to page 1 on filter change, and categories website/branding/mobile-app count 59/2/1 — deployed on Vercel staging.
2. Loading, empty and error scenarios for projects are previewable via fixture.
3. `/goc-nhin/page/2–5/` and category pagination keep source order and counts; all 27 posts render content and media; search matches title/excerpt/body of published posts.
4. Adding a valid mock project or post makes detail, listing, category and related work with no new page file; a slug colliding with a reserved root path is rejected.
5. Baseline comparison screenshots for collection routes are captured and differences logged.

## Boundaries

Project and post routes. Projects and blog share the dynamic-collection pattern and one owner, so they are one epic. Spec Non-goals apply.

## References

- parent — _bmad-output/initiative-sova-landing-page/spec-public-ui-mock/spec-public-ui-mock.md, section Capabilities (CAP-4, CAP-7, CAP-8)
- constraint — the same spec, section Constraints
- decision — docs/ROUTE_MAP.md, projects and blog
- decision — docs/DATA_MODEL.md

## Notes

- Needs (initiative breakdown): epic-site-shell-and-primitives, epic-home.
