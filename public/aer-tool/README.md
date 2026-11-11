# Air Cleaner Calculator (standalone build)

A self-contained web page that helps someone answer one of two questions:

- **"Is the air cleaner I own the right size for this room?"**
- **"I don't have one — what should I buy?"**

The user enters a room size, describes their air cleaner (or says they have none), and picks the air quality they expect. The choices are good or moderate (AQI 0–100, 2 ACH), unhealthy (AQI 101–200, 5 ACH), and very unhealthy or wildfire smoke (AQI 201+, 7.5 ACH per AHAM), or they can enter their own target. The tool returns the air changes per hour the setup delivers, the minimum combined CADR needed to hit the target, and an isometric diagram of the room, the cleaner, and the air moving between them.

## What you get

**There is no build step.** Double-click `index.html` and it runs; drop the folder on any web server and it runs there too. The page loads about 270 KB, 29 KB of it the font. The 73 KB label photo loads only when a "Where to find..." help section is opened.

Every CSS class and `id` is prefixed `smaqmd-`, and the JavaScript defines no globals. Nothing in the folder can collide with names on an existing site.

## How it calculates

**ACH = clean-air flow (CFM, i.e. ft³/min) × 60 ÷ room volume (ft³).**

One "air change" means the cleaner has filtered a full room's worth of air. Airflow is stated in **CFM** (cubic feet of air moved per minute) because that is the unit printed on the box. The minimum combined CADR to hit a target is **CADR = target × room volume ÷ 60**.

Some cleaners are rated in ACH instead of airflow. For those, the tool recovers the flow from the manufacturer's reference room: **flow = ACH × reference volume ÷ 60**. The reference room can be entered as length × width × height or as floor area + ceiling height.

The California Air Resources Board recommends at least 2 air changes per hour, which is the tool's default target.

## What's in the folder

```
aer-tool/
  index.html                       the page
  styles.css                       all styling, including the flattened design tokens
  app.js                           the calculator, the wizard flow and the diagram
  smaqmd-logo.png                  the district logo in the header (~14 KB, links to airquality.org)
  aham-label.jpg                   AHAM Verifide label photo in the "where to find the rating" help (~73 KB)
  fonts/SourceSans3-Variable.woff2 the district's typeface (~29 KB)
  fonts/OFL.txt                    the font's license
  README.md                        this file
```

## Integrating it into an existing site

There are three ways to add it to a site.

### Option A: Host as its own page

Copy `aer-tool/` anywhere on the site and link to it:

```html
<a href="/tools/aer-tool/">Air Cleaner Calculator</a>
```

Nothing to configure. Every path inside the folder is relative, so it works at any depth. This is the simplest option.

### Option B: Embed in an existing page

Copy the `aer-tool/` folder onto the server. Then, in the page that will host the tool:

1. **Add the stylesheet** to the page `<head>`:

   ```html
   <link rel="preload" href="/tools/aer-tool/fonts/SourceSans3-Variable.woff2" as="font" type="font/woff2" crossorigin />
   <link rel="stylesheet" href="/tools/aer-tool/styles.css" />
   ```

   The `preload` line is optional. It fetches the font in parallel with the stylesheet instead of after it, so the text doesn't visibly swap fonts on first load.

2. **Paste the embeddable region.** In `index.html`, two comments mark the block to copy: `<!-- ===== THE EMBEDDABLE REGION — copy from here to </main> ===== -->` and `<!-- ===== end of the embeddable region ===== -->`. Copy everything between them. That is the `<main class="smaqmd-aerb">` element, including the `<template data-cleaner-template>` before its closing tag.

   Then adjust the header and image paths:

   - The visible page `<h1>` is inside that region, in the `.smaqmd-aerb__header` div at the top of `.smaqmd-aerw__col`, on one row with the district logo (which links to airquality.org).
   - To use your own title, replace the `<h1>` text. If the host page already supplies an `<h1>` and its own branding, delete the whole `.smaqmd-aerb__header` div. Below 68rem the script moves the header above the diagram, and it skips that step when the header is gone, so deleting it is safe.
   - If you keep the header but the host page already shows the district logo, delete just the `.smaqmd-logo-link` anchor. The divider beside the title goes with it.
   - The logo (`smaqmd-logo.png`) and the AHAM label photo in the two rating help sections (`aham-label.jpg`) use relative paths. A host page served from a different directory must either keep those images next to itself or point each `src` at wherever `aer-tool/` lives (for example `/tools/aer-tool/smaqmd-logo.png`).

3. **Add the script** at the end of `<body>`:

   ```html
   <script defer src="/tools/aer-tool/app.js"></script>
   ```

4. **Make sure the page has exactly one `<h1>`.** The tool ships one in `.smaqmd-aerb__header` (step 2), and every other heading inside it starts at `<h2>`, so they nest underneath. If your page already has its own `<h1>`, delete the tool's rather than shipping two.

**Styling guarantees**

- **The stylesheet is fully scoped.** Every rule is confined to the tool's own region. There are no `html`, `body`, `:root`, `*`, or bare element selectors. Every class is prefixed `smaqmd-`, and the design tokens are declared on the region root. We verified this by loading a host page with and without the stylesheet and diffing every computed property; nothing changed.
- **The tool defends against host styles.** It pins its own typography, box-sizing, and color, so resets, serif fonts, `content-box` rules, and host `--color-*` or `--spacing-*` variables don't affect it.
- **Font paths are relative to `styles.css`**, not the host page. Keep `fonts/` next to it.
- **One deliberate exception touches the host page.** While one of the tool's two bottom sheets is open, the script sets `overflow: hidden` inline on `<html>` so the page behind can't scroll, and clears it when the sheet closes. If the host page sets its own inline `overflow` on `<html>`, that value is cleared too. Above 68rem a sheet covers only the tool's card. At 68rem and below, the breakpoint where the layout stacks, it covers the viewport.
- **The tool fills the viewport** with a fixed full-height diagram behind a fixed card column. Use this option for a full-page route. For a tool inside an existing header, sidebar, and footer, use Option C.

### Option C: Embed in an iframe

This is the safest way to drop the tool into an existing page, since host and tool CSS can't reach each other.

```html
<iframe
  src="/tools/aer-tool/"
  title="Air Cleaner Calculator"
  style="width: 100%; height: 100vh; border: 0;"
  loading="lazy"
></iframe>
```

Give the iframe real height. The tool is a full-page composition, and a short frame will scroll internally. The `title` attribute is required, because it is how screen-reader users identify the frame.

## Accessibility

Built to **WCAG 2.2 Level AA**.

### Structure

The page has `lang="en"`, a page `<title>`, a `<main>` landmark, and a heading outline with no skipped levels. The page `<h1>` sits in `.smaqmd-aerb__header` and is visible on every screen. Every other heading starts at `<h2>` and nests beneath it. Exactly one `<h2>` is visible at a time: the opening slide's title, the step title, or, on the result screen, the verdict headline that replaces the step title.

### Forms

Every field has a real programmatic label, and placeholders are never used as labels. Hints are wired with `aria-describedby`. Option groups use native `<fieldset>` and `<legend>` with native radios, which give browser-provided arrow-key selection and group naming. The target step is a native radio group of air-quality choices, and "Enter my own target" reveals a labeled number field. Numeric fields carry `inputmode="decimal"` and render at 18px, above the 16px threshold that stops mobile Safari from zooming on input.

Errors are identified in text beside the field. The field is marked `aria-invalid`, and the message is linked through `aria-describedby` with an "Error:" prefix and an icon, so color is never the only signal. Focus moves to the first flagged field.

### Keyboard navigation

Everything works without a mouse, in reading order, with a visible 2px brand focus ring. The ring is drawn with `outline` so it stays visible in Windows Contrast Themes. Moving between steps sends focus to the new heading, so screen-reader users hear where they landed.

The two bottom sheets ("Where to find your air cleaner's rating" and "Don't know the rating?") use the native modal `<dialog>`. While one is open, focus stays inside it and the page behind is inert. The first sheet closes with Esc or its close button. The second asks a question, so Esc doesn't dismiss it; either of its two answer buttons closes it. There are no keyboard traps (WCAG 2.1.2).

### Touch and pointer targets

Buttons and option rows are at least 44px, past both WCAG 2.5.8's 24px minimum and standard touch conventions. Two smaller controls stay well above that minimum: the "Where to find your air cleaner's rating" button (38px with a mouse, 44px on touch screens) and the CADR/ACH switch on the result screen (39px), which only restates a number already on screen.

### Live regions and status

One polite and one assertive live region, mounted at load, are the only live regions on the page (WCAG 4.1.3). Result summaries are announced politely after 600ms, so dragging the diagram doesn't produce a stream of announcements.

### Diagram

The diagram carries `role="img"` and a short `aria-label` describing the furnished room, where each air cleaner stands, the waves, the coverage outline, and the CFM labels. The labels show the result's combined CADR split evenly across the air cleaners, and the combined figure itself appears as text in the result. The diagram's drag handles are pointer-only (WCAG 2.5.7). Typing the number into the field does the same job, so the handles are not tab stops.

### Color

Every foreground and background pair meets AA, including two pairs that needed a darker palette step: orange warning text, and dark text on solid orange fill. No state is conveyed by color alone. Each verdict carries an icon shape and a sentence.

### Motion

`prefers-reduced-motion: reduce` stops the step slide, the flow animation, and transitions, and every state change still happens. The diagram's air-cleaning waves are the one animation that would otherwise run indefinitely, so they have a pause/play button in the scene's lower-right corner (WCAG 2.2.2). The waves start paused for reduced-motion users, who can turn them back on.

### Zoom

There is no `maximum-scale` or `user-scalable=no`. The page reflows to 320px with no horizontal scrolling and works at 400% zoom.

### Verified

We walked the full flow with the keyboard only and ran automated structural checks at 1440px, 390px, and 320px, over both `http://` and `file://`. The checks cover one `h1` per screen with no skipped heading levels, a programmatic label on every field, a `fieldset` and `legend` on every option group, target sizes of at least 24px (44px for buttons and option rows), and no positive `tabindex`.

## Browser support

Chrome, Edge, Firefox, and Safari (current and previous versions), plus iOS Safari and Android Chrome. Nothing here is Chromium-only.

The features that set the floor are `color-mix()`, CSS logical properties, `:focus-visible`, `ResizeObserver`, and `matchMedia().addEventListener`. All have been supported everywhere since roughly mid-2023. The card's frosted-glass effect uses `backdrop-filter` behind an `@supports` check, so a browser without it gets a solid card instead.

## Fonts and licensing

The bundled typeface is **Source Sans 3**, licensed under the [SIL Open Font License 1.1](fonts/OFL.txt), which permits bundling and redistribution with a web page. The full license text ships in `fonts/`. The file is the Latin subset of the variable font, covering the text the tool displays.

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

Every color, space, radius, and type size is a custom property, declared in one block at the top of `styles.css` on the `.smaqmd-aerb` region root. To re-skin the tool, edit that block and nothing else, since every rule below it reads through those properties. They are declared on the region rather than on `:root` on purpose. That keeps them out of the host page and stops host `--color-*` or `--spacing-*` variables from changing the tool.
