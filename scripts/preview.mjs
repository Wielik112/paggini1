/* Local preview of dist/ with the same clean URLs as Vercel (cleanUrls, no trailing slash). */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const PORT = Number(process.env.PORT) || 4173;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".xml": "application/xml", ".txt": "text/plain", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml" };

const file = (p) => { try { return fs.statSync(p).isFile() ? p : null; } catch { return null; } };

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  // /page.html and /page/ redirect to the clean URL, like Vercel
  if (/\.html$/.test(url) || (url.length > 1 && url.endsWith("/"))) {
    const clean = url.replace(/\/index\.html$|\.html$/, "").replace(/\/$/, "") || "/";
    res.writeHead(308, { Location: clean }); return res.end();
  }
  const base = path.join(DIST, url);
  const hit = file(base) || file(base + ".html") || file(path.join(base, "index.html"));
  if (hit) {
    res.writeHead(200, { "Content-Type": TYPES[path.extname(hit)] || "application/octet-stream" });
    return fs.createReadStream(hit).pipe(res);
  }
  res.writeHead(404, { "Content-Type": TYPES[".html"] });
  fs.createReadStream(path.join(DIST, "404.html")).pipe(res);
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}`));
