import type { ParsedPage, WikiLink } from "./parser.js";

export interface ResolvedPage extends ParsedPage {
  slug: string;
  outputPath: string;
  htmlUrl: string;
  backlinks: Backlink[];
  outboundLinks: string[];
}

export interface Backlink {
  title: string;
  slug: string;
  htmlUrl: string;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildPageMap(
  pages: ParsedPage[]
): Map<string, ParsedPage> {
  const map = new Map<string, ParsedPage>();
  for (const page of pages) {
    const slug = computeSlug(page);
    map.set(slug, page);
    map.set(slug.toLowerCase(), page);
    map.set(page.name.toLowerCase(), page);
  }
  return map;
}

export function computeSlug(page: ParsedPage): string {
  if (page.folder) {
    return page.folder + "/" + slugify(page.name);
  }
  return slugify(page.name);
}

export function resolveLinks(
  pages: ParsedPage[]
): ResolvedPage[] {
  const pageMap = buildPageMap(pages);
  const slugToPage = new Map<string, ParsedPage>();

  for (const page of pages) {
    const slug = computeSlug(page);
    slugToPage.set(slug, page);
  }

  const targetToSources = new Map<string, Set<string>>();

  for (const page of pages) {
    for (const link of page.wikiLinks) {
      const targetSlug = resolveTargetSlug(link, page, pageMap, slugToPage);
      if (targetSlug) {
        if (!targetToSources.has(targetSlug)) {
          targetToSources.set(targetSlug, new Set());
        }
        targetToSources.get(targetSlug)!.add(computeSlug(page));
      }
    }
  }

  return pages.map((page) => {
    const slug = computeSlug(page);
    const htmlUrl = slug + ".html";
    const outputPath = htmlUrl;

    const backlinkSlugs = targetToSources.get(slug) || new Set<string>();
    const backlinks: Backlink[] = Array.from(backlinkSlugs)
      .map((sourceSlug) => {
        const sourcePage = slugToPage.get(sourceSlug);
        if (!sourcePage) return null;
        return {
          title: sourcePage.frontmatter.title,
          slug: sourceSlug,
          htmlUrl: sourceSlug + ".html",
        };
      })
      .filter((bl): bl is Backlink => bl !== null)
      .sort((a, b) => a.title.localeCompare(b.title));

    const outboundLinks = page.wikiLinks.map((link) =>
      resolveTargetSlug(link, page, pageMap, slugToPage)
    ).filter((s): s is string => s !== null);

    const uniqueOutbound = Array.from(new Set(outboundLinks));

    return {
      ...page,
      slug,
      outputPath,
      htmlUrl,
      backlinks,
      outboundLinks: uniqueOutbound,
    };
  });
}

function resolveTargetSlug(
  link: WikiLink,
  sourcePage: ParsedPage,
  pageMap: Map<string, ParsedPage>,
  slugToPage: Map<string, ParsedPage>
): string | null {
  const targetName = link.target;
  const slugGuess = slugify(targetName);

  if (slugToPage.has(slugGuess)) {
    return slugGuess;
  }

  const found = pageMap.get(targetName.toLowerCase());
  if (found) {
    return computeSlug(found);
  }

  const foundBySlug = pageMap.get(slugGuess.toLowerCase());
  if (foundBySlug) {
    return computeSlug(foundBySlug);
  }

  for (const [s, p] of slugToPage) {
    if (p.name.toLowerCase() === targetName.toLowerCase()) {
      return s;
    }
  }

  return null;
}

export function isBrokenLink(
  link: WikiLink,
  sourcePage: ParsedPage,
  resolvedPages: ResolvedPage[]
): boolean {
  const slugSet = new Set(resolvedPages.map((p) => p.slug));
  const slugGuess = slugify(link.target);

  if (slugSet.has(slugGuess)) return false;

  for (const rp of resolvedPages) {
    if (rp.name.toLowerCase() === link.target.toLowerCase()) return false;
  }

  return true;
}
