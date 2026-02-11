# Website Copy - Editorial Control

Human-readable Markdown files as the single source of truth for all website text.

## How It Works

1. **You edit** `en.md` - change any text after a key
2. **You ask** the agent: `sync website copy from markdown`
3. **Agent updates** the Astro pages to match
4. **Agent runs** `npm run build` to validate

## Rules

- Edit only the text after each key (the backtick-wrapped name like `hero_h1`)
- Keep key names exactly unchanged
- Don't delete keys unless you want that UI text removed
- Keep formatting simple - one line per value

## File Map

| Copy File | Syncs Into |
|-----------|-----------|
| `en.md` → `hero_*` | `src/pages/index.astro` |
| `en.md` → `tutos_*` | `src/pages/tutos/index.astro` |
| `en.md` → `tools_*` | `src/pages/tools/index.astro` |
| `en.md` → `howiai_*` | `src/pages/howiai.astro` |
| `en.md` → `contact_*` | `src/pages/contact.astro` |
| `en.md` → `footer_*` | `src/components/Footer.astro` |
| `en.md` → `site_title` | `src/layouts/BaseLayout.astro` |
| `en.md` → `*_description` | `<meta>` tags in each page |

## Quick Commands

- `sync website copy from markdown` - parse en.md and update all pages
- `sync website copy from markdown, then run build` - sync + validate

## Who Owns What

- **Human/editor**: wording, message quality, tone
- **Agent**: synchronization, key integrity, build validation
