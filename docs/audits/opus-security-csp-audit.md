# Security & CSP Audit

The HNTBO website is a statically generated Astro site with three client-side browser tools (MD2Word, FolderManager, AudioVisualizer). The security posture is strong for a static site: comprehensive security headers are in place, YouTube embeds correctly use the nocookie variant, all external links carry `rel="noopener noreferrer"`, and inline HTML in the tools components is properly escaped. The primary area for improvement is the CSP's use of `'unsafe-inline'` for `script-src`, which is justified by Astro's current inline script compilation model but should be tightened when origin isolation ships. A handful of minor gaps exist in the CSP (missing `media-src`, YouTube thumbnail origin not explicitly declared in `img-src`), and the desktop nav's FMOTION link is missing `target`/`rel` attributes. No critical or high-severity exploitable vulnerabilities were found.

Conducted 2026-02-21.

---

## Findings by Severity

### CRITICAL

No critical findings.

### HIGH

No high findings.

### MEDIUM

#### M1. `script-src 'unsafe-inline'` allows execution of any inline script

**File**: `C:\Users\frede\Documents\dev\websites\hntbo\public\_headers`, line 2
**Confidence**: HIGH

```
script-src 'self' 'unsafe-inline'
```

**Explanation**: The CSP allows arbitrary inline `<script>` tags and inline event handlers. This disables CSP's primary XSS mitigation for scripts. On this static site with no user-generated HTML and no server-side rendering of untrusted input, the practical risk is low. However, it means that if any injection path were found (e.g., a future feature with dynamic content), CSP would not stop script execution.

**Why it exists**: Astro compiles component `<script>` blocks into inline `<script>` tags in the built HTML. The Header mobile menu toggle (line 110-117), the tools filter scripts in `tutos/index.astro` and `tools/index.astro`, the AnimatedLogo script, and all three tool components (MD2Word, FolderManager, AudioVisualizer) rely on inline scripts in the build output.

**Reproduction**: View page source of any built page; multiple `<script>` blocks are inline.

**Recommendation**: This is a known trade-off with Astro's default build. Moving to CSP nonces would require Astro's experimental CSP nonce support or a server-side middleware to inject nonces. For now, this is acceptable for a static site with no user-generated content. When the origin isolation topology ships (separate tools vs. marketing origins), the tools origin CSP should be the first candidate for nonce-based `script-src` to reduce blast radius around the high-privilege tools.

---

#### M2. Missing `media-src` directive -- falls back to `default-src 'self'`

**File**: `C:\Users\frede\Documents\dev\websites\hntbo\public\_headers`, line 2
**Confidence**: HIGH

```
Content-Security-Policy: default-src 'self'; ... (no media-src)
```

**Explanation**: The AudioVisualizer component uses `getDisplayMedia()` and attaches a `MediaStream` to a hidden `<video>` element at `C:\Users\frede\Documents\dev\websites\hntbo\src\components\AudioVisualizer.astro`, line 117:

```html
<video id="av-sink" muted playsinline style="display:none"></video>
```

And at line 421-422:
```typescript
sink.srcObject = s;
try { await sink.play(); } catch {}
```

The `media-src` directive is not present, so it falls back to `default-src 'self'`. MediaStream objects set via `srcObject` are not restricted by `media-src` (they are already in-memory), so this works today. However, if any future feature loads media from a URL (e.g., `<audio src="...">`), it would be silently blocked unless the origin matches `'self'`. Adding an explicit `media-src 'self' blob:` makes the policy self-documenting and future-proof.

**Recommendation**: Add `media-src 'self' blob:` to the CSP.

---

#### M3. Desktop nav FMOTION link missing `target="_blank"` and `rel="noopener noreferrer"`

**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\Header.astro`, lines 53-60
**Confidence**: HIGH

```html
<a
  href={externalLink.href}
  class="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 border border-border rounded-lg hover:border-text-secondary"
>
  {externalLink.label}
</a>
```

The desktop nav's FMOTION link at line 53-60 is missing `target="_blank"` and `rel="noopener noreferrer"`. The mobile nav version at lines 97-104 correctly includes both attributes. This inconsistency means clicking FMOTION on desktop navigates the user away from hntbo.com within the same tab, which is a UX issue. From a security perspective, the missing `rel="noopener"` is only meaningful when `target="_blank"` is present, so the actual security risk here is negligible -- it is primarily a consistency bug.

**Recommendation**: Add `target="_blank"` and `rel="noopener noreferrer"` to the desktop FMOTION link to match the mobile version.

---

### LOW

#### L1. `img-src https:` is overly broad -- consider tightening

**File**: `C:\Users\frede\Documents\dev\websites\hntbo\public\_headers`, line 2
**Confidence**: MEDIUM

```
img-src 'self' data: https:
```

The site loads images from exactly two external origins:
1. `https://img.youtube.com` -- YouTube video thumbnails (used in `src/pages/tutos/index.astro` line 65, `src/pages/tutos/[slug].astro` line 16, `src/pages/index.astro` line 79)
2. Potentially any `https://` image URL set in content frontmatter's `image` field

The current `https:` wildcard allows images from any HTTPS origin, which is the most permissive option. For a static site with controlled content, this is low risk because image loading is not a significant attack vector. However, restricting to `'self' data: https://img.youtube.com https://*.githubusercontent.com` would narrow the surface.

**Trade-off**: Content authors may want to reference images from arbitrary origins in markdown content. The wildcard `https:` avoids breakage. This is a judgment call.

**Recommendation**: Keep `https:` for now but document why. If content authoring is always done by the site owner, consider tightening later.

---

#### L2. `font-src` includes `data:` -- verify if needed

**File**: `C:\Users\frede\Documents\dev\websites\hntbo\public\_headers`, line 2
**Confidence**: MEDIUM

```
font-src 'self' https://fonts.gstatic.com data:
```

The site loads fonts from Google Fonts via `https://fonts.gstatic.com` (declared in `BaseLayout.astro` line 39-41). The `data:` source for fonts is typically used for base64-inlined fonts. Checking the build output, Tailwind/Astro may inline small font subsets as data URIs, so this may be needed. If not, removing `data:` from `font-src` marginally tightens the policy.

**Recommendation**: Test a production build with `data:` removed from `font-src`. If no fonts break, remove it.

---

#### L3. `frame-src` allows both `youtube-nocookie.com` and `youtube.com` -- only nocookie is used

**File**: `C:\Users\frede\Documents\dev\websites\hntbo\public\_headers`, line 2
**Confidence**: HIGH

```
frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com
```

The YouTube embed in `src/pages/tutos/[slug].astro` line 50 correctly uses the privacy-enhanced `youtube-nocookie.com`:

```html
src={`https://www.youtube-nocookie.com/embed/${tutorial.data.youtubeId}`}
```

The `https://www.youtube.com` origin in `frame-src` is unnecessary if all embeds consistently use the nocookie variant. Keeping it as a fallback is harmless but slightly loosens the policy.

**Recommendation**: Remove `https://www.youtube.com` from `frame-src` to enforce the nocookie-only policy. If a future content author accidentally uses `youtube.com`, the CSP will block it and surface the issue rather than silently allowing the less private variant.

---

#### L4. GitHub security workflow checks are minimal

**File**: `C:\Users\frede\Documents\dev\websites\hntbo\.github\workflows\security.yml`, lines 1-22
**Confidence**: HIGH

```yaml
- run: npm audit --omit=dev --audit-level=high
- run: grep -q "Content-Security-Policy:" public/_headers
- run: grep -q "Referrer-Policy:" public/_headers
```

The workflow does three things: runs `npm audit`, checks that a CSP header exists, and checks that a Referrer-Policy header exists. This is better than nothing but has gaps:
- It does not validate the CSP content (e.g., someone could set `Content-Security-Policy: default-src *` and it would pass).
- It does not check for other security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Permissions-Policy).
- It does not run any static analysis for XSS patterns.

For a static site maintained by a single developer, this level of CI checking is proportionate. The CSP content itself is in a version-controlled file, so PR review is the actual gate.

**Recommendation**: Optionally add a grep for `unsafe-eval` (to catch accidental introduction) and a check that HSTS is present. Keep it lightweight.

---

#### L5. `connect-src 'self'` may block future API calls

**File**: `C:\Users\frede\Documents\dev\websites\hntbo\public\_headers`, line 2
**Confidence**: LOW

```
connect-src 'self'
```

Currently no tool or page makes `fetch` or `XMLHttpRequest` calls to external origins. The MD2Word tool processes everything client-side with the `docx` npm package. FolderManager uses the File System Access API (not network). AudioVisualizer uses `getUserMedia` and `getDisplayMedia` (not network fetch).

If a future feature adds an API call (e.g., fetching YouTube metadata, analytics, or a newsletter signup), `connect-src 'self'` will block it. This is actually good -- it enforces the principle of least privilege. Just be aware when adding network-dependent features.

**Recommendation**: No change needed. This is correct.

---

#### L6. BubbleBeats and BruteBookmarks `livePath` values point to external origins

**Files**:
- `C:\Users\frede\Documents\dev\websites\hntbo\src\content\tools\bubblebeats.md`, line 9: `livePath: "https://bubblebeats.app"`
- `C:\Users\frede\Documents\dev\websites\hntbo\src\content\tools\brute-bookmarks.md`, line 8: `livePath: "https://brutebookmarks.com"`

**Confidence**: MEDIUM

These content entries define `livePath` as full external URLs. In `src/pages/tools/[slug].astro` line 47-58, the "Try Live Demo" button renders with:

```html
<a href={tool.data.livePath} class="btn btn-primary inline-flex">
```

This link has no `target="_blank"` or `rel="noopener noreferrer"` when the `livePath` is an external URL. The tool page uses these attributes only for `downloadUrl` and `githubUrl` links (lines 59-84), but the `livePath` link does not distinguish internal from external paths.

**Recommendation**: Add a check in `[slug].astro` -- if `livePath` starts with `http`, add `target="_blank"` and `rel="noopener noreferrer"`.

---

## Origin Isolation Analysis

### `toolsUrl.ts` Logic Review

**File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\utils\toolsUrl.ts`

```typescript
const rawToolsOrigin = (import.meta.env.PUBLIC_TOOLS_ORIGIN || '').trim();
const toolsOrigin = rawToolsOrigin.replace(/\/+$/, '');

export function toolsUrl(path: string): string {
  if (!path.startsWith('/')) return path;
  if (!path.startsWith('/tools')) return path;
  if (!toolsOrigin) return path;
  return `${toolsOrigin}${path}`;
}
```

**Assessment**: The function is correctly implemented for its purpose:

1. **Passthrough for non-absolute paths**: `if (!path.startsWith('/'))` returns relative/external URLs unchanged. Correct.
2. **Passthrough for non-tools paths**: `if (!path.startsWith('/tools'))` prevents the function from rewriting non-tool URLs. Correct.
3. **Passthrough when no origin configured**: `if (!toolsOrigin)` returns the original path when `PUBLIC_TOOLS_ORIGIN` is unset (current production state). Correct -- no `.env` file exists, so all tool links remain same-origin.
4. **Trailing slash stripping**: `replace(/\/+$/, '')` prevents double-slash in `origin + path`. Correct.

**Edge cases**:
- Path `/toolsmith` would match `startsWith('/tools')` and get rewritten. However, no such path exists in the site and content slugs are controlled by the developer.
- The function is called in exactly two places: `Header.astro` line 8 and `index.astro` lines 92, 100. Both pass well-formed paths. The `tools/index.astro` page does NOT use `toolsUrl` -- tool card `href` values are generated as `/tools/${tool.slug}` without wrapping. This is an inconsistency but not a security issue (it means some links would not redirect to the tools origin when origin isolation is enabled).

**Bypass risk**: None in the current deployment. The function only prepends an origin; it does not perform any security-sensitive validation. The actual isolation depends on the deployment topology (separate origins + redirect), not this helper.

---

## Input Handling in Tools

### MD2Word (`C:\Users\frede\Documents\dev\websites\hntbo\src\components\MD2Word.astro`)

**HTML Escaping**: The component defines an `escHtml` function (line 473-475) that escapes `&`, `<`, and `>`:

```typescript
function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
```

This is used consistently when rendering file names and status messages into the results div via the `line()` function (line 469-471). The `showResults` function (line 459-461) sets `innerHTML`, but all content passed to it goes through `escHtml` first. The one exception is the success message at line 885 which uses the `line()` helper and thus is escaped.

**DOCX generation**: Markdown input goes through `parseMarkdown()` (line 534) which splits into blocks, then `buildDocument()` (line 748) which passes text to the `docx` library's `TextRun` constructor as the `text` property. The `docx` library treats `text` as literal text content in the DOCX XML, not as markup. There is no XSS risk in the generated DOCX because DOCX is not an HTML format -- the text is encoded as OpenXML.

**File name handling**: The filename input (line 858-859) is used as-is for the download filename:

```typescript
const fname = filenameInput.value.trim() || 'document';
await downloadDocx(doc, fname);
```

In `downloadDocx` (line 859), it becomes the `download` attribute of a dynamically created `<a>` tag. A malicious filename could contain path traversal characters (`../`), but browser download dialogs sanitize filenames and do not allow path traversal. This is a non-issue.

**Verdict**: No XSS or injection vulnerabilities found.

### FolderManager (`C:\Users\frede\Documents\dev\websites\hntbo\src\components\FolderManager.astro`)

**HTML Escaping**: Same pattern as MD2Word -- `escHtml` at line 473-475, used in all `line()` calls and in the modal body HTML (lines 744-745, 828). Folder names from the File System Access API are escaped before being inserted into HTML.

**File System Access API safety**: The component uses `showDirectoryPicker()` which requires an explicit user gesture (click) and shows a native browser dialog. The user must grant permission for each folder. The `removeEntry` call (line 610) is gated behind a confirmation modal (lines 742-749). The API itself prevents access outside the granted directory handle -- there is no path traversal possible through the File System Access API.

**Malicious folder names**: Folder names containing HTML/script characters are escaped by `escHtml` before display. Folder names containing unusual Unicode or very long strings could cause display issues but not security issues.

**Verdict**: No exploitable vulnerabilities. The browser's File System Access API enforces sandboxing.

### AudioVisualizer (`C:\Users\frede\Documents\dev\websites\hntbo\src\components\AudioVisualizer.astro`)

**Input sources**: Microphone audio (`getUserMedia`) and tab audio (`getDisplayMedia`). Both require explicit user permission through browser-native dialogs. The component does not transmit audio data anywhere -- it processes `MediaStream` data locally through `AnalyserNode` and renders to a `<canvas>` element.

**localStorage usage**: Presets are stored in `localStorage` under key `av_presets_v2` (line 731). The `readPresets` function (line 790-792) uses `JSON.parse` with a `try/catch`:

```typescript
function readPresets(): Record<string, VisualConfig> {
  try { return JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}'); } catch { return {}; }
}
```

The parsed data is used to set form input values (colors, numbers). If an attacker could write to localStorage (requires same-origin access, which means XSS), they could set arbitrary values for visual parameters. However, these values are only used to set canvas drawing parameters (colors, numbers) and form input values -- not to execute code or modify DOM in dangerous ways. The `applyConfig` function (line 765-788) only sets `.value` on input elements, not `innerHTML`.

**Permissions-Policy check**: The `_headers` file sets `microphone=(self)` (line 4), which correctly allows microphone access on the same origin. The `getDisplayMedia` API is governed by `display-capture`, which is not restricted in the Permissions-Policy (defaults to `'self'`). This is correct for the AudioVisualizer's "Share a tab's audio" feature.

**Verdict**: No exploitable vulnerabilities.

---

## External Resources Mapping

| Resource | Origin | CSP Directive | Status |
|----------|--------|--------------|--------|
| Google Fonts CSS | `https://fonts.googleapis.com` | `style-src` | Whitelisted |
| Google Fonts files | `https://fonts.gstatic.com` | `font-src` | Whitelisted |
| YouTube nocookie embed | `https://www.youtube-nocookie.com` | `frame-src` | Whitelisted |
| YouTube thumbnails | `https://img.youtube.com` | `img-src https:` | Covered by wildcard |
| GitHub (link target only) | `https://github.com` | n/a (navigation) | No CSP concern |
| YouTube (link target only) | `https://www.youtube.com` | n/a (navigation) | No CSP concern |
| LinkedIn (link target only) | `https://www.linkedin.com` | n/a (navigation) | No CSP concern |
| Instagram (link target only) | `https://www.instagram.com` | n/a (navigation) | No CSP concern |
| fmotion.fr (link target only) | `https://fmotion.fr` | n/a (navigation) | No CSP concern |
| BubbleBeats (link target) | `https://bubblebeats.app` | n/a (navigation) | No CSP concern |
| BruteBookmarks (link target) | `https://brutebookmarks.com` | n/a (navigation) | No CSP concern |

All external resources loaded by the page (as opposed to navigated to) are covered by the current CSP.

---

## Recommended Fix Plan

### What NOT to Change

1. **Keep `'unsafe-inline'` in `script-src` for now.** Astro's build output embeds component scripts as inline `<script>` blocks. Removing `'unsafe-inline'` would break the mobile menu, filter buttons, AnimatedLogo animation, and all three tool components. The proper fix is Astro's CSP nonce support or script externalization, which is a build-pipeline change, not a headers change. Do not attempt to remove this without a migration plan.

2. **Keep `style-src 'unsafe-inline'`.** Astro and Tailwind generate inline styles (e.g., `style="display:none"` in FolderManager, `style="aspect-ratio: 16/10"` in Card, `canvas.style.background = ...` in AudioVisualizer). Removing `'unsafe-inline'` from `style-src` would break visual rendering throughout the site.

3. **Keep `img-src https:` (the broad wildcard).** Content frontmatter can reference images from any HTTPS origin (YouTube thumbnails, GitHub-hosted screenshots, etc.). Tightening this to a specific allowlist would require auditing every content entry and updating CSP whenever a new image origin is used. The risk of broad `img-src` on a static site is negligible.

4. **Keep `object-src 'none'`.** This correctly blocks `<object>`, `<embed>`, and `<applet>` elements, which are common plugin-based attack vectors. No part of the site needs these.

5. **Keep `form-action 'self'`.** The site has no forms that submit to external origins. The `mailto:` link on the contact page is an anchor, not a form submission. This directive prevents form-based data exfiltration if XSS were achieved.

6. **Keep `base-uri 'self'`.** This prevents `<base>` tag injection, which could redirect all relative URLs to an attacker-controlled origin. Essential defense-in-depth.

7. **Keep `frame-ancestors 'self'` and `X-Frame-Options: SAMEORIGIN`.** These prevent the site from being framed by other origins (clickjacking defense). Both are needed because `X-Frame-Options` covers older browsers and `frame-ancestors` is the modern CSP equivalent.

8. **Keep the Permissions-Policy with `microphone=(self)`.** The AudioVisualizer needs microphone access on the same origin. All other sensitive APIs (camera, geolocation, payment, etc.) are correctly denied. Do not remove `microphone=(self)` or the AudioVisualizer will break.

9. **Keep `connect-src 'self'`.** No tool or page makes external network requests. This tight policy is correct and prevents data exfiltration via `fetch`/`XMLHttpRequest` if XSS were achieved.

10. **Keep `Strict-Transport-Security` with `includeSubDomains`.** This ensures HTTPS is enforced for the main domain and any future subdomains (including the planned tools subdomain).

### Suggested Changes (in priority order)

| Priority | Change | File | Effort |
|----------|--------|------|--------|
| 1 | Add `target="_blank"` and `rel="noopener noreferrer"` to desktop FMOTION link | `Header.astro` line 54 | 1 min |
| 2 | Remove `https://www.youtube.com` from `frame-src` | `_headers` line 2 | 1 min |
| 3 | Add `media-src 'self' blob:` to CSP | `_headers` line 2 | 1 min |
| 4 | Handle external `livePath` URLs with proper link attributes | `tools/[slug].astro` lines 47-58 | 5 min |
| 5 | Add `unsafe-eval` guard grep to CI | `security.yml` | 5 min |
| 6 | Wrap `tools/index.astro` card hrefs with `toolsUrl()` for origin isolation consistency | `tools/index.astro` line 66 | 5 min |
| 7 | Test removing `data:` from `font-src` | `_headers` line 2 | 10 min |

---

## Summary Table

| ID | Severity | Title | File | Line(s) | Confidence | Exploitable? |
|----|----------|-------|------|---------|------------|-------------|
| M1 | MEDIUM | `script-src 'unsafe-inline'` | `public/_headers` | 2 | HIGH | Theoretical (requires injection path) |
| M2 | MEDIUM | Missing `media-src` directive | `public/_headers` | 2 | HIGH | No (current code works, future risk) |
| M3 | MEDIUM | Desktop FMOTION link missing `target`/`rel` | `src/components/Header.astro` | 53-60 | HIGH | No (UX + consistency issue) |
| L1 | LOW | `img-src https:` overly broad | `public/_headers` | 2 | MEDIUM | No |
| L2 | LOW | `font-src data:` may be unnecessary | `public/_headers` | 2 | MEDIUM | No |
| L3 | LOW | `frame-src` allows non-nocookie YouTube | `public/_headers` | 2 | HIGH | No (privacy, not security) |
| L4 | LOW | CI security checks are minimal | `.github/workflows/security.yml` | 19-22 | HIGH | No |
| L5 | LOW | `connect-src 'self'` may block future APIs | `public/_headers` | 2 | LOW | No (correct behavior) |
| L6 | LOW | External `livePath` links lack `rel="noopener"` | `src/pages/tools/[slug].astro` | 47-58 | MEDIUM | No |
