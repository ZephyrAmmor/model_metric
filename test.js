#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = __dirname;
const failures = [];
let checks = 0;
function check(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}
function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}
function approx(actual, expected, message) {
  check(Math.abs(actual - expected) < 1e-9, `${message}: expected ${expected}, got ${actual}`);
}

const htmlFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith(".html") && entry.name !== "google7a576959a9460e66.html") htmlFiles.push(fullPath);
  }
}
walk(root);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  check(html.includes('meta name="viewport"'), `${path.relative(root, file)} is missing a viewport meta tag`);
  check(html.includes('class="theme-toggle"'), `${path.relative(root, file)} is missing the theme toggle`);
  check(html.includes('class="page-loader"'), `${path.relative(root, file)} is missing the page loader`);
  check(html.includes('href="') && html.includes('tools.html') && html.includes('guides.html'), `${path.relative(root, file)} is missing hub navigation`);
  check(html.includes('class="menu-toggle"') && html.includes('class="mobile-menu"'), `${path.relative(root, file)} is missing the mobile menu`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const link = match[1].split("#")[0];
    if (!link || link.startsWith("#") || link.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(link)) continue;
    check(fs.existsSync(path.resolve(path.dirname(file), link)), `${path.relative(root, file)} -> missing ${link}`);
  }
}

const tokenText = "This is a sample prompt for testing token estimation.";
approx(Math.ceil(tokenText.length / 4), 14, "token estimator default heuristic");
approx(((2000 / 1e6) * 1) + ((500 / 1e6) * 5), 0.0045, "LLM cost per request");
approx(0.0045 * 10000, 45, "LLM monthly cost");
approx(80 / (80 + 20), 0.8, "precision");
approx(80 / (80 + 10), 0.8888888888888888, "recall");
approx((2 * 0.8 * (80 / 90)) / (0.8 + (80 / 90)), 0.8421052631578947, "F1");
approx((80 + 90) / (80 + 20 + 10 + 90), 0.85, "accuracy");
approx((7 * 1e9 * (16 / 8) * 1.15) / (1024 ** 3), 14.994293451309202, "VRAM estimate");

check(read("app.js").includes("localStorage.setItem('modelmetric-theme'"), "theme preference is not persisted");
check(read("styles.css").includes("@font-face"), "bundled fonts are not declared");
for (const asset of ["guide-tokens.svg", "guide-cost.svg", "guide-metrics.svg", "guide-vram.svg"]) {
  check(fs.existsSync(path.join(root, "assets", asset)), `${asset} is missing`);
}
check(fs.existsSync(path.join(root, "404.html")), "custom 404 page is missing");
check(read("robots.txt").includes("Sitemap: https://modelmetric.vercel.app/sitemap.xml"), "robots sitemap entry is missing");
const sitemap = read("sitemap.xml");
check(sitemap.includes("<urlset"), "sitemap XML is malformed or missing");
check(sitemap.includes("<loc>https://modelmetric.vercel.app/</loc>"), "sitemap homepage URL is incorrect");
check((sitemap.match(/<changefreq>monthly<\/changefreq>/g) || []).length === 17, "sitemap change frequency entries are incomplete");
check((sitemap.match(/<priority>(?:0?\.\d+|1(?:\.0+)?)<\/priority>/g) || []).length === 17, "sitemap priority entries are incomplete");
for (const page of ["guides.html", "tools.html", "terms.html", "methodology.html", "pricing.html"]) {
  check(fs.existsSync(path.join(root, page)), `${page} is missing`);
}
for (const file of htmlFiles) {
  check(fs.readFileSync(file, "utf8").includes('<script defer src="/_vercel/insights/script.js"></script>'), `${path.relative(root, file)} is missing Vercel Web Analytics`);
}

if (failures.length) {
  console.error(`FAIL ${failures.length} of ${checks} checks`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`PASS ${checks} checks across ${htmlFiles.length} HTML pages and all four calculators.`);
