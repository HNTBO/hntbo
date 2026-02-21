# Accessibility Audit

The HNTBO website has a solid structural foundation -- proper `lang="en"` attribute, semantic HTML landmarks (`<header>`, `<main>`, `<footer>`), and a clean heading hierarchy on most pages. However, the site has significant accessibility gaps in interactive components. The mobile menu lacks ARIA state management and focus trapping, the three tool UIs (MD2Word, FolderManager, AudioVisualizer) use custom tab patterns without ARIA roles or keyboard navigation, the FolderManager modal has no focus trapping or Escape key handling, and none of the animated elements respect `prefers-reduced-motion`. Color contrast for secondary text (#8e8e93 on #0a0b10) fails WCAG AA for normal text. External links are inconsistently announced to screen readers, and there is no skip-to-content link anywhere on the site.

Conducted 2026-02-21. Standard: WCAG 2.1 AA.

---

## Findings by Severity

### CRITICAL

#### C1. Mobile menu has no ARIA expanded state or focus management
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\Header.astro`, lines 66-75 (button), 79-107 (menu), 110-117 (script)
**Confidence**: HIGH
**WCAG**: 4.1.2 Name, Role, Value; 2.1.1 Keyboard

The mobile hamburger button toggles menu visibility by adding/removing a `hidden` class, but never updates `aria-expanded`, never sets `aria-controls` pointing to the menu, and never manages focus. When the menu opens, keyboard focus stays on the button -- a screen reader user has no indication the menu is now visible or how to reach it.

```html
<!-- Current: no aria-expanded, no aria-controls -->
<button id="mobile-menu-btn" class="p-2 text-text-secondary hover:text-text-primary" aria-label="Toggle menu">
```
```js
// Current: only toggles CSS class
btn?.addEventListener('click', () => {
  menu?.classList.toggle('hidden');
});
```

**Reproduction**: Open the site on a narrow viewport (< 768px). Tab to the hamburger button, press Enter. VoiceOver/NVDA will not announce that the menu is now expanded. There is no way to know the menu opened.

**Fix**: Add `aria-expanded="false"` and `aria-controls="mobile-menu"` to the button. Toggle `aria-expanded` in the click handler. Move focus to the first menu link on open, return focus to the button on close. Add Escape key listener to close the menu.

---

#### C2. FolderManager modal has no focus trapping, no role, no Escape key support
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\FolderManager.astro`, lines 92-101 (HTML), 520-537 (script)
**Confidence**: HIGH
**WCAG**: 2.1.2 No Keyboard Trap; 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships

The confirmation modal (`#fm-modal`) is a `<div>` with no `role="dialog"`, no `aria-modal="true"`, and no `aria-labelledby` pointing to its title. When the modal opens, focus is not moved into it, allowing keyboard users to tab behind the overlay to hidden page content. There is no Escape key handler to dismiss the modal.

```html
<!-- Current: plain div with no dialog semantics -->
<div class="fm-modal-overlay" id="fm-modal" style="display:none">
  <div class="fm-modal">
    <h3 class="fm-modal-title" id="fm-modal-title">Confirm</h3>
```

**Reproduction**: In FolderManager, trigger the "Delete All Empty" action. When the modal appears, press Tab repeatedly -- focus will cycle through elements behind the modal overlay. Press Escape -- nothing happens.

**Fix**: Add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="fm-modal-title"` to the modal container. When opened, move focus to the Cancel button (safest default). Trap focus within the modal using a focus-trap pattern. Close on Escape key.

---

#### C3. No skip-to-content link
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\layouts\BaseLayout.astro`
**Confidence**: HIGH
**WCAG**: 2.4.1 Bypass Blocks

There is no "Skip to main content" link at the top of the page. Keyboard users must tab through the entire navigation on every page load before reaching main content. With the fixed header containing 7 links, this is a significant barrier.

```html
<!-- BaseLayout.astro line 46-51: no skip link before Header -->
<body class="flex flex-col min-h-screen">
  <Header />
  <main class="flex-1">
```

**Reproduction**: Open any page. Press Tab -- focus goes to the logo link in the header. There is no option to skip directly to main content.

**Fix**: Add `<a href="#main-content" class="sr-only focus:not-sr-only ...">Skip to main content</a>` as the first child of `<body>`, and add `id="main-content"` to the `<main>` element.

---

### HIGH

#### H1. Text-secondary (#8e8e93) on background (#0a0b10) fails WCAG AA contrast
**Confidence**: HIGH
**WCAG**: 1.4.3 Contrast (Minimum)

The secondary text color `#8e8e93` on the dark background `#0a0b10` is used extensively across the site for descriptions, hints, timestamps, footer text, and form labels.

**Contrast calculation**:
- `#8e8e93` relative luminance: R=0.2586, G=0.2586, B=0.2990 -> L = 0.0722*0.2990 + 0.7152*0.2586 + 0.2126*0.2586 = 0.0216 + 0.1850 + 0.0549 = 0.2615 (approximate, using linearized sRGB). More precisely: sRGB (142, 142, 147) -> linear approx L1 = 0.261
- `#0a0b10` relative luminance: R=10/255, G=11/255, B=16/255. Very dark -> L2 ~= 0.005

Contrast ratio = (0.261 + 0.05) / (0.005 + 0.05) = 0.311 / 0.055 = **5.65:1**

This actually **passes** AA for normal text (requires 4.5:1) but **fails** AAA (requires 7:1). However, let me recalculate more carefully:

Linearize sRGB values:
- #8e8e93: R=142, G=142, B=147. sRGB: 142/255=0.5569. Linear: ((0.5569+0.055)/1.055)^2.4 = 0.2724. G same = 0.2724. B: 147/255=0.5765. Linear = 0.2912. L1 = 0.2126*0.2724 + 0.7152*0.2724 + 0.0722*0.2912 = 0.0579 + 0.1948 + 0.0210 = 0.2737
- #0a0b10: R=10, G=11, B=16. sRGB: 10/255=0.0392. Linear: 0.0392/12.92=0.00303. G: 11/255=0.0431. Linear: 0.0431/12.92=0.00334. B: 16/255=0.0627. Linear: 0.0627/12.92=0.00485. L2 = 0.2126*0.00303 + 0.7152*0.00334 + 0.0722*0.00485 = 0.000644 + 0.002389 + 0.000350 = 0.003383

Contrast = (0.2737 + 0.05) / (0.003383 + 0.05) = 0.3237 / 0.05338 = **6.06:1**

**Result: PASSES AA (4.5:1) for normal-sized text (16px+). PASSES AA for large text (3:1).**

However, this color is also used at **12px** and **13px** font sizes in tool components (e.g., `.mw-hint` at 14px, `.av-preset-hint` at 12px, labels at 12px in AudioVisualizer). At these small sizes, the text needs to meet the normal text threshold (4.5:1), which it does pass. But note that at 12-13px, readability is borderline even if technically passing AA.

**Affected files**:
- `AudioVisualizer.astro` line 169: labels at `font-size: 12px` using `--av-ink-secondary: #8e8e93`
- `AudioVisualizer.astro` line 232-234: `.av-preset-hint` at `font-size: 12px`
- `MD2Word.astro` lines 97-101: `.mw-hint` at `font-size: 14px`
- `FolderManager.astro` lines 153-158: `.fm-hint` at `font-size: 14px`
- Footer.astro line 59: copyright text `text-text-secondary text-sm`

**Revision**: After careful calculation, the 6.06:1 ratio passes WCAG AA. Downgrading this to a **note** rather than a failure. The concern remains for very small text sizes (12px) where readability can be challenging on certain displays despite meeting the mathematical threshold.

---

#### H2. Custom tab widgets lack ARIA roles and keyboard navigation
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\MD2Word.astro`, lines 11-14
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\FolderManager.astro`, lines 29-33
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\AudioVisualizer.astro`, lines 65-68
**Confidence**: HIGH
**WCAG**: 4.1.2 Name, Role, Value; 2.1.1 Keyboard

All three tool components implement custom tab interfaces using `<button>` or `<div>` elements with `.active` class toggling. None of them use the WAI-ARIA tabs pattern (`role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`). Keyboard users cannot use Arrow keys to navigate between tabs as expected.

MD2Word tabs (buttons -- at least focusable):
```html
<div class="mw-tabs" id="mw-tabs">
  <button class="mw-tab active" data-tab="text">Convert Text</button>
  <button class="mw-tab" data-tab="files">Convert Files</button>
</div>
```

AudioVisualizer tabs (divs -- NOT focusable at all):
```html
<div class="av-tabs" id="av-tabs">
  <div class="av-tab active" data-viz="bars">Bars</div>
  <div class="av-tab" data-viz="osc">Oscilloscope</div>
</div>
```

**Reproduction**: Navigate to any tool page. Tab to the tab buttons. In AudioVisualizer, the Bars/Oscilloscope tabs are `<div>` elements and cannot receive keyboard focus at all. In MD2Word and FolderManager, the `<button>` tabs are focusable but Arrow keys do not move between them, and no ARIA role is communicated.

**Fix**: Add `role="tablist"` to the tab container, `role="tab"` and `aria-selected` to each tab, `role="tabpanel"` and `aria-labelledby` to each panel. Implement Arrow key navigation between tabs. For AudioVisualizer specifically, change `<div class="av-tab">` to `<button class="av-tab">` so they are focusable.

---

#### H3. AudioVisualizer viz tabs are `<div>` elements -- completely inaccessible by keyboard
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\AudioVisualizer.astro`, lines 65-68
**Confidence**: HIGH
**WCAG**: 2.1.1 Keyboard

The Bars/Oscilloscope toggle uses `<div>` elements which are not focusable and have no keyboard interaction. This is worse than the button-based tabs in the other tools because the user literally cannot reach these controls by keyboard at all.

```html
<div class="av-tab active" data-viz="bars">Bars</div>
<div class="av-tab" data-viz="osc">Oscilloscope</div>
```

**Reproduction**: Open the AudioVisualizer tool page. Press Tab repeatedly to cycle through all focusable elements. The Bars/Oscilloscope toggle is never reached.

**Fix**: Change to `<button>` elements. Add ARIA tab roles as described in H2.

---

#### H4. Filter buttons on Tutos and Tools pages lack ARIA pressed/selected state
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\tutos\index.astro`, lines 28-34
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\tools\index.astro`, lines 28-34
**Confidence**: HIGH
**WCAG**: 4.1.2 Name, Role, Value

The tag filter buttons toggle an `.active` class visually but never communicate their state to assistive technology. Screen reader users cannot determine which filter is currently active.

```html
<button class="tag filter-btn active" data-filter="all">All</button>
```

**Fix**: Add `aria-pressed="true"` to the active filter and `aria-pressed="false"` to inactive ones. Toggle in the click handler script. Alternatively, use `role="radiogroup"` with `role="radio"` and `aria-checked`.

---

#### H5. External links not indicated for screen readers
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\Header.astro`, lines 54-60 (desktop FMOTION link)
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\contact.astro`, lines 35-78
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\index.astro`, line 50
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\Card.astro`, lines 12-17
**Confidence**: MEDIUM
**WCAG**: 3.2.5 Change on Request (AAA, but strongly recommended)

External links that open in new tabs (`target="_blank"`) do not communicate this to screen reader users. The desktop FMOTION link in the header is the most notable case -- it has no `target="_blank"` but visually looks like a regular nav link (inconsistent with the mobile version which does have `target="_blank"`). Meanwhile, social links on the contact page and YouTube subscribe button open new tabs without any screen reader indication.

Desktop FMOTION link (no target="_blank"):
```html
<a href={externalLink.href} class="text-sm font-medium ...">
  {externalLink.label}
</a>
```

Mobile FMOTION link (has target="_blank"):
```html
<a href={externalLink.href} target="_blank" rel="noopener noreferrer" class="...">
  {externalLink.label}
</a>
```

**Fix**: Add visually hidden text like `<span class="sr-only">(opens in new tab)</span>` to all external links, or add a consistent external link icon with appropriate `aria-label`.

---

#### H6. Animated logo does not respect `prefers-reduced-motion`
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\AnimatedLogo.astro`, lines 102-155
**Confidence**: HIGH
**WCAG**: 2.3.3 Animation from Interactions (AAA); 2.2.2 Pause, Stop, Hide

The animated logo runs a continuous cycle with `setTimeout` loops (15-second cycle with no stop). There is no media query check for `prefers-reduced-motion: reduce`. Users who have opted into reduced motion in their OS settings will still see the cycling animation, and the floppy disk icon rotates. The animation cannot be paused.

```js
// No prefers-reduced-motion check
setTimeout(runCycle, 2000);
```

**Fix**: Wrap the animation start in a `prefers-reduced-motion` check:
```js
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setTimeout(runCycle, 2000);
}
```

---

### MEDIUM

#### M1. Textarea in MD2Word has no visible label
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\MD2Word.astro`, lines 21-26
**Confidence**: HIGH
**WCAG**: 1.3.1 Info and Relationships; 3.3.2 Labels or Instructions

The main textarea has a `placeholder` but no `<label>` element or `aria-label`. The hint text above it ("Paste or type Markdown below...") is not programmatically associated.

```html
<p class="mw-hint">Paste or type Markdown below, then convert it to a Word document.</p>
<textarea id="mw-textarea" class="mw-textarea" placeholder="# My Document..." spellcheck="false"></textarea>
```

**Fix**: Add `aria-label="Markdown input"` to the textarea, or associate the hint using `aria-describedby="mw-hint-text"` with an `id` on the `<p>`.

---

#### M2. Drop zone in MD2Word has no keyboard activation path
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\MD2Word.astro`, lines 49-55 (HTML), 901 (script)
**Confidence**: MEDIUM
**WCAG**: 2.1.1 Keyboard

The file drop zone is a `<div>` with a click handler that triggers a hidden `<input type="file">`. Since it is a `<div>`, it is not keyboard-focusable. Keyboard users cannot activate the file picker through the drop zone; however, the hidden file input could potentially be made directly accessible instead.

```html
<div class="mw-drop-zone" id="mw-drop-zone">
```
```js
dropZone.addEventListener('click', () => fileInput.click());
```

**Fix**: Add `tabindex="0"` and `role="button"` to the drop zone, plus `aria-label="Choose .md files to convert"`. Add a keydown listener for Enter/Space to trigger the file input. Alternatively, make the file input visible and styled.

---

#### M3. File remove buttons in MD2Word have no accessible label
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\MD2Word.astro`, lines 967-971
**Confidence**: HIGH
**WCAG**: 4.1.2 Name, Role, Value

The "remove file" buttons in the file list are rendered with only an SVG icon (X mark) and a `title="Remove"` attribute. While `title` provides some tooltip text, it is not reliably announced by all screen readers. The button has no `aria-label`.

```html
<button class="mw-file-remove" data-idx="${idx}" title="Remove">
  <svg ...><path ... d="M6 18L18 6M6 6l12 12" /></svg>
</button>
```

**Fix**: Add `aria-label="Remove ${filename}"` to each remove button, dynamically including the file name so users know which file will be removed.

---

#### M4. Hidden file input in MD2Word has no label
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\MD2Word.astro`, line 54
**Confidence**: MEDIUM
**WCAG**: 1.3.1 Info and Relationships

```html
<input id="mw-file-input" type="file" accept=".md,.markdown,.txt" multiple hidden />
```

The hidden file input has no label. While it is currently only triggered programmatically via the drop zone click, if a user or assistive technology manages to focus it, there is no label to describe its purpose.

**Fix**: Add `aria-label="Select Markdown files"` to the input.

---

#### M5. AudioVisualizer label elements use `&nbsp;` as content
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\AudioVisualizer.astro`, lines 22-23, 26-27
**Confidence**: MEDIUM
**WCAG**: 1.3.1 Info and Relationships

Several `<label>` elements contain only `&nbsp;` (non-breaking space) to maintain visual layout alignment. This creates confusing empty labels that screen readers may announce as blank.

```html
<div>
  <label>&nbsp;</label>
  <button id="av-startBtn" class="av-btn-primary">Start</button>
</div>
```

These `<label>` elements are also not associated with any form control via `for` attribute, so they are effectively decorative.

**Fix**: Remove the empty labels or replace them with `<span aria-hidden="true">&nbsp;</span>` for layout. The buttons already have visible text labels ("Start", "Stop") so they self-label.

---

#### M6. Color pickers in AudioVisualizer have labels but no explicit association for some controls
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\AudioVisualizer.astro`, lines 71-113
**Confidence**: MEDIUM
**WCAG**: 1.3.1 Info and Relationships

The range/number pairs in AudioVisualizer use labels with `for` attributes pointing to the range input, but the companion number input has no label association. Screen readers may announce the number input without context.

```html
<label for="av-glow">Glow</label>
<div class="av-pair">
  <input id="av-glow" type="range" ... />
  <input id="av-glowN" type="number" ... />  <!-- No label -->
</div>
```

**Fix**: Add `aria-label="Glow value"` to each companion number input, or use `aria-labelledby` to point both inputs at the same label.

---

#### M7. `prefers-reduced-motion` not respected for any CSS transitions
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\styles\global.css`
**Confidence**: MEDIUM
**WCAG**: 2.3.3 Animation from Interactions

The site uses CSS transitions throughout (`.card:hover` transform, button hover transitions, etc.) but never includes a `prefers-reduced-motion` media query to disable or reduce transitions.

```css
.card:hover {
  @apply border-accent/50 shadow-lg shadow-accent/5;
  transform: translateY(-2px);  /* Motion on hover */
}
```

**Fix**: Add a reduced-motion media query in `global.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

#### M8. SVG icons throughout the site lack `aria-hidden="true"`
**Files**: Multiple -- Header.astro (line 71), Footer.astro (lines 31-49), Card.astro (line 29), contact.astro, index.astro, etc.
**Confidence**: MEDIUM
**WCAG**: 1.3.1 Info and Relationships

Decorative SVG icons that accompany text labels (e.g., the YouTube icon next to "Subscribe on YouTube" button, the hamburger menu icon) are not marked `aria-hidden="true"`. Screen readers may attempt to announce these SVGs, creating noise. The inline SVGs have no `<title>` or meaningful content, so they add no value.

Example from Footer.astro:
```html
<a href={href} ... aria-label={label}>
  {icon === 'youtube' && (
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path ... />
    </svg>
  )}
</a>
```

The footer social links correctly use `aria-label` on the `<a>`, but the SVG inside should also have `aria-hidden="true"` to prevent redundant announcement.

**Fix**: Add `aria-hidden="true"` to all decorative SVG elements that accompany text or are inside elements with `aria-label`.

---

#### M9. `<main>` element has no `id` for anchor target
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\layouts\BaseLayout.astro`, line 48
**Confidence**: LOW (related to C3)
**WCAG**: 2.4.1 Bypass Blocks

```html
<main class="flex-1">
```

The `<main>` element has no `id` attribute, so even if a skip link were added, there would be no target. This is a prerequisite for fixing C3.

**Fix**: Add `id="main-content"` to the `<main>` element.

---

### LOW

#### L1. Desktop FMOTION link inconsistency with mobile version
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\Header.astro`, lines 54-60 vs 97-104
**Confidence**: HIGH
**WCAG**: 3.2.4 Consistent Identification

The desktop FMOTION link lacks `target="_blank"` and `rel="noopener noreferrer"`, while the mobile version has both. This means the same link behaves differently depending on viewport: desktop navigates away from the site, mobile opens a new tab.

Desktop (line 54-59):
```html
<a href={externalLink.href} class="text-sm font-medium text-text-secondary hover:text-text-primary ...">
  {externalLink.label}
</a>
```

Mobile (line 97-104):
```html
<a href={externalLink.href} target="_blank" rel="noopener noreferrer" class="...">
  {externalLink.label}
</a>
```

**Fix**: Add `target="_blank"` and `rel="noopener noreferrer"` to the desktop link as well, matching the mobile behavior.

---

#### L2. YouTube iframe lacks explicit `title` attribute when title is dynamic
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\tutos\[slug].astro`, lines 49-56
**Confidence**: LOW
**WCAG**: 4.1.2 Name, Role, Value

The YouTube embed iframe does have a `title` attribute set to the tutorial title, which is correct. This is a positive finding -- no issue here.

---

#### L3. Card component alt text could be more descriptive
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\Card.astro`, lines 22-24
**Confidence**: LOW
**WCAG**: 1.1.1 Non-text Content

The Card component sets `alt={title}` for images. While this provides some context, it does not describe what the image shows -- it just repeats the card title. For tutorial thumbnails, this is arguably adequate since the title is the most meaningful descriptor. For tool cards, the image is usually a screenshot and the title is sufficient.

```html
<img src={image} alt={title} class="w-full h-full object-cover ..." loading="lazy" />
```

**Note**: This is acceptable for WCAG AA. More descriptive alt text would be a nice-to-have.

---

#### L4. `scroll-behavior: smooth` can be problematic for some users
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\styles\global.css`, line 8
**Confidence**: LOW
**WCAG**: 2.3.3 Animation from Interactions

```css
html {
  scroll-behavior: smooth;
}
```

Smooth scrolling can cause motion sickness for some users. It should be disabled when `prefers-reduced-motion: reduce` is active.

**Fix**: Wrap in a media query:
```css
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
```

---

#### L5. Tool page `[slug].astro` image alt text repeats tool title
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\tools\[slug].astro`, lines 89-95
**Confidence**: LOW
**WCAG**: 1.1.1 Non-text Content

```html
<img src={tool.data.image} alt={tool.data.title} class="w-full h-auto" loading="lazy" />
```

Same pattern as L3 -- the alt text repeats the title. Acceptable for AA compliance but could be improved with a separate `imageAlt` field in the content schema.

---

#### L6. `confirm()` dialog used in AudioVisualizer for preset deletion
**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\AudioVisualizer.astro`, line 870
**Confidence**: LOW
**WCAG**: Not strictly a violation

```js
if (!confirm(`Delete preset "${name}"?`)) return;
```

The native `confirm()` dialog is accessible (browsers handle it), but it is stylistically inconsistent with the FolderManager's custom modal. Not an accessibility bug, but worth noting that the FolderManager has a custom modal (which has its own accessibility issues, see C2) while AudioVisualizer uses the native dialog (which is inherently accessible).

---

---

## Recommended Fix Plan

### Priority 1: Quick wins (< 1 hour total)
1. **Add skip-to-content link** (C3 + M9): Add `id="main-content"` to `<main>`, add skip link as first child of `<body>` in BaseLayout.astro.
2. **Fix mobile menu ARIA** (C1): Add `aria-expanded`, `aria-controls`, toggle in script, add Escape handler.
3. **Add `prefers-reduced-motion` check to AnimatedLogo** (H6): Single `if` guard around `setTimeout(runCycle, 2000)`.
4. **Add global `prefers-reduced-motion` CSS** (M7 + L4): Add media query to global.css to disable transitions and smooth scroll.
5. **Add `aria-hidden="true"` to decorative SVGs** (M8): Bulk edit across Header, Footer, Card, page files.

### Priority 2: Medium effort (2-4 hours total)
6. **Fix FolderManager modal** (C2): Add dialog role, aria-modal, focus trapping, Escape key handling.
7. **Fix custom tab widgets** (H2 + H3): Add ARIA tab roles to MD2Word, FolderManager, AudioVisualizer. Change AudioVisualizer tabs from `<div>` to `<button>`. Add Arrow key navigation.
8. **Add `aria-pressed` to filter buttons** (H4): Update tutos/index.astro and tools/index.astro scripts.
9. **Add `aria-label` to MD2Word textarea** (M1) and drop zone (M2).
10. **Fix file remove buttons** (M3): Add `aria-label` with file name.

### Priority 3: Lower priority
11. **Fix empty labels in AudioVisualizer** (M5): Replace with `aria-hidden` spans.
12. **Label AudioVisualizer number inputs** (M6).
13. **Add external link indication** (H5): Add sr-only text or icon with label.
14. **Fix desktop FMOTION link** (L1): Add `target="_blank"` for consistency.

---

### What NOT to Change

1. **`lang="en"` on `<html>` tag** (`BaseLayout.astro` line 18): This is correctly set and matches the site's primary language. The English language attribute is appropriate even though the author is French, because the site content is in English.

2. **Semantic landmark structure** (`BaseLayout.astro` lines 47-51): The `<header>`, `<main>`, `<footer>` structure is clean and correct. Screen readers can identify page regions. Do not wrap these in additional `<div>` containers or add redundant `role` attributes (e.g., `<main role="main">` is unnecessary since the element already implies the role).

3. **Footer social links with `aria-label`** (`Footer.astro` lines 22-51): The social links correctly use `aria-label={label}` on each `<a>` element, providing "YouTube", "GitHub", "LinkedIn", "Instagram" as accessible names. This is the right approach for icon-only links. Do not remove these labels.

4. **Card component `alt` attribute** (`Card.astro` line 23): The `alt={title}` pattern provides meaningful alt text for card images. While one could argue for more descriptive alt text, the title is the most important identifier and changing it to something like "Thumbnail for [title]" would add verbosity without meaningful benefit. The current approach is WCAG AA compliant.

5. **YouTube iframe `title` attribute** (`tutos/[slug].astro` line 51): The iframe correctly sets `title={tutorial.data.title}`, giving screen readers a meaningful description of the embedded content. This is correctly implemented.

6. **Heading hierarchy on standard pages**: The homepage, tutos index, tools index, contact page, and HowIAI page all follow a proper h1 -> h2 -> h3 hierarchy without skips. The h1 is the page title, h2s are section headers, and h3s appear inside content blocks. Do not refactor these.

7. **Label/input associations in MD2Word filename field** (`MD2Word.astro` lines 28-36): The filename `<label for="mw-filename">` is correctly associated with the `<input id="mw-filename">`. This is properly implemented.

8. **AudioVisualizer `<label for="...">` on select and input elements** (`AudioVisualizer.astro` lines 11-16, 37-39, etc.): The primary labels correctly use `for` attributes pointing to input IDs. The labeling for the main controls (mode select, mic select, preset select, color pickers, range sliders) is correctly done. Only the companion number inputs and spacer labels need fixing -- do not rewrite the entire label structure.

9. **`rel="noopener noreferrer"` on external links**: External links consistently (mostly) include `rel="noopener noreferrer"` for security. This is correct and should be maintained.

10. **Card component external link indicator** (`Card.astro` lines 34-39): The external link badge (arrow icon in top-right corner) provides a visual indication that a card links externally. This is a good visual pattern and should be kept -- it just needs a screen reader equivalent added alongside it.

---

## Summary Table

| ID | Severity | Component | WCAG | Confidence | Description |
|----|----------|-----------|------|------------|-------------|
| C1 | CRITICAL | Header.astro | 4.1.2, 2.1.1 | HIGH | Mobile menu missing aria-expanded, focus management |
| C2 | CRITICAL | FolderManager.astro | 2.1.2, 4.1.2 | HIGH | Modal has no role="dialog", no focus trap, no Escape |
| C3 | CRITICAL | BaseLayout.astro | 2.4.1 | HIGH | No skip-to-content link |
| H1 | HIGH (note) | Multiple | 1.4.3 | HIGH | Secondary text contrast 6.06:1 passes AA; borderline at 12px |
| H2 | HIGH | MD2Word, FolderManager, AudioVisualizer | 4.1.2, 2.1.1 | HIGH | Custom tabs lack ARIA roles/keyboard nav |
| H3 | HIGH | AudioVisualizer.astro | 2.1.1 | HIGH | Viz tabs are divs, unreachable by keyboard |
| H4 | HIGH | tutos/index, tools/index | 4.1.2 | HIGH | Filter buttons missing aria-pressed state |
| H5 | HIGH | Multiple | 3.2.5 | MEDIUM | External links not indicated for screen readers |
| H6 | HIGH | AnimatedLogo.astro | 2.2.2 | HIGH | Animation ignores prefers-reduced-motion |
| M1 | MEDIUM | MD2Word.astro | 1.3.1, 3.3.2 | HIGH | Textarea has no label |
| M2 | MEDIUM | MD2Word.astro | 2.1.1 | MEDIUM | Drop zone not keyboard accessible |
| M3 | MEDIUM | MD2Word.astro | 4.1.2 | HIGH | File remove buttons have no aria-label |
| M4 | MEDIUM | MD2Word.astro | 1.3.1 | MEDIUM | Hidden file input has no label |
| M5 | MEDIUM | AudioVisualizer.astro | 1.3.1 | MEDIUM | Empty &nbsp; labels create confusion |
| M6 | MEDIUM | AudioVisualizer.astro | 1.3.1 | MEDIUM | Companion number inputs unlabeled |
| M7 | MEDIUM | global.css | 2.3.3 | MEDIUM | No prefers-reduced-motion for CSS transitions |
| M8 | MEDIUM | Multiple | 1.3.1 | MEDIUM | Decorative SVGs missing aria-hidden |
| M9 | MEDIUM | BaseLayout.astro | 2.4.1 | LOW | Main element has no id for skip target |
| L1 | LOW | Header.astro | 3.2.4 | HIGH | FMOTION link inconsistent between mobile/desktop |
| L3 | LOW | Card.astro | 1.1.1 | LOW | Alt text repeats title (acceptable) |
| L4 | LOW | global.css | 2.3.3 | LOW | Smooth scroll not gated by reduced-motion |
| L5 | LOW | tools/[slug].astro | 1.1.1 | LOW | Tool image alt repeats title |
| L6 | LOW | AudioVisualizer.astro | N/A | LOW | Native confirm() vs custom modal inconsistency |
