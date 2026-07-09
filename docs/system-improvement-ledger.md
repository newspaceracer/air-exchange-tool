# System improvement ledger

Spoke friction that traces back to the hub (missing token, absent lego, foundation
gap). One line each: what was missing, where it bit, the proposed hub fix.

- **Spoke-template color ramp is Tailwind 50–900, but the hub is Radix 1–12.** The hub's
  loaded primitives (`packages/tokens/dist/tokens.css`) are Radix `1–12` ramps
  (`--color-primary: var(--color-grass-9)`), and many component tokens reference them
  directly (`--tooltip-bg: var(--color-gray-12)`, `--snackbar-item-bg-info: var(--color-blue-11)`,
  `--topbar-icon-color: var(--color-gray-11)`, `--button-on-warning: var(--color-gray-12)`).
  But `packages/spoke-template/src/styles/theme-<slug>.css` scaffolds the raw ramp as
  `--<prefix>-gray-50…900` / `--<prefix>-brand-50…900` (Tailwind). Consequence: a spoke can
  re-point the semantic tier fine, but its 50–900 grays **cannot override the component tokens
  keyed to `--color-gray-1…12`**, so chrome neutrals silently fall back to hub defaults; and
  authors see two different scales (1–12 in the hub, 50–900 in their theme). **Proposed fix:**
  author the spoke-template raw ramp on the Radix 1–12 scale to match the hub, so one scale
  runs end-to-end and spokes can tint direct-primitive component tokens. (There's also a stale
  Tailwind-scale `packages/tokens/tokens.css` not referenced by exports — remove to avoid
  confusion.)
- **`esa-container` as a page width-frame trips `manifest-undeclared-section`.** Using the
  sanctioned `esa-container` lego as the outermost page wrapper (spine) makes the manifest
  cross-check (`lib/manifest-crosscheck.mjs`) treat it as an undeclared depth-0 section,
  since any `esa-*` tag is "trackable." Bit on `src/pages/prototypes/air-exchange-rate.astro`;
  worked around by switching the spine to the `.center` layout primitive. **Proposed fix:**
  treat pure layout-frame legos (`esa-container`) as transparent in the cross-check (like
  the `.center`/`.stack` primitives), or document `.center` as the canonical page spine.
- **`esa-text-field` / `esa-radio-group` don't restore on a native form reset.** Both are
  form-associated (`static formAssociated = true`) but neither implements `formResetCallback`,
  so a native `<form>` reset (or a `type="reset"` button) clears the ElementInternals form
  value while the Lit `value` property — and the visible input/selection — stays populated.
  Bit on `src/components/smaqmd-aer-calculator.astro`: the Reset button did nothing until the
  spoke restored every shared field by hand (`resetFields` + rebuilding the cleaner list).
  **Proposed fix:** add `formResetCallback()` to both components to reset `value` to its
  initial/attribute default and re-render, so `<form reset>` works everywhere for free.
- **`esa-text-field` has no `min` / `max` (or number-range) support.** The number `type` is
  supported but there's no way to bound the value — a user can enter negatives. Bit on
  `src/components/smaqmd-aer-calculator.astro` (room dimensions, air flow, target ACH all must
  be ≥ 0); worked around by clamping negatives to `0` in the component's input handler.
  **Proposed fix:** pass through `min` / `max` / `step` attributes to the native `<input>`
  (and surface range violations via the existing `error-text` path), so range rules live in
  the lego instead of being re-implemented per spoke.
- **`esa-text-field` doesn't forward `inputmode` to the native `<input>`.** The component
  renders `.type=${this.type}` but has no `inputmode` property, so a field can't request a
  specific virtual keyboard. Bit on `src/components/smaqmd-aer-calculator.astro`: to kill the
  number-stepper (which let users spin negatives), the numeric fields were switched to
  `type="text"` — but that drops the mobile numeric keypad, and there's no `inputmode="numeric"`
  to restore it. **Proposed fix:** add an `inputmode` property passed through to the native
  `<input>`, so a text-typed numeric field can still surface the numeric keypad on mobile.
  (Pairs naturally with the `min` / `max` / `step` work above.)
- **`esa-card` hardcodes its title as `<h3>`, with no way to set the heading level.** The title
  always renders `<h3 class="esa-card__title">`, assuming the card sits under a section `<h2>`.
  Bit on `src/pages/prototypes/air-exchange-rate.astro`: the page is `<h1>` (esa-page-header) →
  cards, where the cards ARE the top-level sections — so the outline jumps h1 → h3, skipping h2
  (axe `heading-order` / WCAG 1.3.1). The level can't be fixed from the spoke because it's a lego
  internal; the `header` slot replaces the whole title block and loses the scoped title styling.
  **Proposed fix:** add a heading-level prop to `esa-card` (e.g. `titleAs="h2"` / `heading-level`,
  default `h3`) that sets the tag on `.esa-card__title`, so a card used as a top-level section can
  render `<h2>` and keep the heading order valid. (Same shape as the configurable-level need any
  section-titling lego has; `esa-page-header` already exposes `prominence`/`as`.)
- **`--color-text-muted` resolves to `--color-gray-10`, which is not a text step.** `packages/tokens`
  SPEC says the Radix ramp reserves **11/12 for text** (step 9 = solid fill, 10 = hovered solid
  bg). But `--color-text-muted: var(--color-gray-10)` — a semantic token named "text" that points
  at a non-text step. Consequence: any spoke reaching for the natural "muted caption" token lands
  on gray-10, breaking the 11/12 rule and risking small-text contrast failure. Bit on
  `src/components/smaqmd-aer-calculator.astro` (captions + metric unit labels); worked around by
  using `--color-text-tertiary` (gray-11) instead. **Proposed fix:** repoint `--color-text-muted`
  to `--color-gray-11` (matching `secondary`/`tertiary`), or drop it so there's no "text" token on
  a non-text step. (`--color-text-primary` = 12, `secondary`/`tertiary` = 11 are already correct.)
- **Lego muted text defaults to gray-10 → fails WCAG 1.4.3 (3.7:1 on white).** A contrast audit of
  the air-exchange page (shadow-DOM-piercing walker) found every muted-text lego at gray-10
  (`#838383`, 3.7:1, needs 4.5:1): `esa-stat`'s `.esa-stat__sub` sublabel, `esa-text-field`'s
  `.help` text, and the input `::placeholder`. All are meant to be read (a sublabel, guidance, and
  example values), so none qualify for the 1.4.3 "incidental" exemption — an axe pass flags them.
  Root cause is the same gray-10 default as `--color-text-muted` above, carried by the form/stat
  component tokens (`--form-help-color`, `--form-placeholder-color`, the stat sub color). **Proposed
  fix:** bump those muted-text component-token defaults from gray-10 → gray-11 (3.7 → ~5.9:1); still
  reads as quiet/secondary but clears AA. One ramp-step change fixes stat subs, help text, and
  placeholders across every spoke. (Truly-decorative or disabled-control text may stay lighter —
  those ARE 1.4.3-exempt — but active-field placeholders/help/sublabels are not.)
- **Scaffolded spoke theme ramp is sRGB-only — it discards the hub's P3 gamut.** The hub
  (`packages/tokens/dist/tokens.css`) ships every ramp with a `@media (color-gamut: p3)` block of
  `color(display-p3 …)` overrides (120 declarations). But the spoke-template's scaffolded theme
  (`src/styles/theme-smaqmd.css`) defines `--smaqmd-gray-*` / `--smaqmd-brand-*` as plain sRGB hex
  with NO P3 block, and repoints the semantic tokens (`--color-text-*`, `--color-border`, brand) at
  that sRGB ramp — shadowing the hub's P3 values. Net: the spoke renders entirely in sRGB. Found
  while verifying text color: `--color-text-tertiary` → `--smaqmd-gray-11` → `#646464`, no P3
  variant (visible in dev tools). Negligible for neutrals (grays sit on the shared neutral axis so
  P3 ≈ sRGB), but a real loss of vividness for the saturated **brand** ramp on wide-gamut displays.
  **Proposed fix:** have the spoke-template scaffold a `@media (color-gamut: p3)` block of P3
  variants alongside the sRGB ramp; or, for the gray ramp specifically, inherit the hub's
  `--color-gray-*` (already P3-equipped) instead of redefining neutrals locally, reserving the
  spoke ramp for the brand hue that genuinely must be spoke-authored.
- **No repeater lego — spokes hand-roll add/remove field lists and hit an animation footgun.**
  There's no lego for an "add-as-many-as-you-need" list of identical composite field blocks
  (an "Add another" button + per-block "Remove" with an animated collapse-on-remove); the
  closest catalog entries are single-control groupers (`esa-radio-group`, `esa-checkbox-group`,
  `esa-chip-group`) and `esa-file-list` (uploaded files), none of which repeat arbitrary field
  blocks. Bit on `src/components/smaqmd-aer-calculator.astro` (the air-cleaner list), which
  hand-rolls the whole thing in a client `<script>`. The DIY removal animation carried a browser
  bug: it gated `block.remove()` on `transitionend.propertyName === 'block-size'`, but WebKit
  reports the *logical* block-size transition under its physical name `height`, so the block was
  never removed — leaving a zero-height ghost row whose `border-block-start` divider and `.stack`
  flex `gap` showed as persistent empty space. Worked around by not gating on `propertyName`
  (accept `block-size`|`height`) plus a `setTimeout` fallback that guarantees removal.
  **Proposed fix:** add an `esa-repeater` lego that owns the list plumbing (add/remove, min-count,
  renumbering) and a correct, tested collapse-on-remove transition, so this is written once
  instead of re-implemented — and mis-implemented — per spoke.
