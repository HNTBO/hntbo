# Easy Human Editorial Control

This document formalizes the content workflow so non-technical edits can be made safely and pushed into code quickly.

## Goal

Use two human-readable Markdown files as the source of truth for website copy:
- `content/website-copy/en.md`
- `content/website-copy/fr.md`

Then ask an agent to sync those edits into the translation object in `src/pages/index.astro`.

## Source Files

- English copy: `content/website-copy/en.md`
- French copy: `content/website-copy/fr.md`
- Workflow reference: `content/website-copy/README.md`

## Editing Rules

1. Edit only the text after each key.
2. Keep key names exactly unchanged (example: ``hero_h1``, ``pipeline_step2_p``).
3. Keep both language files aligned on the same key set.
4. Avoid deleting keys unless you also want the related UI text removed in code.
5. Keep formatting simple and readable.

## Standard Workflow

1. Open and edit:
- `content/website-copy/en.md`
- `content/website-copy/fr.md`

2. Request sync in chat:
- `sync website copy from markdown`

3. Codex action:
- Parse both Markdown files
- Update translation values in `src/pages/index.astro`
- Preserve key mapping and language toggle behavior

4. Validation:
- Run `npm run build`
- Confirm no missing keys or build errors

## Recommended Update Cadence

For each editorial round:
1. Update EN and FR copy in Markdown files.
2. Run one sync request.
3. Review output text in the local site.
4. Iterate only on copy, not code structure.

## Quick Request Templates

- `sync website copy from markdown`
- `sync website copy from markdown and keep existing EN keys only`
- `sync website copy from markdown, then run build`

## Guardrails

- Markdown files are the editable copy layer.
- `src/pages/index.astro` is the implementation layer.
- Do not manually edit translation strings in code if the same change can be made in Markdown.

## Change Ownership

- Human/editor: owns wording and message quality.
- Agent: owns synchronization, key integrity, and technical validation.
