# HNTBO Website

**Domain**: hntbo.com
**Purpose**: YouTube channel site and tools repository for "How Not To Be Obsolete"

## Project Context

HNTBO is the digital home for:
- YouTube tutorial content (Houdini, DaVinci Resolve, AI workflows)
- Open source tools and utilities
- AI integration insights and resources

## Tech Stack

- **Framework**: Astro 4.x
- **Styling**: Tailwind CSS
- **TypeScript**: Strict mode
- **Deployment**: Static (Vercel/Netlify ready)

## Site Structure

```
/               - Landing page (hero + featured content)
/tutos          - YouTube tutorials listing
/tools          - GitHub tools/utilities
/howiai         - AI integration content
/contact        - Contact and social links
```

## Navigation

Internal: Home, Tutos, Tools, HowIAI, Contact
External: FMOTION (links to fmotion.fr)

## Design Tokens

```css
/* Colors - Pink/Magenta accent theme */
background:     #0a0b10
surface:        #12141a
border:         #252833
text-primary:   #f5f5f7
text-secondary: #8e8e93
accent:         #ff2f72    /* Pink - distinct from fmotion's orange */
accent-hover:   #ff5a8f
```

## Key Files

```
src/
├── layouts/
│   └── BaseLayout.astro     # Page wrapper
├── components/
│   ├── Header.astro         # Fixed nav with HNTBO text logo
│   ├── Footer.astro         # Social links (YouTube, GitHub, LinkedIn, Instagram)
│   └── Card.astro           # Video/tool card component
├── pages/
│   ├── index.astro          # Landing with featured sections
│   ├── tutos/index.astro    # Tutorials listing
│   ├── tools/index.astro    # Tools listing
│   ├── howiai.astro         # AI content
│   └── contact.astro        # Contact page
└── styles/
    └── global.css           # Tailwind + custom components
```

## Content Status

Currently stub pages - content will be populated with:
- YouTube video data (thumbnails, titles, links)
- GitHub tool information
- AI workflow articles

## Social Links

- YouTube: @hntbo
- GitHub: HNTBO
- LinkedIn: frederic-pons-fmotion
- Instagram: @hntbo

## Related

- **fmotion.fr** (astromotion) - Professional portfolio site
- Same design language, different accent color
