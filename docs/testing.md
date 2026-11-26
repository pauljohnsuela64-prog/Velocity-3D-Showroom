# Testing and acceptance

For Phase 0, inspect the branch and working tree, check relative Markdown links, compare the 14 ordered roadmap rows to the approved scope and check every changed file for whitespace errors. Include untracked documents in the checks. Record results in [progress](progress.md).

For executable phases, run the production build, TypeScript checks and relevant Vitest and Playwright suites locally. Add regression coverage for new behavior in the phase that introduces it. Exercise the real browser entry point. Mirror local checks in GitHub Actions when available. Record commands, results and failures.

| When introduced | Automated evidence | Manual evidence |
| --- | --- | --- |
| Shell and controls | Browser smoke test and keyboard navigation | Phone and desktop layout, zoom, focus order and screen reader labels |
| Viewer and motion | Fallback on renderer failure, skip and reduced-motion paths | Camera interruption, reversed scrolling, lighting and GPU frame time on a named device |
| Configuration and collection | Valid selections, material mapping and model switch | Visible finish matches text and stale selections clear |
| Photography and release | Export completes and published smoke test passes | Inspect downloaded image, credits and capture permissions |

For each phase, an independent reviewer checks the actual diff and acceptance evidence. Resolve findings and rerun affected checks. A human exercises the phase demonstration, records a dated pass or failure and authorizes the next phase separately. Keep failed or unavailable checks visible. Publication requires explicit human direction.

## Phase 0 manual acceptance

- Open README links and confirm the documents describe the intended showroom.
- Compare all roadmap rows with the approved sequence and review dependency timing.
- Inspect Git status on the setup branch for documentation-only changes.
- Confirm the empty asset register, accessible fallback, reduced-motion path and human publication controls.
- Record the human decision and any requested revisions in progress.
