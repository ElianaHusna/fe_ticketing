<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# fe_ticketing (Next.js 16.2.12 + React 19, App Router)

Helpdesk/ticketing frontend. UI copy is Indonesian (Bahasa Indonesia) — keep new UI text in Indonesian.

## Commands
- `npm run dev` — dev server at http://localhost:3000
- `npm run build` / `npm run start` — production build/run
- `npm run lint` — eslint (flat config in `eslint.config.mjs`)
- No test or typecheck script exists.

## Routing & structure gotchas
- Routes live in `app/<route>/page.tsx`; shared UI in `components/`; path alias `@/*` → repo root.
- Links are currently inconsistent — do not "fix" them blindly:
  - `app/page.tsx` redirects to `/submit-ticket`, but the real route is `app/submit-ticketing/` (currently a 404).
  - Sidebar links `/submit-ticket` and `/guide` (no such route); success page links `/submit-ticket`; `components/page.tsx` links `/submit`.
  - `succes` (`app/succes/`) is intentionally misspelled.
- The App Router root layout is `app/layout.tsx`. `components/Layout.tsx` is legacy/dead code (imports `./globals.css`, which does not exist there) — do not import it.
- Pages do not use a shared route-group layout. Each page composes its own shell: `<Sidebar />` + `<main className="ml-64 flex-1">` + `<Navbar />`. Follow this pattern for new pages.
- `components/page.tsx` and `components/StatCard.tsx` are unused leftovers.

## Conventions
- `Sidebar.tsx` / `Navbar.tsx` are `"use client"`; icons come from `lucide-react`.
- Tailwind v4 via `@tailwindcss/postcss`: no `tailwind.config`; global styles and theme live in `app/globals.css` (`@import "tailwindcss"` + `@theme`).
- Repo is mid-refactor: `app/dashboard` and `app/login` were deleted, and `README.md` still holds unresolved merge-conflict markers — leave README alone unless asked.
