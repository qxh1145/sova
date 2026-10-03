---
type: epic
title: "Service pages and About"
parent: initiative-sova-landing-page
covers: [CAP-9, CAP-10]
after: []
assignee: ""
risk: medium
---

# Service pages and About

## Description

Delivers the 8 service types × VI/EN as explicit page compositions in source section order, with pricing tables, FAQ, testimonials and project references, the website service form, and the About pages.

## Outcome

Every service and About page matches the source with all references resolving; signal: CAP-9 success check passes.

## Done when

1. All 16 service pages and About VI/EN render in source section order with no generic ServicePage and no invented tabs (A03/A04 decisions recorded) — deployed on Vercel staging.
2. Every pricing, FAQ, testimonial and project ID reference resolves; pricing tables are readable on mobile.
3. The website form validates with source required flags (phone optional) and shows the demo states.
4. Baseline comparison screenshots for service and About routes are captured and differences logged.

## Boundaries

Service and About routes. CAP-10 part: the website service form only. Spec Non-goals apply.

## References

- parent — _bmad-output/initiative-sova-landing-page/spec-public-ui-mock/spec-public-ui-mock.md, section Capabilities (CAP-9, CAP-10)
- constraint — the same spec, section Constraints
- decision — docs/COMPONENT_REUSE_MAP.md, anomalies A03/A04
- design — _bmad-output/initiative-sova-landing-page/spec-public-ui-mock/screen-component-tree.md, services and About

## Notes

- Needs (initiative breakdown): epic-site-shell-and-primitives, epic-home.
