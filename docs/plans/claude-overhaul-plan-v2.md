# HNTBO Codebase Overhaul Plan v2

## Context

Two independent audits (Claude Opus 4.6 and OpenAI Codex) examined the HNTBO codebase on 2026-02-21, producing 10 audit documents with a combined ~85 deduplicated findings. Codex reviewed v1 of this plan; this v2 incorporates accepted feedback (see `codex-feedback-v1plan-response.md`).

The codebase is functional with no build failures and no confirmed security vulnerabilities. Known issues include: one broken download path (404), parser bugs in MD2Word, missing accessibility infrastructure, CSS token drift, and SEO gaps. This overhaul brings the site from "works" to "works correctly and accessibly."

**Changes from v1**: Context wording corrected, acceptance criteria added to all beads, Bead 2.3 split into 2.3a/2.3b, Phase 7 moved before Phase 6, filename sanitization moved to correct bead, dependency graph tightened, verification made measurable, future considerations section added.

---

## Phase Overview

| # | Phase | Beads | Effort | Priority |
|---|-------|:-----:|--------|----------|
| 1 | Quick Fixes | 4 | ~1 hr | P0 — do first |
| 2 | Accessibility Foundation | 6 | ~5-6 hr | P1 — WCAG AA compliance |
| 3 | MD2Word Parser Hardening | 4 | ~4-6 hr | P1 — user-facing bugs |
| 4 | FolderManager Safety | 2 | ~2 hr | P1 — data loss prevention |
| 5 | CSS / Design System | 3 | ~2-3 hr | P2 — maintainability |
| 6 | Origin Isolation | 1 | ~1 hr | P2 — infra consistency |
| 7 | SEO & Meta Tags | 2 | ~1-2 hr | P2 — discoverability |
| 8 | Tool Component Polish | 2 | ~2-3 hr | P3 — robustness |
| 9 | Accessibility Polish | 1 | ~1-2 hr | P3 — a11y completeness |
| 10 | Content Schema | 1 | ~1 hr | P4 — future-proofing |
| | **Total** | **26** | **~21-31 hr** | |

---

## Phase 1: Quick Fixes (P0)

Broken things that users can hit right now. No dependencies, no architectural decisions.

### Bead 1.1 — Fix broken download link
- **Priority**: P0
- `src/content/tutorials/houdini-kerning-vex.md:7` — `downloadUrl: "/downloads/kerning-hda.zip"` points to nonexistent file. Actual file: `public/downloads/sop_Fred.kern_tool.1.0.hdalc`
- **Fix**: Update frontmatter to match actual filename, and update `downloadLabel` to match file type
- **Acceptance Criteria**:
  - `npm run build` succeeds
  - Visiting `/tutos/houdini-kerning-vex` and clicking "Download" initiates a file download (not 404)
  - Downloaded file matches `public/downloads/sop_Fred.kern_tool.1.0.hdalc`
- Sources: Opus Content H1

### Bead 1.2 — Fix FMOTION desktop link
- **Priority**: P1
- `src/components/Header.astro:54-60` — desktop link missing `target="_blank"` and `rel="noopener noreferrer"` (mobile version at lines 97-104 has them)
- **Fix**: Add both attributes to match mobile behavior
- **Acceptance Criteria**:
  - Desktop FMOTION link opens in new tab
  - `rel="noopener noreferrer"` present in rendered HTML
  - Behavior matches mobile FMOTION link
- Sources: Opus Content M1, Opus Security M3, Codex A11y L1

### Bead 1.3 — Standardize fmotion.fr URL
- **Priority**: P2
- `Header.astro:13` uses `https://www.fmotion.fr`, `contact.astro:89` uses `https://fmotion.fr`
- **Fix**: Pick canonical form (check which domain the site actually resolves to), update both locations
- **Acceptance Criteria**:
  - Grep for `fmotion.fr` returns same URL form across entire `src/`
- Sources: Opus Content M2

### Bead 1.4 — Fix external livePath link attributes
- **Priority**: P2
- `src/pages/tools/[slug].astro:47-58` — "Try Live Demo" link for external tools (BubbleBeats, BruteBookmarks) has no `target="_blank"` / `rel="noopener noreferrer"`
- **Fix**: Add conditional: if `livePath` starts with `http`, add `target="_blank"` and `rel="noopener noreferrer"`
- **Acceptance Criteria**:
  - BubbleBeats and BruteBookmarks "Try Live Demo" buttons open in new tab
  - Internal livePath tools (MD2Word, FolderManager) still open in same tab
- Sources: Opus Security L6

---

## Phase 2: Accessibility Foundation (P1)

WCAG AA compliance gaps. The site's interactive elements lack the ARIA infrastructure screen reader users need.

### Bead 2.1 — Skip link + mobile menu ARIA
- **Priority**: P1
- **Skip link**: Add `<a href="#main-content" class="sr-only focus:not-sr-only ...">Skip to main content</a>` as first child of `<body>` in `BaseLayout.astro`. Add `id="main-content"` to `<main>`.
- **Mobile menu**: In `Header.astro:67-117`, add `aria-expanded="false"`, `aria-controls="mobile-menu"` to button. Toggle `aria-expanded` in click handler. Add Escape key to close. Move focus to first link on open, return focus to button on close.
- Files: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`
- **Acceptance Criteria**:
  - Tab once on any page → skip link appears, Enter jumps to main content
  - Screen reader announces "expanded"/"collapsed" state on hamburger toggle
  - Escape closes mobile menu and returns focus to hamburger button
  - No visual change on desktop (skip link only visible on focus)
- Sources: Opus A11y C1, C3, M9

### Bead 2.2 — FolderManager modal accessibility
- **Priority**: P1
- `src/components/FolderManager.astro:92-101, 520-537`
- Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby="fm-modal-title"` to modal overlay
- Move focus to Cancel button on open
- Trap focus within modal (Tab cycles between Cancel and Confirm only)
- Close on Escape key
- Return focus to trigger button on close
- **Acceptance Criteria**:
  - Screen reader announces "Confirm dialog" when modal opens
  - Tab key cycles only between Cancel and Confirm (no background elements reachable)
  - Escape dismisses modal
  - Focus returns to the button that triggered the modal
- Sources: Opus A11y C2

### Bead 2.3a — ARIA tab widgets: MD2Word + FolderManager
- **Priority**: P1
- **MD2Word** (`MD2Word.astro:11-14`): Add `role="tablist"` on container, `role="tab"` + `aria-selected` on buttons, `role="tabpanel"` + `aria-labelledby` on panels. Add Left/Right Arrow key navigation between tabs.
- **FolderManager** (`FolderManager.astro:29-33`): Same pattern. Three tabs (Delete, Duplicate, Count).
- Both components already use `<button>` elements for tabs — no element change needed.
- **Acceptance Criteria**:
  - Screen reader announces "tab 1 of 2, selected" / "tab 1 of 3, selected" on focus
  - Arrow keys move between tabs; Enter/Space activates
  - `aria-selected="true"` on active tab, `"false"` on others
  - Panel visibility matches selected tab
- Sources: Opus A11y H2

### Bead 2.3b — ARIA tab widget: AudioVisualizer
- **Priority**: P1
- `AudioVisualizer.astro:65-68`: Tabs are `<div>` elements — **change to `<button>`** first (currently keyboard-unreachable), then add ARIA roles as in 2.3a.
- **Acceptance Criteria**:
  - Bars/Oscilloscope toggle reachable by Tab key
  - Screen reader announces tab role and selected state
  - Arrow keys navigate between the two tabs
  - Switching tabs updates canvas visualization mode
- Sources: Opus A11y H3

### Bead 2.4 — Filter button semantics
- **Priority**: P2
- `src/pages/tutos/index.astro:28-34`, `src/pages/tools/index.astro:28-34`
- Add `aria-pressed="true"` to active filter, `aria-pressed="false"` to inactive
- Toggle in click handler alongside `.active` class
- **Acceptance Criteria**:
  - Screen reader announces "All, pressed" on the active filter
  - Clicking a filter updates both visual style and `aria-pressed` attribute
  - Consistent across tutos and tools pages
- Sources: Opus A11y H4, Codex A11y M1

### Bead 2.5 — prefers-reduced-motion
- **Priority**: P2
- **JS**: In `AnimatedLogo.astro:131-146`, wrap `setTimeout(runCycle, ...)` in `if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)`
- **CSS**: In `global.css`, add:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
    html { scroll-behavior: auto; }
  }
  ```
- **Acceptance Criteria**:
  - With OS "reduce motion" enabled: logo shows static "HNTBO", no cycling animation
  - Card hover effects apply instantly (no slide transition)
  - Smooth scroll disabled
  - With motion preference off: no behavior change from current site
- Sources: Opus A11y H6, M7, L4, Codex A11y M2

---

## Phase 3: MD2Word Parser Hardening (P1)

The custom markdown parser is the highest-density bug area. All user-facing — someone pastes markdown, gets wrong output.

### Bead 3.1 — Fix code fence + table detection
- **Priority**: P0
- **Unclosed code fence** (`MD2Word.astro:559-568`): When closing ` ``` ` is missing, the `while` loop swallows the entire rest of the document. Fix: after loop, check `i < lines.length`. If no closing fence, emit code block with what was collected and continue parsing.
- **Table detection** (`MD2Word.astro:613`): Any line with `|` triggers table parsing. Fix: validate that collected lines include a separator row matching `/^\|?[\s\-:|]+\|[\s\-:|]+\|?$/`. If not, fall through to paragraph.
- **Acceptance Criteria**:
  - Input with unclosed fence: content after the fence appears in output (not swallowed)
  - Input `The result of A | B is a bitwise OR.` produces a paragraph, not a table
  - Input with proper `| --- | --- |` separator row still produces a table
  - Input with closed fence still works as before
- Sources: Opus Tools C1, H2

### Bead 3.2 — Fix list parsing
- **Priority**: P1
- **HR/list ordering** (`MD2Word.astro:573,606`): Input `* * *` (valid CommonMark thematic break) matches list pattern first. Fix: add explicit spaced-HR test before the list check, or reorder checks.
- **List continuation**: Treat lines starting with whitespace (not a new block marker) as continuations of previous list item.
- **List nesting**: Support 2-4 space indentation for sub-items, map to `bullet.level > 0` in docx output.
- **Acceptance Criteria**:
  - `* * *` produces a horizontal rule, not a list item
  - `- Item\n  continuation` produces one list item with full text
  - `- Item\n  - Sub-item` produces a nested list
  - Standard flat lists (`- A\n- B\n- C`) still work unchanged
- Sources: Opus Tools H3, M1

### Bead 3.3 — Fix DOCX generation fidelity
- **Priority**: P1
- **Blockquote inline formatting** (`MD2Word.astro:802-810`): Replace single `TextRun(block.text)` with `makeTextRuns(block.text)` to process bold/italic inside blockquotes.
- **Code block line breaks** (`MD2Word.astro:767-777`): Split `block.text` on `\n`, emit one Paragraph per line (Consolas font + indent).
- **Ordered list numbering** (`MD2Word.astro:789-799`): Preserve source start number or use `docx` library's native numbered list feature.
- **Acceptance Criteria**:
  - `> This has **bold** text` produces italic blockquote with "bold" in bold+italic
  - Multi-line code block has visible line breaks in Word (each line on its own line)
  - `3. Third\n4. Fourth` produces items numbered 3 and 4, not 1 and 2
- Sources: Opus Tools M2, M3, M5

### Bead 3.4 — Document inline formatting limitation
- **Priority**: P3
- The regex at `MD2Word.astro:673` cannot handle nested inline formatting (`**bold *italic* bold**`). A recursive parser is significant effort.
- **Fix**: Add a visible note below the textarea: "Tip: Use `***text***` for bold italic. Nested formatting like `**bold *italic* bold**` is not supported."
- **Acceptance Criteria**:
  - Help text visible in the Convert Text tab
  - `***text***` still correctly produces bold+italic output
- Sources: Opus Tools H1

---

## Phase 4: FolderManager Safety (P1)

Data-loss prevention for the file system tool.

### Bead 4.1 — Fix TOCTOU delete race condition
- **Priority**: P1
- `src/components/FolderManager.astro:610, 717`
- Before each `removeEntry`, re-check that the folder is still empty by iterating its entries. Use `removeEntry(target)` without `{ recursive: true }` — if the folder is no longer empty, it will throw and the error is caught and reported.
- **Acceptance Criteria**:
  - Delete operation on a truly empty folder succeeds
  - If a file is added between scan and delete, that folder is skipped with a message like "Skipped: folder is no longer empty"
  - Results log shows count of skipped vs deleted folders
  - No `{ recursive: true }` in the delete path
- Sources: Codex Tools C1, Opus Tools L1

### Bead 4.2 — Separate folder handles by tab
- **Priority**: P2
- `src/components/FolderManager.astro:500-513`
- Replace shared `folderHandle` with per-tab handles (`delHandle`, `countHandle`). When count tab sets a read-only handle, do NOT enable the delete scan button.
- **Acceptance Criteria**:
  - Browsing folder in Count tab does not pre-populate Delete tab
  - Delete tab requires its own folder selection (with `readwrite` permission)
  - Count tab works independently with `read` permission
  - Path display shows correct folder per tab
- Sources: Codex Tools H1, Opus Tools M4, L5

---

## Phase 5: CSS / Design System Alignment (P2)

Token consistency and style deduplication.

### Bead 5.1 — Extract and centralize filter-button styles
- **Priority**: P2
- Remove duplicate `<style>` blocks from `tutos/index.astro:90-112` and `tools/index.astro:91-113`
- Add `.filter-btn` to `global.css` under `@layer components`
- Replace hardcoded `rgba(255, 47, 114, ...)` with Tailwind utilities (`@apply border-accent/50`, `bg-accent/10`, `text-accent`)
- **Acceptance Criteria**:
  - No `<style>` blocks in tutos/index.astro or tools/index.astro for filter buttons
  - `.filter-btn` defined once in `global.css`
  - No `rgba(255, 47, 114` literals in either page file
  - Visual appearance unchanged (hover, active states match current)
- Sources: Opus CSS H1, H2

### Bead 5.2 — Align AudioVisualizer to design system
- **Priority**: P2
- Fix `.av-btn-primary` (`AudioVisualizer.astro:201-210`): Change from solid-fill default to outlined (accent border + accent text), solid fill on hover. Remove `!important` flags.
- Replace `#ffb3b3` (`AudioVisualizer.astro:220`) with `--av-danger: #ff4444` token.
- Rename `--av-panel` → `--av-surface`, `--av-ink-secondary` → `--av-ink2`.
- **Acceptance Criteria**:
  - Start/Save buttons show outlined style (matching Subscribe button on homepage)
  - Hover fills solid accent (same as all other primary buttons)
  - No `!important` on `.av-btn-primary`
  - Error/warning messages use `#ff4444` (matching other tools)
  - Grep for `--av-panel` returns 0 results
- Sources: Opus CSS M1, M3, M4

### Bead 5.3 — Fix hardcoded accent in AnimatedLogo
- **Priority**: P3
- `src/components/AnimatedLogo.astro:87,92` — Replace `color: #ff2f72 !important` with CSS custom property reference. Try increasing specificity to remove `!important`.
- **Acceptance Criteria**:
  - No `#ff2f72` in AnimatedLogo styles (pixel art colors excluded — those are intentional)
  - Logo letters still appear in accent pink
  - No `!important` needed for color
- Sources: Opus CSS M2

---

## Phase 6: Origin Isolation Consistency (P2)

Moved before SEO phase because canonical URL decisions depend on correct origin routing.

### Bead 6.1 — Standardize toolsUrl() usage across tools pages
- **Priority**: P2
- Add `import { toolsUrl } from '@/utils/toolsUrl'` to:
  - `src/pages/tools/index.astro` — wrap card hrefs
  - `src/pages/tools/[slug].astro` — wrap "Back to Tools" and livePath
  - `src/pages/tools/*/live.astro` (3 files) — wrap back links
- Fix prefix match in `toolsUrl.ts:6`: change `path.startsWith('/tools')` to `path === '/tools' || path.startsWith('/tools/')`
- **Acceptance Criteria**:
  - Grep for `href="/tools` in `src/pages/tools/` returns 0 results (all wrapped in `toolsUrl()`)
  - With `PUBLIC_TOOLS_ORIGIN` unset: all links work as before
  - With `PUBLIC_TOOLS_ORIGIN=https://tools.example.com`: all `/tools/*` links resolve to tools origin
  - Path `/toolsmith` (hypothetical) would NOT be rewritten
- Sources: Opus Content H2, Codex Routing M1, M2

---

## Phase 7: SEO & Meta Tags (P2)

Social sharing and search engine optimization. Runs after Phase 6 so canonical URLs account for origin isolation.

### Bead 7.1 — Add missing meta tags to BaseLayout
- **Priority**: P2
- `src/layouts/BaseLayout.astro:25-36`
- Add using `Astro.url`:
  - `<link rel="canonical" href={canonicalUrl} />`
  - `<meta property="og:url" content={canonicalUrl} />`
  - `<meta property="og:site_name" content="HNTBO" />`
- Fix `og:image`: prepend site base URL to relative paths
- Conditional `twitter:card`: `summary_large_image` when image present, `summary` otherwise
- **Acceptance Criteria**:
  - View source of homepage: `og:url`, `og:site_name`, `<link rel="canonical">` present
  - View source of a tool page: `og:image` starts with `https://` (not `/images/...`)
  - Pages without image: `twitter:card` is `summary`, not `summary_large_image`
- Sources: Opus Content H3, M5, L1, L2

### Bead 7.2 — Add publishDate to tutorials + strengthen schema
- **Priority**: P2
- Add `publishDate` to all 3 tutorial content files (use actual YouTube publish dates)
- In `src/content/config.ts:12`: change `publishDate: z.string().optional()` to `z.coerce.date().optional()`
- In sort logic (`index.astro`, `tutos/index.astro`): guard against missing dates with explicit fallback
- **Acceptance Criteria**:
  - All 3 tutorial markdown files have `publishDate` in frontmatter
  - `npm run build` succeeds with new date schema
  - Tutorials on homepage appear in chronological order (newest first)
  - Adding a tutorial without `publishDate` still builds (field is optional)
- Sources: Opus Content M4, L3, Codex Content M1, M2

---

## Phase 8: Tool Component Polish (P3)

### Bead 8.1 — Lazy-load docx library + MD2Word cleanup
- **Priority**: P3
- **Lazy-load** (`MD2Word.astro:412`): Replace top-level `import { Document, Packer, ... } from 'docx'` with dynamic import inside convert function:
  ```ts
  async function convertToDocx() {
    const { Document, Packer, ... } = await import('docx');
    // ...
  }
  ```
- **Batch dedup** (`MD2Word.astro:937`): Use `(name, size, lastModified)` tuple instead of name-only
- **Filename sanitization** (`MD2Word.astro:858`): Strip `<>:"/\|?*` from filename input before download
- **Acceptance Criteria**:
  - Initial page load does NOT fetch the docx chunk (verify in Network tab)
  - First convert triggers the docx import (small delay, then conversion proceeds)
  - Two files with same name but different content both appear in file list
  - Filename input with `test<>file` produces download named `test__file.docx`
- Sources: Codex Tools H2, M1, Opus Tools L3

### Bead 8.2 — AudioVisualizer cleanup + mic permission deferral
- **Priority**: P3
- **Null refs on stop** (`AudioVisualizer.astro:641-652`): Add `audioCtx = null; analyser = null; srcNode = null; stream = null;` after cleanup
- **Resize listener** (`AudioVisualizer.astro:356`): Add `beforeunload` handler to remove listener
- **Defer mic permission** (`AudioVisualizer.astro:878-879`): Remove `primePermission()` from boot IIFE. Move to first Start button click.
- **Acceptance Criteria**:
  - After clicking Stop, audio references are null (verify in console: `audioCtx === null`)
  - No mic permission prompt on initial page load
  - Clicking Start for the first time triggers mic permission prompt
  - Mic device list populates after permission granted
- Sources: Opus Tools M6, M7, L6, Codex Security H2

---

## Phase 9: Accessibility Polish (P3)

### Bead 9.1 — Labels, keyboard access, decorative elements
- **Priority**: P3
- **MD2Word**: Add `aria-label="Markdown input"` to textarea. Add `tabindex="0"`, `role="button"`, `aria-label="Choose .md files to convert"` to drop zone + keydown handler for Enter/Space. Add `aria-label="Remove {filename}"` to file remove buttons. Add `aria-label="Select Markdown files"` to hidden file input.
- **AudioVisualizer**: Replace empty `<label>&nbsp;</label>` with `<span aria-hidden="true">&nbsp;</span>`. Add `aria-label="Glow value"` (etc.) to companion number inputs.
- **SVGs**: Add `aria-hidden="true"` to all decorative SVG icons in Header, Footer, Card, page files.
- **External links**: Add `<span class="sr-only">(opens in new tab)</span>` to links with `target="_blank"`.
- **Acceptance Criteria**:
  - Screen reader announces "Markdown input" when focusing textarea
  - Drop zone reachable by Tab, activatable by Enter
  - No empty label announcements in AudioVisualizer
  - SVGs inside `aria-label`ed links are hidden from screen readers
  - External links announce "opens in new tab"
- Sources: Opus A11y M1-M8, H5

---

## Phase 10: Content Schema Hardening (P4)

### Bead 10.1 — Validation script + schema tightening
- **Priority**: P4
- Add `z.string().regex(/^[\w-]{11}$/)` for `youtubeId` in `src/content/config.ts`
- Validate `livePath` as absolute URL or `/tools/...` path
- Add `npm run validate:content` script (runs `astro check` or custom Zod validation)
- **Acceptance Criteria**:
  - `youtubeId: "invalid"` fails build with clear error
  - `livePath: "not-a-path"` fails build
  - `npm run validate:content` exits 0 on current content, exits 1 on invalid test content
- Sources: Codex Content M1, L1

---

## Dependency Graph

```
Phase 1 (Quick Fixes) ─────────────────────> no deps, start immediately
Phase 2 (A11y Foundation) ──────────────────> no deps, start immediately
Phase 3 (MD2Word Parser) ──────────────────> no deps, start immediately
Phase 4 (FolderManager Safety) ────────────> no deps, start immediately
Phase 5 (CSS/Design System) ───────────────> no deps, start immediately
Phase 6 (Origin Isolation) ────────────────> no deps, start immediately
Phase 7 (SEO) ─────────────────────────────> depends on Phase 6 (canonical URLs need origin routing)
Phase 8 (Tool Polish) ─────────────────────> depends on Phase 3 (MD2Word: same file, avoid conflicts)
Phase 9 (A11y Polish) ─────────────────────> depends on Phase 2 (ARIA tab structure must exist first)
Phase 10 (Content Schema) ─────────────────> depends on Phase 7 (publishDate changes)
```

**Recommended execution order**: Phases 1-4 first (P0/P1), then 5-6 (P2), then 7 (after 6), then 8-10 (P3/P4).

---

## Beads to Create (26 total)

```bash
# Phase 1: Quick Fixes
bd create --title="Fix broken kerning tutorial download link" --type=bug --priority=0
bd create --title="Fix FMOTION desktop link (target, rel)" --type=bug --priority=1
bd create --title="Standardize fmotion.fr URL (www vs non-www)" --type=bug --priority=2
bd create --title="Fix external livePath link attributes" --type=bug --priority=2

# Phase 2: Accessibility Foundation
bd create --title="Add skip-to-content link + mobile menu ARIA" --type=task --priority=1
bd create --title="Add FolderManager modal a11y (dialog role, focus trap)" --type=task --priority=1
bd create --title="Add ARIA tab widgets: MD2Word + FolderManager" --type=task --priority=1
bd create --title="Add ARIA tab widget: AudioVisualizer (div→button + roles)" --type=task --priority=1
bd create --title="Add aria-pressed to filter buttons" --type=task --priority=2
bd create --title="Add prefers-reduced-motion (JS + CSS)" --type=task --priority=2

# Phase 3: MD2Word Parser
bd create --title="Fix MD2Word code fence + table detection bugs" --type=bug --priority=0
bd create --title="Fix MD2Word list parsing (HR ordering, nesting, continuation)" --type=bug --priority=1
bd create --title="Fix MD2Word DOCX fidelity (blockquote, code blocks, ordered lists)" --type=bug --priority=1
bd create --title="Document MD2Word nested formatting limitation" --type=task --priority=3

# Phase 4: FolderManager Safety
bd create --title="Fix FolderManager TOCTOU delete race condition" --type=bug --priority=1
bd create --title="Separate FolderManager read/write folder handles" --type=task --priority=2

# Phase 5: CSS / Design System
bd create --title="Extract filter-button styles + replace hardcoded accent rgba" --type=task --priority=2
bd create --title="Align AudioVisualizer to design system (buttons, tokens, colors)" --type=task --priority=2
bd create --title="Fix AnimatedLogo hardcoded accent color" --type=task --priority=3

# Phase 6: Origin Isolation
bd create --title="Standardize toolsUrl() usage + fix prefix match" --type=task --priority=2

# Phase 7: SEO
bd create --title="Add canonical URL, og:url, og:site_name, fix og:image paths" --type=task --priority=2
bd create --title="Add publishDate to tutorials + strengthen date schema" --type=task --priority=2

# Phase 8: Tool Polish
bd create --title="Lazy-load docx library + MD2Word cleanup (dedup, filename)" --type=task --priority=3
bd create --title="AudioVisualizer cleanup + defer mic permission" --type=task --priority=3

# Phase 9: A11y Polish
bd create --title="Add missing ARIA labels, keyboard access, aria-hidden on SVGs" --type=task --priority=3

# Phase 10: Content Schema
bd create --title="Add content validation script + tighten Zod schemas" --type=task --priority=4
```

### Dependencies to set:
```bash
# Phase 7 depends on Phase 6
bd dep add <bead-7.1> <bead-6.1>   # SEO canonicals depend on origin routing
bd dep add <bead-7.2> <bead-6.1>   # publishDate sort depends on origin routing (minor)

# Phase 8 depends on Phase 3
bd dep add <bead-8.1> <bead-3.1>   # Lazy-load depends on parser fixes (same file)
bd dep add <bead-8.1> <bead-3.3>   # DOCX fidelity changes in same file

# Phase 9 depends on Phase 2
bd dep add <bead-9.1> <bead-2.3a>  # A11y polish depends on tab ARIA structure
bd dep add <bead-9.1> <bead-2.3b>  # A11y polish depends on AV tab ARIA

# Phase 10 depends on Phase 7
bd dep add <bead-10.1> <bead-7.2>  # Schema hardening depends on publishDate changes
```

---

## Verification

### Per-phase checks:
1. `npm run build` — zero errors (warnings tracked per bead below)
2. `npm run preview` — manual check of affected pages
3. Keyboard-only navigation test on affected components

### Known warnings to resolve:
- None currently. Build is clean as of session start. If warnings appear during work, the bead that introduced them owns the fix.

### Parser change verification (Phase 3):
Test each fix with the exact reproduction inputs from audit findings:
- Unclosed fence: paste markdown with opening ` ``` ` and no closing fence
- Table false positive: paste `The result of A | B is a bitwise OR.`
- HR/list: paste `* * *`
- List continuation: paste `- Item\n  continuation line`
- Blockquote: paste `> This has **bold** text`
- Code block: paste multi-line fenced code, open DOCX in Word
- Ordered list: paste `3. Third\n4. Fourth`

### After all phases:
1. Full `npm run build` + deploy to Vercel preview
2. Lighthouse Accessibility audit — target 90+ (current score TBD, measure before starting)
3. Screen reader spot-check on: homepage, tutos page, one tool live page, mobile nav

---

## What This Plan Does NOT Include

- **Replacing the MD2Word regex parser with a full AST parser** — Documented as a UI limitation instead. A recursive parser is a separate project.
- **Nonce-based CSP** — `unsafe-inline` is an Astro framework constraint (see Future Considerations).
- **CSS refactor to shared root tokens** — Per-component token isolation is intentional for portability.
- **New content** (tutorials, tools, HowIAI page) — This is a code quality overhaul.
- **Duplicate content ID build warnings** — Verified as non-existent. Clean build confirmed.

## Future Considerations

- **Astro CSP nonce support**: When Astro's experimental `security.checkOrigin` and CSP nonce features stabilize, evaluate migrating from `unsafe-inline` to nonce-based `script-src`. This would be a separate project touching the build pipeline and every inline script.
- **Full markdown parser replacement**: If MD2Word becomes a flagship tool, consider replacing the regex parser with a proper AST parser (e.g., `marked` or `remark`) to support the full CommonMark spec including nested formatting.
- **Origin isolation deployment**: When `PUBLIC_TOOLS_ORIGIN` is actually configured for production, add CI verification that the split-origin topology is correctly configured (separate from the code-level `toolsUrl()` consistency addressed in Phase 6).
