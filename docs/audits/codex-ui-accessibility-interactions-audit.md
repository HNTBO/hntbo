# UI Accessibility and Interaction Audit

The UI has a solid visual baseline and generally good semantic structure, but several interactive controls are missing state semantics required by assistive technologies. The most important issue is the mobile navigation toggle lacking ARIA state synchronization. Filters and motion behavior also need accessibility upgrades.

Conducted February 21, 2026.

---

## Findings by Severity

### CRITICAL

None.

### HIGH

#### H1. Mobile menu toggle does not expose expanded/collapsed state (`src/components/Header.astro:67`, `src/components/Header.astro:79`, `src/components/Header.astro:114`) — Confidence: High
- Code snippet showing the problem:
```astro
<button id="mobile-menu-btn" aria-label="Toggle menu">
...
<div id="mobile-menu" class="md:hidden hidden ...">
...
menu?.classList.toggle('hidden');
```
- **Reproduction:**
  1. Open site on mobile viewport.
  2. Use a screen reader and focus the menu button.
  3. Activate the button; menu visibility changes, but there is no `aria-expanded` state change announced.
- Explanation of what's wrong and why it matters:
  - Screen-reader users cannot reliably determine whether navigation is open or closed.
- **Recommendation:**
  - Add `aria-controls="mobile-menu"` and toggle `aria-expanded` on click.
  - Optionally manage focus when opening/closing the menu.

### MEDIUM

#### M1. Tag filter buttons lack pressed-state semantics (`src/pages/tools/index.astro:28`, `src/pages/tools/index.astro:124`, `src/pages/tutos/index.astro:28`, `src/pages/tutos/index.astro:123`) — Confidence: High
- Code snippet showing the problem:
```astro
<button class="tag filter-btn active" data-filter="all">All</button>
...
btn.classList.add('active');
```
- Explanation of what's wrong and why it matters:
  - Active state is conveyed visually by class styling only; assistive tech does not get the selected filter state.
- **Recommendation:**
  - Use `aria-pressed` for toggle-style controls or switch to a radiogroup/tablist semantic pattern.

#### M2. Animated logo ignores reduced-motion preference (`src/components/AnimatedLogo.astro:131`, `src/components/AnimatedLogo.astro:146`) — Confidence: High
- Code snippet showing the problem:
```ts
setTimeout(() => showReveal(reveal, rot), delay);
setTimeout(runCycle, 15000);
```
- Explanation of what's wrong and why it matters:
  - Continuous timed animation runs regardless of user `prefers-reduced-motion` settings.
- **Recommendation:**
  - Gate animation with `window.matchMedia('(prefers-reduced-motion: reduce)')`.
  - Provide a static non-animated fallback.

### LOW

#### L1. Mobile menu interaction is click-only; no Escape/outside-close affordance (`src/components/Header.astro:110`) — Confidence: High
- Code snippet showing the problem:
```ts
btn?.addEventListener('click', () => {
  menu?.classList.toggle('hidden');
});
```
- Explanation of what's wrong and why it matters:
  - Keyboard and assistive users may have a less predictable close path when focus moves.
- **Recommendation:**
  - Add Escape key handling and optional outside click close behavior.

---

## Recommended Fix Plan

1. Implement ARIA-expanded + ARIA-controls on mobile nav toggle (H1)  
Affected files: `src/components/Header.astro`  
Effort: 20-40 min

2. Add semantic state attributes for content filters (M1)  
Affected files: `src/pages/tools/index.astro`, `src/pages/tutos/index.astro`  
Effort: 30-60 min

3. Respect reduced-motion preference in animated logo (M2)  
Affected files: `src/components/AnimatedLogo.astro`  
Effort: 20-40 min

4. Improve mobile menu close ergonomics (L1)  
Affected files: `src/components/Header.astro`  
Effort: 15-30 min

### What NOT to Change

- Keep existing descriptive `aria-label` values on social/footer icon links.
- Keep meaningful `alt` text usage for card imagery and key images.
- Keep semantic heading hierarchy and sectioning in content pages.
- Keep clear visual focus/hover contrast in existing theme palette.
- Keep simple filter interaction model (client-side class toggle); upgrade semantics without overcomplicating UX.

---

## Summary Table

| Priority | Item | Confidence | Files Affected | Effort |
|----------|------|:----------:|----------------|--------|
| High | H1: Mobile menu lacks ARIA state sync | High | `src/components/Header.astro` | 20-40 min |
| Medium | M1: Filter controls lack semantic selected state | High | `src/pages/tools/index.astro`, `src/pages/tutos/index.astro` | 30-60 min |
| Medium | M2: Animated logo ignores reduced-motion preference | High | `src/components/AnimatedLogo.astro` | 20-40 min |
| Low | L1: Mobile menu lacks Escape/outside-close interaction | High | `src/components/Header.astro` | 15-30 min |
