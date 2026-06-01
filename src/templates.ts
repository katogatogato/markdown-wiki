import type { ResolvedPage } from "./linker.js";

export interface TemplateData {
  wikiTitle: string;
  currentPageSlug: string;
  sidebar: SidebarSection[];
  breadcrumbs: BreadcrumbItem[];
  pageTitle: string;
  pageDate: string;
  pageDescription: string;
  pageTags: { name: string; url: string }[];
  pageContent: string;
  backlinks: { title: string; htmlUrl: string }[];
  theme: string;
  isDev: boolean;
}

export interface SidebarSection {
  name: string;
  items: { title: string; slug: string; htmlUrl: string }[];
}

export interface BreadcrumbItem {
  label: string;
  url: string | null;
}

export function renderFullPage(data: TemplateData): string {
  const themeClass = data.theme === "dark" ? " dark" : data.theme === "light" ? " light" : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.pageTitle)} — ${escapeHtml(data.wikiTitle)}</title>
  <style>${getCSSPlaceholder()}</style>
</head>
<body class="${themeClass.trim()}">
  <div class="app">
    ${renderSidebar(data)}
    <div class="main">
      ${renderHeader(data)}
      <div class="page">
        ${renderPageTitle(data)}
        ${renderPageMeta(data)}
        ${renderTags(data)}
        ${data.pageContent}
        ${renderBacklinks(data)}
      </div>
    </div>
  </div>
  <div class="sidebar-overlay" id="sidebarOverlay"></div>
  <script>${getClientScript(data)}</script>
</body>
</html>`;
}

function getCSSPlaceholder(): string {
  return "/* STYLES_INJECTED_BY_RENDERER */";
}

function renderSidebar(data: TemplateData): string {
  const sections = data.sidebar
    .map((section) => {
      const items = section.items
        .map(
          (item) =>
            `<li class="nav-item"><a href="${escapeAttr(item.htmlUrl)}"${item.slug === data.currentPageSlug ? ' class="active"' : ""}>${escapeHtml(item.title)}</a></li>`
        )
        .join("\n");

      const sectionName = section.name === "__root__" ? "Pages" : section.name;

      return `<div class="nav-section">
  <div class="nav-section-header" onclick="this.parentElement.classList.toggle('collapsed')">
    <span class="arrow">▼</span> ${escapeHtml(sectionName)}
  </div>
  <ul class="nav-items">${items}
  </ul>
</div>`;
    })
    .join("\n");

  return `<aside class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <a href="index.html" class="sidebar-title">${escapeHtml(data.wikiTitle)}</a>
    <button class="theme-toggle" id="themeToggle" title="Toggle theme">◐</button>
  </div>
  <nav class="sidebar-nav">
    ${sections}
  </nav>
</aside>`;
}

function renderHeader(data: TemplateData): string {
  const crumbs = data.breadcrumbs
    .map((crumb) => {
      if (crumb.url) {
        return `<a href="${escapeAttr(crumb.url)}">${escapeHtml(crumb.label)}</a><span class="sep">/</span>`;
      }
      return `<span class="current">${escapeHtml(crumb.label)}</span>`;
    })
    .join("");

  return `<header class="header">
  <button class="mobile-menu-btn" id="mobileMenuBtn">☰</button>
  <div class="breadcrumbs">${crumbs}</div>
  <div class="search-box">
    <span class="search-icon">⌕</span>
    <input type="text" class="search-input" id="searchInput" placeholder="Search pages..." autocomplete="off">
    <div class="search-results" id="searchResults"></div>
  </div>
</header>`;
}

function renderPageTitle(data: TemplateData): string {
  return `<h1 class="page-title">${escapeHtml(data.pageTitle)}</h1>`;
}

function renderPageMeta(data: TemplateData): string {
  if (!data.pageDate && !data.pageDescription) return "";
  let meta = '<div class="page-meta">';
  if (data.pageDate) {
    meta += `<span class="page-date">📅 ${escapeHtml(data.pageDate)}</span>`;
  }
  meta += "</div>";
  if (data.pageDescription) {
    meta += `<p class="page-description">${escapeHtml(data.pageDescription)}</p>`;
  }
  return meta;
}

function renderTags(data: TemplateData): string {
  if (data.pageTags.length === 0) return "";
  const tags = data.pageTags
    .map((t) => `<a href="${escapeAttr(t.url)}" class="tag">${escapeHtml(t.name)}</a>`)
    .join("");
  return `<div class="page-tags">${tags}</div>`;
}

function renderBacklinks(data: TemplateData): string {
  if (data.backlinks.length === 0) return "";
  const items = data.backlinks
    .map(
      (bl) =>
        `<li><a href="${escapeAttr(bl.htmlUrl)}"><span class="backlink-arrow">←</span> ${escapeHtml(bl.title)}</a></li>`
    )
    .join("");

  return `<div class="backlinks">
  <div class="backlinks-title">Pages that link here</div>
  <ul class="backlinks-list">${items}
  </ul>
</div>`;
}

function getClientScript(data: TemplateData): string {
  const devScript = data.isDev
    ? `
// Live reload
(function() {
  var lastBuildTime = Date.now();
  setInterval(function() {
    fetch('/__ping?t=' + Date.now())
      .then(function(r) { return r.text(); })
      .then(function(text) {
        var serverTime = parseInt(text, 10);
        if (serverTime > lastBuildTime) {
          location.reload();
        }
        lastBuildTime = serverTime;
      })
      .catch(function() {});
  }, 2000);
})();`
    : "";

  return `
// Theme toggle
(function() {
  var toggle = document.getElementById('themeToggle');
  var body = document.body;
  var stored = localStorage.getItem('wiki-theme');
  if (stored) {
    body.className = stored;
  }
  toggle.addEventListener('click', function() {
    if (body.classList.contains('dark')) {
      body.className = 'light';
    } else {
      body.className = 'dark';
    }
    localStorage.setItem('wiki-theme', body.className);
  });
})();

// Mobile sidebar
(function() {
  var btn = document.getElementById('mobileMenuBtn');
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  btn.addEventListener('click', function() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.addEventListener('click', function() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
})();

// Search
(function() {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var searchData = null;

  fetch('search-index.json')
    .then(function(r) { return r.json(); })
    .then(function(data) { searchData = data; })
    .catch(function() {});

  input.addEventListener('input', function() {
    var query = input.value.trim().toLowerCase();
    if (!query || !searchData) {
      results.classList.remove('visible');
      return;
    }
    var matches = searchData.filter(function(item) {
      return item.title.toLowerCase().indexOf(query) >= 0 ||
             item.tags.join(' ').toLowerCase().indexOf(query) >= 0 ||
             item.excerpt.toLowerCase().indexOf(query) >= 0 ||
             item.slug.toLowerCase().indexOf(query) >= 0;
    }).slice(0, 10);

    if (matches.length === 0) {
      results.innerHTML = '<div class="search-empty">No results found</div>';
    } else {
      results.innerHTML = matches.map(function(m) {
        var excerpt = m.excerpt;
        var idx = excerpt.toLowerCase().indexOf(query);
        if (idx >= 0) {
          var start = Math.max(0, idx - 40);
          var end = Math.min(excerpt.length, idx + query.length + 40);
          excerpt = (start > 0 ? '...' : '') +
            excerpt.slice(start, end) +
            (end < excerpt.length ? '...' : '');
          var regex = new RegExp('(' + query.replace(/[-[\\]{}()*+?.,\\\\^$|#\\\\s]/g, '\\\\$&') + ')', 'gi');
          excerpt = excerpt.replace(regex, '<mark>$1</mark>');
        }
        return '<a href="' + m.url + '" class="search-result-item">' +
          '<div class="search-result-title">' + escapeHtmlSimple(m.title) + '</div>' +
          '<div class="search-result-excerpt">' + excerpt + '</div>' +
        '</a>';
      }).join('');
    }
    results.classList.add('visible');
  });

  document.addEventListener('click', function(e) {
    if (!results.contains(e.target) && e.target !== input) {
      results.classList.remove('visible');
    }
  });

  function escapeHtmlSimple(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();
${devScript}`;
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
