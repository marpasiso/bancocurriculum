---
name: banco-curriculos-design-css
description: Use when creating, reviewing, or changing UI, CSS, layouts, forms, navigation, responsive behavior, visual states, or accessibility for the Banco de Curriculos MVP. Use for Next.js pages/components, src/app/globals.css, dashboard/admin screens, candidate/employer flows, and any request to improve the visual design without changing business rules.
---

# Banco Curriculos Design CSS

## Design Intent

Build a quiet operational interface for local MVP testing. Prioritize clarity, trust, fast scanning, and predictable forms over marketing polish.

## Core Rules

1. Keep UI code thin; never move business rules into pages or CSS decisions.
2. Prefer simple CSS in `src/app/globals.css` or small component classes.
3. Use restrained colors, clear typography, and consistent spacing.
4. Keep forms readable and mobile-friendly.
5. Make blocked, success, warning, and admin states visually distinct.
6. Preserve accessibility basics: labels, focus states, contrast, and semantic HTML.

## Visual System

- Use cards only for individual items, forms, and compact dashboard blocks.
- Keep border radius at 8px or less.
- Avoid decorative gradients, orbs, oversized heroes, and stock-like imagery.
- Avoid one-note palettes dominated by purple, dark slate, beige, brown, or orange.
- Prefer neutral surfaces, one primary action color, and semantic state colors.
- Use dense but calm layouts for admin/employer pages.
- Keep candidate/public pages straightforward and reassuring.

## References

Load only what matches the task:

- Forms and inputs: read `references/forms.md`.
- Layout, cards, navigation, and responsive rules: read `references/layout.md`.
- Colors, states, and accessibility: read `references/states-accessibility.md`.

## Validation

Before finishing UI work, check that:

- Text does not overflow buttons, cards, or nav.
- Mobile width remains usable.
- Employer/admin workflows still expose the needed controls.
- No sensitive data is added to list views.
- `npm run build` still passes when code changed.
