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
//    invariants are checkable mechanically: the find-ratings body appears twice
//    (inline on the cleaners step, in a disclosure on the result step) and must
//    stay byte-identical; every .smaqmd-type-* rung the twin fixes must equal
//    the theme's pin for the same rung; every radio group's options, labels and
//    default must match; the engine constants (AIR_QUALITY_ACH, TITLES, …) must
//    match; and the deliverable's HTML/CSS must carry no code comments.
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
// NESTING-AWARE on purpose: find-ratings now contains a second disclosure
// ("Need help finding it?"), so a non-greedy /<details>...<\/details>/ would stop
// at the INNER closing tag and compare two truncated blocks — which would pass
// while the real tails drifted. Scan to the matching close with a depth counter.
// Keyed off .smaqmd-aer-find__list, not the old __lede paragraph: the client's
// Sep 2026 copy drops the lede and opens straight into the list.
const twinHtml = read('public/aer-tool/index.html');
// Only TOP-LEVEL blocks: a start index that falls inside the block we just
// captured is the nested "Need help finding it?" disclosure, which carries the
// same marker class and would otherwise be counted as a third and fourth copy.
const detailsBlocks = () => {
  const out = [];
  const open = /<details class="smaqmd-collapsible">/g;
  let m;
  let consumedTo = -1;
  while ((m = open.exec(twinHtml))) {
    const start = m.index;
    if (start < consumedTo) continue;
    let depth = 0;
    let i = start;
    while (i < twinHtml.length) {
      const o = twinHtml.indexOf('<details', i);
      const c = twinHtml.indexOf('</details>', i);
      if (c === -1) break;
      if (o !== -1 && o < c) { depth++; i = o + 8; }
      else {
        depth--; i = c + 10;
        if (depth === 0) { out.push(twinHtml.slice(start, i)); consumedTo = i; break; }
      }
    }
  }
  return out;
};
const details = detailsBlocks().filter((b) => b.includes('aer-find__figure'));
// Since the SMAQMD review (Nov 2026) the cleaners step shows the find-ratings
// BODY inline, and only the result step keeps it inside a disclosure. So: exactly
// one find-ratings <details>, and its body (the stack inside
// .smaqmd-collapsible__body) must appear verbatim exactly twice in the file —
// once in that disclosure, once inline on the cleaners step.
if (details.length !== 1) {
  failures.push(`expected exactly 1 find-ratings <details> block (result step) in public/aer-tool/index.html, found ${details.length}`);
} else {
  const block = details[0];
  const bodyStart = block.indexOf('<div class="smaqmd-stack" data-gap="sm">');
  const bodyEnd = block.lastIndexOf('</div>', block.lastIndexOf('</details>'));
  const body = bodyStart === -1 ? '' : block.slice(bodyStart, bodyEnd);
  const copies = body ? twinHtml.split(body).length - 1 : 0;
  if (copies !== 2) {
    failures.push(`the inline (cleaners step) and disclosure (result step) find-ratings copies in public/aer-tool/index.html have drifted apart — expected the body twice, found ${copies}; re-sync them (deliberate literal duplicates)`);
  }
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

// ---- 2c. every radio group's options + default match between the builds ----
// The wizard renders its choices from frontmatter arrays (options={JSON.stringify
// (name)}); the twin hand-writes the same choices as radio inputs. A relabelled,
// reordered, added or dropped option in one build — or a different default — is
// exactly the drift the "KEEP IN SYNC" comments could not stop.
// bcn-lego-checked: no UI here — the "<input" below is a regex READING the
// twin's markup to compare it, not markup this script builds; no lego applies.
const wizard = read('src/components/smaqmd-aer-wizard.astro');
const squash = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const arrays = new Map();
for (const [, name, body] of wizard.matchAll(/const (\w+) = \[([\s\S]*?)\];/g)) {
  const items = [...body.matchAll(/\{\s*label:\s*(['"])(.*?)\1,\s*value:\s*'([^']+)'/g)]
    .map(([, , label, value]) => ({ label, value }));
  if (items.length) arrays.set(name, items);
}
const INPUT_TAG = '<' + 'input';
let groupsChecked = 0;
for (const m of wizard.matchAll(/options=\{JSON\.stringify\((\w+)\)\}/g)) {
  const tagStart = wizard.lastIndexOf('<esa-', m.index);
  const tag = wizard.slice(tagStart, wizard.indexOf('>', m.index));
  const fieldName = tag.match(/data-field="(\w+)"/)?.[1];
  const opts = arrays.get(m[1]);
  if (!fieldName || !opts) {
    failures.push(`radio group using ${m[1]} in the wizard has no data-field or no parsable options array`);
    continue;
  }
  const twinOpts = [...twinHtml.matchAll(new RegExp(`${INPUT_TAG}[^>]*name="${fieldName}"[^>]*>([\\s\\S]*?)</label>`, 'g'))]
    .map(([whole, rest]) => {
      const open = whole.slice(0, whole.indexOf('>') + 1);
      return {
        value: open.match(/value="([^"]+)"/)?.[1],
        label: squash(rest),
        checked: /\schecked[\s/>]/.test(open),
      };
    });
  const want = opts.map((o) => `${o.value}=${o.label}`).join(' | ');
  const got = twinOpts.map((o) => `${o.value}=${o.label}`).join(' | ');
  if (want !== got) {
    failures.push(`radio group "${fieldName}" differs between builds:\n      wizard (${m[1]}): ${want}\n      twin:            ${got}`);
  }
  const wizDefault = tag.match(/\svalue="([^"]+)"/)?.[1];
  const twinDefault = twinOpts.find((o) => o.checked)?.value;
  if (wizDefault && wizDefault !== twinDefault) {
    failures.push(`radio group "${fieldName}" default differs: wizard value="${wizDefault}", twin checks "${twinDefault ?? 'nothing'}"`);
  }
  groupsChecked++;
}

// ---- 2d. the engine constants + step titles match between the builds ----
const twinJs = read('public/aer-tool/app.js');
const literal = (src, name) => {
  const m = src.match(new RegExp(`(?:const|var|let) ${name}(?::[^=]+)?\\s*=\\s*([\\[{][\\s\\S]*?[\\]}]);`));
  return m ? m[1].replace(/\s+/g, '').replace(/"/g, "'").replace(/,([\]}])/g, '$1') : null;
};
for (const name of ['AIR_QUALITY_ACH', 'TITLES', 'ROOM_MAX', 'CLEANER_FIELDS']) {
  const a = literal(wizard, name);
  const b = literal(twinJs, name);
  if (a !== b) failures.push(`${name} differs between builds:\n      wizard: ${a}\n      twin:   ${b}`);
}

// ---- 2d'. no dead helpers in the twin engine ----
// A helper the twin DEFINES but never CALLS means a port landed half-way: the
// function was copied from the wizard, the call site wasn't. Shipped once (Nov
// 2026): capLabelAt() — the pause-button keep-out for the scene's capacity caption —
// existed in app.js while drawScene still used the old fixed offset, so on phones
// the caption ran under the pause button. Every `var name = function` must be
// referenced at least once beyond its own definition.
for (const [, name] of twinJs.matchAll(/\bvar (\w+) = function\b/g)) {
  const uses = twinJs.match(new RegExp(`\\b${name}\\b`, 'g'))?.length ?? 0;
  if (uses < 2) failures.push(`public/aer-tool/app.js defines ${name}() but never calls it — a half-ported wizard change? Mirror the wizard's call site`);
}

// ---- 2e. the deliverable carries no code comments ----
// The client embeds public/aer-tool verbatim, so it stands alone: no explanatory
// comments and no spoke workflow tokens in its markup or styles. The ONLY
// sanctioned comments are the two "=====" embed-region markers the README cites.
// (app.js predates this guard and still carries comments — not yet enforced.)
const strayHtml = [...twinHtml.matchAll(/<!--([\s\S]*?)-->/g)].filter(([, c]) => !c.includes('====='));
if (strayHtml.length) {
  failures.push(`public/aer-tool/index.html has ${strayHtml.length} code comment(s) besides the embed markers — the deliverable ships comment-free; keep notes in the wizard source`);
}
const strayCss = twinCss.match(/\/\*[\s\S]*?\*\//g) ?? [];
if (strayCss.length) {
  failures.push(`public/aer-tool/styles.css has ${strayCss.length} code comment(s) — the deliverable ships comment-free`);
}

// ---- 3. known-broken lego prop combinations ----
// esa-button variant="ghost" + appearance="soft": soft's hover sets white text +
// an accent border, then ghost's hover resets the background to light gray —
// the label vanishes (white on #f0f0f0) on every hover. Shipped once (Nov 2026,
// the CADR/ACH swap buttons). Ghost already IS the quiet button; drop soft.
for (const f of readdirSync(resolve(root, 'src/components'))) {
  const src = read(`src/components/${f}`);
  for (const m of src.matchAll(/<EsaButton\b[^>]*>/g)) {
    if (/variant="ghost"/.test(m[0]) && /appearance="soft"/.test(m[0])) {
      failures.push(`${f}: EsaButton variant="ghost" appearance="soft" — the label turns white on gray on hover; use plain variant="ghost"`);
    }
  }
}

if (failures.length) {
  console.error('check-consistency FAILED:\n' + failures.map((f) => `  ✗ ${f}`).join('\n'));
  process.exit(1);
}
console.log(`check-consistency ok — ${new Set(fluidTokens).size} type tokens pinned, twin blocks identical, ${twinRungs.length} twin rungs matched, ${groupsChecked} radio groups matched, engine constants matched, deliverable comment-free`);
