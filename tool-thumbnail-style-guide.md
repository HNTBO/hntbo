# HNTBO Tool Thumbnail Style Guide

Style reference for generating tool card thumbnails on hntbo.com. Use this when prompting image generation (Banana Pro or similar) for new tool cards.

## Aspect Ratio

- **16:10** (matches the Card.astro component's `aspect-ratio: 16/10`)
- Resolution: 1280x800px minimum, 1920x1200px ideal

## Background

- **Soft light blue-grey gradient** — icy, frosted feel
- Ranges from pale sky blue to slightly warmer light grey
- Subtle texture allowed: faint geometric pattern (chevrons, dots, halftone) at low opacity
- Never pure white, never dark — the site's dark theme makes these light cards pop

## Typography

- **Bold, 3D-style orange gradient text** for the tool name
- Color range: warm orange (#FF8C00) to red-orange (#FF4500)
- Slight emboss / raised / extruded effect — not flat, but not over-the-top 3D
- Subtle warm glow behind the text (light bloom on the background)
- Tool name is the dominant element — large, centered or right-aligned
- Optional subtitle in smaller text inside a frosted glass pill/badge

## Visual Elements

- **Frosted glass (glassmorphism) panels** — semi-transparent white cards with soft blur and thin white border
- **Cartoon-style icons** that represent the tool's function — friendly, slightly rounded, with dark outlines
- Icons sit inside or on top of the frosted glass panels
- Visual elements illustrate what the tool does (waveform for audio, folders for file management, etc.)

## Composition

- **Centered** or **split layout** (icons left, title right — or title top, visual middle)
- Plenty of breathing room — not cluttered
- The tool name is always readable at card size (~400px wide)

## What to Avoid

- Dark backgrounds (conflicts with the site's dark theme)
- Photographic/realistic imagery (keep it illustrated/graphic)
- Flat design without depth — the style leans into subtle 3D and glass effects
- Busy compositions — these are card thumbnails, not posters
- Pure white text — always use the orange gradient for the title

## Reference Images

Existing thumbnails in `/public/images/tools/`:
- `audio-visualizer.jpg` — title top, waveform panel center, slider UI elements bottom
- `folder-manager.jpg` — centered cartoon folder icon with tool overlays, title in glass pill below
- `storytrails.jpg` — vertical timeline with icon cards left, title right
- `bubblebeat-card.webp` — (outlier: white bg, product UI mockup style)
- `brute-bookmarks.jpg` — (outlier: actual UI screenshot, dark bg)
