---
title: Linking Pages
tags: [guide, linking, wiki-links]
description: How to use wiki-links to connect your pages
date: 2026-01-20
---

# Linking Pages

Wiki-links are what make your wiki a **connected knowledge base** rather than isolated documents.

## Syntax

| Syntax | Result |
|--------|--------|
| `[[Page Name]]` | Links to page, displays "Page Name" |
| `[[Page Name\|Custom Text]]` | Links to page, displays "Custom Text" |

## How Links Are Resolved

1. `[[Getting Started]]` → looks for `getting-started.md`
2. The link text is **slugified** (lowercased, spaces → hyphens)
3. If the target page exists, a clickable link is created
4. If not found, it appears as a red broken link

## Backlinks

Links are **bidirectional**. When page A links to page B:

- Page A shows a normal link to B
- Page B automatically shows "Linked from: A" in the backlinks section

This means you don't need to manually maintain反向链接 — they're computed automatically!

## Examples

- [[Home]] — basic link
- [[Getting Started|Start here!]] — custom display text
- [[Writing]] — cross-folder link to `guides/writing.md`

> **Tip**: Link freely! Even if a page doesn't exist yet, the broken link serves as a reminder to create it.

---

Return to [[Home]] or read about [[Writing]].
