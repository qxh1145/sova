---
type: epic
title: "Home vertical slice"
parent: initiative-sova-landing-page
covers: [CAP-6]
after: []
assignee: ""
risk: medium
---

# Home vertical slice

## Description

Delivers `/` and `/en/home` with every source section in order, proving UI → query → mock end to end. Owns the shared ProjectCard, PostCard, Testimonials and Partners that later epics reuse.

## Outcome

The owner sees a complete, data-driven Home matching the source; signal: CAP-6 success check passes.

## Done when

1. Home VI/EN render all source sections in order including Stats (A01, decision recorded), deployed on Vercel staging.
2. Typewriter is CSS-only and not cut at any STYLE_AUDIT breakpoint; FeaturedProjects pins/scrubs from ordered project IDs.
3. Testimonials autoplay at 6000ms; latest posts show 3/2/1 cards by breakpoint.
4. Baseline comparison screenshots for Home are captured and differences logged.

## Boundaries

Home routes only. Owns shared cards/sections first used here; collection templates are epic-collections'. Spec Non-goals apply.

## References

- parent — _bmad-output/initiative-sova-landing-page/spec-public-ui-mock/spec-public-ui-mock.md, section Capabilities (CAP-6)
- constraint — the same spec, section Constraints
- design — _bmad-output/initiative-sova-landing-page/spec-public-ui-mock/screen-component-tree.md, Home
- decision — docs/COMPONENT_REUSE_MAP.md, anomaly A01

## Notes

- Needs (initiative breakdown): epic-platform-and-content-layer, epic-site-shell-and-primitives.
