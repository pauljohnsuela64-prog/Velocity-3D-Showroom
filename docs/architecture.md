# Planned architecture

| First need | Responsibility |
| --- | --- |
| Phase 1 · React, TypeScript, Vite, Tailwind | Render the semantic page shell and build static files with basic color tokens. ESLint and TypeScript check source. Vitest and React Testing Library verify shell markup, and Playwright exercises the production build in Chromium. GitHub Actions runs the same checks after authorized publication. |
| Phase 2 · Visual design system | Extend the Tailwind foundation with shared design tokens, component states and responsive patterns. |
| Phase 3 · Three.js, React Three Fiber, Drei | Three.js draws the scene. React Three Fiber connects it to React. Use Drei helpers where a scene requirement calls for one. |
| Phases 4–5 · GSAP | Own the cinematic timeline and scroll choreography. |
| Phase 7 · Zustand | Share durable selections between controls, scene and summary when configuration spans those consumers. |
| Phase 13 · Vercel | Serve the approved static build after verifying hosting terms and deployment triggers. |

Keep model IDs, option definitions and allowed combinations in vehicle data. A control changes a selected option ID. The summary reads the selection and the scene maps it to a material. Keep transient camera positions and frame updates inside the scene to avoid rerendering the interface every frame.

Lazy-load the viewer behind a readable HTML shell. Preserve a licensed still and textual options for loading errors and unavailable WebGL. Measure frame time, draw calls, texture memory and initial download on a named device. Cap rendering resolution, reduce shadows and pause idle rendering as measurements warrant. Release obsolete geometry, textures and materials when switching vehicles.
