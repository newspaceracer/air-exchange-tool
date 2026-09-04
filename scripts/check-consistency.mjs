// check-consistency — the guards for the two failure classes this repo has
// actually shipped, run before every build (see package.json).
//
// 1. TYPE-PIN COMPLETENESS. The hub's type ramp is fluid (clamps on vw) and its
//    minima undershoot the design floors on phones, so theme-smaqmd.css pins
//    every composite size token to a fixed value. The failure mode is a GAP: a
//    rung nobody pinned (or a rung the hub adds later) silently scales down on
//    mobile while its neighbours hold — this shipped three separate times
//    (body prose, -strong labels, display-sm) before the pin was made
//    exhaustive. This check fails the build if ANY fluid composite size token
//    in the hub has no pin in the theme.
//
// 2. TWIN DRIFT. public/aer-tool is a hand-maintained port of the wizard. Two
//    invariants are checkable mechanically: the find-ratings <details> block
//    appears twice and must stay byte-identical, and every .smaqmd-type-* rung
//    the twin fixes must equal the theme's pin for the same rung, so the
//    prototype and the shipped artifact render the same scale.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');
const failures = [];

// ---- 1. every fluid composite size token is pinned ----
const hub = read('node_modules/@esa/tokens/dist/tokens.css');
const theme = read('src/styles/theme-smaqmd.css');
const fluidTokens = [...hub.matchAll(/(--typography-[a-z0-9-]+-font-size):\s*var\(--font-size-\d+\)/g)]
  .map((m) => m[1]);
for (const tok of new Set(fluidTokens)) {
  if (!theme.includes(`${tok}:`)) {
    failures.push(`unpinned fluid type token: ${tok} (add a pin in src/styles/theme-smaqmd.css)`);
  }
}

// ---- 1b. component-token tier: any *-size token reading a fluid primitive
// bypasses the composite pins entirely (this is how the stat hero stayed fluid
// after every composite was pinned), so each needs its own pin in the theme. ----
const compTokens = read('node_modules/@esa/tokens/src/component-tokens.css');
for (const [, tok] of compTokens.matchAll(/(--[a-z0-9-]*-(?:font-)?size):\s*var\(--font-size-\d+/g)) {
  if (!theme.includes(`${tok}:`)) {
    failures.push(`component token ${tok} reads a fluid primitive and has no pin in theme-smaqmd.css`);
  }
}

// ---- 1c. hub legos whose own styles read the primitive ramp BEFORE the
// composite tokens — the primitive always resolves, so no theme pin can reach
// them and they scale with the viewport. Known cases carry a spoke-side
// workaround; a NEW one appearing in the (live-symlinked) hub must be triaged,
// not silently shipped. ----
import { readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
const ACKNOWLEDGED = new Set(['esa-stat.astro']); // label/sub sized via wizard override
// Only legos this spoke actually mounts can put fluid text on our pages — an
// unused lego is the hub's problem, not a build failure here.
const usedLegos = execSync("grep -rhoE '@esa/ecology/esa-[a-z-]+' src/ | sort -u", { cwd: root })
  .toString().trim().split('\n').map((s) => s.replace('@esa/ecology/', ''));
const compDir = 'node_modules/@esa/ecology/src/components';
for (const f of readdirSync(resolve(root, compDir))) {
  if (!/\.(astro|ts)$/.test(f)) continue;
  if (!usedLegos.some((u) => f.startsWith(u))) continue;
  const src = read(`${compDir}/${f}`);
  // a size property whose FIRST fallback is the primitive ramp
  if (/(?:font-)?size:\s*var\(--font-size-\d+\s*[,)]/.test(src) && !ACKNOWLEDGED.has(f)) {
    failures.push(`hub lego ${f} sizes text from the primitive ramp (--font-size-*) ahead of the composites — pins can't reach it; add a spoke workaround and list it in ACKNOWLEDGED`);
  }
}

// ---- 2a. the twin's two find-ratings blocks are byte-identical ----
const twinHtml = read('public/aer-tool/index.html');
const details = [...twinHtml.matchAll(/<details class="smaqmd-collapsible">[\s\S]*?<\/details>/g)]
  .map((m) => m[0])
  .filter((b) => b.includes('aer-find__lede'));
if (details.length !== 2) {
  failures.push(`expected exactly 2 find-ratings <details> blocks in public/aer-tool/index.html, found ${details.length}`);
} else if (details[0] !== details[1]) {
  failures.push('the two find-ratings <details> blocks in public/aer-tool/index.html have drifted apart — re-sync them (they are deliberate literal duplicates)');
}

// ---- 2b. twin type rungs match the theme's pins ----
const twinCss = read('public/aer-tool/styles.css');
const twinRungs = [...twinCss.matchAll(/\.smaqmd-type-([a-z0-9-]+)\s*\{[^}]*?font-size:\s*([\d.]+rem)/g)];
for (const [, rung, size] of twinRungs) {
  const m = theme.match(new RegExp(`--typography-${rung}-font-size:\\s*([\\d.]+rem)`));
  if (m && m[1] !== size) {
    failures.push(`scale mismatch on "${rung}": twin styles.css says ${size}, theme pin says ${m[1]} — the two builds will render different sizes`);
  }
}

if (failures.length) {
  console.error('check-consistency FAILED:\n' + failures.map((f) => `  ✗ ${f}`).join('\n'));
  process.exit(1);
}
console.log(`check-consistency ok — ${new Set(fluidTokens).size} type tokens pinned, twin blocks identical, ${twinRungs.length} twin rungs matched`);
