/*
 * Air Exchange Rate Tool — standalone engine.
 *
 * bcn-lego-checked: no esa- lego can be used here at all. This file is the
 * zero-dependency CLIENT deliverable: the .astro legos (esa-card / esa-stat /
 * esa-alert-box) are compile-time and cannot exist outside an Astro build, and
 * the Lit legos (esa-text-field / esa-radio-group / esa-button-toggle) are ES
 * modules that would reintroduce npm, a bundler and a module <script> — the
 * three things the client asked to be free of, and a module script does not run
 * from a file:// double-click at all. Checked Beacon: Angular, same problem.
 * So the controls are NATIVE elements (label+input, fieldset+radio, button) —
 * which is the lego's own internal markup anyway; esa-radio-group renders a real
 * fieldset/legend with native radios. The reusable home for the ported chrome is
 * styles.css + this file, and the Astro component remains the source of truth
 * they are ported FROM.
 *
 * Ported from the inline <script> of src/components/smaqmd-aer-wizard.astro
 * (variant="responsive"), with the TypeScript annotations stripped and the
 * design-system dependencies replaced:
 *
 *   @esa/ecology/announcer   -> the `announcer` module at the top of this file
 *   esa-text-field .value    -> the native <input>'s .value (unchanged)
 *   esa-radio-group .value   -> getFieldValue()/setFieldValue(), which read and
 *                               write the checked radio inside a <fieldset>
 *   customElements.whenDefined boot gate -> gone; native elements are ready as
 *                               soon as this deferred script runs
 *
 * The maths, the isometric projection, the step machinery, the plan fork, the
 * focus management, the reduced-motion gate, the drag grips and the `sceneLive`
 * breakpoint pause are ports, not rewrites: keep them in sync with the Astro
 * component if either side changes.
 *
 * Plain classic script (NOT a module) wrapped in an IIFE, so it works from a
 * file:// double-click as well as when served.
 */
(function () {
  'use strict';

  /* =====================================================================
     ANNOUNCER — a hand port of @esa/ecology/announcer.
     ===================================================================== */
  /*
   * The page's ONLY ARIA live regions. Two of them, in the light DOM, appended
   * to <body> at boot. Three facts drive the shape:
   *
   *   1. A live region has to PRE-EXIST its content. A region created in the
   *      same tick as the text it holds is routinely not announced at all — the
   *      browser has to have it in the accessibility tree and under observation
   *      before the mutation happens. So they mount at boot, not on first use:
   *      recompute() can raise a validation alert on the very first pass.
   *   2. Live regions interfere with each other. Assertive updates can clear the
   *      queue of polite ones; several regions on a page means some messages are
   *      announced twice and others not at all. The accepted ceiling is about
   *      two — one polite, one assertive — which is exactly what this owns.
   *   3. An identical repeat is not a mutation, and so is silent. The fix is
   *      clear, yield, then write; one frame is not enough on every engine, and
   *      ~100ms is the interval that survives testing.
   *
   * The upstream module also re-homes the regions into an open modal <dialog>
   * (showModal() blocks body-level elements from the accessibility tree). That
   * branch is deliberately NOT ported: this tool renders no dialog.
   */
  var announcer = (function () {
    var CLEAR_AFTER_MS = 350;
    var REPEAT_GAP_MS = 100;
    var regions = null;
    var timers = new WeakMap();

    function hide(el) {
      // The clip-rect, inline, so the region never depends on a stylesheet: a
      // live region that is display:none is not announced at all, so failing
      // open here is not an option.
      el.style.cssText =
        'position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;' +
        'overflow:hidden;white-space:nowrap;clip:rect(0 0 0 0);clip-path:inset(50%);';
    }

    function ensure() {
      if (regions && regions.polite.isConnected && regions.assertive.isConnected) return regions;
      if (regions) {
        regions.polite.remove();
        regions.assertive.remove();
      }
      var make = function (live, role) {
        var el = document.createElement('div');
        el.setAttribute('aria-live', live);
        // The role is redundant with aria-live on paper — status implies polite,
        // alert implies assertive — but some AT paths key off the role and
        // others off the attribute, and stating both costs nothing.
        el.setAttribute('role', role);
        el.setAttribute('aria-atomic', 'true');
        el.setAttribute('data-esa-announcer', live);
        hide(el);
        document.body.appendChild(el);
        return el;
      };
      regions = { polite: make('polite', 'status'), assertive: make('assertive', 'alert') };
      return regions;
    }

    return {
      /** Mount the regions without announcing anything. Idempotent. */
      init: function () {
        ensure();
      },
      /**
       * Announce a status message. Composed by the caller and written in ONE
       * mutation — a screen reader may announce separate fragments separately.
       * Empty messages are ignored rather than clearing the region.
       */
      announce: function (message, options) {
        var text = String(message == null ? '' : message).trim();
        if (!text) return;
        var mounted = ensure();
        var region = options && options.assertive ? mounted.assertive : mounted.polite;
        var pending = timers.get(region);
        if (pending) clearTimeout(pending);
        // Clear first, always: an identical repeat would otherwise be silent,
        // and stale text lets a screen-reader user navigate to a message that is
        // no longer on screen.
        region.textContent = '';
        timers.set(
          region,
          setTimeout(function () {
            region.textContent = text;
            timers.set(
              region,
              setTimeout(function () {
                region.textContent = '';
              }, CLEAR_AFTER_MS)
            );
          }, REPEAT_GAP_MS)
        );
      },
    };
  })();

  var kitAnnounce = announcer.announce;
  // Pre-mount: a region that mounts and mutates in the same tick does not
  // announce, and recompute() can raise a validation alert on init.
  announcer.init();

  var root = document.querySelector('[data-aerb-wizard]');
  if (!root) return;

  // THE narrow-screen breakpoint, in JS. One MediaQueryList shared by both
  // consumers below so they can never disagree about which side of 68rem we are
  // on. Must stay identical to the `@media (max-width: 68rem)` query in
  // styles.css — the CSS hides the scene, this decides whether it animates.
  var mqMobile = window.matchMedia('(max-width: 68rem)');

  /* =====================================================================
     FIELD PLUMBING — the one place the port diverges from the component.
     ===================================================================== */
  // In the Astro build every control is a custom element with a `.value`
  // property. Here the text fields are native inputs (which already have one)
  // and the radio groups are <fieldset>s (which do not). These two helpers are
  // the whole adaptation; everything downstream reads and writes through them.
  var isGroup = function (el) {
    return !!el && el.tagName === 'FIELDSET';
  };
  var getFieldValue = function (el) {
    if (!el) return '';
    if (isGroup(el)) {
      var checked = el.querySelector('[type="radio"]:checked');
      return checked ? checked.value : '';
    }
    return el.value == null ? '' : el.value;
  };
  var setFieldValue = function (el, v) {
    if (!el) return;
    if (isGroup(el)) {
      var want = String(v);
      var radios = el.querySelectorAll('[type="radio"]');
      for (var i = 0; i < radios.length; i++) radios[i].checked = radios[i].value === want;
      return;
    }
    el.value = String(v);
  };
  // Stamp a value onto a field in a freshly CLONED (not yet inserted) block. The
  // component set the `value` ATTRIBUTE so an esa-* element booted populated even
  // before it upgraded; native elements have no upgrade step, so this sets the
  // attribute (for a clean DOM) and the property (for the live control).
  var presetField = function (el, val) {
    if (!el) return;
    if (isGroup(el)) {
      setFieldValue(el, val);
      var radios = el.querySelectorAll('[type="radio"]');
      for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) radios[i].setAttribute('checked', '');
        else radios[i].removeAttribute('checked');
      }
      return;
    }
    el.setAttribute('value', val);
    el.value = val;
  };

  // ---- input plumbing (shared with the city drawing) ----
  // Namespaced field lookup: a bare name matches the shared (no data-cleaner)
  // field; passing a cleaner id matches that cleaner's per-block field. Grips and
  // room math use the shared fields; cleaner math passes the block id.
  var qa = function (sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  };
  var field = function (name, id) {
    var sel =
      id != null
        ? '[data-field="' + name + '"][data-cleaner="' + id + '"]'
        : '[data-field="' + name + '"]:not([data-cleaner])';
    return root.querySelector(sel);
  };
  var raw = function (name, id) {
    return String(getFieldValue(field(name, id))).trim();
  };
  var num = function (name, id) {
    var v = parseFloat(raw(name, id));
    return isFinite(v) ? v : NaN;
  };
  var pos = function (name, id) {
    var v = num(name, id);
    return isFinite(v) && v > 0 ? v : NaN;
  };
  var fmt = function (v, digits) {
    if (digits === undefined) digits = 0;
    return v.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  };

  // ---- isometric projection ----
  // Project a 3D world point (x=length axis, y=width axis, z=up, all in ft) to
  // 2D. Classic 2:1 isometric: x runs right, y runs left, z runs up.
  var COS30 = Math.cos(Math.PI / 6);
  var SIN30 = 0.5;
  var project = function (x, y, z) {
    return [(x - y) * COS30, (x + y) * SIN30 - z];
  };

  // THE SCENE IS OPTIONAL. Rather than thread a guard through the ~30 places the
  // engine touches these nodes, they fall back to DETACHED stand-ins: every
  // querySelector against the stand-in returns null (each of those call sites
  // already null-checks) and every dataset write lands off-document.
  var sceneSvg = root.querySelector('.smaqmd-cityview__svg');
  var sceneStage = root.querySelector('[data-cityview]');
  var svg = sceneSvg || document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  var container = sceneStage || document.createElement('div');
  // px-per-projected-ft from the last fit; frozen at pointerdown for a drag so
  // the gesture's px->ft mapping stays stable while the scene re-fits.
  var fitScale = 1;
  var viewW = 480;
  var viewH = 380;
  var safe = { x: 52, y: 52, w: 376, h: 276 };
  var MAX_SCALE = 12; // px per projected ft — stops a small room ballooning on huge monitors
  // Air-cleaner sizing bounds. The footprint scales with the room only UP TO a
  // world cap (CW_MAX). Independently, UNIT_MIN_PX is a readability FLOOR on
  // screen — a huge room fits by zooming out, which can shrink the (world-capped)
  // cleaner below legibility, so the fit runs a second pass to clear it.
  var CW_MAX = 4.5;
  var CW_MIN = 2;
  var GAP_MAX = 10;
  var UNIT_MIN_PX = 22;
  var sceneSentinel = root.querySelector('[data-safe]');
  var sentinel = sceneSentinel || document.createElement('div');
  var hasScene = !!(sceneSvg && sceneStage && sceneSentinel);
  // hasScene answers "is the scene in the document"; sceneLive answers "is it
  // WORTH DRAWING right now". They differ for exactly one case: this build ships
  // the scene at every width but CSS-hides it under 68rem, where the container
  // measures 0x0 — so an unguarded loop would ease gradients nobody sees and
  // syncViewport would fit to a zero-sized box, poisoning `safe` for when the
  // scene comes back.
  var isResponsive = root.getAttribute('data-variant') === 'responsive';
  var sceneLive = hasScene && !(isResponsive && mqMobile.matches);

  var syncViewport = function () {
    if (!sceneLive) return;
    viewW = container.clientWidth;
    viewH = container.clientHeight;
    svg.setAttribute('viewBox', '0 0 ' + viewW + ' ' + viewH);
    var s = sentinel.getBoundingClientRect();
    var c = container.getBoundingClientRect();
    safe = { x: s.left - c.left, y: s.top - c.top, w: s.width, h: s.height };
    drawScene(cur.L, cur.W, cur.H);
  };
  if (hasScene && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncViewport).observe(sentinel);
  }

  // One screen-coord lane path per cleaner, filled each draw. returnPaths[i] runs
  // cleaner i -> room; outPaths[i] runs room -> cleaner i.
  var returnPaths = [];
  var outPaths = [];
  var sceneN = 1;
  var MAX_CLEANERS = 4;

  var ptsAttr = function (pts) {
    return pts
      .map(function (p) {
        return p[0].toFixed(1) + ',' + p[1].toFixed(1);
      })
      .join(' ');
  };
  var setPoly = function (sel, pts) {
    var el = svg.querySelector(sel);
    if (el) el.setAttribute('points', ptsAttr(pts));
  };
  var setLabel = function (name, at, text) {
    var el = svg.querySelector('[data-label="' + name + '"]');
    if (!el) return;
    el.setAttribute('x', at[0].toFixed(1));
    el.setAttribute('y', at[1].toFixed(1));
    el.textContent = text;
  };
  var mid = function (p, q) {
    return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  };

  // Architectural-detail helpers: one wrapper-group lookup + a per-poly toggle
  // that mirrors the lane/ghost pattern — style.visibility (never display), and
  // set points only when shown.
  var detailsG = svg.querySelector('[data-room-details]');
  var setDetail = function (sel, on, pts) {
    var el = svg.querySelector(sel);
    if (!el) return;
    el.style.visibility = on ? '' : 'hidden';
    if (on && pts) el.setAttribute('points', ptsAttr(pts));
  };

  // N air cleaners on the right street side (x > L), spread along the room's
  // width. Cleaner k of n centers at cyc_k = W*(k+0.5)/n, so n=1 lands at W/2.
  // Footprint shrinks as more cleaners share the width so their small faces never
  // overlap. Each keeps its own two straight iso lanes.
  var layoutCleaners = function (L, W, n, cwOpt) {
    var gap = Math.min(Math.max(3, Math.min(L, W) * 0.55), GAP_MAX);
    // Base footprint: scales with the room (floor CW_MIN) but stops growing at
    // CW_MAX. cwOpt (the readability pass) overrides that base. Either way the
    // anti-overlap ceiling (W/n)*0.55 is the FINAL clamp.
    var cwBase = Math.min(Math.max(Math.min(L, W) * 0.18, CW_MIN), CW_MAX);
    var cw = Math.min(cwOpt == null ? cwBase : cwOpt, (W / n) * 0.55);
    var ch = cw * 1.3;
    var off = cw * 0.3; // lane separation tied to the cleaner, not the room
    var out = [];
    for (var k = 0; k < n; k++) {
      var cyc = (W * (k + 0.5)) / n;
      out.push({
        x0: L + gap,
        y0: cyc - cw / 2,
        x1: L + gap + cw,
        y1: cyc + cw / 2,
        h: ch,
        laneOut: cyc - off,
        laneRet: cyc + off,
      });
    }
    return out;
  };

  // Architectural details on the room building. All positions are pure,
  // deterministic functions of the eased dims — no randomness — so details morph
  // in lockstep with the room and the drag grips.
  var WIN_POOL = 8;
  var WIN_W = 2.4; // ft — fixed; count scales, size doesn't
  var RTU_DEFS = [
    { fx: 0.66, fy: 0.38, sx: 2.4, sy: 1.8, h: 1.4 },
    { fx: 0.4, fy: 0.7, sx: 1.8, sy: 1.8, h: 1.0 },
    { fx: 0.8, fy: 0.68, sx: 1.4, sy: 1.4, h: 0.8 },
  ];
  // Evenly distributed window centers inside [span0, span1]; count ~len/6 and
  // slot >= 3 ft for n >= 2, so fixed-width windows never overlap.
  var winCenters = function (span0, span1) {
    var S = span1 - span0;
    if (S < WIN_W) return [];
    var n = Math.min(Math.max(Math.floor((S + 3) / 6), 1), WIN_POOL);
    var out = [];
    for (var i = 0; i < n; i++) out.push(span0 + (S * (i + 0.5)) / n);
    return out;
  };
  var layoutDetails = function (L, W, H) {
    var degenerate = L < 3 || W < 3 || H < 3.5;
    // Window rows stack by story as the building grows tall. H=8 -> 1 row,
    // H=16 -> 2, H=24+ -> 3 (cap; taller just stretches the stories).
    var stories = Math.min(Math.max(Math.floor(H / 8), 1), 3);
    var storyH = H / stories;
    var winH = Math.min(3, storyH * 0.4);
    var sills = [];
    for (var r = 0; r < stories; r++) sills.push(r * storyH + Math.min(3, storyH * 0.36));
    var doorOn = !degenerate && L >= 8 && H >= 5; // left wall, near the (L,W) corner
    var doorH = Math.min(6.8, H * 0.8); // the x=L wall carries the lane ends
    var winL = degenerate ? [] : winCenters(1.5, doorOn ? L - 5.5 : L - 1.5);
    var winR = degenerate ? [] : winCenters(1.5, W - 1.5);
    var rtus = [];
    if (!degenerate && Math.min(L, W) >= 5) {
      var count = Math.min(3, 1 + Math.floor(Math.sqrt(L * W) / 14));
      for (var k = 0; k < count; k++) {
        var d = RTU_DEFS[k];
        var sx = Math.min(d.sx, L * 0.28);
        var sy = Math.min(d.sy, W * 0.28);
        // 1.6 ft back margin keeps units clear of the roof edge carrying the
        // width label + grip; 1 ft on the other sides.
        var x0 = Math.max(Math.min(d.fx * L - sx / 2, L - 1 - sx), 1.6);
        var y0 = Math.max(Math.min(d.fy * W - sy / 2, W - 1 - sy), 1);
        rtus.push({ x0: x0, y0: y0, x1: x0 + sx, y1: y0 + sy, h: Math.min(d.h, H * 0.2) });
      }
    }
    // Water tower (very tall + roomy roofs), clamped inside the roof exactly like
    // the RTUs. Antenna mast at the roof center (only the tallest roofs); its tip
    // is a tiny status beacon inheriting --pulse-color like the flow lanes.
    var towerOn = !degenerate && H >= 18 && Math.min(L, W) >= 6;
    var tx0 = Math.max(Math.min(0.25 * L - 1.1, L - 1 - 2.2), 1.6);
    var ty0 = Math.max(Math.min(0.3 * W - 1.1, W - 1 - 2.2), 1);
    var mastOn = !degenerate && H >= 26;
    var mastH = Math.min(6, H * 0.22);
    return {
      degenerate: degenerate,
      stories: stories,
      winH: winH,
      sills: sills,
      doorOn: doorOn,
      doorH: doorH,
      winL: winL,
      winR: winR,
      rtus: rtus,
      towerOn: towerOn,
      tx0: tx0,
      ty0: ty0,
      tx1: tx0 + 2.2,
      ty1: ty0 + 2.2,
      mastOn: mastOn,
      mastH: mastH,
    };
  };

  // Draw the whole scene at the given (already-eased) room dimensions. Every
  // world point is projected, then the entire figure is scaled + centred to fill
  // the frame, so proportions stay truthful at any absolute size.
  var drawScene = function (L, W, H) {
    if (!hasScene) return;
    var n = Math.min(Math.max(1, sceneN), MAX_CLEANERS);
    var det = layoutDetails(L, W, H);

    // Capacity ghost shares the room's origin + ceiling; footprint scaled by
    // capS. Cleaner-independent, so computed once and fed into both fit passes.
    var drawCap = capS > 0.01;
    var gL = L * capS;
    var gW = W * capS;
    // Anchor the ghost at the room's NEAR-bottom corner (L,W) and grow it back
    // toward the origin, so an over-capacity ghost extends away from the viewer
    // instead of over the cleaner buildings in front.
    var gx0 = L - gL;
    var gy0 = W - gW;

    // The fit as a closure so it can run twice: pass 1 with the world-capped
    // cleaner, then — if that cleaner would render below the on-screen
    // readability floor — pass 2 with a wider cleaner. Lot bounds derive from
    // cls[0], so they're computed INSIDE and returned.
    var computeFit = function (cls) {
      var maxX1 = L;
      var maxY1 = W;
      for (var q = 0; q < cls.length; q++) {
        maxX1 = Math.max(maxX1, cls[q].x1);
        maxY1 = Math.max(maxY1, cls[q].y1);
      }
      var c0 = cls[0];
      var margin = Math.max(c0.x1 - c0.x0, c0.x0 - L) * 0.9 + 1;
      var lotX0 = -margin;
      var lotY0 = -margin;
      var lotX1 = maxX1 + margin;
      var lotY1 = maxY1 + margin;

      // Collect every world point that must be on-screen, then fit.
      var fitPts = [];
      var box = function (x0, y0, x1, y1, z1) {
        var corners = [
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ];
        for (var i = 0; i < 4; i++) {
          fitPts.push(project(corners[i][0], corners[i][1], 0));
          fitPts.push(project(corners[i][0], corners[i][1], z1));
        }
      };
      box(0, 0, L, W, H);
      for (var u = 0; u < det.rtus.length; u++) {
        var rt = det.rtus[u];
        box(rt.x0, rt.y0, rt.x1, rt.y1, H + rt.h);
      }
      // Tower + mast poke above the roof — feed their tops into the fit so a very
      // tall building's rooftop hardware never clips against the safe area.
      if (det.towerOn) box(det.tx0, det.ty0, det.tx1, det.ty1, H + 4.8);
      if (det.mastOn) box(L / 2, W / 2, L / 2, W / 2, H + det.mastH);
      for (var ci = 0; ci < cls.length; ci++) {
        var c = cls[ci];
        box(c.x0, c.y0, c.x1, c.y1, c.h);
      }
      // Feed the ghost into the fit so the whole ghost stays inside the safe area
      // (when it's larger than the room, it's what drives the fit).
      if (drawCap) box(gx0, gy0, L, W, H);
      var lot = [
        [lotX0, lotY0],
        [lotX1, lotY0],
        [lotX1, lotY1],
        [lotX0, lotY1],
      ];
      for (var li = 0; li < 4; li++) fitPts.push(project(lot[li][0], lot[li][1], 0));

      var minX = Infinity;
      var maxX = -Infinity;
      var minY = Infinity;
      var maxY = -Infinity;
      for (var fi = 0; fi < fitPts.length; fi++) {
        var p = fitPts[fi];
        if (p[0] < minX) minX = p[0];
        if (p[0] > maxX) maxX = p[0];
        if (p[1] < minY) minY = p[1];
        if (p[1] > maxY) maxY = p[1];
      }
      var scale = Math.min(safe.w / (maxX - minX || 1), safe.h / (maxY - minY || 1), MAX_SCALE);
      var ox = safe.x + (safe.w - (maxX - minX) * scale) / 2 - minX * scale;
      var oy = safe.y + (safe.h - (maxY - minY) * scale) / 2 - minY * scale;
      return {
        scale: scale,
        ox: ox,
        oy: oy,
        lotX0: lotX0,
        lotY0: lotY0,
        lotX1: lotX1,
        lotY1: lotY1,
      };
    };

    // Pass 1: world-capped cleaner. If that footprint would paint below
    // UNIT_MIN_PX on screen, re-lay it wider in WORLD units and re-fit once. The
    // 1.1 headroom compensates for pass 2's slightly smaller scale.
    var cleaners = layoutCleaners(L, W, n);
    var fit = computeFit(cleaners);
    var cw1 = cleaners[0].x1 - cleaners[0].x0;
    if (cw1 * fit.scale < UNIT_MIN_PX) {
      cleaners = layoutCleaners(L, W, n, (UNIT_MIN_PX * 1.1) / fit.scale);
      fit = computeFit(cleaners);
    }
    var scale = fit.scale;
    var ox = fit.ox;
    var oy = fit.oy;
    fitScale = scale;
    var w = function (x, y, z) {
      var p = project(x, y, z);
      return [ox + p[0] * scale, oy + p[1] * scale];
    };

    // Ground lot (the city block) — sits on the dot paper behind it.
    setPoly('[data-ground]', [
      w(fit.lotX0, fit.lotY0, 0),
      w(fit.lotX1, fit.lotY0, 0),
      w(fit.lotX1, fit.lotY1, 0),
      w(fit.lotX0, fit.lotY1, 0),
    ]);

    // Room building — top + the two near walls.
    setPoly('[data-room="top"]', [w(0, 0, H), w(L, 0, H), w(L, W, H), w(0, W, H)]);
    setPoly('[data-room="left"]', [w(0, W, H), w(L, W, H), w(L, W, 0), w(0, W, 0)]);
    setPoly('[data-room="right"]', [w(L, 0, H), w(L, W, H), w(L, W, 0), w(L, 0, 0)]);

    // Architectural details — re-derived every frame from the eased dims. The
    // 0.22 lerp is monotone (no overshoot), so a count steps through each
    // threshold exactly once per morph — windows pop in one at a time, never
    // flicker. Window rows STACK by story, addressing slot s = r*8 + c + 1 in the
    // 24-per-wall pool.
    if (detailsG) detailsG.style.visibility = det.degenerate ? 'hidden' : '';
    if (!det.degenerate) {
      var hw = WIN_W / 2;
      for (var r = 0; r < 3; r++) {
        var rowOn = r < det.stories;
        var z0 = det.sills[r] == null ? 0 : det.sills[r];
        var z1 = z0 + det.winH;
        for (var c2 = 0; c2 < WIN_POOL; c2++) {
          var s = r * 8 + c2 + 1;
          var cl = det.winL[c2]; // left wall: y = W plane
          var onL = rowOn && cl != null;
          setDetail(
            '[data-win-l="' + s + '"]',
            onL,
            onL
              ? [w(cl - hw, W, z1), w(cl + hw, W, z1), w(cl + hw, W, z0), w(cl - hw, W, z0)]
              : undefined
          );
          var cr = det.winR[c2]; // right wall: x = L plane
          var onR = rowOn && cr != null;
          setDetail(
            '[data-win-r="' + s + '"]',
            onR,
            onR
              ? [w(L, cr - hw, z1), w(L, cr + hw, z1), w(L, cr + hw, z0), w(L, cr - hw, z0)]
              : undefined
          );
        }
      }
      setDetail(
        '[data-door]',
        det.doorOn,
        det.doorOn
          ? [w(L - 4.5, W, det.doorH), w(L - 1.5, W, det.doorH), w(L - 1.5, W, 0), w(L - 4.5, W, 0)]
          : undefined
      );
      var pin = Math.min(0.9, 0.15 * Math.min(L, W)); // parapet inset line
      setPoly('[data-parapet]', [
        w(pin, pin, H),
        w(L - pin, pin, H),
        w(L - pin, W - pin, H),
        w(pin, W - pin, H),
      ]);
      for (var k2 = 0; k2 < 3; k2++) {
        var u2 = det.rtus[k2];
        var g = svg.querySelector('[data-rtu="' + (k2 + 1) + '"]');
        if (g) g.style.visibility = u2 ? '' : 'hidden';
        if (!u2) continue;
        var zt = H + u2.h; // same 3-face mini-box pattern as the cleaner units
        setPoly('[data-rtu="' + (k2 + 1) + '"] [data-rtu-face="top"]', [
          w(u2.x0, u2.y0, zt),
          w(u2.x1, u2.y0, zt),
          w(u2.x1, u2.y1, zt),
          w(u2.x0, u2.y1, zt),
        ]);
        setPoly('[data-rtu="' + (k2 + 1) + '"] [data-rtu-face="left"]', [
          w(u2.x0, u2.y1, zt),
          w(u2.x1, u2.y1, zt),
          w(u2.x1, u2.y1, H),
          w(u2.x0, u2.y1, H),
        ]);
        setPoly('[data-rtu="' + (k2 + 1) + '"] [data-rtu-face="right"]', [
          w(u2.x1, u2.y0, zt),
          w(u2.x1, u2.y1, zt),
          w(u2.x1, u2.y1, H),
          w(u2.x1, u2.y0, H),
        ]);
      }

      // Water tower — legs from the tank's two VISIBLE bottom corners down to the
      // roof, then the same 3-face mini-box as the RTUs, raised on the legs.
      var towerG = svg.querySelector('[data-tower]');
      if (towerG) towerG.style.visibility = det.towerOn ? '' : 'hidden';
      if (det.towerOn) {
        var setLine2 = function (sel, p, q) {
          var el = svg.querySelector(sel);
          if (!el) return;
          el.setAttribute('x1', p[0].toFixed(1));
          el.setAttribute('y1', p[1].toFixed(1));
          el.setAttribute('x2', q[0].toFixed(1));
          el.setAttribute('y2', q[1].toFixed(1));
        };
        setLine2('[data-tower-leg="1"]', w(det.tx0, det.ty1, H + 2.2), w(det.tx0, det.ty1, H));
        setLine2('[data-tower-leg="2"]', w(det.tx1, det.ty0, H + 2.2), w(det.tx1, det.ty0, H));
        var zb = H + 2.2;
        var ztt = H + 4.8; // tank bottom + top
        setPoly('[data-tower-face="top"]', [
          w(det.tx0, det.ty0, ztt),
          w(det.tx1, det.ty0, ztt),
          w(det.tx1, det.ty1, ztt),
          w(det.tx0, det.ty1, ztt),
        ]);
        setPoly('[data-tower-face="left"]', [
          w(det.tx0, det.ty1, ztt),
          w(det.tx1, det.ty1, ztt),
          w(det.tx1, det.ty1, zb),
          w(det.tx0, det.ty1, zb),
        ]);
        setPoly('[data-tower-face="right"]', [
          w(det.tx1, det.ty0, ztt),
          w(det.tx1, det.ty1, ztt),
          w(det.tx1, det.ty1, zb),
          w(det.tx1, det.ty0, zb),
        ]);
      }

      // Antenna mast — a line up from the roof center with a status-beacon tip.
      var mastG = svg.querySelector('[data-mast]');
      if (mastG) mastG.style.visibility = det.mastOn ? '' : 'hidden';
      if (det.mastOn) {
        var base = w(L / 2, W / 2, H);
        var top = w(L / 2, W / 2, H + det.mastH);
        var line = svg.querySelector('[data-mast-line]');
        if (line) {
          line.setAttribute('x1', base[0].toFixed(1));
          line.setAttribute('y1', base[1].toFixed(1));
          line.setAttribute('x2', top[0].toFixed(1));
          line.setAttribute('y2', top[1].toFixed(1));
        }
        var tip = svg.querySelector('[data-mast-tip]');
        if (tip) {
          tip.setAttribute('cx', top[0].toFixed(1));
          tip.setAttribute('cy', top[1].toFixed(1));
        }
      }
    }

    // Capacity ghost — same three faces as the room at the scaled footprint, so
    // it reads as a room drawn over the actual room. Group visibility is owned by
    // recompute().
    if (drawCap) {
      setPoly('[data-cap="top"]', [w(gx0, gy0, H), w(L, gy0, H), w(L, W, H), w(gx0, W, H)]);
      setPoly('[data-cap="left"]', [w(gx0, W, H), w(L, W, H), w(L, W, 0), w(gx0, W, 0)]);
      setPoly('[data-cap="right"]', [w(L, gy0, H), w(L, W, H), w(L, W, 0), w(L, gy0, 0)]);
      // Label near the ghost's far-back top corner, nudged up-right.
      var capPt = w(gx0, gy0, H);
      var prefix = capClamped ? '≥' : '';
      // Match the result's unit toggle: ft² floor area (default) or ft³ volume.
      var capFt3 = raw('units') === 'ft3';
      var capText = capFt3 ? fmt(capMaxVol, 0) + ' ft³' : fmt(capMaxVol / 8, 0) + ' ft²';
      setLabel('capacity', [capPt[0] + 6, capPt[1] - 8], 'covers a room up to ' + prefix + capText);
    }

    // Per cleaner: its street + lanes group (behind the room) and its building
    // group (in front). Groups beyond n are hidden via style.visibility — NOT
    // display: a lane's wave stroke is a paint server (url(#…-grad)) resolved
    // once, and WebKit can leave a group that was ever display:none unpainted
    // after it's shown again, so added cleaners' lanes never animate.
    returnPaths.length = 0;
    outPaths.length = 0;
    for (var i2 = 0; i2 < MAX_CLEANERS; i2++) {
      var laneG = svg.querySelector('.smaqmd-cityview__lanes[data-lanes="' + (i2 + 1) + '"]');
      var unitG = svg.querySelector('.smaqmd-cityview__unitg[data-unitg="' + (i2 + 1) + '"]');
      var on = i2 < n;
      // Belt-and-braces for the same WebKit quirk: when a lane group goes
      // hidden->shown, re-assert each wave polyline's inline stroke so WebKit
      // re-resolves the paint server on the now-visible element.
      var wasHidden = laneG && laneG.style.visibility === 'hidden';
      if (laneG) laneG.style.visibility = on ? '' : 'hidden';
      if (unitG) unitG.style.visibility = on ? '' : 'hidden';
      if (laneG && on && wasHidden) {
        var waveEls = laneG.querySelectorAll('.smaqmd-cityview__wave');
        for (var wi = 0; wi < waveEls.length; wi++) {
          waveEls[wi].style.stroke = waveEls[wi].style.stroke;
        }
      }
      if (!on) {
        returnPaths[i2] = [];
        outPaths[i2] = [];
        continue;
      }
      var cc = cleaners[i2];

      // Street: road surface from the room's wall to the cleaner, then the two
      // straight iso lanes (out runs room->cleaner, return runs cleaner->room).
      var setLaneG = (function (lg) {
        return function (sel, pts) {
          var el = lg ? lg.querySelector(sel) : null;
          if (el) el.setAttribute('points', ptsAttr(pts));
        };
      })(laneG);
      var cyc2 = (cc.laneOut + cc.laneRet) / 2; // road runs down the lane centerline
      setLaneG('[data-road]', [w(L, cyc2, 0), w(cc.x0, cyc2, 0)]);
      var outPath = [w(L, cc.laneOut, 0), w(cc.x0, cc.laneOut, 0)]; // room -> cleaner
      setLaneG('[data-flow="out-track"]', outPath);
      setLaneG('[data-flow="out-wave"]', outPath);
      var returnPath = [w(cc.x0, cc.laneRet, 0), w(L, cc.laneRet, 0)]; // cleaner -> room
      setLaneG('[data-flow="return-track"]', returnPath);
      setLaneG('[data-flow="wave"]', returnPath);
      outPaths[i2] = outPath;
      returnPaths[i2] = returnPath;

      // Air-cleaner building — same three faces, small.
      var setUnitG = (function (ug) {
        return function (sel, pts) {
          var el = ug ? ug.querySelector(sel) : null;
          if (el) el.setAttribute('points', ptsAttr(pts));
        };
      })(unitG);
      setUnitG('[data-unit="top"]', [
        w(cc.x0, cc.y0, cc.h),
        w(cc.x1, cc.y0, cc.h),
        w(cc.x1, cc.y1, cc.h),
        w(cc.x0, cc.y1, cc.h),
      ]);
      setUnitG('[data-unit="left"]', [
        w(cc.x0, cc.y1, cc.h),
        w(cc.x1, cc.y1, cc.h),
        w(cc.x1, cc.y1, 0),
        w(cc.x0, cc.y1, 0),
      ]);
      setUnitG('[data-unit="right"]', [
        w(cc.x1, cc.y0, cc.h),
        w(cc.x1, cc.y1, cc.h),
        w(cc.x1, cc.y1, 0),
        w(cc.x1, cc.y0, 0),
      ]);
    }

    // Dimension labels around the room's LEFT-front corner (0,W) — away from the
    // street on the right, so nothing collides.
    var lm = mid(w(0, W, 0), w(L, W, 0));
    setLabel('length', [lm[0] - 4, lm[1] + 20], fmt(L, 1) + ' ft');
    // Width rides the ROOF back-left edge (z=H), so it meets the top of the height
    // edge at (0,W,H) — reading as height going up, then width across.
    var wm = mid(w(0, 0, H), w(0, W, H));
    setLabel('width', [wm[0] - 12, wm[1] - 12], fmt(W, 1) + ' ft');
    var hm = mid(w(0, W, 0), w(0, W, H));
    setLabel('height', [hm[0] - 26, hm[1]], fmt(H, 1) + ' ft');

    // Drag grips: an invisible fat hit-line along each dimension's edge + a
    // visible knob at the edge midpoint. Positioned every draw so they track the
    // morphing room.
    var HANDLE_DEG = { length: 30, width: 150, height: 90 };
    var setLine = function (dim, p, q) {
      var lineEl = svg.querySelector('.smaqmd-cityview__hit[data-grip="' + dim + '"]');
      if (lineEl) {
        lineEl.setAttribute('x1', p[0].toFixed(1));
        lineEl.setAttribute('y1', p[1].toFixed(1));
        lineEl.setAttribute('x2', q[0].toFixed(1));
        lineEl.setAttribute('y2', q[1].toFixed(1));
      }
      var m = mid(p, q);
      var handle = svg.querySelector('.smaqmd-cityview__handle[data-grip="' + dim + '"]');
      if (handle) {
        handle.setAttribute(
          'transform',
          'translate(' + m[0].toFixed(1) + ' ' + m[1].toFixed(1) + ') rotate(' + HANDLE_DEG[dim] + ')'
        );
      }
    };
    setLine('length', w(0, W, 0), w(L, W, 0));
    setLine('width', w(0, 0, H), w(0, W, H)); // roof back-left edge
    setLine('height', w(0, W, 0), w(0, W, H));
  };

  /* ---- animation loop: room morph + a scrolling gradient wave on the lane ----
     Time scale: HOUR_SECONDS of wall-clock = one hour. Each bright wave sweeping
     the return lane (filter -> room) is one air change, so a fresh wave leaves
     the filter every HOUR_SECONDS / ACH seconds (ACH 2 -> every 2.5s). */
  var HOUR_SECONDS = 5;
  var TRAVEL = 2.2; // seconds for one wave to cross the lane
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = { L: 12, W: 10, H: 8 };
  var tgt = { L: 12, W: 10, H: 8 };
  // Capacity ghost: the eased footprint scale (capS) toward its target (capSTgt)
  // = sqrt(maxVol / roomVol) clamped to 3 for the DRAWING only (the stats keep
  // the true maxVol); 0 hides the ghost. Set in recompute().
  var capS = 0;
  var capSTgt = 0;
  var capMaxVol = 0; // true (un-clamped) largest coverable volume, for the label
  var capClamped = false; // whether the drawn scale hit the 3x clamp
  var capG = svg.querySelector('[data-capg]');
  // Per-cleaner air-change cadence: laneAch[i] = that cleaner's flow x 60 / room
  // volume. Zero (blank cleaner) -> faint tracks, no wave on that street.
  var laneAch = [];
  var stateNow = 'idle'; // idle | pass | fail (aggregate tint)
  var running = false;
  var last = 0;
  // One wave entry per lane — return + intake for each of the MAX_CLEANERS
  // streets (8 total). Each carries its own scroll phase and its cleaner index.
  var waves = [];
  if (hasScene) {
    for (var gi = 0; gi < MAX_CLEANERS; gi++) {
      (function (i) {
        waves.push({
          grad: svg.querySelector('[data-return-grad="' + (i + 1) + '"]'),
          path: function () {
            return returnPaths[i] || [];
          },
          idx: i,
          phase: 0,
        });
        waves.push({
          grad: svg.querySelector('[data-out-grad="' + (i + 1) + '"]'),
          path: function () {
            return outPaths[i] || [];
          },
          idx: i,
          phase: 0,
        });
      })(gi);
    }
  }
  var animating = function () {
    return stateNow !== 'idle' && !reduced;
  };

  // Scroll each cleaner's repeating gradient along its (possibly morphed) lane by
  // moving the gradient start; spreadMethod="repeat" tiles the rest. One repeat
  // (wavelength wl) passes a point every HOUR_SECONDS / ACH_i seconds — one air
  // change for THAT cleaner. Skip lanes past sceneN or with no flow.
  var updateWave = function (dt) {
    if (stateNow === 'idle') return;
    for (var i = 0; i < waves.length; i++) {
      var wv = waves[i];
      if (!wv.grad) continue;
      if (wv.idx >= sceneN) continue;
      var ach = laneAch[wv.idx];
      if (!ach || !isFinite(ach)) continue;
      var path = wv.path();
      if (path.length < 2) continue;
      var interval = Math.max(0.3, Math.min(20, HOUR_SECONDS / ach));
      var P0 = path[0];
      var P1 = path[path.length - 1];
      var dx = P1[0] - P0[0];
      var dy = P1[1] - P0[1];
      var Ln = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / Ln;
      var uy = dy / Ln;
      var v = Ln / TRAVEL; // px/s a wave head travels
      var wl = Math.max(8, v * interval); // px between successive waves
      wv.phase = reduced ? 0 : (wv.phase + v * dt) % wl;
      var sx = P0[0] + ux * wv.phase;
      var sy = P0[1] + uy * wv.phase;
      wv.grad.setAttribute('x1', sx.toFixed(1));
      wv.grad.setAttribute('y1', sy.toFixed(1));
      wv.grad.setAttribute('x2', (sx + ux * wl).toFixed(1));
      wv.grad.setAttribute('y2', (sy + uy * wl).toFixed(1));
    }
  };

  var frame = function (ts) {
    // A crossing into narrow can land mid-loop; drop out on the next tick rather
    // than waiting for the morph to finish against a hidden scene.
    if (!sceneLive) {
      running = false;
      return;
    }
    var dt = Math.min(0.05, (ts - last) / 1000 || 0);
    last = ts;

    // Ease the room toward the entered dimensions, and the capacity ghost's
    // footprint scale toward its target, so the ghost grows/shrinks in step.
    cur.L += (tgt.L - cur.L) * 0.22;
    cur.W += (tgt.W - cur.W) * 0.22;
    cur.H += (tgt.H - cur.H) * 0.22;
    capS += (capSTgt - capS) * 0.22;
    var morphing =
      Math.abs(tgt.L - cur.L) +
        Math.abs(tgt.W - cur.W) +
        Math.abs(tgt.H - cur.H) +
        Math.abs(capSTgt - capS) >=
      0.01;
    if (!morphing) {
      cur.L = tgt.L;
      cur.W = tgt.W;
      cur.H = tgt.H;
      capS = capSTgt;
    }
    drawScene(cur.L, cur.W, cur.H);

    updateWave(dt);

    if (morphing || animating()) requestAnimationFrame(frame);
    else running = false;
  };
  var startLoop = function () {
    if (!sceneLive || running) return; /* sceneLive already implies hasScene */
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  };

  /* ---- room size across the three entry modes ----
     roomVolume(): the true volume for the ACH math, per the chosen method.
     sceneBox(): a drawable LxWxH box for the isometric scene, derived from
     whatever the mode gives — area/volume modes have no real footprint, so we
     draw a square room of the equivalent size with a standard ceiling. The 0.5
     fallbacks keep the scene alive while fields are blank. */
  var roomVolume = function () {
    switch (raw('roomMethod')) {
      case 'dimensions':
        return num('length') * num('width') * num('height');
      case 'area':
        return num('area') * num('height');
      case 'volume':
        return num('volume');
      default:
        return NaN;
    }
  };
  // roomArea(): the room's FLOOR AREA in ft² — the relatable unit for the result
  // (people picture square feet, not cubic feet). Exact from LxW or an entered
  // area; in volume-only mode there's no footprint, so approximate at a standard
  // 8 ft ceiling (the same assumption the coverage figure uses).
  var roomArea = function () {
    switch (raw('roomMethod')) {
      case 'dimensions': {
        var a = pos('length') * pos('width');
        return a > 0 ? a : NaN;
      }
      case 'area':
        return pos('area');
      case 'volume': {
        var v = pos('volume');
        return v > 0 ? v / 8 : NaN;
      }
      default:
        return NaN;
    }
  };
  var sceneBox = function () {
    var method = raw('roomMethod');
    if (method === 'area') {
      var area = pos('area');
      var Ha = pos('height') || 8;
      var sideA = isFinite(area) ? Math.sqrt(area) : 0.5;
      return { L: sideA || 0.5, W: sideA || 0.5, H: Ha };
    }
    if (method === 'volume') {
      var vol = pos('volume');
      var Hv = 8;
      var sideV = isFinite(vol) ? Math.sqrt(vol / Hv) : 0.5;
      return { L: sideV || 0.5, W: sideV || 0.5, H: Hv };
    }
    return { L: pos('length') || 0.5, W: pos('width') || 0.5, H: pos('height') || 0.5 };
  };
  var morphScene = function () {
    var b = sceneBox();
    tgt.L = b.L;
    tgt.W = b.W;
    tgt.H = b.H;
    startLoop();
  };

  /* ---- scene pause across the breakpoint ----
     Going narrow: flipping sceneLive is enough — frame() bails on its next tick
     and startLoop() refuses to restart, so nothing runs while the scene is
     hidden. Coming back wide, two things are stale and both are SNAPPED rather
     than replayed: the eased room box and the capacity ghost's scale, which would
     otherwise animate from wherever the loop happened to stop to wherever the
     inputs now say — a morph the user never triggered, of a scene they were not
     looking at. Then refit (the container was 0x0 while hidden, and the window
     has by definition just been resized) and restart the waves via morphScene,
     which ends in startLoop(). */
  if (isResponsive && hasScene) {
    mqMobile.addEventListener('change', function () {
      var live = !mqMobile.matches;
      if (live === sceneLive) return;
      sceneLive = live;
      if (!live) return;
      cur.L = tgt.L;
      cur.W = tgt.W;
      cur.H = tgt.H;
      capS = capSTgt;
      syncViewport();
      morphScene();
    });
  }

  /* ---- air-cleaner list (add / remove any number, capped at MAX_CLEANERS) ---- */
  var cleanersHost = root.querySelector('[data-cleaners]');
  var template = root.querySelector('[data-cleaner-template]');
  var cleanerBlocks = function () {
    return qa('[data-cleaner-block]:not([data-removing])');
  };
  var nextId = 0;

  // Fields duplicated when copying a cleaner — air cleaners are assumed identical
  // by default, so an added one inherits the last one's reported values.
  var CLEANER_FIELDS = ['unit', 'airflow', 'ach', 'refLength', 'refWidth', 'refHeight'];

  // PORT-ONLY. The Astro template's controls were custom elements addressed
  // entirely by data-* attributes; native controls carry two kinds of
  // document-unique reference that a clone would duplicate:
  //   - id / label[for] / aria-describedby — a duplicated id silently re-points
  //     the SECOND block's label at the FIRST block's field.
  //   - a radio's `name` — two blocks sharing one name are ONE radio group, so
  //     choosing "ACH" in cleaner 2 would clear cleaner 1.
  // Suffixing all of them with the block id keeps each block independent.
  var uniquifyBlock = function (frag, sfx) {
    var withId = frag.querySelectorAll('[id]');
    for (var i = 0; i < withId.length; i++) withId[i].id = withId[i].id + '-' + sfx;
    var withFor = frag.querySelectorAll('label[for]');
    for (var j = 0; j < withFor.length; j++) {
      withFor[j].setAttribute('for', withFor[j].getAttribute('for') + '-' + sfx);
    }
    var withDesc = frag.querySelectorAll('[aria-describedby]');
    for (var k = 0; k < withDesc.length; k++) {
      withDesc[k].setAttribute(
        'aria-describedby',
        withDesc[k]
          .getAttribute('aria-describedby')
          .split(/\s+/)
          .map(function (t) {
            return t + '-' + sfx;
          })
          .join(' ')
      );
    }
    var radios = frag.querySelectorAll('[type="radio"][name]');
    for (var m = 0; m < radios.length; m++) radios[m].name = radios[m].name + '-' + sfx;
  };

  // Reveal a newly added block with an ease-out expand — the enter mirror of
  // removeCleaner's collapse. Collapse is applied synchronously (no full-height
  // flash), then measured on the next frame and expanded to that height. Reduced
  // motion -> instant, matching remove.
  var animateIn = function (b) {
    if (reduced) return;
    b.style.overflow = 'hidden';
    b.style.boxSizing = 'border-box';
    b.style.blockSize = '0';
    b.style.opacity = '0';
    requestAnimationFrame(function () {
      var target = b.scrollHeight;
      var dur = 200;
      b.style.transition = 'block-size ' + dur + 'ms ease-out, opacity ' + dur + 'ms ease-out';
      b.style.blockSize = target + 'px';
      b.style.opacity = '1';
      var done = false;
      var clear = function () {
        if (done) return;
        done = true;
        b.style.transition = '';
        b.style.overflow = '';
        b.style.boxSizing = '';
        b.style.blockSize = '';
        b.style.opacity = '';
      };
      b.addEventListener('transitionend', function (e) {
        if (e.propertyName === 'block-size' || e.propertyName === 'height') clear();
      });
      window.setTimeout(clear, dur + 80);
    });
  };

  var addCleaner = function (opts) {
    var existing = cleanerBlocks();
    if (existing.length >= MAX_CLEANERS) return;
    // Copy from the last existing cleaner so its values replicate into the new
    // one. If that cleaner is blank (e.g. the initial one), the new one is blank
    // too — hence "blank for the first new one, replicate once you've entered it".
    var lastBlock = existing[existing.length - 1];
    var srcId =
      opts && opts.copyLast && lastBlock ? lastBlock.getAttribute('data-cleaner-block') : undefined;
    var frag = template.content.cloneNode(true);
    var b = frag.querySelector('[data-cleaner-block]');
    var id = String(++nextId);
    b.setAttribute('data-cleaner-block', id);
    var tagged = b.querySelectorAll('[data-cleaner]');
    for (var t = 0; t < tagged.length; t++) tagged[t].setAttribute('data-cleaner', id);
    uniquifyBlock(b, id);
    if (srcId) {
      for (var f = 0; f < CLEANER_FIELDS.length; f++) {
        var name = CLEANER_FIELDS[f];
        var val = raw(name, srcId);
        if (!val) continue;
        presetField(b.querySelector('[data-field="' + name + '"][data-cleaner]'), val);
      }
    }
    cleanersHost.appendChild(frag);
    if (opts && opts.animate) animateIn(b);
  };

  // The initial cleaner boots blank, so the tool opens on the "no cleaner yet ->
  // here's the minimum CADR to look for" state.
  var resetCleaners = function () {
    cleanersHost.replaceChildren();
    nextId = 0;
    addCleaner();
  };

  // Collapse the clicked block in place so the eye tracks WHICH cleaner leaves.
  // It's excluded from cleanerBlocks() the moment it starts collapsing, so the
  // scene + result update immediately while the row animates out.
  var removeCleaner = function (b) {
    b.setAttribute('data-removing', '');
    var finishNow = function () {
      b.remove();
      morphScene();
      recompute();
    };
    if (reduced) {
      finishNow();
      return;
    }
    var startHeight = b.offsetHeight;
    b.style.overflow = 'hidden';
    b.style.boxSizing = 'border-box';
    b.style.blockSize = startHeight + 'px';
    b.getBoundingClientRect(); // flush the start height before transitioning
    var duration = 180;
    b.style.transition =
      'block-size ' + duration + 'ms ease, opacity ' + duration + 'ms ease, ' +
      'padding-block ' + duration + 'ms ease, margin-block ' + duration + 'ms ease, ' +
      'border-block ' + duration + 'ms ease';
    b.style.blockSize = '0';
    b.style.opacity = '0';
    b.style.paddingBlock = '0';
    b.style.marginBlock = '0';
    b.style.borderBlock = '0';
    var done = false;
    var finish = function () {
      if (done) return;
      done = true;
      finishNow();
    };
    b.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'block-size' || e.propertyName === 'height') finish();
    });
    window.setTimeout(finish, duration + 60);
    recompute(); // update the readout now, before the collapse finishes
  };

  /* ---- visibility sync (room-mode wrappers, entry-mode flag, cleaner chrome) ---- */
  var showEl = function (el, on) {
    if (el) el.hidden = !on;
  };
  var syncVisibility = function () {
    // Room-entry field wrappers matching the chosen method.
    var method = raw('roomMethod') || 'dimensions';
    qa('[data-room]').forEach(function (el) {
      showEl(el, el.getAttribute('data-room').split(' ').indexOf(method) !== -1);
    });
    // Entry-mode flag drives the CSS grip gate (dimensions-only draggable edges).
    container.dataset.entryMode = method;

    // The intent fork: hide the whole cleaner-entry UI when the user says they
    // have none ("No"). combinedFlow() below reads the same flag, so hidden
    // cleaners contribute nothing and the result falls through to shop mode.
    showEl(root.querySelector('[data-cleaner-entry]'), raw('hasCleaner') !== 'no');

    // Per-cleaner: renumber the title + remove-button label, show Remove only when
    // >1 cleaner. Then toggle the Add button + cap note against the cap.
    var blocks = cleanerBlocks();
    blocks.forEach(function (b, i) {
      var title = b.querySelector('.smaqmd-aerb__cleaner-title');
      if (title) title.textContent = 'Air cleaner ' + (i + 1);
      var rm = b.querySelector('[data-remove-cleaner]');
      showEl(rm, blocks.length > 1);
      // PORT: the lego took a `label` prop; the native icon button is named by
      // aria-label. Contextual, so "Remove" alone never announces ambiguously.
      var btn = rm ? rm.querySelector('button') : null;
      if (btn) btn.setAttribute('aria-label', 'Remove air cleaner ' + (i + 1));
      // Per-cleaner unit mode: show the airflow or the ACH sub-form.
      var unitMode = raw('unit', b.getAttribute('data-cleaner-block'));
      showEl(b.querySelector('[data-unit-mode="airflow"]'), unitMode !== 'ach');
      showEl(b.querySelector('[data-unit-mode="ach"]'), unitMode === 'ach');
    });
    var atCap = blocks.length >= MAX_CLEANERS;
    showEl(root.querySelector('[data-add-cleaner]'), !atCap);
    showEl(root.querySelector('[data-cap-note]'), atCap);
  };

  /* ---- result + flow state ---- */
  var block = root.querySelector('[data-result]');
  var setMetric = function (name, html) {
    var el = root.querySelector('[data-metric="' + name + '"] .esa-stat__value');
    // innerHTML: callers pass computed numbers + an optional unit <span>, never user input.
    if (el) el.innerHTML = html;
  };
  // A stat value's unit, rendered smaller than the number (leading space kept
  // inside the span so screen readers still read "32 ft³/min").
  var unitSpan = function (u) {
    return '<span class="smaqmd-aerb__unit"> ' + u + '</span>';
  };
  var setReadout = function (name, text) {
    var els = block.querySelectorAll('[data-r="' + name + '"]');
    for (var i = 0; i < els.length; i++) els[i].textContent = text;
  };
  var show = function (el, on) {
    if (!el) return;
    var wasHidden = el.hidden;
    el.hidden = !on;
    // A [data-alert] block is a VISIBLE message, not a live region — announcing it
    // here keeps the two announcer regions the only ones on the page (SC 4.1.3),
    // and only on the hidden -> visible edge so a recompute does not re-announce.
    if (on && wasHidden && el.hasAttribute('data-alert')) {
      kitAnnounce((el.textContent || '').trim(), {
        assertive: el.getAttribute('data-alert') === 'assertive',
      });
    }
  };

  // Clean-air flow (ft³/min) for one cleaner block; blank/partial -> 0 so empty
  // rows never block the result. In airflow mode the reported flow is used
  // directly; in ACH mode the flow is derived from the reported ACH x the
  // manufacturer's reference room volume (LxWx(H||8)) / 60.
  var cleanerFlow = function (id) {
    var f;
    if (raw('unit', id) === 'ach') {
      var refVol = num('refLength', id) * num('refWidth', id) * (pos('refHeight', id) || 8);
      f = (pos('ach', id) * refVol) / 60;
    } else {
      f = pos('airflow', id);
    }
    return isFinite(f) && f > 0 ? f : 0;
  };
  // "No cleaner to check" (the intro fork) -> zero flow regardless of any stale
  // values in the hidden blocks, so the result falls through to shop mode.
  var hasCleaners = function () {
    return raw('hasCleaner') !== 'no';
  };
  var combinedFlow = function () {
    return hasCleaners()
      ? cleanerBlocks().reduce(function (sum, b) {
          return sum + cleanerFlow(b.getAttribute('data-cleaner-block'));
        }, 0)
      : 0;
  };

  var showGroup = function (name, on) {
    show(block.querySelector('[data-group="' + name + '"]'), on);
  };

  // Information card — show exactly one verdict alert (pass / fail / shop), or
  // none. Separate from the answer headline's own data-verdict (which tints the
  // heading); these are the boxed callouts under the hero.
  var setVerdictCard = function (state) {
    var cards = block.querySelectorAll('[data-verdict-card]');
    for (var i = 0; i < cards.length; i++) {
      show(cards[i], cards[i].getAttribute('data-verdict-card') === state);
    }
  };

  var answerG = block.querySelector('[data-group="answer"]');
  var answerTitle = block.querySelector('[data-answer-title]');
  // Target alerts live on the target STEP (outside [data-result]), so query them
  // on root — not block, which is the result subtree (they'd never resolve).
  var targetWarn = root.querySelector('[data-target-warn]');
  var targetInvalid = root.querySelector('[data-target-invalid]');
  var achWrap = block.querySelector('[data-metric="ach"]');
  var fixWrap = block.querySelector('[data-metric="fix"]');
  var cadrHighEl = block.querySelector('[data-cadr-high]');
  var setAnswer = function (title, verdict) {
    if (answerTitle) answerTitle.textContent = title;
    if (answerG) {
      if (verdict) answerG.setAttribute('data-verdict', verdict);
      else answerG.removeAttribute('data-verdict');
      show(answerG, verdict != null);
    }
  };

  // Debounced polite announcer: a one-sentence summary written 600 ms after the
  // last change (drag gestures don't chatter), and only when the text differs.
  var announceTimer = 0;
  var lastAnnounce = '';
  var announce = function (msg) {
    window.clearTimeout(announceTimer);
    announceTimer = window.setTimeout(function () {
      if (msg !== lastAnnounce) {
        kitAnnounce(msg);
        lastAnnounce = msg;
      }
    }, 600);
  };

  var recompute = function () {
    syncVisibility();

    var blocks = cleanerBlocks();
    // Effective cleaner count: how many the CADR-to-buy is split across. A shopper
    // with no cleaner ("No") is buying ONE, so the divisor is 1 no matter how many
    // stale blocks linger; a checker splits across the blocks they entered.
    var cleanerCount = hasCleaners() ? Math.max(1, blocks.length) : 1;
    sceneN = Math.min(Math.max(1, blocks.length), MAX_CLEANERS);
    var target = pos('target') || 2;
    setReadout('target', fmt(target, 2));
    // A target of 0 (or less) is not a real goal — it's blocked (invalid). A
    // positive target below the CARB-recommended 2 is allowed but flagged.
    var enteredTarget = num('target');
    var targetIsInvalid = isFinite(enteredTarget) && enteredTarget <= 0;
    show(targetInvalid, targetIsInvalid);
    show(targetWarn, isFinite(enteredTarget) && enteredTarget > 0 && enteredTarget < 2);

    var flow = combinedFlow();
    var vol = roomVolume();
    var hasFlow = flow > 0;
    var hasRoom = isFinite(vol) && vol > 0;

    // Secondary readouts — room + coverage, in the unit picked by the inline
    // toggle. Coverage volume = largest room the setup covers at target; /8 ->
    // floor area.
    var area = roomArea();
    var coverVol = hasFlow ? (flow * 60) / target : NaN;
    var asFt3 = raw('units') === 'ft3';
    // Count-aware subject so the legend reads "Your cleaner covers" / "Your
    // cleaners cover" (this line only shows with flow, so >= 1 cleaner).
    setReadout('coversubj', blocks.length > 1 ? 'Your cleaners cover' : 'Your cleaner covers');
    setReadout(
      'roomarea',
      hasRoom && isFinite(area) ? (asFt3 ? fmt(vol, 0) + ' ft³' : fmt(area, 0) + ' ft²') : '—'
    );
    setReadout(
      'coverarea',
      hasFlow ? (asFt3 ? fmt(coverVol, 0) + ' ft³' : fmt(coverVol / 8, 0) + ' ft²') : '—'
    );
    // Secondary is the coverage-vs-room COMPARISON — only meaningful with a
    // cleaner delivering flow. In shop mode "Your room is about X" would stand
    // alone, echoing an input with nothing to compare it to, so it is hidden.
    showGroup('secondary', hasRoom && hasFlow);

    // ACH the current setup delivers + whether it meets the target. Computed once
    // here so the min-CADR guidance and the verdict below stay in agreement.
    var ach = hasFlow && hasRoom ? (flow / vol) * 60 : NaN;
    var pass = hasFlow && hasRoom && ach >= target;

    // Capacity ghost — the largest room the cleaners cover at the target, overlaid
    // on the actual room. The DRAWN footprint scale clamps at 3x so an extreme
    // target can't blow the scene out; the label + stats keep the true un-clamped
    // maxVol. data-cap-compare tells the CSS which box is bigger so the LARGER one
    // gets the more transparent fill.
    if (hasFlow && hasRoom) {
      capMaxVol = (flow * 60) / target;
      var sScale = Math.sqrt(capMaxVol / vol);
      capSTgt = Math.min(sScale, 3);
      capClamped = sScale > 3;
      container.dataset.capCompare = capMaxVol >= vol ? 'bigger' : 'smaller';
      if (capG) capG.style.visibility = '';
    } else {
      capSTgt = 0;
      capClamped = false;
      if (capG) capG.style.visibility = 'hidden';
    }

    // Fill each cleaner's ACH share for the wave cadence (flow_i x 60 / vol), and
    // mark idle any lane with no flow so its wave stays hidden.
    laneAch.length = 0;
    blocks.forEach(function (b, i) {
      if (i >= MAX_CLEANERS) return;
      var f = cleanerFlow(b.getAttribute('data-cleaner-block'));
      laneAch[i] = hasRoom && f > 0 ? (f / vol) * 60 : 0;
    });
    for (var li = 0; li < MAX_CLEANERS; li++) {
      var laneG = svg.querySelector('.smaqmd-cityview__lanes[data-lanes="' + (li + 1) + '"]');
      if (!laneG) continue;
      var idle = !(li < sceneN && laneAch[li] > 0);
      if (idle) laneG.setAttribute('data-lane-idle', '');
      else laneG.removeAttribute('data-lane-idle');
    }

    // ANSWER + hero metric + wave. Three result states, all with a room present
    // (the wizard gates leaving step 0 without one): a cleaner that PASSES, one
    // that FAILS, or no cleaner yet (SHOP for a rating).
    // The minimum COMBINED CADR — the total clean-air delivery all the cleaners
    // together must add up to. A CADR isn't "bought" per unit; it's the sum the
    // setup reaches, so this is independent of how many cleaners share the load.
    var needCadr = (target * vol) / 60;
    var setPrompt = function (on) {
      show(block.querySelector('[data-prompt="empty"]'), on);
    };

    if (targetIsInvalid) {
      // Invalid target (<= 0): block the verdict rather than compute one from the
      // silent default. The target-step alert tells the user how to fix it.
      show(achWrap, false);
      show(fixWrap, false);
      setAnswer('', null);
      setVerdictCard(null);
      showGroup('secondary', false);
      stateNow = 'idle';
      container.dataset.state = 'idle';
      setPrompt(true);
      announce('');
    } else if (hasFlow && hasRoom) {
      // Pass/fail: the ACH the setup delivers is the hero (vs. the target). On a
      // FAIL, the CADR-to-buy joins it as a co-equal hero — problem + fix.
      setMetric('ach', fmt(ach, 1));
      setReadout('ach', fmt(ach, 1));
      show(achWrap, true);
      // Tint the ACH readout warning when it falls short of the target.
      if (achWrap) achWrap.toggleAttribute('data-below', !pass);
      setMetric('fix', fmt(needCadr, 0) + unitSpan('ft³/min'));
      show(fixWrap, !pass);
      // Fail remedies: how many MORE of the user's current (assumed-identical)
      // cleaner would reach the target, and a caution when the CADR-to-buy is
      // beyond a typical single unit (~700 ft³/min). Pass shows neither.
      if (!pass) {
        // "Add N more" sizes N off the WEAKEST cleaner entered, so N units like
        // yours are guaranteed to reach the target even when your cleaners differ.
        var neededFlow = (target * vol) / 60;
        var flows = blocks
          .map(function (b) {
            return cleanerFlow(b.getAttribute('data-cleaner-block'));
          })
          .filter(function (f) {
            return f > 0;
          });
        var weakest = flows.length ? Math.min.apply(null, flows) : 0;
        var moreUnits = weakest > 0 ? Math.max(1, Math.ceil((neededFlow - flow) / weakest)) : 0;
        setReadout('moreunits', fmt(moreUnits, 0));
        show(cadrHighEl, needCadr > 700);
      } else {
        show(cadrHighEl, false);
      }
      // "Powerful enough", not "big enough" — adequacy here is airflow (CADR), not
      // physical size; the size metaphor feeds the misconception the tool corrects.
      var subj = blocks.length > 1 ? 'Your cleaners are' : 'Your cleaner is';
      var subjNeg = blocks.length > 1 ? "Your cleaners aren't" : "Your cleaner isn't";
      setAnswer(
        pass ? subj + ' powerful enough for this room' : subjNeg + ' powerful enough for this room',
        pass ? 'pass' : 'fail'
      );
      setVerdictCard(pass ? 'pass' : 'fail');
      setPrompt(false);
      stateNow = pass ? 'pass' : 'fail';
      container.dataset.state = stateNow;
      announce(
        'This setup delivers ' + fmt(ach, 1) + ' air changes per hour, ' +
          (pass ? 'at or above' : 'below') + ' your target of ' + fmt(target, 1) + '.'
      );
      startLoop();
    } else if (hasRoom) {
      // Shop mode (no cleaner yet): the combined CADR to reach IS the result, so
      // it takes the hero slot alone; the ACH hero has nothing to measure yet.
      show(achWrap, false);
      if (achWrap) achWrap.removeAttribute('data-below');
      setMetric('fix', fmt(needCadr, 0) + unitSpan('ft³/min'));
      show(fixWrap, true);
      // Same over-700 caution in shop mode: no single typical cleaner reaches it.
      show(cadrHighEl, needCadr > 700);
      setAnswer('Shop for this rating', 'shop');
      setVerdictCard('shop');
      setPrompt(false);
      stateNow = 'idle';
      container.dataset.state = 'idle';
      announce(
        cleanerCount > 1
          ? 'To reach ' + fmt(target, 1) + " air changes per hour, your cleaners' combined " +
              'CADR needs to be at least ' + fmt(needCadr, 0) + '.'
          : 'To reach ' + fmt(target, 1) + ' air changes per hour in this room, look for an ' +
              'air cleaner with a CADR of at least ' + fmt(needCadr, 0) + '.'
      );
    } else {
      // No room (defensive — the wizard shouldn't reach results without one).
      show(achWrap, false);
      show(fixWrap, false);
      setAnswer('', null);
      setVerdictCard(null);
      stateNow = 'idle';
      container.dataset.state = 'idle';
      setPrompt(true);
      announce('');
      // Wake the loop if the ghost still has residual scale to ease away.
      if (capS > 0.01) startLoop();
    }
  };

  // Numbers only (no stepper, so no negative spinning): strip to digits + one dot.
  var sanitizeNumeric = function (s) {
    var out = s.replace(/[^0-9.]/g, '');
    var dot = out.indexOf('.');
    if (dot !== -1) out = out.slice(0, dot + 1) + out.slice(dot + 1).replace(/\./g, '');
    return out;
  };

  // Switching room-entry mode: prefill the newly shown (empty) area/volume field
  // from the current drawn box so the scene never jumps. Derived from tgt (the
  // last drawn box) — NOT sceneBox(), which would read the new mode's still-blank
  // fields and derive from the 0.5 ft fallbacks.
  var prefillMode = function (method) {
    if (method === 'area') {
      var fa = field('area');
      if (fa && !raw('area')) setFieldValue(fa, String(Math.round(tgt.L * tgt.W)));
    } else if (method === 'volume') {
      var fv = field('volume');
      if (fv && !raw('volume')) setFieldValue(fv, String(Math.round(tgt.L * tgt.W * tgt.H)));
    }
  };

  var onEdit = function (e) {
    var el = e.target;
    if (!el || !el.tagName) return;
    // PORT: was `el.tagName === 'ESA-TEXT-FIELD'`. The numeric fields are native
    // now, marked with data-numeric so a future non-numeric field here isn't
    // silently stripped.
    if (el.hasAttribute && el.hasAttribute('data-numeric')) {
      var clean = sanitizeNumeric(el.value || '');
      if (clean !== el.value) el.value = clean;
    }
    // PORT: was `el.tagName === 'ESA-RADIO-GROUP' && el.dataset.field === 'roomMethod'`.
    // The event target is now the radio INSIDE the fieldset that carries
    // data-field. Prefill before the mode's fields are read for the scene box.
    if (el.type === 'radio' && el.closest) {
      var group = el.closest('[data-field]');
      if (group && group.getAttribute('data-field') === 'roomMethod') {
        prefillMode(getFieldValue(group) || 'dimensions');
      }
    }
    morphScene();
    recompute();
  };
  root.addEventListener('input', onEdit);
  root.addEventListener('change', onEdit);

  // Add / remove cleaner (delegated). Add clones the template; remove collapses
  // the clicked block. Both funnel through morphScene()/recompute().
  root.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('[data-add-cleaner]')) {
      e.preventDefault();
      if (cleanerBlocks().length >= MAX_CLEANERS) return;
      // Air cleaners are assumed identical: a new one copies the last cleaner's
      // values (blank if that one is still blank), so you only re-enter what
      // differs between them.
      addCleaner({ copyLast: true, animate: true });
      morphScene();
      recompute();
      return;
    }
    var rm = t.closest('[data-remove-cleaner]');
    if (rm) {
      e.preventDefault();
      var b = rm.closest('[data-cleaner-block]');
      if (b && !b.hasAttribute('data-removing')) removeCleaner(b);
    }
  });

  /* ---- drag-to-resize ----
     Each grip edge converts pointer delta to feet via the frozen fit scale + the
     per-axis screen unit vector, then types the snapped value into the matching
     text field. The onEdit pipeline does the rest — the field stays the source of
     truth. Width is inverted from its raw iso axis so pulling RIGHT enlarges it.
     Pointer-only by design (SC 2.5.7): typing the value is the equivalent path,
     so no grip is a tab stop. */
  var AXIS = { length: [COS30, SIN30], width: [COS30, -SIN30], height: [0, -1] };
  var KEY = { length: 'L', width: 'W', height: 'H' };
  var drag = null;

  svg.addEventListener('pointerdown', function (e) {
    // Grips only resize in dimensions mode — the other room-entry modes have no
    // draggable edges (CSS also hides the handles).
    if (raw('roomMethod') !== 'dimensions') return;
    var grip = e.target && e.target.closest ? e.target.closest('[data-grip]') : null;
    if (!grip) return;
    var dim = grip.getAttribute('data-grip');
    drag = { dim: dim, sx: e.clientX, sy: e.clientY, v0: tgt[KEY[dim]], sc: fitScale };
    if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
    container.dataset.dragging = dim;
    e.preventDefault();
  });
  svg.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var ax = AXIS[drag.dim];
    var ft = ((e.clientX - drag.sx) * ax[0] + (e.clientY - drag.sy) * ax[1]) / drag.sc;
    var next = Math.min(100, Math.max(1, Math.round((drag.v0 + ft) * 2) / 2));
    var f = field(drag.dim);
    // PORT: `.value` reads/writes go through the helpers. A synthetic `input`
    // event with bubbles:true still works on a native field, so the delegated
    // listener on root picks it up exactly as before.
    if (f && getFieldValue(f) !== String(next)) {
      setFieldValue(f, String(next));
      f.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  var endDrag = function () {
    drag = null;
    delete container.dataset.dragging;
  };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);

  /* ---- wizard step navigation ----
     Steps 0 room / 1 cleaners / 2 target gate forward; step 3 is the result
     screen. Every step lives in the DOM at once (the engine reads all fields on
     each recompute) — this only toggles which step is visible + the chrome, and
     gates leaving the room step on a valid room size.

     PLAN — which step sections this run walks, in order. Not a constant because
     the two intents are not the same length: a shopper has no cleaner to
     describe, so their run drops section 1 and becomes a two-step flow. The dots,
     the "Step n of m" counter and the nav gates all read plan.length. */
  var FULL_PLAN = [0, 1, 2];
  var SHOP_PLAN = [0, 2];
  var RESULT_SECTION = 3;
  var plan = FULL_PLAN;
  var TITLES = [
    'What size is your room?',
    'What air cleaners do you have?',
    "What's your air-change target?",
    'Your result',
  ];
  var wizardEl = root.querySelector('[data-wizard]');
  var introEl = root.querySelector('[data-intro]');
  var introTitle = root.querySelector('[data-intro-title]');
  var stepSections = qa('[data-step]');
  var dots = qa('[data-dot]');
  var stepCountEl = root.querySelector('[data-step-count]');
  var stepTitleEl = root.querySelector('[data-step-title]');
  var roomHint = root.querySelector('[data-room-hint]');
  var navEl = function (name) {
    return root.querySelector('[data-nav="' + name + '"]');
  };
  var roomValid = function () {
    var v = roomVolume();
    return isFinite(v) && v > 0;
  };
  var stepIdx = 0;

  // dir: +1 advancing (Next), -1 retreating (Back), 0 no slide (initial paint).
  var renderStep = function (dir) {
    if (dir === undefined) dir = 0;
    var isResult = stepIdx >= plan.length;
    var section = isResult ? RESULT_SECTION : plan[stepIdx];
    stepSections.forEach(function (s) {
      show(s, Number(s.getAttribute('data-step')) === section);
    });
    // Replay the enter animation on the now-visible step, sliding in from the
    // direction of travel. Removing both direction classes + forcing a reflow
    // before re-adding restarts the animation each step change.
    var active = stepSections.filter(function (s) {
      return Number(s.getAttribute('data-step')) === section;
    })[0];
    if (active) {
      active.classList.remove('smaqmd-wizard__step--enter-fwd', 'smaqmd-wizard__step--enter-back');
      if (dir !== 0) {
        void active.offsetWidth;
        active.classList.add(
          dir < 0 ? 'smaqmd-wizard__step--enter-back' : 'smaqmd-wizard__step--enter-fwd'
        );
      }
    }
    dots.forEach(function (d, i) {
      // A two-step run shows two dots. The third is hidden rather than
      // relabelled: the dots ARE the step count, so leaving a dead one on would
      // promise a step the shopper never reaches.
      show(d, i < plan.length);
      d.toggleAttribute('data-active', i === stepIdx && !isResult);
      d.toggleAttribute('data-done', i < stepIdx);
    });
    if (stepCountEl) {
      stepCountEl.textContent = isResult
        ? 'Result'
        : 'Step ' + (stepIdx + 1) + ' of ' + plan.length;
    }
    // On the result step the verdict headline is the title — the generic "Your
    // result" heading would just duplicate the eyebrow + verdict, so hide it. The
    // verdict headline is therefore this phase's section heading (h2, like the
    // other two: the host page owns the h1 — see index.html).
    if (stepTitleEl) {
      stepTitleEl.hidden = isResult;
      if (!isResult) stepTitleEl.textContent = TITLES[section];
    }
    // Back is offered on the first step too when there is an opening slide to go
    // back TO — without it the intent chosen there would be unchangeable, and a
    // shopper who realises they do own a cleaner would have no way out.
    show(navEl('back'), stepIdx > 0 || !!introEl);
    show(navEl('next'), stepIdx < plan.length - 1);
    show(navEl('result'), stepIdx === plan.length - 1);
    show(navEl('restart'), isResult);
    if (roomHint && section !== 0) show(roomHint, false);
    // Re-fit the scene: the panel height changes between steps, which moves the
    // safe-area sentinel; a sync recentres the buildings for the new frame.
    syncViewport();
    // A11y: on a real navigation (not the initial paint), move focus to the new
    // step's heading so screen-reader + keyboard users land in — and hear — the
    // step they advanced to, instead of focus being stranded on the old button.
    // A change of context is surfaced by AT directly, which is why a step change
    // needs no live-region announcement of its own (SC 4.1.3).
    if (dir !== 0) {
      var heading = isResult ? answerTitle : stepTitleEl;
      if (heading) heading.focus();
    }
  };

  var goStep = function (i) {
    var next = Math.min(Math.max(0, i), plan.length);
    // Forward gate: you can't leave the room step without a valid room size.
    if (next > stepIdx && plan[stepIdx] === 0 && !roomValid()) {
      if (roomHint) show(roomHint, true);
      return;
    }
    var dir = next === stepIdx ? 0 : next > stepIdx ? 1 : -1;
    stepIdx = next;
    renderStep(dir);
  };

  // Returning to the opening slide is a step change like any other, so it moves
  // focus the same way renderStep does — onto the heading of what is now on screen.
  var toIntro = function () {
    stepIdx = 0;
    if (wizardEl) wizardEl.setAttribute('data-phase', 'intro');
    if (introTitle) introTitle.focus();
  };
  var backOrIntro = function () {
    if (stepIdx === 0 && introEl) toIntro();
    else goStep(stepIdx - 1);
  };

  root.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    // The two intent buttons on the opening slide. Each writes the answer into the
    // hasCleaner radio group — the field the engine already reads — rather than
    // introducing a second piece of state that could disagree with it. Setting it
    // fires no event, so the two listeners that would have run are called by hand.
    var intent = t.closest('[data-nav="check"], [data-nav="shop"]');
    if (intent) {
      e.preventDefault();
      var shopping = intent.matches('[data-nav="shop"]');
      setFieldValue(field('hasCleaner'), shopping ? 'no' : 'yes');
      syncVisibility();
      recompute();
      plan = shopping ? SHOP_PLAN : FULL_PLAN;
      stepIdx = 0;
      // Hand the card over to the step machinery, then render with a direction so
      // it reuses renderStep's own focus move onto the heading — leaving the intro
      // is a change of context, same as any step change.
      if (wizardEl) wizardEl.setAttribute('data-phase', 'steps');
      renderStep(1);
    } else if (t.closest('[data-nav="next"]')) {
      e.preventDefault();
      goStep(stepIdx + 1);
    } else if (t.closest('[data-nav="result"]')) {
      e.preventDefault();
      goStep(plan.length);
    } else if (t.closest('[data-nav="back"]')) {
      e.preventDefault();
      backOrIntro();
    } else if (t.closest('[data-nav="restart"]')) {
      e.preventDefault();
      if (introEl) toIntro();
      else goStep(0);
    }
  });

  // Clear the room-required hint the moment a valid room is entered.
  root.addEventListener('input', function () {
    if (stepIdx === 0 && roomHint && roomValid()) show(roomHint, false);
  });

  /* ---- boot ----
     Stamp the (blank) first cleaner and draw the default scene immediately
     (cur/tgt default to 12x10x8), then sync the mode wrappers/entry-mode flag,
     snap the box to the fields, and compute — opening on the "no cleaner yet ->
     minimum CADR to look for" state (room 12x10x8, target 2, no wave).

     PORT: the component gated this on customElements.whenDefined() for the two
     Lit controls, so their .value getters would read entered attributes. Native
     elements have no upgrade step and this script is deferred, so the gate is
     dropped and the sequence runs straight through. */
  resetCleaners();
  drawScene(cur.L, cur.W, cur.H);
  syncVisibility();
  morphScene();
  recompute();
  renderStep();
})();
