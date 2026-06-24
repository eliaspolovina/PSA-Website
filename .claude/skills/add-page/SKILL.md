---
name: add-page
description: Scaffold a new Astro page on the Polovina Scientific site with the correct Layout wrapper, section structure, and nav/footer wiring. Use when asked to add a new page or top-level route.
---

Scaffold a new page for the Polovina Scientific Astro site. Follow these steps in order.

## 0. Pre-check route collisions

- Confirm `src/pages/<slug>.astro` does not already exist.
- If it exists, treat the task as an edit/refactor request, not scaffolding.

## 1. Confirm the slug and title

Ask (or infer from context):
- URL slug (e.g. `insights` → `src/pages/insights.astro`, accessible at `/insights`)
- Page `<title>` string (used in Layout's `title` prop)
- Whether it needs a nav link or should be unlisted (e.g. a legal/privacy page)

## 2. Create the page file

Use `src/pages/about.astro` or `src/pages/capabilities.astro` as the reference model — not
`index.astro` (the home page has a more complex hero that isn't reusable as a scaffold).

Minimum structure:
```astro
---
import Layout from "../layouts/Layout.astro";
---
<Layout title="Page Title">
  <!-- HERO / PAGE HEADER -->
  <section class="px-6 lg:px-10 pt-16 pb-14 lg:pt-20 border-b border-[var(--color-hairline)]">
    <div class="mx-auto max-w-[1200px]">
      <div class="eyebrow mb-4"><span class="kicker-line"></span>Section Label</div>
      <h1 class="font-display text-[clamp(2.1rem,3.4vw,3rem)] text-[var(--color-ink)] leading-[1.15]">
        Page headline
      </h1>
    </div>
  </section>

  <!-- BODY SECTIONS -->
  <section class="px-6 lg:px-10 py-20">
    <div class="mx-auto max-w-[1200px]">
      <!-- content here -->
    </div>
  </section>
</Layout>
```

Key conventions:
- All color references use `var(--color-*)` tokens — no hardcoded hex.
- Section headings: `font-display`, body copy: default (Hanken Grotesk), labels/eyebrows: `font-mono uppercase tracking-[...]`.
- Card surfaces use `class="glass"` (+ `glass-hover` for interactive cards).
- Horizontal padding: `px-6 lg:px-10`. Inner max-width: `max-w-[1200px] mx-auto`.
- Vertical section rhythm: `py-20` or `py-24`.
- Dividers between sections: `<div class="divider mx-6 lg:mx-10 border-t border-[var(--color-hairline)]"></div>`

## 3. Wire the nav (if the page should appear in navigation)

Open `src/components/Nav.astro`. Add an entry to the `links` array:
```ts
const links = [
  { href: "/", label: "Home" },
  { href: "/capabilities", label: "Capabilities" },
  { href: "/about", label: "About" },
  { href: "/your-new-slug", label: "Your Label" },  // ← add here
];
```
The `isActive` logic uses `path.startsWith(href)` (with a `/` guard), so it will auto-highlight
correctly for nested routes under the same slug.

## 4. Wire the footer

Open `src/components/Footer.astro`. Add an `<li>` to the Navigate column:
```html
<li><a href="/your-new-slug" class="text-[13.5px] text-[var(--color-ink-dim)] hover:text-[var(--color-signal)] transition-colors">Your Label</a></li>
```

## 5. Verify

Run `npm run build` and confirm the new route appears in the generated routes list with no errors:
```
├─ /your-new-slug/index.html
```

## Definition of done

- New route file exists and renders inside `Layout`.
- Nav/Footer are wired only if the page is intended to be publicly listed.
- The page uses existing PSA spacing, token, and typography conventions.
- Build succeeds with the new route present in output.
