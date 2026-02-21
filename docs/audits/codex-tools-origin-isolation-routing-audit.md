# Tools Origin Isolation and Routing Audit

The codebase has good foundational support for split-origin hosting, including a dedicated URL helper and deployment docs. The main gap is enforcement: isolation is currently optional and easy to bypass operationally, and link generation is inconsistent across tool pages. This can weaken the intended privilege boundary between marketing pages and high-privilege tools.

Conducted February 21, 2026.

---

## Findings by Severity

### CRITICAL

None.

### HIGH

#### H1. Origin isolation is not enforced by application build/runtime (`astro.config.mjs:4`, `src/pages/tools/folder-manager/live.astro:1`) — Confidence: High
- Code snippet showing the problem:
```ts
export default defineConfig({
  integrations: [tailwind()],
  output: 'static',
});
```
- **Reproduction:**
  1. Run `npm run build`.
  2. Observe static routes include both marketing and `/tools/*` pages in one artifact.
  3. Serve the single artifact on one origin (`npm run preview`) and open `/tools/folder-manager/live`.
  4. The high-privilege tool runs on the same origin as marketing pages unless external infra manually splits traffic.
- Explanation of what's wrong and why it matters:
  - The security model in `docs/tools-origin-isolation.md` depends on deployment discipline, not app-level safeguards. A default single-origin deployment undermines privilege isolation.
- **Recommendation:**
  - Add build profiles or route-level deployment checks to fail CI when split-origin requirements are not configured.
  - Add explicit runtime banner/assertion when `PUBLIC_TOOLS_ORIGIN` is unset in production.

### MEDIUM

#### M1. `toolsUrl()` rewrite is applied selectively; multiple tool backlinks are hardcoded (`src/pages/tools/[slug].astro:25`, `src/pages/tools/audio-visualizer/live.astro:13`, `src/pages/tools/folder-manager/live.astro:13`, `src/pages/tools/md2word/live.astro:13`) — Confidence: High
- Code snippet showing the problem:
```astro
<a href="/tools">Back to Tools</a>
<a href="/tools/audio-visualizer">Back to Audio Visualizer</a>
```
- Explanation of what's wrong and why it matters:
  - Header/home routes use `toolsUrl()` correctly, but these hardcoded paths bypass that abstraction. If any tools page is accessed from the marketing origin (misconfig, staging, local preview), navigation may not preserve intended origin boundaries.
- **Recommendation:**
  - Standardize all internal tools navigation through a single helper abstraction.

#### M2. Path matching in `toolsUrl()` is prefix-based and over-broad (`src/utils/toolsUrl.ts:6`) — Confidence: High
- Code snippet showing the problem:
```ts
if (!path.startsWith('/tools')) return path;
```
- Explanation of what's wrong and why it matters:
  - This also matches routes like `/toolshed` or `/toolsmith` if added later.
- **Recommendation:**
  - Match with `path === '/tools' || path.startsWith('/tools/')`.

### LOW

None.

---

## Recommended Fix Plan

1. Enforce split-origin at build/deploy gate (H1)  
Affected files: CI/deploy pipeline, `astro.config.mjs`, env validation  
Effort: 2-4 hrs

2. Normalize internal tools links through helper usage (M1)  
Affected files: `src/pages/tools/[slug].astro`, `src/pages/tools/*/live.astro`  
Effort: 30-60 min

3. Tighten helper route match semantics (M2)  
Affected files: `src/utils/toolsUrl.ts`  
Effort: 10-20 min

### What NOT to Change

- Keep `PUBLIC_TOOLS_ORIGIN` support in `toolsUrl`; it is the right primitive for split-host linking.
- Keep trailing-slash normalization in `toolsUrl`, which avoids malformed URL joins.
- Keep documented topology and rollout guidance in `docs/tools-origin-isolation.md`.
- Keep nginx redirect example for `/tools/*` in `nginx.multi-origin.conf`; it correctly models perimeter routing.
- Keep current ability for `livePath` to be absolute external URLs (for externally hosted tools like BubbleBeats/BruteBookmarks).

---

## Summary Table

| Priority | Item | Confidence | Files Affected | Effort |
|----------|------|:----------:|----------------|--------|
| High | H1: Isolation not enforced in app build/runtime | High | `astro.config.mjs`, `src/pages/tools/*` | 2-4 hrs |
| Medium | M1: Hardcoded tool backlinks bypass helper | High | `src/pages/tools/[slug].astro`, `src/pages/tools/*/live.astro` | 30-60 min |
| Medium | M2: `toolsUrl` prefix match is over-broad | High | `src/utils/toolsUrl.ts` | 10-20 min |
