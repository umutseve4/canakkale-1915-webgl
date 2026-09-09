/**
 * Canakkale 1915 - offline verification.
 *
 * The scene is one dependency free HTML file that needs a GPU, so CI cannot
 * open it and cannot measure a frame rate. Everything below is something that
 * can be checked without a GPU, and nothing below is a claim about how the
 * scene looks.
 *
 * Run: node verify.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "index.html"), "utf8");
const readme = readFileSync(join(here, "README.md"), "utf8");

let failed = 0;
const pad = (s, n) => (s + " ".repeat(n)).slice(0, n);
function check(name, fn) {
  try {
    const note = fn();
    console.log(`  ok   ${pad(name, 46)} ${note ?? ""}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL ${pad(name, 46)} ${e.message}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

console.log("\nCanakkale 1915 verification\n");

// ------------------------------------------------------------------ document
console.log("[ document ]");
check("declares lang, title, viewport", () => {
  assert(/<html[^>]+lang=/i.test(html), "missing lang on <html>");
  assert(/<title>[^<]+<\/title>/i.test(html), "missing <title>");
  assert(/name=["']viewport["']/i.test(html), "missing viewport meta");
  const lang = /<html[^>]+lang=["']([^"']+)["']/i.exec(html)[1];
  return `lang="${lang}"`;
});
check("respects prefers-reduced-motion", () => {
  assert(/prefers-reduced-motion/.test(html), "no reduced-motion handling");
  return "handled";
});
check("handles a lost webgl context", () => {
  assert(/webglcontextlost/.test(html), "no webglcontextlost listener");
  return "webglcontextlost listener present";
});
check("canvas is focusable and labelled", () => {
  // Two spellings are legitimate: the HTML attribute on a <canvas> tag, and
  // the DOM property on the canvas three.js creates. Both are accepted, but
  // both have to land on the canvas, not on some unrelated element.
  const attr = /<canvas\b[^>]*\btabindex\s*=/i.test(html);
  const prop = /(domElement|canvas)\s*\.\s*tabIndex\s*=/.test(html);
  assert(attr || prop, "the canvas is never made focusable (no tabindex, no .tabIndex)");
  const labelAttr = /<canvas\b[^>]*\baria-label\s*=/i.test(html);
  const labelProp = /(domElement|canvas)[\s\S]{0,80}?["']aria-label["']/.test(html);
  assert(labelAttr || labelProp, "the canvas has no accessible label");
  return `focusable via ${attr ? "attribute" : "tabIndex"}, labelled`;
});

// ------------------------------------------------------------------- assets
console.log("\n[ assets ]");
const ALLOWED_HOSTS = ["unpkg.com", "cdn.jsdelivr.net", "esm.sh"];
check("every loaded resource comes from an allowed CDN", () => {
  // only things the browser actually fetches: script src, link href, and the
  // importmap. Ordinary <a href> links to elsewhere are not loads.
  const loaded = [];
  for (const m of html.matchAll(/<(script|link)\b([^>]*)>/gi)) {
    const url = /(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)["']/i.exec(m[2]);
    if (url) loaded.push(url[1]);
  }
  const imap = /<script[^>]*type=["']importmap["'][^>]*>([\s\S]*?)<\/script>/i.exec(html);
  if (imap) loaded.push(...[...imap[1].matchAll(/https?:\/\/[^"'\s]+/g)].map(m => m[0]));
  const hosts = [...new Set(loaded.map(u => new URL(u).hostname.toLowerCase()))];
  const bad = hosts.filter(h => !ALLOWED_HOSTS.includes(h));
  assert(bad.length === 0, `unexpected host(s): ${bad.join(", ")}`);
  return hosts.join(", ") || "none";
});
check("no model, texture or photo file is loaded", () => {
  const re = /\.(glb|gltf|fbx|obj|dae|png|jpe?g|webp|ktx2?|hdr|exr|mp4|webm)\b/gi;
  const hits = [...new Set([...html.matchAll(re)].map(m => m[0].toLowerCase()))];
  assert(hits.length === 0, `references asset file type(s): ${hits.join(", ")}`);
  return "0 asset files, everything is generated in code";
});

// ------------------------------------------------------------- three version
console.log("\n[ dependency ]");
const versions = [...new Set([...html.matchAll(/three@([0-9]+\.[0-9]+\.[0-9]+)/g)].map(m => m[1]))];
check("three is pinned to one exact version", () => {
  assert(versions.length > 0, "no pinned three@x.y.z found in the importmap");
  assert(versions.length === 1, `importmap mixes versions: ${versions.join(", ")}`);
  return versions[0];
});
check("the README states that same version", () => {
  assert(versions.length === 1, "skipped: the version could not be determined");
  assert(
    readme.includes(versions[0]),
    `index.html pins three ${versions[0]}, the README does not mention it`
  );
  return `README and importmap agree on ${versions[0]}`;
});

// ------------------------------------------------------------------ parsing
console.log("\n[ javascript ]");
const modules = [...html.matchAll(/<script([^>]*type=["']module["'][^>]*)>([\s\S]*?)<\/script>/gi)];
check("the module script parses", () => {
  assert(modules.length > 0, "no <script type=\"module\"> block found");
  let bytes = 0;
  modules.forEach((m, i) => {
    const file = join(tmpdir(), `canakkale-module-${i}.mjs`);
    writeFileSync(file, m[2]);
    bytes += m[2].length;
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  });
  return `${modules.length} module(s), ${(bytes / 1024).toFixed(1)} kB`;
});
check("no leftover debugger or alert", () => {
  const body = modules.map(m => m[2]).join("\n");
  const bad = /\b(debugger|alert)\s*[;(]/.exec(body);
  assert(!bad, `found ${bad?.[1]}`);
  return "clean";
});

// -------------------------------------------------------------------- README
// The README publishes one measured number. A number typed in two places goes
// stale in one of them, so the three places are compared against each other.
console.log("\n[ README ]");
check("the terrain build figure agrees with the badge", () => {
  const badge = /terrain%20build-(\d+)%20ms/.exec(readme);
  assert(badge, "the terrain build badge is missing or renamed");
  const ms = badge[1];
  assert(
    readme.includes(`to ~${ms} ms`),
    `the badge says ${ms} ms, the Engineering notes section does not say "to ~${ms} ms"`
  );
  assert(
    readme.includes(`~${ms} ms) was measured`),
    `the Limits section does not repeat the ~${ms} ms figure as a single machine measurement`
  );
  return `${ms} ms in 3 places`;
});
check("no frame rate is claimed anywhere", () => {
  const bad = /\b\d+\s*(fps|FPS)\b/.exec(readme);
  assert(!bad, `the README publishes "${bad?.[0]}" but no frame rate was measured`);
  return "no fps figure, as the Limits section states";
});

console.log(failed ? `\n${failed} check(s) failed\n` : "\nall checks passed\n");
process.exit(failed ? 1 : 0);
