import * as fs from "node:fs";
import * as path from "node:path";

export interface ScannedFile {
  relativePath: string;
  absolutePath: string;
  folder: string;
  name: string;
}

export function scanDirectory(sourceDir: string): ScannedFile[] {
  const absoluteSource = path.resolve(sourceDir);
  if (!fs.existsSync(absoluteSource)) {
    throw new Error(`Source directory does not exist: ${absoluteSource}`);
  }

  const files: ScannedFile[] = [];
  walkDirectory(absoluteSource, absoluteSource, files);
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return files;
}

function walkDirectory(
  currentDir: string,
  rootDir: string,
  results: ScannedFile[]
): void {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "_site" || entry.name === "node_modules") {
      continue;
    }

    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      walkDirectory(fullPath, rootDir, results);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const relativePath = path.relative(rootDir, fullPath);
      const folder = path.dirname(relativePath);
      const name = path.basename(relativePath, ".md");

      results.push({
        relativePath,
        absolutePath: fullPath,
        folder: folder === "." ? "" : folder,
        name,
      });
    }
  }
}
