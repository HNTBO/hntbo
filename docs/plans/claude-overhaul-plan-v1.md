# HNTBO Codebase Overhaul Plan v1

## Context

Two independent audits (Claude Opus 4.6 and OpenAI Codex) examined the HNTBO codebase on 2026-02-21, producing 10 audit documents with a combined ~85 deduplicated findings. This plan consolidates both sets of findings into an actionable overhaul, organized into phases that can be tracked as beads.

The codebase is healthy — no build failures, no broken pages, no security vulnerabilities. The issues are: parser bugs in MD2Word, missing accessibility infrastructure, CSS token drift, SEO gaps, and a few broken links. The overhaul brings the site from "works" to "works correctly and accessibly."

---

## Phase Overview

| # | Phase | Beads | Effort | Priority |
|---|-------|:-----:|--------|----------|
| 1 | Quick Fixes | 4 | ~1 hr | P0 — do first |
| 2 | Accessibility Foundation | 5 | ~4-5 hr | P1 — WCAG AA compliance |
| 3 | MD2Word Parser Hardening | 4 | ~4-6 hr | P1 — user-facing bugs |
| 4 | FolderManager Safety | 2 | ~2 hr | P1 — data loss prevention |
| 5 | CSS / Design System | 3 | ~2-3 hr | P2 — maintainability |
| 6 | SEO & Meta Tags | 2 | ~1-2 hr | P2 — discoverability |
| 7 | Origin Isolation | 1 | ~1 hr | P2 — infra consistency |
| 8 | Tool Component Polish | 2 | ~2-3 hr | P3 — robustness |
| 9 | Accessibility Polish | 1 | ~1-2 hr | P3 — a11y completeness |
| 10 | Content Schema | 1 | ~1 hr | P4 — future-proofing |
| | **Total** | **25** | **~20-30 hr** | |

---

## Phase 1: Quick Fixes (P0)

Broken things that users can hit right now. No dependencies, no architectural decisions.

### Bead 1.1 — Fix broken download link
- **Type**: bug, **Priority**: P0
- `src/content/tutorials/houdini-kerning-vex.md:7` — `downloadUrl: "/downloads/kerning-hda.zip"` points to nonexistent file
- Actual file: `public/downloads/sop_Fred.kern_tool.1.0.hdalc`
- **Fix**: Update frontmatter to match actual filename (or rename file)
- Sources: Opus Content H1

### Bead 1.2 — Fix FMOTION desktop link
- **Type**: bug, **Priority**: P1
- `src/components/Header.astro:54-60` — desktop link missing `target="_blank"` and `rel="noopener noreferrer"` (mobile version has them)
- **Fix**: Add both attributes to match mobile behavior
- Sources: Opus Content M1, Opus Security M3, Codex A11y L1

### Bead 1.3 — Standardize fmotion.fr URL
- **Type**: bug, **Priority**: P2
- `Header.astro:13` uses `https://www.fmotion.fr`, `contact.astro:89` uses `https://fmotion.fr`
- **Fix**: Pick canonical form, update both locations
- Sources: Opus Content M2

### Bead 1.4 — Fix external livePath link attributes
- **Type**: bug, **Priority**: P2
- `src/pages/tools/[slug].astro:47-58` — "Try Live Demo" link for external tools (BubbleBeats, BruteBookmarks) has no `target="_blank"` / `rel="noopener noreferrer"`
- **Fix**: Add conditional: if `livePath` starts with `http`, add target/rel
- Sources: Opus Security L6

---

## Phase 2: Accessibility Foundation (P1)

WCAG AA compliance gaps. The site's interactive elements (mobile nav, tool UIs, modals) lack the ARIA infrastructure screen reader users need.

### Bead 2.1 — Skip link + mobile menu ARIA
- **Type**: task, **Priority**: P1
- **Skip link**: Add `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>` as first child of `<body>` in `BaseLayout.astro`. Add `id="main-content"` to `<main>`.
- **Mobile menu**: In `Header.astro:67-117`, add `aria-expanded="false"`, `aria-controls="mobile-menu"` to button. Toggle `aria-expanded` in click handler. Add Escape key to close. Move focus to first link on open, return to button on close.
- Files: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`
- Sources: Opus A11y C1, C3, M9

### Bead 2.2 — FolderManager modal accessibility
- **Type**: task, **Priority**: P1
- `src/components/FolderManager.astro:92-101, 520-537`
- Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby="fm-modal-title"` to modal overlay
- Move focus to Cancel button on open
- Trap focus within modal (Tab cycle between Cancel and Confirm)
- Close on Escape key
- Return focus to trigger button on close
- Sources: Opus A11y C2

### Bead 2.3 — ARIA tab widgets for all 3 tool components
- **Type**: task, **Priority**: P1
- **MD2Word** (`MD2Word.astro:11-14`): Tabs are `<button>` — add `role="tablist"` on container, `role="tab"` + `aria-selected` on buttons, `role="tabpanel"` + `aria-labelledby` on panels. Add Arrow key navigation.
- **FolderManager** (`FolderManager.astro:29-33`): Same pattern as MD2Word.
- **AudioVisualizer** (`AudioVisualizer.astro:65-68`): Tabs are `<div>` — **change to `<button>`** first, then add ARIA roles. This is the most critical one because divs are completely keyboard-unreachable.
- Sources: Opus A11y H2, H3

### Bead 2.4 — Filter button semantics
- **Type**: task, **Priority**: P2
- `src/pages/tutos/index.astro:28-34`, `src/pages/tools/index.astro:28-34`
- Add `aria-pressed="true"` to active filter, `aria-pressed="false"` to inactive
- Toggle in click handler script alongside the `.active` class
- Sources: Opus A11y H4, Codex A11y M1

### Bead 2.5 — prefers-reduced-motion
- **Type**: task, **Priority**: P2
- **JS**: In `AnimatedLogo.astro:131-146`, wrap `setTimeout(runCycle, ...)` in `if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)`
- **CSS**: In `global.css`, add media query to disable transitions/animations:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
    html { scroll-behavior: auto; }
  }
  ```
- Sources: Opus A11y H6, M7, L4, Codex A11y M2

---

## Phase 3: MD2Word Parser Hardening (P1)

The custom markdown parser is the highest-density bug area. These are all user-facing — someone pastes markdown, gets wrong output.

### Bead 3.1 — Fix code fence + table detection
- **Type**: bug, **Priority**: P0
- **Unclosed code fence** (`MD2Word.astro:559-568`): When closing ` ``` ` is missing, the `while` loop swallows the entire rest of the document. Fix: after loop, check `i < lines.length`. If no closing fence found, treat opening as paragraph or emit code block with warning.
- **Table detection** (`MD2Word.astro:613`): Any line with `|` triggers table parsing. Fix: validate that collected lines include a separator row matching `/^\|?[\s\-:|]+\|[\s\-:|]+\|?$/`. If not, fall through to paragraph.
- Sources: Opus Tools C1, H2

### Bead 3.2 — Fix list parsing
- **Type**: bug, **Priority**: P1
- **HR/list ordering** (`MD2Word.astro:573,606`): Move horizontal rule check before list check, or test for spaced-asterisk HR pattern first. Prevents `* * *` (valid HR) from being parsed as a list item.
- **List continuation**: Treat lines starting with whitespace (not a new block marker) as continuations of previous list item.
- **List nesting**: Support 2-4 space indentation for sub-items, map to `bullet.level > 0`.
- Sources: Opus Tools H3, M1

### Bead 3.3 — Fix DOCX generation fidelity
- **Type**: bug, **Priority**: P1
- **Blockquote inline formatting** (`MD2Word.astro:802-810`): Replace single `TextRun(block.text)` with `makeTextRuns(block.text)` to process `**bold**`, `*italic*`, etc. inside blockquotes.
- **Code block line breaks** (`MD2Word.astro:767-777`): Split `block.text` on `\n` and emit one Paragraph per line (all Consolas + indent) for reliable multi-line rendering.
- **Ordered list numbering** (`MD2Word.astro:789-799`): Preserve source start number, or use `docx` library's native numbered list feature.
- Sources: Opus Tools M2, M3, M5

### Bead 3.4 — Document inline formatting limitation
- **Type**: task, **Priority**: P3
- The regex at `MD2Word.astro:673` fundamentally cannot handle nested inline formatting (`**bold *italic* bold**`). A proper fix requires a recursive parser — significant effort.
- **Fix (quick)**: Add a note in the UI or help text: "Supported: `***bold italic***`, `**bold**`, `*italic*`. Nested formatting like `**bold *italic* bold**` is not supported."
- **Fix (long-term)**: Replace regex with state-machine parser (bigger effort, separate bead if desired).
- Sources: Opus Tools H1

---

## Phase 4: FolderManager Safety (P1)

Data-loss prevention for the file system tool.

### Bead 4.1 — Fix TOCTOU delete race condition
- **Type**: bug, **Priority**: P1
- `src/components/FolderManager.astro:610, 717`
- Before each `removeEntry`, re-check that the folder is still empty (iterate its entries). Use `removeEntry(target)` without `{ recursive: true }` first — if the folder is no longer empty, it will fail safely. Catch the error and report to user.
- Sources: Codex Tools C1, Opus Tools L1

### Bead 4.2 — Separate folder handles by tab
- **Type**: task, **Priority**: P2
- `src/components/FolderManager.astro:500-513`
- Replace shared `folderHandle` with per-tab handles (`delHandle`, `countHandle`). When count tab sets a read-only handle, do NOT enable the delete scan button. Show message: "Select folder from Delete tab for write access."
- Sources: Codex Tools H1, Opus Tools M4, L5

---

## Phase 5: CSS / Design System Alignment (P2)

Token consistency and style deduplication.

### Bead 5.1 — Extract and centralize filter-button styles
- **Type**: task, **Priority**: P2
- Remove duplicate `<style>` blocks from `tutos/index.astro:90-112` and `tools/index.astro:91-113`
- Add `.filter-btn` to `global.css` under `@layer components`
- Replace hardcoded `rgba(255, 47, 114, ...)` with Tailwind utilities (`@apply border-accent/50`, `bg-accent/10`, `text-accent`)
- Sources: Opus CSS H1, H2

### Bead 5.2 — Align AudioVisualizer to design system
- **Type**: task, **Priority**: P2
- Fix `.av-btn-primary` (`AudioVisualizer.astro:201-210`): Change from solid-fill default to outlined default (accent border + accent text), solid fill on hover. Remove `!important` flags.
- Replace `#ffb3b3` (`AudioVisualizer.astro:220`) with `--av-danger: #ff4444` token to match other tools.
- Rename `--av-panel` → `--av-surface`, `--av-ink-secondary` → `--av-ink2` for naming consistency.
- Sources: Opus CSS M1, M3, M4

### Bead 5.3 — Fix hardcoded accent in AnimatedLogo
- **Type**: task, **Priority**: P3
- `src/components/AnimatedLogo.astro:87,92` — Replace `color: #ff2f72 !important` with CSS custom property reference. Try increasing specificity to remove `!important`.
- Sources: Opus CSS M2

---

## Phase 6: SEO & Meta Tags (P2)

Social sharing and search engine optimization.

### Bead 6.1 — Add missing meta tags to BaseLayout
- **Type**: task, **Priority**: P2
- `src/layouts/BaseLayout.astro:25-36`
- Add using `Astro.url`:
  - `<link rel="canonical" href={canonicalUrl} />`
  - `<meta property="og:url" content={canonicalUrl} />`
  - `<meta property="og:site_name" content="HNTBO" />`
- Fix `og:image`: prepend site base URL to relative paths
- Conditional `twitter:card`: use `summary_large_image` when image present, `summary` otherwise
- Sources: Opus Content H3, M5, L1, L2

### Bead 6.2 — Add publishDate to tutorials + strengthen schema
- **Type**: task, **Priority**: P2
- Add `publishDate` to all 3 tutorial content files (look up actual YouTube publish dates)
- In `src/content/config.ts:12`: change `publishDate: z.string().optional()` to `z.coerce.date().optional()`
- In sort logic (`index.astro`, `tutos/index.astro`): guard against `NaN` dates
- Sources: Opus Content M4, L3, Codex Content M1, M2

---

## Phase 7: Origin Isolation Consistency (P2)

### Bead 7.1 — Standardize toolsUrl() usage across tools pages
- **Type**: task, **Priority**: P2
- Add `import { toolsUrl } from '@/utils/toolsUrl'` to:
  - `src/pages/tools/index.astro` — wrap card href
  - `src/pages/tools/[slug].astro` — wrap "Back to Tools" and livePath
  - `src/pages/tools/*/live.astro` (3 files) — wrap back links
- Fix prefix match in `toolsUrl.ts:6`: change `path.startsWith('/tools')` to `path === '/tools' || path.startsWith('/tools/')`
- Sources: Opus Content H2, Codex Routing M1, M2

---

## Phase 8: Tool Component Polish (P3)

### Bead 8.1 — Lazy-load docx library
- **Type**: task, **Priority**: P3
- `src/components/MD2Word.astro:412`
- Current: `import { Document, Packer, ... } from 'docx'` at top level (352 KB client bundle)
- **Fix**: Dynamic import only when user clicks Convert:
  ```ts
  async function convertToDocx() {
    const { Document, Packer, ... } = await import('docx');
    // ... rest of conversion
  }
  ```
- Also fix batch dedup (`MD2Word.astro:937`): use `(name, size, lastModified)` tuple instead of name-only
- Sources: Codex Tools H2, M1

### Bead 8.2 — AudioVisualizer + FolderManager cleanup
- **Type**: task, **Priority**: P3
- **AudioVisualizer**:
  - `stop()` function (`AudioVisualizer.astro:641-652`): null out `audioCtx`, `analyser`, `srcNode`, `stream` after cleanup
  - Resize listener (`AudioVisualizer.astro:356`): add `beforeunload` cleanup
  - Defer `primePermission()` (`AudioVisualizer.astro:878-879`): move to first Start click
- **FolderManager**:
  - Sanitize filename in MD2Word (`MD2Word.astro:858`): strip `<>:"/\|?*` from filename input
- Sources: Opus Tools M6, M7, L3, L6

---

## Phase 9: Accessibility Polish (P3)

### Bead 9.1 — Labels, keyboard access, decorative elements
- **Type**: task, **Priority**: P3
- **MD2Word**: Add `aria-label="Markdown input"` to textarea. Add `tabindex="0"`, `role="button"`, `aria-label` to drop zone. Add `aria-label="Remove {filename}"` to file remove buttons. Add `aria-label` to hidden file input.
- **AudioVisualizer**: Replace empty `<label>&nbsp;</label>` with `<span aria-hidden="true">`. Add `aria-label` to companion number inputs.
- **SVGs**: Add `aria-hidden="true"` to all decorative SVG icons in Header, Footer, Card, page files.
- **External links**: Add `<span class="sr-only">(opens in new tab)</span>` to links with `target="_blank"`.
- Sources: Opus A11y M1-M8, H5

---

## Phase 10: Content Schema Hardening (P4)

### Bead 10.1 — Validation script + schema tightening
- **Type**: task, **Priority**: P4
- Add `z.string().regex(/^[\w-]{11}$/)` for `youtubeId` in `src/content/config.ts`
- Validate `livePath` as absolute URL or `/tools/...` path
- Add `npm run validate:content` script (runs `astro check` or custom Zod validation)
- Sources: Codex Content M1, L1

---

## Dependency Graph

```
Phase 1 (Quick Fixes) ─────────────────────> can start immediately
Phase 2 (A11y Foundation) ──────────────────> can start immediately
Phase 3 (MD2Word Parser) ──────────────────> can start immediately
Phase 4 (FolderManager Safety) ────────────> can start immediately
Phase 5 (CSS/Design System) ───────────────> can start immediately
Phase 6 (SEO) ─────────────────────────────> can start immediately
Phase 7 (Origin Isolation) ────────────────> can start immediately
Phase 8 (Tool Polish) ─────────────────────> depends on Phase 3 (MD2Word changes)
Phase 9 (A11y Polish) ─────────────────────> depends on Phase 2 (ARIA tab structure)
Phase 10 (Content Schema) ─────────────────> depends on Phase 6 (publishDate changes)
```

Most phases are independent. Recommend working Phases 1-4 first (highest priority), then 5-7, then 8-10.

---

## Beads to Create (25 total)

```bash
# Phase 1: Quick Fixes
bd create --title="Fix broken kerning tutorial download link" --type=bug --priority=0
bd create --title="Fix FMOTION desktop link (target, rel)" --type=bug --priority=1
bd create --title="Standardize fmotion.fr URL (www vs non-www)" --type=bug --priority=2
bd create --title="Fix external livePath link attributes" --type=bug --priority=2

# Phase 2: Accessibility Foundation
bd create --title="Add skip-to-content link + mobile menu ARIA" --type=task --priority=1
bd create --title="Add FolderManager modal a11y (dialog role, focus trap)" --type=task --priority=1
bd create --title="Add ARIA tab widgets to 3 tool components" --type=task --priority=1
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

# Phase 6: SEO
bd create --title="Add canonical URL, og:url, og:site_name, fix og:image paths" --type=task --priority=2
bd create --title="Add publishDate to tutorials + strengthen date schema" --type=task --priority=2

# Phase 7: Origin Isolation
bd create --title="Standardize toolsUrl() usage + fix prefix match" --type=task --priority=2

# Phase 8: Tool Polish
bd create --title="Lazy-load docx library + fix batch filename dedup" --type=task --priority=3
bd create --title="AudioVisualizer + FolderManager cleanup (refs, listeners, filename)" --type=task --priority=3

# Phase 9: A11y Polish
bd create --title="Add missing ARIA labels, keyboard access, aria-hidden on SVGs" --type=task --priority=3

# Phase 10: Content Schema
bd create --title="Add content validation script + tighten Zod schemas" --type=task --priority=4
```

### Dependencies to set:
```bash
bd dep add <bead-8.1> <bead-3.1>   # Lazy-load depends on parser fixes (same file)
bd dep add <bead-8.1> <bead-3.3>   # Same file, avoid conflicts
bd dep add <bead-9.1> <bead-2.3>   # A11y polish depends on tab ARIA structure
bd dep add <bead-10.1> <bead-6.2>  # Schema hardening depends on publishDate changes
```

---

## Verification

After each phase:
1. `npm run build` — zero warnings, zero errors
2. `npm run preview` — manual check of affected pages
3. Keyboard-only navigation test (Tab through page, Escape to close menus/modals)
4. For parser changes: test with the reproduction inputs from audit findings

After all phases:
5. Full `npm run build` + deploy to Vercel preview
6. Lighthouse audit (Accessibility score should improve from current to 90+)
7. Screen reader spot-check (VoiceOver or NVDA on key flows)

---

## What This Plan Does NOT Include

- **Replacing the MD2Word regex parser with a full AST parser** — The nested inline formatting issue (Opus Tools H1) is documented but not fully fixed. A proper recursive parser is a larger project; this plan documents the limitation in the UI instead.
- **Nonce-based CSP** — `unsafe-inline` is an Astro framework constraint. Removing it requires Astro's experimental CSP nonce support or script externalization. Tracked as a future consideration, not part of this overhaul.
- **CSS/design system refactor to shared root tokens** — The per-component token isolation pattern is intentional for portability. This plan normalizes naming and removes hardcoded values but keeps the architecture.
- **New content** (tutorials, tools, HowIAI page) — This is a code quality overhaul, not a content update.
