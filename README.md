# markdown-wiki

**Turn a folder of Markdown files into a searchable, linkable personal wiki.**

![npm version](https://img.shields.io/npm/v/markdown-wiki)
![license](https://img.shields.io/npm/l/markdown-wiki)
![node](https://img.shields.io/node/v/markdown-wiki)

## Features

- **Wiki-links** — `[[Page Name]]` syntax for bidirectional linking between pages
- **Backlinks** — Automatic "Pages that link here" section on every page
- **Tags** — Organize pages with frontmatter tags, browse by tag index
- **Full-text search** — Client-side search across titles, tags, and content
- **Dev server** — Live preview with automatic rebuild on file changes
- **Dark/Light mode** — Respects system preference with manual toggle
- **Responsive** — Works on desktop and mobile
- **Zero dependencies in output** — Pure static HTML/CSS/JS, host anywhere
- **Sidebar navigation** — Collapsible tree grouped by folder
- **Breadcrumbs** — Folder path navigation on every page

## Installation

```bash
npm install -g markdown-wiki
```

Or use directly with npx:

```bash
npx markdown-wiki build ./my-wiki
```

## Quick Start

```bash
# 1. Create a starter wiki
markdown-wiki init my-wiki

# 2. Start the dev server
cd my-wiki
markdown-wiki dev .

# 3. Build for production
markdown-wiki build . --output _site
```

## Commands

### `markdown-wiki build [source]`

Build a static wiki from a directory of Markdown files.

```bash
markdown-wiki build ./wiki
markdown-wiki build ./wiki --output dist --title "My Notes"
markdown-wiki build ./wiki --theme dark
```

**Options:**

| Flag | Default | Description |
|------|---------|-------------|
| `-o, --output <dir>` | `_site` | Output directory |
| `-t, --title <name>` | `My Wiki` | Wiki title |
| `--theme <light\|dark>` | `system` | Default color theme |

### `markdown-wiki dev [source]`

Start a local dev server with live reload.

```bash
markdown-wiki dev ./wiki
markdown-wiki dev ./wiki --port 8080 --title "Dev Wiki"
```

**Options:**

| Flag | Default | Description |
|------|---------|-------------|
| `-p, --port <number>` | `3000` | Server port |
| `-t, --title <name>` | `My Wiki` | Wiki title |
| `--theme <light\|dark>` | `system` | Default color theme |

### `markdown-wiki init [path]`

Create a starter wiki with example pages.

```bash
markdown-wiki init my-wiki
```

Creates:

```
my-wiki/
├── index.md
├── getting-started.md
└── guides/
    ├── writing.md
    └── linking.md
```

## Wiki-Link Syntax

Link to other pages using double brackets:

| Syntax | Result |
|--------|--------|
| `[[Page Name]]` | Links to page, displays "Page Name" |
| `[[Page Name\|Custom Text]]` | Links to page, displays "Custom Text" |

**How it works:**

- `[[Getting Started]]` resolves to `getting-started.md`
- Page names are slugified: lowercase, spaces → hyphens
- If the target page doesn't exist, the link appears red with a strikethrough

**Backlinks are automatic:** If page A links to page B, page B shows "Linked from: A" at the bottom.

## Frontmatter

Each page can have YAML frontmatter:

```yaml
---
title: My Page Title
tags: [tag1, tag2, tag3]
description: A brief summary of this page
date: 2026-01-15
---

Page content goes here...
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Page title (defaults to filename) |
| `tags` | string[] | No | Tags for categorization |
| `description` | string | No | Brief page summary |
| `date` | string | No | Page date (any format) |

## Example Output

The generated site looks like this:

```
┌─────────────────────────────────────────────────────┐
│ ◐  My Wiki                                          │
│                                                     │
│  Pages                                              │
│  ├─ Getting Started                                 │
│  ├─ Home                                            │
│                                                     │
│  guides                                             │
│  ├─ Linking Pages                                   │
│  ├─ Writing Markdown                                │
├───────────────────────────────┬─────────────────────┤
│ Home / Getting Started     ⌕ Search...             │
├───────────────────────────────┴─────────────────────┤
│                                                     │
│  Getting Started                    📅 2026-01-15   │
│  guide  beginner                                    │
│                                                     │
│  Welcome! Here's how to use your wiki.              │
│                                                     │
│  Quick Start                                        │
│  1. Create .md files                                │
│  2. Add frontmatter                                 │
│  3. Use [[wiki-links]]                              │
│                                                     │
│  ─────────────────────────────────────              │
│  PAGES THAT LINK HERE                               │
│  ← Home                                             │
│  ← Writing Markdown                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Project Structure

```
markdown-wiki/
├── src/
│   ├── index.ts          # CLI entry point
│   ├── scanner.ts        # File discovery
│   ├── parser.ts         # Markdown + frontmatter parsing
│   ├── linker.ts         # Wiki-link resolution & backlinks
│   ├── renderer.ts       # HTML generation
│   ├── search.ts         # Search index builder
│   ├── server.ts         # Dev server with live reload
│   ├── templates.ts      # HTML page templates
│   └── styles.ts         # CSS (embedded in output)
├── bin/
│   └── markdown-wiki     # CLI binary
├── examples/
│   └── wiki/             # Sample wiki
├── tsconfig.json
├── package.json
├── .gitignore
├── LICENSE
└── README.md
```

## Deployment

The `_site/` directory contains pure static HTML/CSS/JS. Deploy it anywhere:

**GitHub Pages:**
```bash
markdown-wiki build ./wiki --output docs
# Push docs/ folder, enable GitHub Pages in settings
```

**Netlify:**
```bash
# Build command: markdown-wiki build . --output _site
# Publish directory: _site
```

**Vercel:**
```bash
# Same as Netlify — just point to _site
```

**Any static host:** Simply upload the `_site/` directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [katogatogato](https://github.com/katogatogato)
