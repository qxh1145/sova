---
type: initiative
title: "Sova landing page"
parent: none
covers: [CAP-1, CAP-2, CAP-3, CAP-4, CAP-5, CAP-6, CAP-7, CAP-8, CAP-9, CAP-10, CAP-11, CAP-12, CAP-13, CAP-14]
after: []
assignee: ""
risk: high
---

# Sova landing page

## Description

Phase A: replace the `../eras-clone` WordPress mirror with a Next.js public site branded **Sova**, keeping the source layout, CSS, motion and URLs, running entirely on typed mock data so the owner can accept the UI before a backend is chosen. The spec owns the capabilities, constraints and non-goals.

## Outcome

The project owner can review every kept VI/EN route of the Sova site on Vercel staging without any backend — the spec's success signal.

## Done when

1. A reviewer clones the repo on a machine with no secrets, builds it, and browses every kept VI/EN route on Vercel staging.
2. Filter, search and every form work in demo mode, labelled as demo; editing one mock record changes every place it is used.
3. A grep of the build output finds no `Eras`, `eras-`, `erasvietnam` outside the recorded exception list.
4. Every difference against the captured source baseline is classified source-missing / accepted / regression, with no open regression.
5. The phase B handoff lists the anomaly register, mock scenarios, unbuilt phase B work and release brand gates.

## Boundaries

Capability boundary along MOCK_UI_PLAN's build order; one owner, one repo, one Vercel deployment. Not phase B, the 16 Digital Media/Recruitment routes, FlipbookViewer, analytics, redesign — see the spec's Non-goals. Every epic delivers VI and EN for its routes. Tracer path: scaffold → content layer → shell → Home on staging.

- Touch point: `../eras-clone` — read-only source for baseline, data and asset import, comparison; owner: epic-platform-and-content-layer
- Touch point: Vercel — project and indexed staging; owner: epic-platform-and-content-layer

## References

- spec — _bmad-output/initiative-sova-landing-page/spec-public-ui-mock/spec-public-ui-mock.md
- constraint — the same spec, section Constraints
- plan — docs/MOCK_UI_PLAN.md (build order), docs/MIGRATION_PLAN.md (phase checklists)

## Notes

- Decision: EN uses the source slug registry — no `/en` prefix on VI slugs, no invented translations; epic-platform-and-content-layer owns it in the route registry, every page epic follows it (2026-10-03).
- Decision: anomaly register A01–A13 is created by epic-platform-and-content-layer; each epic records the decision for anomalies on its own routes before fixing them (A01 → epic-home, A03/A04 → epic-services-and-about); epic-fidelity-and-handoff consolidates (2026-10-03).
- Decision: each page epic captures baseline comparison screenshots for its routes; epic-fidelity-and-handoff runs the cross-route sweep and classifies (2026-10-03).
- Decision: epic-platform-and-content-layer owns the content schema and brand term map; a later epic may add or correct the mock records it consumes through that map (2026-10-03).
- Decision: nav links to routes not yet built return 404 on staging until their epic lands; epic-fidelity-and-handoff's crawl gates the final state (2026-10-03).
- Decision: contact map renders as the live map iframe like the source; recorded as an exception to CAP-1's no-live-calls network check (2026-10-03).
- Decision: opening split into platform/content layer and shell/primitives epics, on the tree check's size finding (2026-10-03).
- Parked: phase B, Digital Media/Recruitment routes, FlipbookViewer, analytics, release gates (404/410 policy, eras→sova slugs, testimonial rights) — spec Non-goals; listed in the handoff.
