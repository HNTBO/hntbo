# Feedback on Claude Audit Reports

Reviewed files:
- `docs/audits/opus-accessibility-audit.md`
- `docs/audits/opus-content-routing-seo-audit.md`
- `docs/audits/opus-css-design-system-audit.md`
- `docs/audits/opus-interactive-tools-audit.md`
- `docs/audits/opus-security-csp-audit.md`

Reviewed on February 21, 2026.

## Overall Assessment

Claude's audit set is strong on breadth and structure. The reports are easy to scan, usually evidence-backed, and include many valid high-signal issues. The biggest quality gap is curation: several findings contradict themselves, include preference-level items as defects, or are miscalibrated in severity.

## What Claude Did Well

- Covered all major risk surfaces: security headers/CSP, routing/origin isolation, tool runtime logic, accessibility, content/SEO.
- Included concrete file references and usually actionable fixes.
- Caught real issues that matter:
  - Broken tutorial download link path mismatch (`src/content/tutorials/houdini-kerning-vex.md:7` vs file in `public/downloads/`).
  - `toolsUrl()` inconsistency across tools pages (`src/pages/tools/*.astro`).
  - Missing canonical/`og:url` metadata in `src/layouts/BaseLayout.astro`.
  - Mobile menu ARIA/state gaps in `src/components/Header.astro`.
  - AudioVisualizer tabs implemented as non-focusable divs (`src/components/AudioVisualizer.astro`).

## Key Problems to Fix in Claude's Audit Quality

- Internal contradictions were left in severity sections.
- Severity calibration is inconsistent (some cosmetic findings are too high; some real risks are too low).
- Scope drift appears repeatedly (UX/style preferences framed as defects).
- Duplicate findings appear across multiple audit documents.
- Some claims are technically incorrect or weakly grounded.

## Concrete Feedback by Report

### `opus-accessibility-audit.md`

- Strong findings to keep:
  - Mobile menu ARIA/state/focus issues.
  - Missing skip link.
  - Inaccessible AudioVisualizer tab controls.
  - Filter state not exposed semantically.
- Findings to revise/remove:
  - H1 is self-contradictory: it claims contrast failure, then proves AA pass (~6.06:1), and still remains in HIGH (`opus-accessibility-audit.md:79`, `opus-accessibility-audit.md:110`, `opus-accessibility-audit.md:556`).
  - L2 is explicitly "no issue here" but is still listed as a finding (`opus-accessibility-audit.md:427`, `opus-accessibility-audit.md:432`).
- Severity note:
  - C1/C2/C3 are important, but classifying all as CRITICAL is probably too aggressive for this codebase; HIGH is more defensible unless there is demonstrated blocking impact.

### `opus-content-routing-seo-audit.md`

- Strong findings to keep:
  - Broken kerning download URL (good catch).
  - Missing canonical/OG URL metadata.
  - `toolsUrl()` consistency concerns.
- Findings to downgrade or drop:
  - M2 (www vs non-www fmotion) is minor unless SEO canonical conflict is demonstrated.
  - M3 (LinkedIn mismatch between docs/code) is likely documentation drift, not product defect.
  - L4/L5/L6 are mostly product/content strategy choices, not code defects.
- Suggestion:
  - Tighten this report around behavior regressions and indexability/shareability defects.

### `opus-css-design-system-audit.md`

- Overall quality is good and honest (mostly maintainability/cosmetic).
- Main calibration issue:
  - H1/H2 are arguably MEDIUM (duplication/token purity), not HIGH.
- Good practice shown:
  - Explicit "What NOT to Change" section is substantive and useful.

### `opus-interactive-tools-audit.md`

- Strong findings to keep:
  - False table detection on any `|` (real parser behavior problem).
  - List continuation/nesting limitations.
  - Shared read/readwrite FolderManager handle issue.
  - Permission prompt on load in AudioVisualizer.
- Findings needing correction:
  - M1 (HR/list conflict) appears incorrect; `^[\*\-\+]\s` requires a space, so `***`/`---` are not captured as list entries (`src/components/MD2Word.astro:573`, `src/components/MD2Word.astro:606`).
  - L4 is not a defect; `__text__` as bold is correct CommonMark behavior (`src/components/MD2Word.astro:692`). This is acknowledged in-text but still left as a finding (`opus-interactive-tools-audit.md:376`, `opus-interactive-tools-audit.md:385`, `opus-interactive-tools-audit.md:387`).
- Severity correction:
  - L1 (recursive delete after stale scan) is underestimated. This is a real data-loss risk and should be High/Critical, not Low.

### `opus-security-csp-audit.md`

- Strong findings to keep:
  - `script-src 'unsafe-inline'` risk framing and migration direction.
  - External `livePath` links missing `target`/`rel` handling on tool pages.
- Issues to correct:
  - Intro claims all external links have `rel="noopener noreferrer"`, but desktop FMOTION link does not (`opus-security-csp-audit.md:3` vs `src/components/Header.astro:54`).
  - M2 (missing `media-src`) is mostly a future-proofing note, not a present risk finding.
  - M3 (desktop FMOTION target/rel) is more consistency/UX than security.
- Suggestion:
  - Split true security vulnerabilities from hardening notes to keep the signal high.

## Cross-Report Process Feedback for Claude

- Enforce a hard curation pass before finalizing:
  - If a finding concludes "works correctly" or "no issue," remove it from severity sections.
- Add explicit verification tags per finding:
  - `Verified in runtime`, `Verified in build output`, or `Code-read inference`.
- Limit low-severity/polish findings:
  - Cap to highest-value items (for example, max 3 per report).
- De-duplicate cross-cutting findings:
  - Assign ownership (for example, FMOTION link issue appears in accessibility/content/security reports).
- Calibrate severity by impact, not detectability:
  - Data loss and security boundary failures should outrank style-token drift.

## Suggested Re-Scoping if Claude Re-runs

- Keep and prioritize:
  - FolderManager deletion safety and permission model.
  - CSP hardening path and origin-isolation enforcement.
  - Accessibility semantics for nav/menu/tabs/filter states.
  - Content integrity checks that affect runtime behavior or SEO indexing.
- Remove or move to appendix:
  - Pure stylistic preferences and non-defect observations.
