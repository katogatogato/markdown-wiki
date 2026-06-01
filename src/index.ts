#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { scanDirectory } from "./scanner.js";
import { parsePage } from "./parser.js";
import { resolveLinks } from "./linker.js";
import { renderAndWrite } from "./renderer.js";
import { startDevServer } from "./server.js";
import * as fs from "node:fs";
import * as path from "node:path";

const program = new Command();

program
  .name("markdown-wiki")
  .description("Turn a folder of Markdown files into a searchable, linkable personal wiki")
  .version("1.0.0");

program
  .command("build")
  .description("Build a static wiki from Markdown files")
  .argument("[source]", "source directory containing .md files", ".")
  .option("-o, --output <dir>", "output directory", "_site")
  .option("-t, --title <name>", "wiki title", "My Wiki")
  .option("--theme <light|dark>", "default theme (light or dark)", "system")
  .action((source: string, options: { output: string; title: string; theme: string }) => {
    buildCommand(source, options);
  });

program
  .command("dev")
  .description("Start a dev server with live reload")
  .argument("[source]", "source directory containing .md files", ".")
  .option("-p, --port <number>", "port number", "3000")
  .option("-t, --title <name>", "wiki title", "My Wiki")
  .option("--theme <light|dark>", "default theme (light or dark)", "system")
  .action((source: string, options: { port: string; title: string; theme: string }) => {
    devCommand(source, options);
  });

program
  .command("init")
  .description("Create a starter wiki structure")
  .argument("[path]", "target directory", "wiki")
  .action((targetPath: string) => {
    initCommand(targetPath);
  });

program.parse();

function buildCommand(
  source: string,
  options: { output: string; title: string; theme: string }
): void {
  const sourceDir = path.resolve(source);
  const outputDir = path.resolve(options.output);

  console.log(chalk.cyan("\n  markdown-wiki build\n"));
  console.log(`  Source: ${chalk.gray(sourceDir)}`);
  console.log(`  Output: ${chalk.gray(outputDir)}`);
  console.log(`  Title:  ${chalk.gray(options.title)}\n`);

  if (!fs.existsSync(sourceDir)) {
    console.error(chalk.red(`  Error: Source directory not found: ${sourceDir}`));
    process.exit(1);
  }

  const scannedFiles = scanDirectory(sourceDir);
  console.log(`  Found ${chalk.bold(String(scannedFiles.length))} markdown files\n`);

  const parsedPages = scannedFiles.map((f) =>
    parsePage(f.absolutePath, f.relativePath, f.folder, f.name)
  );

  const resolvedPages = resolveLinks(parsedPages);

  const result = renderAndWrite(resolvedPages, {
    source: sourceDir,
    output: outputDir,
    title: options.title,
    theme: options.theme,
    isDev: false,
  });

  console.log(
    chalk.green(`  ✓ Built ${result.pageCount} pages in ${result.buildTime}ms`)
  );
  console.log(`  Output: ${chalk.gray(result.outputDir)}\n`);
}

function devCommand(
  source: string,
  options: { port: string; title: string; theme: string }
): void {
  const sourceDir = path.resolve(source);
  const port = parseInt(options.port, 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    console.error(chalk.red(`  Error: Invalid port number: ${options.port}`));
    process.exit(1);
  }

  if (!fs.existsSync(sourceDir)) {
    console.error(chalk.red(`  Error: Source directory not found: ${sourceDir}`));
    process.exit(1);
  }

  startDevServer({
    source: sourceDir,
    port,
    title: options.title,
    theme: options.theme,
  });
}

function initCommand(targetPath: string): void {
  const targetDir = path.resolve(targetPath);

  console.log(chalk.cyan("\n  markdown-wiki init\n"));
  console.log(`  Creating wiki at: ${chalk.gray(targetDir)}\n`);

  if (fs.existsSync(targetDir)) {
    const existing = fs.readdirSync(targetDir);
    if (existing.length > 0) {
      console.error(
        chalk.red(`  Error: Directory is not empty: ${targetDir}`)
      );
      process.exit(1);
    }
  }

  fs.mkdirSync(targetDir, { recursive: true });
  fs.mkdirSync(path.join(targetDir, "guides"), { recursive: true });

  const files: Record<string, string> = {
    "index.md": `---
title: Home
tags: []
description: Welcome to your personal wiki
---

# Welcome to My Wiki

This is your personal knowledge base. Start writing and linking your thoughts!

## Getting Started

- Check out the [[Getting Started]] guide
- Learn about [[Writing|writing markdown]]
- Discover [[Linking|how to link pages]]

## Quick Tips

- Use \`[[Page Name]]\` to create links between pages
- Add frontmatter to each page for metadata
- Use tags to organize your content
`,
    "getting-started.md": `---
title: Getting Started
tags: [guide, beginner]
description: Everything you need to know to get started
date: 2026-01-15
---

# Getting Started

Welcome to your wiki! Here's how to get the most out of it.

## Creating Pages

Simply create a new \`.md\` file in your wiki directory. Each file becomes a page.

## Frontmatter

Each page can have frontmatter at the top:

\`\`\`yaml
---
title: My Page
tags: [tag1, tag2]
description: A brief description
date: 2026-01-15
---
\`\`\`

## Linking Pages

Use the double-bracket syntax to link between pages:

- \`[[Page Name]]\` links to a page
- \`[[Page Name|Custom Text]]\` shows custom text

The [[Home]] page is a great place to start organizing your wiki.
`,
    "guides/writing.md": `---
title: Writing Markdown
tags: [guide, markdown, writing]
description: Tips for writing effective markdown content
date: 2026-01-15
---

# Writing Markdown

Your wiki supports standard Markdown with some enhancements.

## Basic Formatting

You can use **bold**, *italic*, and \`inline code\`.

## Lists

- Item one
- Item two
- Item three

1. First
2. Second
3. Third

## Code Blocks

\`\`\`javascript
function hello() {
  console.log("Hello from your wiki!");
}
\`\`\`

## Blockquotes

> The best way to predict the future is to create it.

## Links

Reference other pages freely: check out [[Getting Started]] or head back [[Home]].
`,
    "guides/linking.md": `---
title: Linking Pages
tags: [guide, linking, wiki-links]
description: How to use wiki-links to connect your pages
date: 2026-01-15
---

# Linking Pages

Wiki-links are the core feature that turns your markdown files into a connected knowledge base.

## Syntax

There are two ways to create links:

1. **Basic**: \`[[Page Name]]\` — links to a page, displays the page name
2. **Custom text**: \`[[Page Name|Click here]]\` — links to a page, displays custom text

## How It Works

When you write \`[[Getting Started]]\`, the wiki:

1. Looks for a file named \`getting-started.md\`
2. Creates a clickable link in the rendered page
3. If the target doesn't exist, shows a broken link (red, struck-through)

## Backlinks

Every link is bidirectional! If you link from page A to page B, page B automatically shows a backlink to page A in the "Pages that link here" section.

## Examples

- [[Home]] — basic link
- [[Getting Started|Get started here!]] — custom text
- [[Writing]] — cross-folder link

Happy linking!
`,
  };

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(targetDir, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
    console.log(`  ${chalk.green("created")} ${filePath}`);
  }

  console.log(chalk.green(`\n  ✓ Wiki created at ${targetDir}\n`));
  console.log("  Next steps:");
  console.log(`    ${chalk.cyan("cd")} ${targetPath}`);
  console.log(`    ${chalk.cyan("markdown-wiki dev")} .\n`);
}
