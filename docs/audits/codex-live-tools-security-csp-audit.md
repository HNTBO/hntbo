# Live Tools Security and CSP Audit

The live tools are thoughtfully sandboxed in-browser, but the current security posture still leaves meaningful exposure: CSP allows inline script execution globally, microphone capability is enabled site-wide, and one live tool asks for mic permission before explicit user action. None of these are immediate remote-code-execution bugs by themselves, but together they weaken defense-in-depth for a site that hosts high-privilege browser tools.

Conducted February 21, 2026.

---

## Findings by Severity

### CRITICAL

None.

### HIGH

#### H1. Global CSP allows inline scripts on every route (`public/_headers:2`) — Confidence: High
- Code snippet showing the problem:
```text
Content-Security-Policy: ... script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' ...
```
- **Reproduction:**
  1. Run `npm run build && npm run preview`.
  2. Open any page and inspect response headers.
  3. Confirm CSP contains `script-src 'unsafe-inline'`.
  4. In DevTools console, append an inline script element; it executes because policy allows inline script.
- Explanation of what's wrong and why it matters:
  - This significantly reduces CSP's protection against script injection. Any HTML/script injection bug elsewhere has a much easier exploit path because inline execution is already allowed.
- **Recommendation:**
  - Externalize inline scripts and move to nonce/hash-based CSP.
  - Tighten to `script-src 'self'` (plus nonces/hashes where required).

#### H2. Audio visualizer requests microphone permission before user intent (`src/components/AudioVisualizer.astro:372`, `src/components/AudioVisualizer.astro:879`) — Confidence: High
- Code snippet showing the problem:
```ts
async function primePermission() {
  const tmp = await navigator.mediaDevices.getUserMedia({ audio: true });
}

(async () => {
  if (secureOk()) { await primePermission(); }
})();
```
- **Reproduction:**
  1. Open `/tools/audio-visualizer/live` over HTTPS.
  2. Observe that microphone permission may be requested on page load, before clicking `Start`.
- Explanation of what's wrong and why it matters:
  - Requesting mic access without explicit action erodes user trust and violates least-privilege interaction patterns, especially on a public site.
- **Recommendation:**
  - Remove boot-time priming and request permission only inside the `Start` handler.
  - Keep a visible preflight message instead of automatic permission acquisition.

### MEDIUM

#### M1. Microphone capability is allowed for the whole origin, not tool routes only (`public/_headers:4`) — Confidence: High
- Code snippet showing the problem:
```text
Permissions-Policy: ... microphone=(self)
```
- Explanation of what's wrong and why it matters:
  - Every page on the origin is allowed to request microphone access. Even with user consent prompts, this broadens the attack surface if unrelated pages/scripts are ever compromised.
- **Recommendation:**
  - Restrict mic-using pages to tools origin only.
  - Serve stricter `Permissions-Policy` on marketing origin (remove `microphone`).

### LOW

#### L1. Dynamic HTML assembly relies on manual escaping, which is brittle over time (`src/components/MD2Word.astro:960`, `src/components/FolderManager.astro:522`) — Confidence: Medium
- Code snippet showing the problem:
```ts
fileListEl.innerHTML = selectedFiles.map(...${escHtml(f.name)}...).join('');
modalBody.innerHTML = bodyHtml;
```
- Explanation of what's wrong and why it matters:
  - Current call sites do escape user-provided strings, but ongoing maintenance can easily introduce a missed escape and create XSS regressions.
- **Recommendation:**
  - Prefer DOM node creation (`createElement`, `textContent`) for dynamic UI.
  - If HTML templating remains, centralize and enforce strict sanitization patterns.

---

## Recommended Fix Plan

1. Remove boot-time mic permission request in audio visualizer (H2)  
Affected files: `src/components/AudioVisualizer.astro`  
Effort: 20-30 min

2. Split `Permissions-Policy` by origin and route class (M1)  
Affected files: `public/_headers`, deployment config  
Effort: 30-60 min

3. Externalize inline scripts, then tighten CSP (H1)  
Affected files: `src/components/*.astro`, `src/pages/*/*.astro`, `public/_headers`, deployment CSP  
Effort: 0.5-1.5 day

4. Replace highest-risk `innerHTML` paths with DOM-based rendering (L1)  
Affected files: `src/components/MD2Word.astro`, `src/components/FolderManager.astro`  
Effort: 1-2 hrs

### What NOT to Change

- Keep `escHtml` usage where dynamic strings are currently interpolated; it materially reduces injection risk in existing render paths.
- Keep secure-context checks for microphone mode (`secureOk()`), which prevents confusing failures on insecure origins.
- Keep explicit confirmation modal before folder deletion; this is an important destructive-action guardrail.
- Keep `rel="noopener noreferrer"` on external links throughout pages/components.
- Keep existing baseline hardening headers (`X-Frame-Options`, `X-Content-Type-Options`, HSTS, Referrer-Policy).

---

## Summary Table

| Priority | Item | Confidence | Files Affected | Effort |
|----------|------|:----------:|----------------|--------|
| High | H1: Global CSP allows inline scripts | High | `public/_headers` | 0.5-1.5 day |
| High | H2: Mic permission requested on page load | High | `src/components/AudioVisualizer.astro` | 20-30 min |
| Medium | M1: Microphone policy too broad for full origin | High | `public/_headers` | 30-60 min |
| Low | L1: Manual `innerHTML` composition is brittle | Medium | `src/components/MD2Word.astro`, `src/components/FolderManager.astro` | 1-2 hrs |
