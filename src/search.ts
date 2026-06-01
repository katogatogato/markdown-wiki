import type { ResolvedPage } from "./linker.js";

export interface SearchEntry {
  title: string;
  slug: string;
  url: string;
  tags: string[];
  excerpt: string;
}

export function buildSearchIndex(pages: ResolvedPage[]): SearchEntry[] {
  return pages.map((page) => ({
    title: page.frontmatter.title,
    slug: page.slug,
    url: page.htmlUrl,
    tags: page.frontmatter.tags,
    excerpt: extractExcerpt(page.rawContent),
  }));
}

function extractExcerpt(content: string): string {
  const stripped = content
    .replace(/^---[\s\S]*?---/, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[\[.*?\]\]/g, "")
    .replace(/[#*_`~>\-|]/g, "")
    .replace(/\n+/g, " ")
    .trim();

  return stripped.slice(0, 200);
}

export function searchIndexToJson(entries: SearchEntry[]): string {
  return JSON.stringify(entries, null, 2);
}
