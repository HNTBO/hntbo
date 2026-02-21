# Content, Routing & SEO Audit

The HNTBO site has a solid content collection setup with proper Zod schemas, functional dynamic routing, and reasonable SEO fundamentals. The most impactful issues are: a broken download link for the Houdini kerning tutorial (file exists but path/name is wrong), inconsistent application of the `toolsUrl()` origin-isolation utility (used on index and header but not on tools pages themselves), missing canonical URLs and `og:url`/`og:site_name` meta tags, and a desktop navigation link to FMOTION that lacks `target="_blank"` while the mobile version has it. No content files fail schema validation, and the empty-state UI is handled well on both listing pages. There are no CRITICAL routing failures that would produce 404s or build errors.

Conducted 2026-02-21.

---

## Findings by Severity

### CRITICAL

_None found._

### HIGH

#### H1. Broken Download URL for Kerning Tutorial
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\content\tutorials\houdini-kerning-vex.md`, line 7
- **Code**:
  ```yaml
  downloadUrl: "/downloads/kerning-hda.zip"
  downloadLabel: "Download HDA"
  ```
- **Actual file on disk**: `public/downloads/sop_Fred.kern_tool.1.0.hdalc`
- **Issue**: The frontmatter references `/downloads/kerning-hda.zip` but the only file in `public/downloads/` is `sop_Fred.kern_tool.1.0.hdalc`. Clicking "Download HDA" on the tutorial page will return a 404.
- **Reproduction**: Visit `/tutos/houdini-kerning-vex` and click the "Download HDA" button.
- **Fix**: Either rename the physical file to `kerning-hda.zip` (if it should be a zip), or update the frontmatter `downloadUrl` to `/downloads/sop_Fred.kern_tool.1.0.hdalc` (and adjust `downloadLabel` to match the actual file type).
- **Confidence**: HIGH (verified file listing against frontmatter value)

#### H2. Inconsistent `toolsUrl()` Application Across Tools Pages
- **Files affected**:
  - `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\tools\index.astro`, line 65: `href={`/tools/${tool.slug}`}` (no `toolsUrl()`)
  - `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\tools\[slug].astro`, line 25: `href="/tools"` (no `toolsUrl()`)
  - `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\tools\[slug].astro`, line 49: `href={tool.data.livePath}` (no `toolsUrl()`)
  - `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\tools\audio-visualizer\live.astro`, line 13: `href="/tools/audio-visualizer"` (no `toolsUrl()`)
  - `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\tools\folder-manager\live.astro`, line 13: `href="/tools/folder-manager"` (no `toolsUrl()`)
  - `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\tools\md2word\live.astro`, line 13: `href="/tools/md2word"` (no `toolsUrl()`)
- **Issue**: The `toolsUrl()` utility (from `src/utils/toolsUrl.ts`) is used in `Header.astro` and `index.astro` (homepage) but is completely absent from the tools section pages. If `PUBLIC_TOOLS_ORIGIN` is set to isolate tools on a separate origin, links within the tools section will point to the wrong domain.
- **Reproduction**: Set `PUBLIC_TOOLS_ORIGIN=https://tools.hntbo.com` in `.env`, then navigate within the tools section -- all "Back to Tools" links and card hrefs will point to the main origin instead of the tools origin.
- **Fix**: Wrap all `/tools/*` href values in `toolsUrl()` across tools pages, or document that `toolsUrl()` is only intended for cross-section links (header and homepage).
- **Confidence**: HIGH (grepped entire `src/pages/tools/` and confirmed zero `toolsUrl` imports)

#### H3. Missing `og:url`, `og:site_name`, and Canonical URL Meta Tags
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\layouts\BaseLayout.astro`, lines 25-36
- **Code**:
  ```html
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:locale" content="en_US" />
  {image && <meta property="og:image" content={image} />}
  ```
- **Missing**:
  - `<meta property="og:url" content={canonicalUrl} />` -- required for correct social sharing; without it, platforms may use the wrong URL
  - `<meta property="og:site_name" content="HNTBO" />` -- recommended for brand display in social cards
  - `<link rel="canonical" href={canonicalUrl} />` -- important for SEO to prevent duplicate content issues
- **Impact**: Social sharing previews may show incorrect URLs. Search engines may index duplicate paths differently. This is especially relevant given the tools-origin isolation pattern where the same page could theoretically be accessible at two URLs.
- **Reproduction**: Share any page URL on Twitter/LinkedIn and inspect the card preview.
- **Fix**: Add `Astro.url` or a constructed canonical URL to `BaseLayout.astro`, then add the three missing meta tags.
- **Confidence**: HIGH (grepped entire `src/` for `og:url`, `og:site_name`, `canonical` -- zero results)

### MEDIUM

#### M1. Desktop FMOTION Link Missing `target="_blank"`
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\Header.astro`, lines 54-60
- **Code**:
  ```html
  <a
    href={externalLink.href}
    class="text-sm font-medium ..."
  >
    {externalLink.label}
  </a>
  ```
- **Contrast with mobile** (lines 97-104):
  ```html
  <a
    href={externalLink.href}
    target="_blank"
    rel="noopener noreferrer"
    class="..."
  >
  ```
- **Issue**: The desktop navigation link to fmotion.fr opens in the same tab, while the mobile version correctly opens in a new tab. This is inconsistent and navigates users away from the HNTBO site on desktop.
- **Fix**: Add `target="_blank"` and `rel="noopener noreferrer"` to the desktop FMOTION link.
- **Confidence**: HIGH (confirmed by reading both link elements in Header.astro)

#### M2. Inconsistent fmotion.fr URL (www vs non-www)
- **Files**:
  - `C:\Users\frede\Documents\dev\websites\hntbo\src\components\Header.astro`, line 13: `https://www.fmotion.fr`
  - `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\contact.astro`, line 89: `https://fmotion.fr`
- **Issue**: Header uses `www.fmotion.fr` while contact page uses `fmotion.fr` (no www). While the domain likely redirects, this is inconsistent and could cause unnecessary redirects.
- **Fix**: Standardize to one form (whichever is the canonical domain for fmotion.fr) across all files.
- **Confidence**: HIGH (two different URLs found via grep)

#### M3. LinkedIn URL Discrepancy Between CLAUDE.md and Code
- **CLAUDE.md**: Documents social links as `LinkedIn: frederic-pons-fmotion`
- **Code** (`Footer.astro`, line 7 and `contact.astro`, line 58): `https://www.linkedin.com/company/hntbo`
- **Issue**: The CLAUDE.md documentation says the LinkedIn link should point to `frederic-pons-fmotion` (a personal profile), but the actual code points to `company/hntbo` (a company page). One of these is wrong.
- **Fix**: Verify which LinkedIn URL is correct and update whichever source is outdated (most likely CLAUDE.md is stale).
- **Confidence**: MEDIUM (cannot verify which URL is currently correct without visiting them)

#### M4. No `publishDate` on Any Tutorial Content File
- **Files**:
  - `C:\Users\frede\Documents\dev\websites\hntbo\src\content\tutorials\houdini-roulette-wheel.md`
  - `C:\Users\frede\Documents\dev\websites\hntbo\src\content\tutorials\houdini-kerning-vex.md`
  - `C:\Users\frede\Documents\dev\websites\hntbo\src\content\tutorials\davinci-resolve-cryptomatte.md`
- **Issue**: The schema defines `publishDate: z.string().optional()` and the sort logic in both `index.astro` (line 8-10) and `tutos/index.astro` (line 8-10) sorts by `publishDate`. However, none of the three tutorials have a `publishDate` field set in their frontmatter. The sort fallback is `0` (epoch), so all tutorials are treated as having the same date and their order is effectively undefined.
- **Impact**: When more tutorials are added, some with dates and some without, the undated ones will always sink to the bottom. The current "featured" tutorials on the homepage may appear in random order.
- **Fix**: Add `publishDate` to all tutorial frontmatter (e.g., `publishDate: "2025-01-15"`). Consider also using `z.coerce.date()` instead of `z.string()` for type-safe date handling.
- **Confidence**: HIGH (grepped `publishDate` in `src/content/` -- only found the schema definition, zero content files)

#### M5. `og:image` Uses Relative Paths for Tutorials
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\pages\tutos\[slug].astro`, line 16
- **Code**:
  ```typescript
  const thumbnail = tutorial.data.thumbnail || `https://img.youtube.com/vi/${tutorial.data.youtubeId}/maxresdefault.jpg`;
  ```
- **Issue**: The YouTube fallback thumbnail is an absolute URL (good), but the `thumbnail` field from frontmatter is optional and currently not used by any tutorial. If a tutorial sets `thumbnail: "/images/some-image.jpg"`, that relative path would be passed to `og:image` in BaseLayout, which requires an absolute URL for proper social sharing. The `tool.data.image` values (e.g., `/images/tools/audio-visualizer.jpg`) have the same problem -- they are relative paths passed directly to `og:image`.
- **Fix**: Prepend the site's base URL to image paths in BaseLayout before emitting them as `og:image` content.
- **Confidence**: HIGH (verified tools pass relative `/images/tools/...` paths to `og:image` via `image={tool.data.image}`)

### LOW

#### L1. No Default `og:image` Fallback
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\layouts\BaseLayout.astro`, line 30
- **Code**:
  ```html
  {image && <meta property="og:image" content={image} />}
  ```
- **Issue**: Pages without an `image` prop (howiai.astro, contact.astro, tutos/index.astro, tools/index.astro) emit no `og:image` at all. Social sharing for these pages will show a generic preview or nothing.
- **Fix**: Add a default site-wide OG image fallback (e.g., `/images/og-default.jpg`).
- **Confidence**: HIGH

#### L2. `twitter:card` Set to `summary_large_image` Without Guaranteed Image
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\layouts\BaseLayout.astro`, line 33
- **Code**: `<meta name="twitter:card" content="summary_large_image" />`
- **Issue**: `summary_large_image` is always emitted even on pages with no image. Twitter/X will fall back to `summary` card behavior, but it is better practice to conditionally set the card type.
- **Fix**: Use `summary_large_image` when an image is present, `summary` otherwise.
- **Confidence**: MEDIUM

#### L3. `publishDate` Schema Uses `z.string()` Instead of Date Type
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\content\config.ts`, line 12
- **Code**: `publishDate: z.string().optional()`
- **Issue**: Using a string for dates means no validation of the date format. A typo like `publishDate: "2025-13-45"` would pass schema validation but produce `NaN` in the sort logic.
- **Fix**: Use `z.coerce.date()` or `z.string().datetime()` for type-safe date handling.
- **Confidence**: HIGH

#### L4. MD2Word Content File Missing `githubUrl` and `image`
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\content\tools\md2word.md`
- **Frontmatter**:
  ```yaml
  title: "Markdown to Word Converter"
  description: "Convert Markdown to Word documents directly in the browser."
  tags: ["Markdown", "Browser", "Utility"]
  featured: false
  isLive: true
  livePath: "/tools/md2word/live"
  liveLabel: "Try in Browser"
  ```
- **Issue**: No `githubUrl` (so no GitHub link on the tool detail page) and no `image` (so the Card component shows a placeholder icon instead of a screenshot). All other tools with `isLive: true` have an image. Not a bug (both fields are optional), but it makes the tool look less polished in listings.
- **Fix**: Add `image: "/images/tools/md2word.jpg"` (after creating the screenshot) and optionally a `githubUrl` if the repo exists.
- **Confidence**: HIGH (verified against schema -- fields are optional)

#### L5. Storytrails Content File Has No Download/Live Path Despite Description Saying "Coming Soon"
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\content\tools\storytrails.md`
- **Issue**: `isLive: false` and no `downloadUrl` or `livePath`. The tool detail page will show tags, the image, prose content, and a "Questions or suggestions?" box, but no action buttons at all. This is by design (tool is not released yet), but worth noting in case this was an oversight.
- **Confidence**: LOW (this appears intentional)

#### L6. All Three Tutorials Have `featured: true`
- **Files**: All three tutorials in `src/content/tutorials/`
- **Issue**: Every tutorial is featured. The homepage slices to 3 (`slice(0, 3)`), so currently this is fine. But it means the "featured" flag provides no filtering benefit -- it is the same as showing all tutorials.
- **Fix**: Not an issue now, but as tutorials are added, ensure `featured` is used selectively.
- **Confidence**: LOW (cosmetic concern only with 3 tutorials)

#### L7. Desktop FMOTION External Link Has No `aria-label` or Visual External-Link Indicator
- **File**: `C:\Users\frede\Documents\dev\websites\hntbo\src\components\Header.astro`, lines 54-60
- **Issue**: The desktop FMOTION link goes to an external site but has no visual indicator (like an external link icon) or `aria-label` to indicate it navigates away. Combined with the missing `target="_blank"` (see M1), users may not realize they are leaving the site.
- **Confidence**: LOW (accessibility/UX polish)

---

## Recommended Fix Plan

### Priority 1 (Do Now)
1. **Fix the download URL** (H1): Update `houdini-kerning-vex.md` frontmatter to point to the actual file path, or rename/re-upload the correct file.
2. **Add canonical URL and missing OG tags** (H3): Add `og:url`, `og:site_name`, and `<link rel="canonical">` to `BaseLayout.astro` using `Astro.url`.
3. **Fix desktop FMOTION link** (M1): Add `target="_blank"` and `rel="noopener noreferrer"` to the desktop nav link.

### Priority 2 (Do Soon)
4. **Standardize `toolsUrl()` usage** (H2): Either wrap all `/tools/*` hrefs in the tools section with `toolsUrl()`, or decide/document that the utility is only for cross-section references.
5. **Add `publishDate`** (M4): Set publish dates on all tutorial frontmatter.
6. **Standardize fmotion.fr URL** (M2): Pick `www.fmotion.fr` or `fmotion.fr` and use it everywhere.
7. **Fix `og:image` relative paths** (M5): Prepend site base URL to relative image paths in BaseLayout.

### Priority 3 (Nice to Have)
8. **Add a default OG image** (L1): Create a site-wide fallback OG image.
9. **Add md2word tool image** (L4): Create and add a screenshot for the MD2Word tool card.
10. **Verify LinkedIn URL** (M3): Confirm which LinkedIn URL is correct and update CLAUDE.md or code accordingly.

### What NOT to Change

1. **The content collection schemas are correct.** Both `tutorials` and `tools` collections have sensible required/optional field definitions. `tags` being required (not optional) is the right call -- it ensures filtering always works. Do not make `tags` optional.

2. **The `Card.astro` image fallback is well-designed.** When no image is provided, the Card shows a clean SVG placeholder icon instead of a broken image. This graceful degradation is intentional and handles the `md2word` and future tools-without-images case correctly. Do not add error-prone fallback image URLs.

3. **The empty-state UI on listing pages is good.** Both `tutos/index.astro` (lines 37-57) and `tools/index.astro` (lines 37-58) have proper "Coming Soon" states with CTA buttons when collections are empty. These will never show currently (since both collections have content), but they are good defensive coding. Do not remove them.

4. **The YouTube embed uses `youtube-nocookie.com`.** In `tutos/[slug].astro` line 50, the iframe uses `https://www.youtube-nocookie.com/embed/` which is the privacy-enhanced YouTube embed. This is the correct domain. Do not change it to `youtube.com`.

5. **The `toolsUrl()` utility design is sound.** The function correctly handles: paths not starting with `/`, paths not starting with `/tools`, empty/unset origin, and trailing slashes on the origin. The implementation in `src/utils/toolsUrl.ts` is clean. The problem is inconsistent application (H2), not the utility itself.

6. **The tag filtering client-side script is appropriate.** Using `data-tags` JSON attributes and vanilla JS for client-side filtering (in both `tutos/index.astro` and `tools/index.astro`) is the right approach for a static Astro site. It avoids unnecessary JavaScript framework overhead. Do not replace with a React/Vue component.

7. **The `featured` boolean with `.default(false)` is correct.** The schema default ensures unfeatured items are explicitly `false` rather than `undefined`, which makes the filter logic (`t => t.data.featured`) reliable. Do not change this pattern.

8. **The Footer social links array pattern is clean.** The `socialLinks` array with conditional SVG rendering in `Footer.astro` is maintainable and avoids an icon library dependency. Do not refactor into a separate icon component system.

---

## Summary Table

| ID  | Severity | File(s) | Issue | Confidence |
|-----|----------|---------|-------|------------|
| H1  | HIGH     | `tutorials/houdini-kerning-vex.md` | Download URL points to non-existent file | HIGH |
| H2  | HIGH     | `pages/tools/**` (6 files) | `toolsUrl()` not used in tools section pages | HIGH |
| H3  | HIGH     | `layouts/BaseLayout.astro` | Missing `og:url`, `og:site_name`, canonical URL | HIGH |
| M1  | MEDIUM   | `components/Header.astro` | Desktop FMOTION link missing `target="_blank"` | HIGH |
| M2  | MEDIUM   | `Header.astro`, `contact.astro` | Inconsistent fmotion.fr URL (www vs non-www) | HIGH |
| M3  | MEDIUM   | CLAUDE.md vs `Footer.astro`, `contact.astro` | LinkedIn URL mismatch (docs vs code) | MEDIUM |
| M4  | MEDIUM   | All 3 tutorial content files | No `publishDate` set; sort order undefined | HIGH |
| M5  | MEDIUM   | `tutos/[slug].astro`, `tools/[slug].astro` | `og:image` receives relative paths | HIGH |
| L1  | LOW      | `layouts/BaseLayout.astro` | No default OG image fallback | HIGH |
| L2  | LOW      | `layouts/BaseLayout.astro` | `summary_large_image` card type without image | MEDIUM |
| L3  | LOW      | `content/config.ts` | `publishDate` uses `z.string()` not date type | HIGH |
| L4  | LOW      | `tools/md2word.md` | Missing `image` and `githubUrl` | HIGH |
| L5  | LOW      | `tools/storytrails.md` | No action buttons on detail page (intentional) | LOW |
| L6  | LOW      | All 3 tutorial files | All tutorials are `featured: true` | LOW |
| L7  | LOW      | `components/Header.astro` | FMOTION link has no external indicator or aria-label | LOW |
