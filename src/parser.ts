import matter from "gray-matter";
import { marked } from "marked";
import * as fs from "node:fs";

export interface PageFrontmatter {
  title: string;
  tags: string[];
  date: string;
  description: string;
}

export interface WikiLink {
  raw: string;
  target: string;
  display: string;
  startIndex: number;
  endIndex: number;
}

export interface ParsedPage {
  relativePath: string;
  folder: string;
  name: string;
  frontmatter: PageFrontmatter;
  rawContent: string;
  wikiLinks: WikiLink[];
}

export function parsePage(
  absolutePath: string,
  relativePath: string,
  folder: string,
  name: string
): ParsedPage {
  const fileContent = fs.readFileSync(absolutePath, "utf-8");
  const { data, content } = matter(fileContent);

  const frontmatter: PageFrontmatter = {
    title: typeof data.title === "string" ? data.title : name,
    tags: Array.isArray(data.tags)
      ? data.tags.map((t: string) => String(t))
      : [],
    date: typeof data.date === "string" ? data.date : "",
    description: typeof data.description === "string" ? data.description : "",
  };

  const wikiLinks = extractWikiLinks(content);

  return {
    relativePath,
    folder,
    name,
    frontmatter,
    rawContent: content,
    wikiLinks,
  };
}

export function extractWikiLinks(content: string): WikiLink[] {
  const links: WikiLink[] = [];
  const regex = /\[\[([^\]]+)\]\]/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const inner = match[1];
    const pipeIndex = inner.indexOf("|");
    const target = pipeIndex >= 0 ? inner.slice(0, pipeIndex).trim() : inner.trim();
    const display = pipeIndex >= 0 ? inner.slice(pipeIndex + 1).trim() : target;

    links.push({
      raw: match[0],
      target,
      display,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return links;
}

export function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}
