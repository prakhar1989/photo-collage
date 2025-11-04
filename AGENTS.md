# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains all application code. Collage logic lives under `src/features/collage/` with subfolders for `components/`, `types.ts`, and shared helpers (e.g. `useCollageRenderer.ts`).
- Global styling is centralized in `src/index.css`. Tailwind configuration sits in `tailwind.config.js`. Static assets belong in `public/` or `src/assets/`.
- Build artifacts are emitted to `dist/` after running the production build.

## Build, Test, and Development Commands
- `pnpm dev` starts the Vite dev server with hot module replacement.
- `pnpm build` runs TypeScript project references then produces an optimized Vite build in `dist/`.
- `pnpm lint` executes ESLint across the project using the top-level `eslint.config.js`.

## Coding Style & Naming Conventions
- TypeScript + React with functional components is the standard. Prefer hooks over class components.
- Tailwind classes drive styling; keep utility classes concise and grouped logically.
- Use type-only imports (`import type`) when bringing in types to satisfy `verbatimModuleSyntax`.
- Favor descriptive camelCase names for variables/functions, PascalCase for components, and SCREAMING_SNAKE_CASE for immutable constants.

## Testing Guidelines
- Add tests with the framework introduced in future iterations (none configured yet). For now, keep modules pure and export helper functions to ease testing.
- Place component or hook tests alongside source files (`ComponentName.test.tsx`) or under a dedicated `__tests__/` directory once the tooling is added.
- Always ensure `pnpm build` passes before opening a pull request.

## Commit & Pull Request Guidelines
- Write commit messages in imperative mood (e.g., “Add mosaic layout preview”). Keep them scoped to a single change set.
- Pull requests should include: purpose summary, screenshots or GIFs for UI updates, and references to tracked issues when applicable.
- Validate linting/build locally and note any manual QA steps in the PR description.

## Architecture Overview
- Collage state is managed by `CollageProvider`, exposing a context consumed by control, upload, and preview components.
- Canvas rendering and export responsibilities are encapsulated in `useCollageRenderer`, which orchestrates high-quality scaling via `pica`.
