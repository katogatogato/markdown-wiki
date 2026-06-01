import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { scanDirectory } from "./scanner.js";
import { parsePage } from "./parser.js";
import { resolveLinks } from "./linker.js";
import { renderAndWrite, type BuildOptions } from "./renderer.js";

export interface DevServerOptions {
  source: string;
  port: number;
  title: string;
  theme: string;
}

let lastBuildTimestamp = Date.now();

export function startDevServer(options: DevServerOptions): void {
  const sourceDir = path.resolve(options.source);
  const outputDir = path.join(sourceDir, "_site");

  function rebuild(): void {
    try {
      const scannedFiles = scanDirectory(sourceDir);
      const parsedPages = scannedFiles.map((f) =>
        parsePage(f.absolutePath, f.relativePath, f.folder, f.name)
      );
      const resolvedPages = resolveLinks(parsedPages);

      const buildOptions: BuildOptions = {
        source: sourceDir,
        output: outputDir,
        title: options.title,
        theme: options.theme,
        isDev: true,
      };

      renderAndWrite(resolvedPages, buildOptions);
      lastBuildTimestamp = Date.now();
      console.log(
        `  Rebuilt at ${new Date().toLocaleTimeString()} (${resolvedPages.length} pages)`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  Build error: ${message}`);
    }
  }

  rebuild();

  const watcher = fs.watch(sourceDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (filename.startsWith("_site") || filename.startsWith("node_modules")) return;
    if (!filename.endsWith(".md")) return;

    console.log(`  Change detected: ${filename}`);
    rebuild();
  });

  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", `http://localhost:${options.port}`);

    if (url.pathname === "/__ping") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(String(lastBuildTimestamp));
      return;
    }

    let filePath = path.join(outputDir, url.pathname);
    if (filePath.endsWith("/")) {
      filePath = path.join(filePath, "index.html");
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(outputDir, "index.html");
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    const contentTypes: Record<string, string> = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
    };

    const contentType = contentTypes[ext] || "application/octet-stream";
    const content = fs.readFileSync(filePath);

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
    });
    res.end(content);
  });

  server.listen(options.port, () => {
    console.log(
      `\n  🚀 Dev server running at http://localhost:${options.port}\n`
    );
    console.log(`  Watching: ${sourceDir}`);
    console.log(`  Press Ctrl+C to stop\n`);
  });

  process.on("SIGINT", () => {
    watcher.close();
    server.close();
    console.log("\n  Dev server stopped.");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    watcher.close();
    server.close();
    process.exit(0);
  });
}
