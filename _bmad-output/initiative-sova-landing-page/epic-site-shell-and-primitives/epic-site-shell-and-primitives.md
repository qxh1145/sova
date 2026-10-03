---
type: epic
title: "Site shell and UI primitives"
parent: initiative-sova-landing-page
covers: [CAP-5, CAP-10]
after: []
assignee: ""
risk: medium
---

# Site shell and UI primitives

## Description

Renders the shared shell once for every VI/EN marketing page — header, footer, mobile menu, consult popup with its form, floating contacts, mobile contact bar, cursor — and the UI primitives later epics compose: Button, Container, SectionHeading, FormField, Accordion, Tabs, Dialog, Pagination, FAQ list, and the Carousel adapter over Embla with the required prototype. Owns the form SubmitAdapter and deterministic mock transport.

## Outcome

Every page epic drops content into a working shell with keyboard-accessible primitives and demo-mode forms; signal: CAP-5 success check passes.

## Done when

1. Playwright confirms header sticky 90→70px, menu and popup open/close by keyboard and Escape, focus returns, scroll locks — deployed on Vercel staging.
2. Logo, name and contacts in every shell part read from SiteSettings; editing SiteSettings changes all of them.
3. The consult popup form shows idle/submitting/demo-success/demo-error, labels demo results “Bản demo — chưa gửi thông tin”, and keeps input on error.
4. The Embla carousel adapter prototype covers testimonials, project gallery and mobile pricing before any page uses it.
5. Nav contains no Digital Media/Recruitment route; no primitive imports mock data.

## Boundaries

Shell and primitive boundary: no page sections. CAP-10 part: SubmitAdapter/SubmitResult.mode, mock transport and the consult form; website and contact forms belong to their page epics. Spec Non-goals apply.

## References

- parent — _bmad-output/initiative-sova-landing-page/spec-public-ui-mock/spec-public-ui-mock.md, section Capabilities (CAP-5, CAP-10)
- constraint — the same spec, section Constraints
- decision — docs/CLIENT_BOUNDARIES.md
- decision — docs/COMPONENT_MAP.md, docs/COMPONENT_REUSE_MAP.md
- plan — docs/MOCK_UI_PLAN.md, section Mock interaction contract

## Notes

- Waits on epic-platform-and-content-layer because: the shell reads SiteSettings, navigation and the registry.
- Needs (initiative breakdown): epic-platform-and-content-layer.
