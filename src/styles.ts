export function getStyles(): string {
  return `/* markdown-wiki — Clean, Notion-inspired theme */
:root {
  --bg: #ffffff;
  --bg-secondary: #f7f7f7;
  --bg-sidebar: #fafafa;
  --text: #37352f;
  --text-secondary: #787774;
  --text-muted: #9b9a97;
  --border: #e9e9e7;
  --border-light: #efefef;
  --accent: #2383e2;
  --accent-hover: #1b6ec2;
  --accent-light: #e8f0fe;
  --tag-bg: #e8f0fe;
  --tag-text: #2383e2;
  --code-bg: #f7f6f3;
  --code-text: #eb5757;
  --link-bg: rgba(35, 131, 226, 0.06);
  --link-text: #2383e2;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --radius: 6px;
  --radius-lg: 10px;
  --sidebar-width: 260px;
  --header-height: 52px;
  --font-display: 'Georgia', 'Times New Roman', serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
  --font-mono: 'SFMono-Regular', 'Menlo', 'Consolas', monospace;
  --transition: 0.2s ease;
}

.dark {
  --bg: #191919;
  --bg-secondary: #202020;
  --bg-sidebar: #1a1a1a;
  --text: #e0e0e0;
  --text-secondary: #a0a0a0;
  --text-muted: #707070;
  --border: #2e2e2e;
  --border-light: #272727;
  --accent: #529cca;
  --accent-hover: #6fb3e0;
  --accent-light: #1a2a3a;
  --tag-bg: #1a2a3a;
  --tag-text: #529cca;
  --code-bg: #252525;
  --code-text: #f97583;
  --link-bg: rgba(82, 156, 202, 0.1);
  --link-text: #529cca;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
}

@media (prefers-color-scheme: dark) {
  :root:not(.light) {
    --bg: #191919;
    --bg-secondary: #202020;
    --bg-sidebar: #1a1a1a;
    --text: #e0e0e0;
    --text-secondary: #a0a0a0;
    --text-muted: #707070;
    --border: #2e2e2e;
    --border-light: #272727;
    --accent: #529cca;
    --accent-hover: #6fb3e0;
    --accent-light: #1a2a3a;
    --tag-bg: #1a2a3a;
    --tag-text: #529cca;
    --code-bg: #252525;
    --code-text: #f97583;
    --link-bg: rgba(82, 156, 202, 0.1);
    --link-text: #529cca;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  }
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-body);
  color: var(--text);
  background: var(--bg);
  line-height: 1.7;
  min-height: 100vh;
}

/* ===== LAYOUT ===== */
.app {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 20;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
  text-decoration: none;
}

.sidebar-title:hover {
  color: var(--accent);
}

.theme-toggle {
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: var(--transition);
  line-height: 1;
}

.theme-toggle:hover {
  background: var(--bg-secondary);
  color: var(--text);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.nav-section {
  margin-bottom: 2px;
}

.nav-section-header {
  display: flex;
  align-items: center;
  padding: 6px 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  cursor: pointer;
  user-select: none;
  gap: 6px;
}

.nav-section-header:hover {
  color: var(--text-secondary);
}

.nav-section-header .arrow {
  font-size: 10px;
  transition: transform var(--transition);
  display: inline-block;
  width: 14px;
}

.nav-section.collapsed .arrow {
  transform: rotate(-90deg);
}

.nav-section.collapsed .nav-items {
  display: none;
}

.nav-items {
  list-style: none;
}

.nav-item {
  display: block;
}

.nav-item a {
  display: block;
  padding: 5px 20px 5px 34px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 13.5px;
  line-height: 1.5;
  transition: var(--transition);
  border-left: 2px solid transparent;
}

.nav-item a:hover {
  color: var(--text);
  background: var(--bg-secondary);
}

.nav-item a.active {
  color: var(--accent);
  background: var(--accent-light);
  border-left-color: var(--accent);
  font-weight: 500;
}

/* ===== MAIN CONTENT ===== */
.main {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  height: var(--header-height);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 32px;
  gap: 16px;
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 10;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.breadcrumbs a {
  color: var(--text-secondary);
  text-decoration: none;
}

.breadcrumbs a:hover {
  color: var(--accent);
}

.breadcrumbs .sep {
  color: var(--text-muted);
}

.breadcrumbs .current {
  color: var(--text);
  font-weight: 500;
}

.search-box {
  flex: 1;
  max-width: 400px;
  margin-left: auto;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 7px 14px 7px 34px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 13.5px;
  background: var(--bg-secondary);
  color: var(--text);
  outline: none;
  transition: var(--transition);
  font-family: var(--font-body);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  border-color: var(--accent);
  background: var(--bg);
  box-shadow: 0 0 0 3px rgba(35, 131, 226, 0.12);
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 14px;
  pointer-events: none;
}

.search-results {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  max-height: 400px;
  overflow-y: auto;
  display: none;
  z-index: 100;
}

.search-results.visible {
  display: block;
}

.search-result-item {
  display: block;
  padding: 10px 14px;
  text-decoration: none;
  color: var(--text);
  border-bottom: 1px solid var(--border-light);
  transition: var(--transition);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: var(--accent-light);
}

.search-result-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.search-result-excerpt {
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.search-result-excerpt mark {
  background: rgba(235, 87, 87, 0.15);
  color: var(--code-text);
  padding: 0 2px;
  border-radius: 2px;
}

.search-empty {
  padding: 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

/* ===== PAGE ===== */
.page {
  flex: 1;
  max-width: 800px;
  width: 100%;
  padding: 40px 32px 60px;
  margin: 0 auto;
}

.page-title {
  font-family: var(--font-display);
  font-size: 38px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--text);
  margin-bottom: 8px;
}

.page-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  font-size: 13px;
  color: var(--text-muted);
}

.page-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-description {
  font-size: 17px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
  font-style: italic;
}

.page-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 28px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: var(--tag-bg);
  color: var(--tag-text);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  transition: var(--transition);
  letter-spacing: 0.01em;
}

.tag:hover {
  background: var(--accent);
  color: #fff;
}

/* ===== CONTENT BODY ===== */
.page-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text);
}

.page-content h1 {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
  margin: 48px 0 16px;
  letter-spacing: -0.01em;
  line-height: 1.3;
  color: var(--text);
}

.page-content h2 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  margin: 40px 0 12px;
  letter-spacing: -0.01em;
  line-height: 1.35;
  color: var(--text);
}

.page-content h3 {
  font-size: 19px;
  font-weight: 600;
  margin: 32px 0 10px;
  color: var(--text);
}

.page-content h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 24px 0 8px;
  color: var(--text);
}

.page-content p {
  margin-bottom: 16px;
}

.page-content a {
  color: var(--link-text);
  text-decoration: none;
  background: var(--link-bg);
  padding: 1px 4px;
  border-radius: 3px;
  transition: var(--transition);
}

.page-content a:hover {
  background: var(--accent);
  color: #fff;
}

.page-content a.broken-link {
  color: #eb5757;
  background: rgba(235, 87, 87, 0.08);
  text-decoration: line-through;
}

.page-content ul,
.page-content ol {
  margin-bottom: 16px;
  padding-left: 24px;
}

.page-content li {
  margin-bottom: 6px;
}

.page-content blockquote {
  border-left: 3px solid var(--accent);
  padding: 12px 20px;
  margin: 16px 0;
  background: var(--bg-secondary);
  border-radius: 0 var(--radius) var(--radius) 0;
  color: var(--text-secondary);
}

.page-content blockquote p:last-child {
  margin-bottom: 0;
}

.page-content code {
  font-family: var(--font-mono);
  font-size: 0.88em;
  background: var(--code-bg);
  color: var(--code-text);
  padding: 2px 6px;
  border-radius: 4px;
}

.page-content pre {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 20px;
  overflow-x: auto;
  margin: 16px 0;
  line-height: 1.6;
}

.page-content pre code {
  background: none;
  color: var(--text);
  padding: 0;
  font-size: 13.5px;
}

.page-content img {
  max-width: 100%;
  border-radius: var(--radius);
  margin: 16px 0;
}

.page-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 14px;
}

.page-content th,
.page-content td {
  padding: 10px 14px;
  border: 1px solid var(--border);
  text-align: left;
}

.page-content th {
  background: var(--bg-secondary);
  font-weight: 600;
}

.page-content hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 32px 0;
}

/* ===== BACKLINKS ===== */
.backlinks {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.backlinks-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.backlinks-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.backlinks-list a {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  color: var(--text);
  text-decoration: none;
  font-size: 14px;
  transition: var(--transition);
}

.backlinks-list a:hover {
  border-color: var(--accent);
  background: var(--accent-light);
}

.backlinks-list .backlink-arrow {
  color: var(--accent);
  font-size: 12px;
}

/* ===== TAG INDEX PAGE ===== */
.tag-index {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-index-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag-index-item .tag {
  min-width: 100px;
  text-align: center;
}

.tag-count {
  font-size: 13px;
  color: var(--text-muted);
}

.tag-pages {
  margin-top: 24px;
}

.tag-page-group h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.tag-page-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 24px;
}

.tag-page-list a {
  color: var(--link-text);
  text-decoration: none;
}

.tag-page-list a:hover {
  text-decoration: underline;
}

/* ===== MOBILE MENU ===== */
.mobile-menu-btn {
  display: none;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 6px 10px;
  cursor: pointer;
  color: var(--text);
  font-size: 18px;
  line-height: 1;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 19;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-overlay.open {
    display: block;
  }

  .main {
    margin-left: 0;
  }

  .mobile-menu-btn {
    display: block;
  }

  .page {
    padding: 24px 16px 40px;
  }

  .page-title {
    font-size: 28px;
  }

  .header {
    padding: 0 16px;
  }

  .search-box {
    max-width: 200px;
  }
}

/* ===== PRINT ===== */
@media print {
  .sidebar,
  .header,
  .theme-toggle,
  .search-box,
  .mobile-menu-btn {
    display: none !important;
  }

  .main {
    margin-left: 0;
  }

  .page {
    max-width: 100%;
    padding: 0;
  }

  body {
    color: #000;
    background: #fff;
  }

  a {
    color: #000;
    text-decoration: underline;
  }
}

/* ===== SYNTAX HIGHLIGHTING CLASSES ===== */
.token.comment { color: var(--text-muted); font-style: italic; }
.token.keyword { color: #a626a4; }
.dark .token.keyword { color: #c678dd; }
.token.string { color: #50a14f; }
.dark .token.string { color: #98c379; }
.token.number { color: #986801; }
.dark .token.number { color: #d19a66; }
.token.function { color: #4078f2; }
.dark .token.function { color: #61afef; }
.token.operator { color: var(--text-secondary); }
.token.class-name { color: #c18401; }
.dark .token.class-name { color: #e5c07b; }
`;
}
