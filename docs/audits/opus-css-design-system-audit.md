# CSS & Design System Audit

The HNTBO website has a well-structured three-layer styling system: Tailwind tokens in `tailwind.config.mjs`, global component classes in `global.css`, and namespaced tool-component styles (`mw-`, `fm-`, `av-`). The design system is largely consistent -- all three tool components correctly mirror the documented HNTBO tokens via CSS custom properties, the button system is applied faithfully across pages, and there are no layout-breaking issues. The main findings are cosmetic-level inconsistencies: hardcoded accent color values used in place of token references, duplicated filter-button styles across two pages, a minor button system deviation in the AudioVisualizer, and one off-palette hardcoded color. None of these are critical; the site ships clean and visually coherent.

Conducted 2026-02-21.

---

## Findings by Severity

### CRITICAL

None.

### HIGH

**H1. Duplicated filter-button styles across tutos and tools pages**
- **Confidence**: HIGH
- **Files**:
  - `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\tutos\index.astro` lines 90-112
  - `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\tools\index.astro` lines 91-113
- **Description**: Both pages define identical `<style>` blocks for `.filter-btn`, `.filter-btn:hover`, `.filter-btn.active`, and the item transition/hidden styles. This is copy-pasted CSS that will drift over time.
- **Code (from tutos/index.astro, lines 92-104)**:
  ```css
  .filter-btn {
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .filter-btn:hover {
    border-color: rgba(255, 47, 114, 0.5);
  }
  .filter-btn.active {
    background-color: rgba(255, 47, 114, 0.1);
    border-color: rgba(255, 47, 114, 0.5);
    color: #ff2f72;
  }
  ```
- **Impact**: Maintenance burden. If the accent color changes, you must update four locations (two pages x two rgba references + one hex reference each).
- **Reproduction**: Compare `src/pages/tutos/index.astro` lines 90-112 with `src/pages/tools/index.astro` lines 91-113 -- they are character-for-character identical.
- **Fix**: Extract these filter-button styles into `global.css` under `@layer components`, alongside the existing `.tag` class definition. Replace the hardcoded `rgba(255, 47, 114, ...)` with Tailwind token utilities (`@apply border-accent/50` etc.) or at minimum, centralize them in one place.

**H2. Hardcoded accent rgba() values bypass the design token system**
- **Confidence**: HIGH
- **Files and lines**:
  - `src/pages/tutos/index.astro` lines 97, 101, 102, 103
  - `src/pages/tools/index.astro` lines 98, 102, 103, 104
  - `src/components/MD2Word.astro` lines 139, 300
  - `src/components/FolderManager.astro` line 186
  - `src/components/AudioVisualizer.astro` line 273
- **Description**: Multiple locations use `rgba(255, 47, 114, 0.15)`, `rgba(255, 47, 114, 0.5)`, or `rgba(255, 47, 114, 0.05)` instead of referencing the token. In the tool components, this is partially justified since they define their own CSS custom property (e.g., `var(--mw-accent)`) but then bypass it for the alpha-blended variants. In the page-level `<style>` blocks, it completely bypasses the Tailwind token system.
- **Impact**: If the accent color ever changes from `#ff2f72`, these hardcoded rgba values will not update with it.
- **Fix**: For the tool components, consider defining additional tokens like `--mw-accent-15` or using CSS `color-mix()` / `oklch`. For the page-level styles, use Tailwind's opacity modifiers: `bg-accent/10`, `border-accent/50`.

### MEDIUM

**M1. AudioVisualizer button system diverges from the site-wide pattern**
- **Confidence**: HIGH
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\AudioVisualizer.astro` lines 201-210
- **Description**: The `.av-btn-primary` class uses a **filled** accent background as its default state (solid `var(--av-accent)` background with dark text), with `!important` overrides on five properties. This contradicts the CLAUDE.md button design system which specifies: "Default: Accent border, accent text, accent icon" for primary buttons, with the solid fill only appearing on hover.
- **Code (lines 201-210)**:
  ```css
  .av-btn-primary {
    background: var(--av-accent) !important;
    border-color: var(--av-accent) !important;
    color: var(--av-bg) !important;
  }
  .av-btn-primary:hover:not(:disabled) {
    background: var(--av-accent-hover) !important;
    border-color: var(--av-accent-hover) !important;
  }
  ```
- **Impact**: Visual inconsistency -- the AudioVisualizer's "Start" and "Save / Update" buttons appear as solid pink buttons while every other primary button on the site is outlined-pink-on-dark. The `!important` flags are needed to override the broad `av-container button` selector (line 191-188) but signal a specificity problem.
- **Reproduction**: Navigate to `/tools/audio-visualizer/live`. Compare the "Start" button appearance to the "Subscribe on YouTube" button on the home page.
- **Fix**: Align `.av-btn-primary` with `.mw-btn-primary` and `.fm-btn-primary` (which correctly use the outlined pattern: accent border + accent text, solid fill on hover). Remove the `!important` flags by increasing specificity naturally or restructuring the base button selector.

**M2. AnimatedLogo uses hardcoded accent color with !important**
- **Confidence**: HIGH
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\AnimatedLogo.astro` lines 87, 92
- **Description**: The animated logo uses `color: #ff2f72 !important;` for both `.letter.active` and `.reveal` elements. These are in a `<style is:global>` block, so they affect the global scope and cannot be overridden without matching `!important`.
- **Code (lines 86-93)**:
  ```css
  .animated-logo .letter.active {
    color: #ff2f72 !important;
  }
  .animated-logo .reveal {
    display: none;
    color: #ff2f72 !important;
  }
  ```
- **Impact**: The `!important` is likely needed to override the base `a` color rule from `global.css` (line 36: `@apply text-accent`). However, the hardcoded hex value means a token change would not propagate here. The `is:global` scope is broader than necessary.
- **Fix**: Replace `#ff2f72` with `var(--tw-accent, #ff2f72)` or add the accent color as a CSS custom property in `:root` and reference it. Alternatively, since this is inside a header `<a>` tag that already gets `text-accent`, the `!important` may be removable if the specificity is increased (e.g., `header .animated-logo .letter.active`).

**M3. AudioVisualizer has an off-palette hardcoded color**
- **Confidence**: HIGH
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\AudioVisualizer.astro` line 220
- **Description**: The `.av-msg` element uses `color: #ffb3b3`, a light pink/salmon color that does not appear in the HNTBO design token palette and is not defined as a CSS custom property.
- **Code (lines 217-222)**:
  ```css
  .av-msg {
    margin-top: 8px;
    font-size: 13px;
    color: #ffb3b3;
    min-height: 1.4em;
  }
  ```
- **Impact**: This appears to be an error/warning message color. The other tool components use `--fm-danger: #ff4444` or `--mw-danger: #ff4444` for error states. This color is inconsistent with the rest of the system.
- **Fix**: Define and use an `--av-warning` or `--av-danger` token, or reuse the existing pattern with `var(--av-accent)` or a new `--av-danger: #ff4444` token to match the other tools.

**M4. AudioVisualizer uses `--av-panel` instead of `--av-surface` for surface color token name**
- **Confidence**: MEDIUM
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\AudioVisualizer.astro` line 124
- **Description**: The AudioVisualizer names its surface token `--av-panel: #12141a` while the other two tool components use `--mw-surface` and `--fm-surface`. Similarly, the secondary text token is named `--av-ink-secondary` vs `--mw-ink2` / `--fm-ink2`. All three map to the same hex values (#12141a and #8e8e93 respectively), but the naming is inconsistent.
- **Code comparison**:
  ```css
  /* MD2Word */     --mw-surface: #12141a;   --mw-ink2: #8e8e93;
  /* FolderManager */ --fm-surface: #12141a;   --fm-ink2: #8e8e93;
  /* AudioVisualizer */ --av-panel: #12141a;   --av-ink-secondary: #8e8e93;
  ```
- **Impact**: Pure naming inconsistency. Does not affect visual output. Makes maintenance slightly harder when scanning for surface-color references across tools.
- **Fix**: Rename `--av-panel` to `--av-surface` and `--av-ink-secondary` to `--av-ink2` for consistency with the established pattern.

### LOW

**L1. AudioVisualizer responsive breakpoints differ from the other tools**
- **Confidence**: MEDIUM
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\AudioVisualizer.astro` lines 159, 285, 291
- **Description**: The AudioVisualizer uses three breakpoints (`900px`, `1200px`, `640px`) while MD2Word and FolderManager both use only `640px`. The `900px` and `1200px` breakpoints do not align with Tailwind's default breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).
- **Impact**: Not a bug -- the AudioVisualizer has a more complex grid layout that justifies additional breakpoints. However, the `1200px` breakpoint for `.av-grid` is close to but not aligned with Tailwind's `xl: 1280px`, and `900px` does not match any standard breakpoint.
- **Fix**: Consider aligning to `768px` (md) and `1024px` (lg) for consistency with the Tailwind breakpoint scale, or document these as intentional AudioVisualizer-specific breakpoints.

**L2. The "Browse Tutorials" secondary button on the home page has no icon**
- **Confidence**: HIGH
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\index.astro` line 56
- **Code**:
  ```html
  <a href="/tutos" class="btn btn-secondary">
    Browse Tutorials
  </a>
  ```
- **Description**: Per the CLAUDE.md button design system, secondary buttons do not require icons ("Use for: Alternative actions, navigation"). This button is correctly implemented. However, it is the only `btn-secondary` without an icon -- the contact page, tools page, tutos page, and tool slug pages all pair their secondary buttons with icons.
- **Impact**: Minor visual inconsistency in the button family. The button is still correct per the design spec.
- **Fix**: Optional. Adding a right-arrow icon (`->`) would make it visually consistent with other secondary buttons but is not required by the design system.

**L3. FolderManager modal Cancel button uses `fm-btn-primary` class**
- **Confidence**: HIGH
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\FolderManager.astro` line 97
- **Code**:
  ```html
  <button class="fm-btn fm-btn-primary" id="fm-modal-cancel">Cancel</button>
  <button class="fm-btn fm-btn-danger" id="fm-modal-confirm">Confirm</button>
  ```
- **Description**: The "Cancel" button in the confirmation modal is styled as `fm-btn-primary` (accent-colored), while the destructive "Confirm" (which deletes folders) is `fm-btn-danger`. This inverts the typical UX pattern where the cancel/safe action should be visually subdued and the dangerous action should be prominent/red.
- **Impact**: Users may hesitate because the "Cancel" button draws more initial attention (accent color) than the "Confirm" button, though the danger color does correctly signal risk. The current pattern could be read as "Cancel is the recommended action," which is actually a reasonable safety default.
- **Fix**: Subjective. If the intent is to make canceling the "safe default," the current pattern is defensible. If standard modal conventions are preferred, swap: make Cancel the base `fm-btn` and Confirm the `fm-btn-danger`.

**L4. Card component combines global `.card` class with inline Tailwind utilities**
- **Confidence**: MEDIUM
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\Card.astro` line 14
- **Code**:
  ```html
  <a href={href} class="card group block h-full flex flex-col" ...>
  ```
- **Description**: The `card` class from `global.css` already applies `bg-surface rounded-lg border border-border overflow-hidden` and transition properties. The inline `block h-full flex flex-col` Tailwind classes add layout behavior on top. This is a reasonable approach (global class for visual theme, inline for layout) but the `block` utility is redundant since `<a>` elements become block-level when `flex` is applied.
- **Impact**: No visual impact. Minor class redundancy.
- **Fix**: Remove `block` from the class list since `flex` already establishes a block-level flex container.

**L5. Tool components redeclare the same design token values**
- **Confidence**: HIGH
- **Files**:
  - `src/components/MD2Word.astro` lines 73-85
  - `src/components/FolderManager.astro` lines 107-122
  - `src/components/AudioVisualizer.astro` lines 121-131
- **Description**: Each of the three tool components declares its own set of CSS custom properties mapping to the identical HNTBO palette values (#0a0b10, #12141a, #252833, #f5f5f7, #8e8e93, #ff2f72, #ff5a8f). This is by design for component isolation (each tool is self-contained and could be used outside the HNTBO site), but it means the accent color is defined in 4 places (Tailwind config + 3 components).
- **Impact**: If the HNTBO accent color changes, all three components must be updated manually. This is an acceptable trade-off for portability.
- **Fix**: This is the correct pattern for self-contained tools. Document in CLAUDE.md that tool components intentionally duplicate tokens for isolation. Alternatively, if portability is not needed, these could reference a shared `:root`-level custom property set.

---

## Recommended Fix Plan

### Priority 1 (address soon)
1. **Extract filter-button styles** from `tutos/index.astro` and `tools/index.astro` into `global.css` as a `.filter-btn` component class, eliminating the duplication (H1).
2. **Align AudioVisualizer `.av-btn-primary`** to match the outlined pattern used by MD2Word and FolderManager, removing the `!important` flags (M1).

### Priority 2 (next cleanup pass)
3. **Replace `#ffb3b3`** in AudioVisualizer with a proper `--av-danger` or `--av-warning` token (M3).
4. **Rename `--av-panel` to `--av-surface`** and `--av-ink-secondary` to `--av-ink2` for cross-tool naming consistency (M4).
5. **Replace hardcoded `#ff2f72`** in AnimatedLogo with a CSS custom property reference (M2).

### Priority 3 (nice to have)
6. **Replace hardcoded `rgba(255, 47, 114, ...)` values** in the tool components with computed tokens or `color-mix()` (H2 -- lower priority since these are scoped to component custom properties).

### What NOT to Change

1. **Tool component token isolation** (L5): Each tool declares its own CSS custom properties (`--mw-*`, `--fm-*`, `--av-*`) mapping to the same palette values. This is the correct pattern for self-contained components that could be extracted or reused outside the site. Do not centralize these into a shared `:root` definition.

2. **Tool component CSS prefix namespacing** (`mw-`, `fm-`, `av-`): These prefixes prevent style leaks between tool components and the global stylesheet. The namespacing is thorough and consistent. Do not merge these into global classes.

3. **AnimatedLogo SVG pixel art colors** (`#6b0626`, `#8f0530`, `#db1452`, `#c8426c`, `#f26e96`, `#fb779f`, `#c80542`): These are artistic colors for the floppy disk pixel art and are intentionally distinct from the design tokens. They form a pink/magenta gradient that is thematic but not meant to be tokenized.

4. **AudioVisualizer default `value` attributes** (`value="#ff2f72"`, `value="#0a0b10"` on color inputs at lines 72, 76): These are HTML form default values for the color pickers. They must be hardcoded hex strings in the HTML attribute -- CSS custom properties cannot be used in `value` attributes. Similarly, the seed preset values in the JavaScript (lines 816-817, 830-831) must be literal strings.

5. **The `is:global` scope on AnimatedLogo styles**: The animated logo sits inside a Header `<a>` tag that applies the global link color via `global.css` base rules. The `is:global` is needed so the logo's `.letter` and `.reveal` class styles can override the inherited link color. Scoping these styles more tightly would require restructuring the header markup.

6. **The `.prose` class in `global.css`**: This is a comprehensive, well-structured article styling system that covers headings, paragraphs, code, blockquotes, lists, images, tables, and video embeds. It is actively used on 5 page templates. Do not replace it with `@tailwindcss/typography` -- the current implementation gives full control and matches the dark theme.

7. **Separate responsive breakpoints in AudioVisualizer** (L1): The `900px` and `1200px` breakpoints serve the AudioVisualizer's 7-column grid layout which does not exist in the other tools. These are justified by the component's unique layout complexity.

8. **FolderManager modal Cancel as `fm-btn-primary`** (L3): The current pattern makes "Cancel" visually prominent, which encourages the safe action (not deleting). This is a defensible UX choice for a destructive-action modal.

---

## Summary Table

| ID | Severity | Component / File | Finding | Confidence |
|----|----------|-----------------|---------|------------|
| H1 | HIGH | tutos/index + tools/index | Duplicated filter-button styles | HIGH |
| H2 | HIGH | Multiple (6 files) | Hardcoded rgba() accent values bypass tokens | HIGH |
| M1 | MEDIUM | AudioVisualizer | `.av-btn-primary` uses filled default (diverges from design system) | HIGH |
| M2 | MEDIUM | AnimatedLogo | Hardcoded `#ff2f72` with `!important` | HIGH |
| M3 | MEDIUM | AudioVisualizer | Off-palette `#ffb3b3` color for messages | HIGH |
| M4 | MEDIUM | AudioVisualizer | Token name inconsistency (`--av-panel` vs `--av-surface`) | MEDIUM |
| L1 | LOW | AudioVisualizer | Non-standard responsive breakpoints (900px, 1200px) | MEDIUM |
| L2 | LOW | index.astro | Secondary button without icon (valid but inconsistent) | HIGH |
| L3 | LOW | FolderManager | Modal Cancel uses accent styling | HIGH |
| L4 | LOW | Card.astro | Redundant `block` class alongside `flex` | MEDIUM |
| L5 | LOW | All 3 tool components | Token values duplicated across components (by design) | HIGH |
