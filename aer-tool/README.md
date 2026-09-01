# Air Exchange Rate Tool — standalone build

A self-contained web page that helps someone answer one of two questions:

- **"Is the air cleaner I own powerful enough for this room?"**
- **"I don't have one — what should I buy?"**

The user provides a room size, describes their air cleaner (or confirms they have none), and sets a target. The tool returns the air changes per hour the setup delivers, the minimum combined CADR needed to hit the target, and an isometric diagram of the room, the cleaner, and the air moving between them.

## What you get

**There is no build step.** No npm, no bundler, no framework, no external requests. Double-click `index.html` and it runs; drop the folder on any web server and it runs there too. Total weight is about 170 KB, of which 29 KB is the font.

Everything is namespaced: every CSS class and `id` is prefixed `smaqmd-`, and the JavaScript defines no globals. Nothing in the folder can collide with names on an existing site.

## How it calculates

**ACH = clean-air flow (ft³/min) × 60 ÷ room volume (ft³).**

One "air change" means the cleaner has filtered a full room's worth of air. The minimum combined CADR to hit a target is **CADR = target × room volume ÷ 60**. Where a cleaner is rated in ACH rather than airflow, its flow is recovered from the manufacturer's reference room: **flow = ACH × reference volume ÷ 60**. The California Air Resources Board recommends at least 2 air changes per hour, which is the tool's default target.

## What's in the folder

```
aer-tool/
  index.html                       the page
  styles.css                       all styling, including the flattened design tokens
  app.js                           the calculator, the wizard flow and the diagram
  fonts/SourceSans3-Variable.woff2 the district's typeface (~29 KB)
  fonts/OFL.txt                    that font's licence
  README.md                        this file
```

## Integrating it

Choose one of three options based on your needs:

### Option A: Host as its own page

Copy `aer-tool/` anywhere on the site and link to it:

```html
<a href="/tools/aer-tool/">Air Exchange Rate Tool</a>
```

Nothing to configure. Every path inside the folder is relative, so it works at any depth. This is the simplest option.

### Option B: Embed in an existing page

Copy the `aer-tool/` folder onto the server. Then, in the page that will host the tool:

1. **Add the stylesheet** to the page `<head>`:
   ```html
   <link rel="stylesheet" href="/tools/aer-tool/styles.css" />
   ```

2. **Paste the embeddable region.** In `index.html`, the block to copy is marked by comments: `<!-- ===== THE EMBEDDABLE REGION — copy from here to </main> ===== -->` and `<!-- ===== end of the embeddable region ===== -->`. Copy everything between them: the `<main class="smaqmd-aerb">` element, including the `<template data-cleaner-template>` before its closing tag. Do not copy the `<h1 class="smaqmd-visually-hidden">` above it—that is the standalone page's own heading; your page supplies its own.

3. **Add the script** at the end of `<body>`:
   ```html
   <script defer src="/tools/aer-tool/app.js"></script>
   ```

4. **Include a page `<h1>`.** Every heading inside the tool starts at `<h2>`, so it nests underneath yours. A real `<h1>` keeps the heading outline correct.

**Styling guarantees:**

- **Fully scoped stylesheet:** Every rule is confined to the tool's own region. No `html`, `body`, `:root`, `*`, or bare element selectors; every class is prefixed `smaqmd-`, and design tokens are declared on the region root. Verified by loading a host page with and without the stylesheet and diffing all computed properties: zero changed. The tool equally defends against host styles, pinning its typography, box-sizing, and colour to prevent resets, serif fonts, `content-box` rules, or conflicting `--color-*` or `--spacing-*` variables from affecting it.
- **Font paths are relative to `styles.css`**, not the host page. Keep `fonts/` next to it.
- **The tool fills the viewport** with a fixed full-height diagram behind a fixed card column. Use this option for a full-page route. For a tool inside an existing header, sidebar, and footer, use Option C.

### Option C: Embed in an iframe

The safest option for dropping the tool into an existing page, since host and tool CSS cannot reach each other:

```html
<iframe
  src="/tools/aer-tool/"
  title="Air Exchange Rate Tool"
  style="width: 100%; height: 100vh; border: 0;"
  loading="lazy"
></iframe>
```

Give the iframe real height: the tool is a full-page composition and a short frame will scroll internally. The `title` attribute is required; it is how screen-reader users identify the frame.

## Accessibility

Built to **WCAG 2.2 Level AA**.

**Structure:** `lang="en"`, a page `<title>`, a `<main>` landmark, and a heading outline with no skipped levels. Every heading inside the tool starts at `<h2>`, leaving the `<h1>` to the host page or standalone shell. Throughout the flow, exactly one section heading is visible at a time: the opening slide's title, the step title, or — on the result screen, where the step title is hidden — the verdict headline.

**Forms:** Every field has a real programmatic label; placeholders are never used as labels. Hints are wired with `aria-describedby`. Option groups use native `<fieldset>`/`<legend>` with native radios for browser-provided arrow-key selection and group naming. Numeric fields carry `inputmode="decimal"` and render at 18px, above the 16px threshold that prevents mobile Safari from zooming on input.

**Keyboard navigation:** Everything is operable without a mouse, in reading order, with a visible 2px brand focus ring (drawn with `outline` to stay visible in Windows Contrast Themes). No overlays or focus traps. Moving between steps sends focus to the new heading so screen-reader users hear where they landed.

**Touch and pointer targets:** Buttons and option rows are at least 44px, past both WCAG 2.5.8's 24px minimum and standard touch conventions. The diagram's drag handles are pointer-only (WCAG 2.5.7); the equivalent path is typing the number into the field, so handles are not tab stops.

**Live regions and status:** One polite and one assertive live region, mounted at load, are the only live regions on the page (WCAG 4.1.3). Result summaries are announced politely after 600ms to prevent diagram dragging from creating chatter.

**Diagram:** Carries `role="img"` and a sentence-long `aria-label`; every number it shows also appears as text in the result.

**Colour:** Every foreground/background pair meets AA, including the two pairs that required a darker palette step: orange warning text and dark text on solid orange fill. No state is conveyed by colour alone—each verdict carries an icon shape and a sentence.

**Motion:** `prefers-reduced-motion: reduce` stops the step slide, flow animation, and transitions; all state changes still happen.

**Zoom:** No `maximum-scale` or `user-scalable=no`. Reflows to 320px with no horizontal scrolling and survives 400% zoom.

**Verified:** Keyboard-only walkthrough of the full flow, plus automated structural checks run at 1440px, 390px, and 320px over both `http://` and `file://`. Checks include one `h1` per screen with no skipped heading levels, every field programmatically labelled, every option group in a `fieldset` with a `legend`, target sizes at 44px, and no positive `tabindex`.

## Browser support

Chrome, Edge, Firefox, and Safari (current and previous versions), plus iOS Safari and Android Chrome. Nothing here is Chromium-only.

The features that set the floor are `color-mix()`, CSS logical properties, `:focus-visible`, `ResizeObserver`, and `matchMedia().addEventListener`—all supported everywhere since roughly mid-2023. `backdrop-filter` is used for the card's frosted-glass effect and is behind an `@supports` check, so a browser without it gets a solid card instead.

## Fonts and licensing

The bundled typeface is **Source Sans 3**, licensed under the [SIL Open Font License 1.1](fonts/OFL.txt), which permits bundling and redistribution with a web page. The full licence text ships in `fonts/`. The file is the Latin subset of the variable font, covering the text the tool displays.

To serve the font from Google's CDN instead of hosting it locally, delete `fonts/`, remove the `@font-face` block at the top of `styles.css`, and add this to the page `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300..700&display=swap"
/>
```

## Customizing the look

Every colour, space, radius, and type size is a custom property declared in one block at the top of `styles.css`, on the `.smaqmd-aerb` region root, under consistent, descriptive names. To re-skin the tool, edit that block and nothing else—every rule below it reads through those names. They are declared on the region rather than on `:root` deliberately, to keep them out of the host page and to prevent host `--color-*` or `--spacing-*` variables from reaching in and changing the tool.

