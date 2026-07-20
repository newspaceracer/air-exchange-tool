# How this repo consumes the Ecology design system

A plain-language explanation of how this spoke is wired to the `@esa/ecology`
design system: where the component code lives, what you can and can't edit from
here, what happens at build vs. run time, and whether this setup is normal.

Everything below was verified against this repo's actual files (`package.json`,
the `node_modules` symlinks, and the built `dist/` output), not assumed.

---

## 1. The one-sentence model

This repo is a **spoke**: a thin, brand-themed Astro site that **assembles and
re-skins** components owned by a separate **hub** repo (`@esa/ecology`). It
consumes those components as a dependency — it does **not** contain copies of
their source.

---

## 2. Where the component code actually lives

The `esa-*` components are **not saved in this repo.** They live in a separate
repo and are pulled in as a dependency.

- `package.json` declares them as local *file* dependencies pointing at a
  sibling checkout:
  ```jsonc
  "@esa/ecology": "file:../ecology/packages/ecology",
  "@esa/tokens":  "file:../ecology/packages/tokens",
  "@esa/docs":    "file:../ecology/packages/docs",
  ```
- `npm install` turns that into a **symlink** under `node_modules`:
  ```
  node_modules/@esa/ecology -> ../../../ecology/packages/ecology
  ```
- So reading `node_modules/@esa/ecology/src/components/esa-text-field.ts` from
  here is really reading the file at
  `/Users/<you>/Documents/GitHub/ecology/packages/ecology/src/components/esa-text-field.ts`
  — a file **owned by a different git repo** (`…/GitHub/ecology`).

**Verification facts:**
- `git ls-files | grep esa-text-field` in this repo → **no results** (not tracked here).
- `realpath node_modules/@esa/ecology/src/components/esa-text-field.ts` → resolves
  **outside** this repo, into the `ecology` repo.
- Nothing in this repo's `src/` is an `esa-*` component source. (The file
  `src/pages/design-system/components/esa-button.astro` is a *documentation page*
  about the button, not the button itself.)

> There is no local copy of any lego to "just edit." The only copy that exists is
> the hub's, shared by every spoke.

---

## 3. What you CAN and CANNOT change from this repo

The dividing line is **inputs you pass to a component** vs. **the component's own
internals.**

| What you want to change | Where it lives | From this repo? |
|---|---|---|
| A button's **label**, `color`, `size`, `icon`, `appearance` | Your markup (props/slots) | ✅ Yes, freely |
| **Which** components you use and **how** they're arranged | Your pages/components | ✅ Yes, freely |
| The **brand skin** (colors, spacing, radius) | This repo's theme CSS tokens | ✅ Yes, freely |
| A prop/behavior the component **doesn't already expose** (e.g. `min` on a number field) | The component's source | ❌ No — that's a hub change |

Example from this repo — the label is yours, right here:
```astro
<EsaButton color="ghost" appearance="dashed" size="sm" icon="plus" type="button">
  Add air cleaner   <!-- this text lives in this repo; edit it freely -->
</EsaButton>
```

Analogy: like any library, you write `<Button label="Save" />` in your own code;
you don't open the library's source to change "Save" to "Submit." You only touch
the library when you need it to do something it doesn't yet support.

This is why the "prevent negative numbers" request was awkward: `min` isn't a
value you pass in — `esa-text-field` has no `min` input to accept — so there was
nothing to configure from here. See
[`system-improvement-ledger.md`](./system-improvement-ledger.md) for that logged gap.

---

## 4. Editing the hub is guarded on purpose

Because the hub is shared by every spoke, a change to it is **not** a local
side effect of prototyping here. This repo ships a `guard-hub-writes` hook that
**blocks** writes to the `ecology` repo from a spoke session. The sanctioned
paths are:

- **`/request-lego`** — file the gap formally so the hub team adds it, or
- make the change in a dedicated session **inside the `ecology` repo** (so it's
  committed, reviewed, and versioned there).

There is an escape-hatch token for genuinely-approved, in-session hub edits, but
it should only be used after explicit, impact-aware go-ahead — the change still
affects all spokes and still needs to be committed/reviewed on the hub side.

---

## 5. Build time vs. run time (does the site break if ecology is gone?)

Ecology is needed to **build** the site, never to **run** the built site.

**At build time — ecology required:**
`astro build` must resolve `import EsaButton from '@esa/ecology/...'` through the
symlink. If the sibling `ecology` repo is missing or the symlink is broken, the
**build fails** (unresolved import) and no site is produced.

**At run time — fully self-contained:**
The build inlines everything into this repo's `dist/`:
- `.astro` legos (buttons, cards) are rendered to **plain static HTML** (e.g.
  `<span class="esa-button ...">` with the label baked in).
- `.ts` web components (`esa-text-field`, `esa-radio-group`) are **compiled and
  bundled** into a local file, e.g.
  `dist/_astro/smaqmd-aer-calculator...js`.
- The page only loads local assets under `/_astro/*.css` and `*.js`. It makes
  **no reference to the ecology repo or any ecology server at run time.**

So once built and deployed, you could delete the entire `ecology` folder and the
live form keeps working — visitors only load the bundled JS/CSS.

| Situation | ecology needed? | Result |
|---|---|---|
| Building the site (`astro build`) | ✅ Yes | Missing → build fails, no output |
| Visiting the already-built site | ❌ No | Works fully (baked-in HTML + bundled JS/CSS) |

It behaves like any compiled dependency: needed to compile, not shipped with —
and not phoned home to — by the compiled output.

---

## 6. Is this a normal way to build a design system?

**The model is textbook-normal; one wiring detail is a convenience shortcut.**

**Normal (industry standard):** a central design system consumed as a dependency
and configured via props + tokens, rather than copied/forked. Material UI,
Shopify Polaris, GitHub Primer, Atlassian, and Chakra all work this way. Apps own
composition, content, and theme — not component internals. That's what keeps many
tenants visually consistent instead of drifting apart. The "I can't edit the
button's code from here" property is the *point*, not a bug.

**The slightly unusual part:** the dependency is a `file:` path + symlink to a
**sibling repo's live working directory**, instead of a **published, versioned**
package from a registry. Live-linking is normal *inside a monorepo* (pnpm/yarn
workspaces, Nx, Turborepo); doing it across two separate repos by relative path
is the mildly unconventional bit.

| | Live symlink (what this repo does) | Published versioned package (typical prod) |
|---|---|---|
| Iterate on hub + spoke together | ✅ Instant, no publish step | ❌ Publish/bump each change |
| Version pinning / changelogs | ❌ You get whatever's in the sibling folder now — including *uncommitted* edits | ✅ Locked to e.g. `2.3.1` until you upgrade |
| Reproducible builds elsewhere | ❌ Needs the sibling repo at that exact path | ✅ `npm install` pulls it from a registry |

**Why it's set up this way:** this repo is a **prototyping / client-review spoke**.
For rapid design iteration where hub and spoke are often edited in the same
sitting, live-linking avoids a publish cycle. A more production-hardened version
would consume a **versioned, published** `@esa/ecology` so builds are reproducible
and hub changes land through explicit version bumps.

**Verdict:** the architecture (hub design system + thin themed consumers) is
normal and good; the `file:`-symlink-to-a-sibling-repo trades reproducibility for
iteration speed — a defensible choice for a prototyping tool.
