import type { ResolvedPage } from "./linker.js";
import { renderMarkdown, extractWikiLinks } from "./parser.js";
import { slugify, isBrokenLink } from "./linker.js";
import { getStyles } from "./styles.js";
import {
  renderFullPage,
  type TemplateData,
  type SidebarSection,
  type BreadcrumbItem,
} from "./templates.js";
import { buildSearchIndex, searchIndexToJson } from "./search.js";
import * as fs from "node:fs";
import * as path from "node:path";

export interface BuildOptions {
  source: string;
  output: string;
  title: string;
  theme: string;
  isDev: boolean;
}

export interface BuildResult {
  outputDir: string;
  pageCount: number;
  buildTime: number;
}

export function renderAndWrite(
  pages: ResolvedPage[],
  options: BuildOptions
): BuildResult {
  const startTime = Date.now();
  const outputDir = path.resolve(options.output);

  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const tagPageMap = collectTagPages(pages);
  const sidebar = buildSidebar(pages);
  const allTags = Array.from(tagPageMap.keys()).sort();

  for (const page of pages) {
    const renderedContent = renderPageContent(page, pages);
    const breadcrumbs = buildBreadcrumbs(page);
    const pageTags = page.frontmatter.tags.map((tag) => ({
      name: tag,
      url: `tags/${slugify(tag)}.html`,
    }));

    const templateData: TemplateData = {
      wikiTitle: options.title,
      currentPageSlug: page.slug,
      sidebar,
      breadcrumbs,
      pageTitle: page.frontmatter.title,
      pageDate: page.frontmatter.date,
      pageDescription: page.frontmatter.description,
      pageTags,
      pageContent: renderedContent,
      backlinks: page.backlinks,
      theme: options.theme,
      isDev: options.isDev,
    };

    const html = renderFullPage(templateData);
    const finalHtml = injectStyles(html);

    const pageOutputPath = path.join(outputDir, page.outputPath);
    fs.mkdirSync(path.dirname(pageOutputPath), { recursive: true });
    fs.writeFileSync(pageOutputPath, finalHtml);
  }

  const tagsOutputDir = path.join(outputDir, "tags");
  fs.mkdirSync(tagsOutputDir, { recursive: true });

  for (const tag of allTags) {
    const tagPages = tagPageMap.get(tag) || [];
    const tagSlug = slugify(tag);

    const tagPageContent = renderTagPage(tag, tagPages);
    const tagBreadcrumbs: BreadcrumbItem[] = [
      { label: "Home", url: "../index.html" },
      { label: "Tags", url: null },
      { label: tag, url: null },
    ];

    const tagTemplateData: TemplateData = {
      wikiTitle: options.title,
      currentPageSlug: `tags/${tagSlug}`,
      sidebar,
      breadcrumbs: tagBreadcrumbs,
      pageTitle: `Tag: ${tag}`,
      pageDate: "",
      pageDescription: `Pages tagged with "${tag}"`,
      pageTags: [],
      pageContent: tagPageContent,
      backlinks: [],
      theme: options.theme,
      isDev: options.isDev,
    };

    const html = renderFullPage(tagTemplateData);
    const finalHtml = injectStyles(html);
    fs.writeFileSync(path.join(tagsOutputDir, tagSlug + ".html"), finalHtml);
  }

  const tagsIndexContent = renderTagsIndex(allTags, tagPageMap);
  const tagsIndexData: TemplateData = {
    wikiTitle: options.title,
    currentPageSlug: "tags-index",
    sidebar,
    breadcrumbs: [
      { label: "Home", url: "index.html" },
      { label: "All Tags", url: null },
    ],
    pageTitle: "All Tags",
    pageDate: "",
    pageDescription: "Browse all tags in this wiki",
    pageTags: [],
    pageContent: tagsIndexContent,
    backlinks: [],
    theme: options.theme,
    isDev: options.isDev,
  };

  const tagsIndexHtml = renderFullPage(tagsIndexData);
  fs.writeFileSync(
    path.join(outputDir, "tags.html"),
    injectStyles(tagsIndexHtml)
  );

  const searchIndex = buildSearchIndex(pages);
  fs.writeFileSync(
    path.join(outputDir, "search-index.json"),
    searchIndexToJson(searchIndex)
  );

  const buildTime = Date.now() - startTime;
  return {
    outputDir,
    pageCount: pages.length,
    buildTime,
  };
}

function injectStyles(html: string): string {
  return html.replace("/* STYLES_INJECTED_BY_RENDERER */", getStyles());
}

function renderPageContent(
  page: ResolvedPage,
  allPages: ResolvedPage[]
): string {
  let content = page.rawContent;

  const links = extractWikiLinks(content);
  const sortedLinks = [...links].sort(
    (a, b) => b.startIndex - a.startIndex
  );

  for (const link of sortedLinks) {
    const slugGuess = slugify(link.target);
    const broken = isBrokenLink(link, page, allPages);

    let targetPage: ResolvedPage | undefined;
    for (const p of allPages) {
      if (p.slug === slugGuess || p.name.toLowerCase() === link.target.toLowerCase()) {
        targetPage = p;
        break;
      }
    }

    let replacement: string;
    if (broken) {
      replacement = `<a class="broken-link" title="Page not found: ${escapeAttr(link.target)}">${escapeHtml(link.display)}</a>`;
    } else {
      const href = targetPage ? targetPage.htmlUrl : slugGuess + ".html";
      replacement = `<a href="${escapeAttr(href)}">${escapeHtml(link.display)}</a>`;
    }

    content =
      content.slice(0, link.startIndex) +
      replacement +
      content.slice(link.endIndex);
  }

  return renderMarkdown(content);
}

function buildSidebar(pages: ResolvedPage[]): SidebarSection[] {
  const sectionMap = new Map<string, ResolvedPage[]>();

  for (const page of pages) {
    const folder = page.folder || "__root__";
    if (!sectionMap.has(folder)) {
      sectionMap.set(folder, []);
    }
    sectionMap.get(folder)!.push(page);
  }

  const sections: SidebarSection[] = [];
  const folderOrder = Array.from(sectionMap.keys()).sort();

  if (sectionMap.has("__root__")) {
    const rootPages = sectionMap.get("__root__")!.sort((a, b) =>
      a.frontmatter.title.localeCompare(b.frontmatter.title)
    );
    sections.push({
      name: "__root__",
      items: rootPages.map((p) => ({
        title: p.frontmatter.title,
        slug: p.slug,
        htmlUrl: p.htmlUrl,
      })),
    });
  }

  for (const folder of folderOrder) {
    if (folder === "__root__") continue;
    const folderPages = sectionMap.get(folder)!.sort((a, b) =>
      a.frontmatter.title.localeCompare(b.frontmatter.title)
    );
    sections.push({
      name: folder,
      items: folderPages.map((p) => ({
        title: p.frontmatter.title,
        slug: p.slug,
        htmlUrl: p.htmlUrl,
      })),
    });
  }

  return sections;
}

function buildBreadcrumbs(page: ResolvedPage): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [
    { label: "Home", url: (page.folder ? "../" : "") + "index.html" },
  ];

  if (page.folder) {
    const parts = page.folder.split("/");
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      crumbs.push({
        label: part.charAt(0).toUpperCase() + part.slice(1),
        url: isLast ? null : parts.slice(0, i + 1).join("/") + "/index.html",
      });
    }
  }

  crumbs.push({ label: page.frontmatter.title, url: null });
  return crumbs;
}

function collectTagPages(
  pages: ResolvedPage[]
): Map<string, ResolvedPage[]> {
  const map = new Map<string, ResolvedPage[]>();
  for (const page of pages) {
    for (const tag of page.frontmatter.tags) {
      if (!map.has(tag)) {
        map.set(tag, []);
      }
      map.get(tag)!.push(page);
    }
  }
  return map;
}

function renderTagPage(
  tag: string,
  pages: ResolvedPage[]
): string {
  const items = pages
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title))
    .map(
      (p) =>
        `<li><a href="${escapeAttr(p.htmlUrl)}">${escapeHtml(p.frontmatter.title)}</a></li>`
    )
    .join("");

  return `<h2>Pages tagged "${escapeHtml(tag)}"</h2>
<ul class="tag-page-list">${items}</ul>
<p><a href="../tags.html">← All tags</a></p>`;
}

function renderTagsIndex(
  tags: string[],
  tagPageMap: Map<string, ResolvedPage[]>
): string {
  if (tags.length === 0) {
    return "<p>No tags found.</p>";
  }

  const items = tags
    .map((tag) => {
      const count = tagPageMap.get(tag)?.length || 0;
      return `<li class="tag-index-item">
  <a href="tags/${slugify(tag)}.html" class="tag">${escapeHtml(tag)}</a>
  <span class="tag-count">${count} page${count !== 1 ? "s" : ""}</span>
</li>`;
    })
    .join("");

  return `<ul class="tag-index">${items}</ul>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
