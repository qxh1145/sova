---
type: epic
title: "Fidelity sweep and phase B handoff"
parent: initiative-sova-landing-page
covers: [CAP-13, CAP-14]
after: []
assignee: ""
risk: medium
---

# Fidelity sweep and phase B handoff

## Description

Runs the cross-route responsive and motion sweep, the final route crawl and brand grep, classifies every baseline difference, and writes the phase B handoff.

## Outcome

The owner can accept phase A and start phase B; signal: CAP-13 and CAP-14 success checks pass, and the initiative's Done when holds.

## Done when

1. Comparison screenshots exist at 390/549/550/768/849/850/1280/1440 (+575/1199/1380 for marquee) for every route family; each difference is classified source-missing / accepted / regression.
2. No horizontal overflow outside intentional scrollers; listeners are cleaned up on navigation.
3. A crawl of the route registry on Vercel staging returns 200 for every kept route; a grep of build output finds no Eras outside the recorded exception list (CAP-2, CAP-12 final check).
4. The handoff document lists the anomaly register, mock scenarios, phase B work and release brand gates.

## Boundaries

Verification and documentation across all routes; fixes it finds that are page work go back to the owning epic as bugs. Spec Non-goals apply.

## References

- parent — _bmad-output/initiative-sova-landing-page/spec-public-ui-mock/spec-public-ui-mock.md, section Capabilities (CAP-13, CAP-14)
- constraint — the same spec, section Constraints
- plan — docs/MIGRATION_PLAN.md, phases 10–11 and Baseline và fidelity protocol

## Notes

- Needs (initiative breakdown): epic-home, epic-collections, epic-services-and-about, epic-utility-pages.
