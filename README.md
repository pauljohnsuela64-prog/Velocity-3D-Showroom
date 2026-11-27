# VELOCITY

VELOCITY is a cinematic 3D automotive showroom. Visitors will explore a vehicle under studio lighting, configure its appearance, and frame a photograph.

**Current phase · 2 — Visual design system.** The showroom has responsive editorial layouts, shared controls and a reserved surface for the future renderer.

## Run locally

Use Node 24.17.0 (see `.node-version`) and npm. Run `npm ci` to install the exact dependency tree from the lockfile, then run `npm run dev` and open the address Vite prints.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright starts a local preview of the production build. For manual acceptance, follow the [Phase 2 checklist](docs/testing.md#phase-2-manual-acceptance).

| To understand | Read |
| --- | --- |
| Audience, experience and priorities | [Project vision](docs/vision.md) |
| Delivery order and phase outcomes | [Roadmap](docs/roadmap.md) |
| Current evidence and pending decisions | [Progress](docs/progress.md) |
| Color, type, layout and controls | [Design system](docs/design-system.md) |
| Camera movement and scroll behavior | [Animation guidelines](docs/animation.md) |
| Planned stack and ownership | [Architecture](docs/architecture.md) |
| Permissions and credits | [Asset licenses](docs/asset-licenses.md) |
| Verification and acceptance | [Testing](docs/testing.md) |

Contributors start with [AGENTS.md](AGENTS.md). The repository includes an [MIT license](LICENSE). Record third-party asset terms individually before use.
