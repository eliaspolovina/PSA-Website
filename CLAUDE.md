# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Marketing site for **Polovina Scientific Advisory** — an independent scientific/financial
due-diligence firm that helps hedge funds and venture investors evaluate cell & gene therapy
(CGT) assets across three dimensions: clinical probability of success, technical feasibility, and
financial/commercial outlook. The audience is finance professionals, not scientists — copy and
design should stay accessible and jargon-light.

Built with **Astro 6** (static output) + **Tailwind CSS v4** (CSS-first config, no
`tailwind.config.js`). No React/Vue/etc. — pages are plain `.astro` files with a little inline
`<script>` where needed (e.g. the contact form's fetch handler).

`legacy/psa-website.html` is the original single-file static prototype this project replaced
(different positioning — advisory to CGT companies, not investors). It's kept only for reference;
it isn't part of the build.

## Commands

- `npm run dev` — start the dev server (default port 4321).
- `npm run build` — production build to `dist/`. Run this after non-trivial changes to catch
  Astro/TS errors before considering work done — there is no separate lint or test suite.
- `npm run preview` — serve the built `dist/` output locally.

There are no unit/e2e tests and no linter configured. The closest thing to CI verification is a
clean `npm run build`.

## Architecture

- **Routing**: file-based via `src/pages/*.astro` — `index.astro` (Home), `capabilities.astro`,
  `about.astro`, `contact.astro`. Adding a page is just adding a file; update the nav links in
  `src/components/Nav.astro` (and footer links in `Footer.astro`) to surface it.
- **Layout**: every page wraps content in `src/layouts/Layout.astro`, which owns the `<head>`
  (fonts, meta), the fixed ambient background (grid + glow orbs + noise, see below), and renders
  `<Nav />` / `<Footer />` around the page's `<slot />`.
- **Design tokens**: all colors, fonts, and the one shared shadow live in the `@theme` block at
  the top of `src/styles/global.css` as CSS custom properties (`--color-signal`, `--color-ink`,
  `--font-display`, etc.) per Tailwind v4's CSS-first theming. Reference them via Tailwind's
  arbitrary-value syntax, e.g. `text-[var(--color-signal)]`, rather than hardcoding hex values —
  this is the established pattern throughout every page/component.
- **Visual language ("deep navy fintech")**: dark navy/near-black background, a teal "signal"
  accent for primary actions/data-positive, amber for secondary data callouts, glass-panel cards
  (`.glass` / `.glass-hover` utility classes in `global.css`) with hairline borders, and a fixed
  full-page atmosphere layer (`field-grid` + `glow-orb` + `field-noise` in `Layout.astro`) sitting
  behind all content at `-z-10`. Keep new sections consistent with this rather than introducing
  flat solid backgrounds.
- **Type system**: three fonts loaded from Google Fonts in `Layout.astro` — Fraunces
  (`font-display`, serif headlines/quotes), Hanken Grotesk (`font-body`, default body text), and
  Martian Mono (`font-mono`, used for eyebrows/labels/buttons/nav/data readouts). Don't introduce
  a fourth font.
- **Entrance animation**: the `.rise` utility class (fade + slide up, `global.css`) is applied to
  above-the-fold elements, frequently combined with an inline `animation-delay` for staggering. If
  you're screenshotting/inspecting the site headlessly (e.g. via a headless-Chrome script), be
  aware a screenshot taken before the animation completes will show delayed elements as faint or
  missing — that's a capture-timing artifact, not a rendering bug. Verify by waiting it out or
  temporarily setting `.rise { animation: none; opacity: 1; }`.
- **Brand mark**: `src/components/Mark.astro` is a small inline SVG (helix-derived signal trace)
  used in the nav and footer, colored via the same CSS variables as everything else so it stays in
  sync with the theme. It's a placeholder mark, not a final logo — see open items below.
- **Contact form** (`src/pages/contact.astro`): a static HTML `<form>` posting to a Formspree
  endpoint, progressively enhanced with an inline `<script>` that intercepts submit, POSTs via
  `fetch` with `Accept: application/json`, and swaps in a `#form-success` panel on success (falls
  back to an inline error message pointing at a direct mailto). There is no backend/serverless code
  in this repo — Formspree is the entire "backend."

## Known open items (intentionally left as placeholders, not bugs)

- `FORMSPREE_ENDPOINT` in `contact.astro` is still `https://formspree.io/f/YOUR_FORM_ID` — the
  form will not deliver mail until this is replaced with a real endpoint created at formspree.io
  under `elias.polovina@polovinascientific.com`.
- `about.astro` has two italicized placeholder paragraphs (founding story, founder background)
  marked `[Add ...]` — these were left blank rather than fabricated because no real biographical
  facts about Elias Polovina/the firm's history were available when the page was written. Don't
  invent specifics (employers, schools, years, past clients) to fill these in; ask for real facts
  or leave the placeholder.
- The contact page intentionally omits a phone number/office address (none was supplied) — only
  email, response-time commitment, and NDA-availability are shown.
