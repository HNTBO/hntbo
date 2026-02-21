# Content Schema and Build Integrity Audit

The project already uses Astro content collections, which is a strong foundation. The main gaps are in validation strictness and build reliability signals: important fields are only typed as free-form strings, and current builds emit duplicate-id warnings. These gaps can allow silent content quality regressions to reach production.

Conducted February 21, 2026.

---

## Findings by Severity

### CRITICAL

None.

### HIGH

#### H1. Build emits duplicate content ID warnings for tool entries (`src/content/tools/bubblebeats.md:1`, `src/content/tools/brute-bookmarks.md:1`) — Confidence: Medium
- Code snippet showing the problem:
```md
---
title: "BubbleBeats"
...
---
```
- **Reproduction:**
  1. Run `npm run build`.
  2. Observe warnings from Astro glob loader:
     - `Duplicate id "brute-bookmarks" ...`
     - `Duplicate id "bubblebeats" ...`
- Explanation of what's wrong and why it matters:
  - Duplicate IDs can cause one content entry to overwrite another in collection resolution.
  - The warning currently appears during normal builds, so release integrity depends on manual log review.
- **Recommendation:**
  - Treat duplicate-id warnings as CI failures.
  - Investigate root cause and eliminate duplicate source resolution paths.  
  - `[Assumption]` warning may be influenced by path resolution behavior in the current environment; still should fail closed in CI.

### MEDIUM

#### M1. Schema allows unrestricted string values for critical fields (`src/content/config.ts:8`, `src/content/config.ts:12`, `src/content/config.ts:28`) — Confidence: High
- Code snippet showing the problem:
```ts
youtubeId: z.string(),
publishDate: z.string().optional(),
livePath: z.string().optional(),
```
- Explanation of what's wrong and why it matters:
  - Invalid YouTube IDs, malformed dates, or unsafe/invalid `livePath` values pass schema validation and fail only at runtime/UI.
- **Recommendation:**
  - Add `z.string().regex(...)` for YouTube IDs.
  - Use `z.coerce.date()` or strict ISO-date validator.
  - Validate `livePath` as either absolute URL or `/tools/...` path by policy.

#### M2. Date sorting does not guard invalid timestamps (`src/pages/index.astro:12`, `src/pages/tutos/index.astro:8`) — Confidence: High
- Code snippet showing the problem:
```ts
const dateA = a.data.publishDate ? new Date(a.data.publishDate).getTime() : 0;
```
- Explanation of what's wrong and why it matters:
  - `Invalid Date` becomes `NaN`; comparator results can become unstable or misleading.
- **Recommendation:**
  - Normalize invalid dates to explicit fallback (`Number.NEGATIVE_INFINITY`) and log/flag invalid content.

### LOW

#### L1. No dedicated content validation script in npm workflows (`package.json:5`) — Confidence: High
- Code snippet showing the problem:
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build"
}
```
- Explanation of what's wrong and why it matters:
  - Content regressions are mostly discovered only during full build and manual log inspection.
- **Recommendation:**
  - Add a fast `npm run validate:content` step and run it in CI before build.

---

## Recommended Fix Plan

1. Fail CI on duplicate-id warnings and resolve root cause (H1)  
Affected files: CI config, content loading path config  
Effort: 1-3 hrs

2. Strengthen Zod schema constraints for IDs/dates/paths (M1)  
Affected files: `src/content/config.ts`  
Effort: 30-90 min

3. Make sorting robust to invalid dates with explicit fallback behavior (M2)  
Affected files: `src/pages/index.astro`, `src/pages/tutos/index.astro`  
Effort: 20-40 min

4. Add standalone content validation command (L1)  
Affected files: `package.json`, CI workflow  
Effort: 20-60 min

### What NOT to Change

- Keep Astro content collections as the source of truth for tutorials/tools.
- Keep typed frontmatter schema presence (already much better than untyped markdown parsing).
- Keep `getStaticPaths()` per slug pages; this ensures build-time route determinism.
- Keep optional metadata fields (`downloadLabel`, `liveLabel`) to support heterogeneous tool/tutorial cards.
- Keep current featured/sorted content rendering approach; it is readable and straightforward once inputs are validated.

---

## Summary Table

| Priority | Item | Confidence | Files Affected | Effort |
|----------|------|:----------:|----------------|--------|
| High | H1: Duplicate content ID warnings during build | Medium | `src/content/tools/bubblebeats.md`, `src/content/tools/brute-bookmarks.md` | 1-3 hrs |
| Medium | M1: Schema too permissive for critical fields | High | `src/content/config.ts` | 30-90 min |
| Medium | M2: Date sorting not robust to invalid dates | High | `src/pages/index.astro`, `src/pages/tutos/index.astro` | 20-40 min |
| Low | L1: Missing dedicated content validation script | High | `package.json` | 20-60 min |
