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

## Phase 1 manual acceptance

1. Check out `feat/phase-1-foundation`. With Node 24.17.0, run `npm ci`, then `npm run dev` and open the printed URL.
2. Confirm the browser tab title is “VELOCITY | Automotive Showroom”. Check that the main heading and introduction are readable against the dark background.
3. Press Tab on a fresh load. Confirm “Skip to content” is visible with a champagne focus outline. Press Enter and confirm focus moves to the main landmark.
4. Try a desktop viewport and a 320 px viewport. At 200% zoom, confirm the text stays readable and the page has no horizontal scrolling. In the accessibility tree or a screen reader, verify the banner, main landmark and single level-one heading.
5. Run the verification commands in the [README](../README.md). Record the date, browser, viewport and any failures in [progress](progress.md).

## Phase 2 manual acceptance

1. Run `npm ci` and `npm run dev`, then open the printed URL.
2. View the page at 320, 768, 1024, 1440 and 1920 px. Check that the wordmark and navigation wrap cleanly, the studio panel changes from stacked to side by side at 1024 px, and the headline clears the panel. Repeat at 200% browser zoom.
3. Tab from a fresh load. Activate the skip link, then test both navigation links and both call-to-action links. Confirm visible focus and that each link takes focus to its destination.
4. Enable reduced motion and verify that hover and focus feedback remains visible without transitions. Check text and control boundaries on the dark surfaces.
5. Run the README verification commands. Record the browser, sizes, date and result in [progress](progress.md).

## Phase 3 manual acceptance

1. Run the build and open the local preview. On a cold reload, inspect the stage as it loads. Confirm the final vehicle has readable wheels, paint highlights, glass and a contact shadow.
2. Resize between a 320 px phone layout and a large desktop. Check that the whole vehicle stays inside the stage and the skip link, studio navigation and vehicle credits work with the keyboard.
3. In browser developer tools, block the vehicle GLB request and reload with cache disabled. Confirm the still image and status appear, then unblock and reload to recover.
4. Disable WebGL in a separate browser session and reload. Check that the shell and credits remain usable. With WebGL enabled, use the browser's WebGL context-loss extension to simulate a lost context and check the still view.
5. With the vehicle settled and the viewport unchanged, inspect a performance trace for idle rendering. Record the browser, GPU, viewport and observations in progress.

## Phase 4 manual acceptance

1. Build and preview locally. Reload at desktop and phone widths. Watch the type settle while the model loads, then check the camera and reflections on the real vehicle.
2. Reload with network throttling. Navigate to The studio before the vehicle arrives. Confirm navigation works immediately and the delayed vehicle settles without a reveal.
3. Reload, activate Skip reveal with a keyboard, and compare the endpoint with natural completion. Resize during the move and check all four corners of the vehicle stay in frame.
4. Reload with reduced motion, then try switching the preference during a normal reveal. Confirm a static inspection pose and visible controls.
5. Exercise the Phase 3 failure checks and inspect a performance trace after completion. Record the device, browser and decision in progress.
