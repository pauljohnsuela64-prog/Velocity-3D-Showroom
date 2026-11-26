# Planned architecture

| First need | Responsibility |
| --- | --- |
| Phase 1 · React, TypeScript, Vite | Render the semantic page shell, type its data and build static files. Introduce Vitest for behavior and Playwright for a browser smoke test. GitHub Actions will run the verified local checks when a human authorizes publication. |
| Phase 2 · Tailwind | Express shared design tokens and responsive layout in the interface. |
| Phase 3 · Three.js, React Three Fiber, Drei | Three.js draws the scene. React Three Fiber connects it to React. Use Drei helpers where a scene requirement calls for one. |
| Phases 4–5 · GSAP | Own the cinematic timeline and scroll choreography. |
| Phase 7 · Zustand | Share durable selections between controls, scene and summary when configuration spans those consumers. |
| Phase 13 · Vercel | Serve the approved static build after verifying hosting terms and deployment triggers. |

Keep model IDs, option definitions and allowed combinations in vehicle data. A control changes a selected option ID. The summary reads the selection and the scene maps it to a material. Keep transient camera positions and frame updates inside the scene to avoid rerendering the interface every frame.

Lazy-load the viewer behind a readable HTML shell. Preserve a licensed still and textual options for loading errors and unavailable WebGL. Measure frame time, draw calls, texture memory and initial download on a named device. Cap rendering resolution, reduce shadows and pause idle rendering as measurements warrant. Release obsolete geometry, textures and materials when switching vehicles.
