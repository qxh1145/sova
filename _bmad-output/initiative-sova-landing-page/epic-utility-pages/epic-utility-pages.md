---
type: epic
title: "FAQ, contact, legal and utility pages"
parent: initiative-sova-landing-page
covers: [CAP-10, CAP-11]
after: []
assignee: ""
risk: medium
---

# FAQ, contact, legal and utility pages

## Description

Delivers FAQ topics, contact with form and map, 10 legal pages, the company profile route, thank-you demo preview, sample page and the legacy login UI.

## Outcome

Every utility and content route works at UI level; signal: CAP-11 success check passes.

## Done when

1. FAQ tabs work by keyboard and share FAQ IDs with service FAQ; legal, sample and profile (route + shell + heading) render — deployed on Vercel staging.
2. The contact form shows demo states and keeps input on error; the thank-you page has a labelled demo preview; the contact map renders as the live iframe.
3. Login has fields, reveal and validation only, sends no credentials and grants nothing.
4. Baseline comparison screenshots for these routes are captured and differences logged.

## Boundaries

FAQ, contact, legal, profile, thank-you, sample, login routes. Not FlipbookViewer. CAP-10 part: contact form and thank-you. Can run in parallel with epic-home through epic-services-and-about; shares registry and mock-data files with them (solo owner, accepted). Spec Non-goals apply.

## References

- parent — _bmad-output/initiative-sova-landing-page/spec-public-ui-mock/spec-public-ui-mock.md, section Capabilities (CAP-10, CAP-11)
- constraint — the same spec, section Constraints
- plan — docs/MOCK_UI_PLAN.md, section Mock interaction contract
- decision — docs/ADMIN_CONTENT_MAP.md

## Notes

- Decision: contact map is the live iframe like the source, an exception to CAP-1's no-live-calls check (2026-10-03).
- Needs (initiative breakdown): epic-site-shell-and-primitives.
