/* ============================================================
   PAGGINI, build (zero dependencies)
   Copies the static site into dist/ and fails on SEO/link errors:
   broken internal links, missing images, invalid JSON-LD, missing
   title/description/canonical/H1, sitemap out of sync, unknown i18n keys.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const SITE = "https://paggini.com";
const SKIP_DIRS = new Set(["dist", "node_modules", "scripts", ".git", ".github", ".vercel"]);
const STATIC_DIRS = ["css", "js"];
const STATIC_FILES = ["robots.txt", "sitemap.xml"];

const errors = [];
const warnings = [];
const rel = (p) => path.relative(ROOT, p);

/* ---------- collect pages ---------- */
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}
const pages = walk(ROOT).sort();

// file path -> clean URL path, as served by Vercel with cleanUrls
function routeOf(file) {
  let r = "/" + rel(file).split(path.sep).join("/").replace(/\.html$/, "");
  if (r === "/index") return "/";
  return r.replace(/\/index$/, "");
}
const routes = new Map(pages.map((p) => [routeOf(p), p]));

/* ---------- i18n keys ---------- */
const i18nSrc = fs.readFileSync(path.join(ROOT, "js/i18n.js"), "utf8");
const ctx = { window: {}, navigator: { userAgent: "build", languages: ["pl"] }, localStorage: { getItem() {}, setItem() {} },
  document: { querySelectorAll: () => [], getElementById: () => null, documentElement: {} } };
vm.runInNewContext(i18nSrc + ";this.__I18N = I18N;", ctx);
const I18N = ctx.__I18N;

/* ---------- helpers ---------- */
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"));
  return m ? m[1] : null;
};
const metaContent = (html, key) => {
  const m = html.match(new RegExp(`<meta\\s+(?:name|property)="${key}"\\s+content="([^"]*)"`, "i"));
  return m ? m[1] : null;
};
const exists = (urlPath) => {
  const clean = decodeURIComponent(urlPath.split("#")[0].split("?")[0]);
  if (routes.has(clean.replace(/\/$/, "") || "/")) return true;
  const f = path.join(ROOT, clean);
  return fs.existsSync(f) && fs.statSync(f).isFile();
};

/* ---------- validate pages ---------- */
const indexable = [];
const seen = { title: new Map(), description: new Map(), h1: new Map() };
const referenced = new Set(); // asset paths used by pages/css

for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  const route = routeOf(file);
  const where = rel(file);
  const robots = metaContent(html, "robots") || "";
  const noindex = /noindex/i.test(robots);

  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
  const desc = metaContent(html, "description");
  if (!title) errors.push(`${where}: missing <title>`);
  if (!desc) errors.push(`${where}: missing meta description`);
  if (!/<html[^>]*\slang="pl"/i.test(html)) warnings.push(`${where}: <html lang="pl"> missing`);
  if (!/<meta charset="utf-8"/i.test(html)) errors.push(`${where}: missing charset`);
  if (!/<meta name="viewport"/i.test(html)) errors.push(`${where}: missing viewport`);
  const h1s = html.match(/<h1[\s>]/gi) || [];
  if (h1s.length !== 1) errors.push(`${where}: expected exactly one <h1>, found ${h1s.length}`);

  if (!noindex) {
    indexable.push(route);
    const expected = SITE + (route === "/" ? "/" : route);
    const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/i) || [])[1];
    if (canonical !== expected) errors.push(`${where}: canonical "${canonical}" should be "${expected}"`);
    const ogUrl = metaContent(html, "og:url");
    if (ogUrl !== expected) errors.push(`${where}: og:url "${ogUrl}" should be "${expected}"`);
    for (const k of ["og:title", "og:description", "og:image", "og:type", "og:site_name", "twitter:card"])
      if (!metaContent(html, k)) errors.push(`${where}: missing ${k}`);
    const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
    for (const [k, v] of [["title", title], ["description", desc], ["h1", h1 && h1.replace(/<[^>]+>/g, "").trim()]]) {
      if (!v) continue;
      if (seen[k].has(v)) errors.push(`${where}: duplicate ${k} (same as ${seen[k].get(v)})`);
      else seen[k].set(v, where);
    }
    if (desc && desc.length > 170) warnings.push(`${where}: description is ${desc.length} chars`);
  }

  // JSON-LD
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(m[1]); } catch (e) { errors.push(`${where}: invalid JSON-LD (${e.message})`); }
  }

  // links
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/<a\s[^>]*>/gi)) {
    const href = attr(m[0], "href");
    if (href === null) { errors.push(`${where}: <a> without href`); continue; }
    if (/^(https?:|mailto:|tel:)/i.test(href)) continue;
    if (href === "#" || href === "") { errors.push(`${where}: empty link "${href}"`); continue; }
    if (href.startsWith("#")) { if (!ids.has(href.slice(1))) errors.push(`${where}: dead anchor ${href}`); continue; }
    if (!href.startsWith("/")) { warnings.push(`${where}: relative link ${href}`); continue; }
    if (/\.html(#|$)/.test(href)) warnings.push(`${where}: link uses .html (${href}), prefer the clean URL`);
    if (!exists(href)) errors.push(`${where}: broken link ${href}`);
  }

  // images and other local resources
  for (const m of html.matchAll(/<img\s[^>]*>/gi)) {
    const src = attr(m[0], "src");
    if (attr(m[0], "alt") === null) errors.push(`${where}: <img ${src}> without alt`);
    if (!attr(m[0], "width") || !attr(m[0], "height")) warnings.push(`${where}: <img ${src}> without width/height`);
  }
  for (const m of html.matchAll(/\s(?:src|href|content)="(\/[^"#?]+|https:\/\/paggini\.com\/assets\/[^"#?]+)"/g)) {
    const p = m[1].replace(SITE, "");
    if (p.startsWith("/assets/")) {
      referenced.add(p);
      if (!exists(p)) errors.push(`${where}: missing file ${p}`);
    }
  }
  for (const m of html.matchAll(/"(https:\/\/paggini\.com\/assets\/[^"]+)"/g)) referenced.add(m[1].replace(SITE, ""));

  // i18n keys
  for (const m of html.matchAll(/data-i18n="([^"]+)"/g)) {
    for (const lang of Object.keys(I18N)) {
      if (!(m[1] in I18N[lang])) { errors.push(`${where}: i18n key "${m[1]}" missing in ${lang}`); break; }
    }
  }
}

// assets referenced from CSS (e.g. mask images)
for (const f of fs.readdirSync(path.join(ROOT, "css"))) {
  const css = fs.readFileSync(path.join(ROOT, "css", f), "utf8");
  for (const m of css.matchAll(/url\((['"]?)(\/assets\/[^)'"]+)\1\)/g)) referenced.add(m[2]);
}

/* ---------- sitemap & robots ---------- */
const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const expectedLocs = new Set(indexable.map((r) => SITE + (r === "/" ? "/" : r)));
for (const l of locs) if (!expectedLocs.has(l)) errors.push(`sitemap.xml: ${l} is not an indexable page`);
for (const l of expectedLocs) if (!locs.includes(l)) errors.push(`sitemap.xml: missing ${l}`);
const robotsTxt = fs.readFileSync(path.join(ROOT, "robots.txt"), "utf8");
if (!robotsTxt.includes(`Sitemap: ${SITE}/sitemap.xml`)) errors.push("robots.txt: Sitemap line missing");
if (/^Disallow:\s*\/\s*$/m.test(robotsTxt)) errors.push("robots.txt blocks the whole site");

/* ---------- report ---------- */
for (const w of warnings) console.warn("  warn  " + w);
if (errors.length) {
  for (const e of errors) console.error("  error " + e);
  console.error(`\nBuild failed: ${errors.length} error(s).`);
  process.exit(1);
}

/* ---------- copy to dist ---------- */
fs.rmSync(DIST, { recursive: true, force: true });
const copy = (from) => {
  const to = path.join(DIST, rel(from));
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
};
pages.forEach(copy);
for (const d of STATIC_DIRS) fs.cpSync(path.join(ROOT, d), path.join(DIST, d), { recursive: true });
for (const f of STATIC_FILES) copy(path.join(ROOT, f));
// only ship assets that are actually used (skips original source images)
let skipped = 0;
for (const f of fs.readdirSync(path.join(ROOT, "assets"))) {
  if (referenced.has("/assets/" + f)) copy(path.join(ROOT, "assets", f));
  else skipped++;
}

console.log(`Built ${pages.length} pages (${indexable.length} indexable) into dist/, ` +
  `${referenced.size} assets copied, ${skipped} unused source files skipped, ${warnings.length} warning(s).`);
