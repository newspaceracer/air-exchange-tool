/* bcn-lego-checked: zero-dependency client build, hand-ported from the inline script of src/components/smaqmd-aer-wizard.astro — no esa-* runtime exists outside the Astro build (.astro legos are compile-time; Lit legos would reimpose npm and a module script that file:// cannot load). */
(function () {
  'use strict';

  var announcer = (function () {
    var CLEAR_AFTER_MS = 350;
    var REPEAT_GAP_MS = 100;
    var regions = null;
    var timers = new WeakMap();

    function hide(el) {
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
      init: function () {
        ensure();
      },
      announce: function (message, options) {
        var text = String(message == null ? '' : message).trim();
        if (!text) return;
        var mounted = ensure();
        var region = options && options.assertive ? mounted.assertive : mounted.polite;
        var pending = timers.get(region);
        if (pending) clearTimeout(pending);
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
  announcer.init();

  var root = document.querySelector('[data-aerb-wizard]');
  if (!root) return;

  // THE narrow-screen breakpoint, in JS. Must stay identical to the
  // `@media (max-width: 68rem)` query in styles.css — the CSS lays the flow out,
  // this decides where the header sits and whether the scene animates.
  var mqMobile = window.matchMedia('(max-width: 68rem)');

  // ---- responsive header placement ----
  // Wide keeps the page heading atop the card column; narrow moves it ABOVE the
  // graphic (the node is relocated, not duplicated). Runs now (before paint) and
  // on every breakpoint crossing. Port of the same block in the Astro source.
  var headerEl = root.querySelector('.smaqmd-aerb__header');
  var colEl = root.querySelector('.smaqmd-aerw__col');
  var placeHeader = function () {
    if (!headerEl) return;
    if (mqMobile.matches) {
      if (root.firstElementChild !== headerEl) root.prepend(headerEl);
    } else if (colEl && colEl.firstElementChild !== headerEl) {
      colEl.prepend(headerEl);
    }
  };
  placeHeader();
  mqMobile.addEventListener('change', placeHeader);

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

  var COS30 = Math.cos(Math.PI / 6);
  var SIN30 = 0.5;
  var project = function (x, y, z) {
    return [(x - y) * COS30, (x + y) * SIN30 - z];
  };

  var sceneSvg = root.querySelector('.smaqmd-cityview__svg');
  var sceneStage = root.querySelector('[data-cityview]');
  var svg = sceneSvg || document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  var container = sceneStage || document.createElement('div');
  var fitScale = 1;
  var viewW = 480;
  var viewH = 380;
  var safe = { x: 52, y: 52, w: 376, h: 276 };
  var MAX_SCALE = 12;
  // The DRAWN room stops growing here. Past this the picture says nothing new
  // while everything in it shrinks toward invisible. Each axis clamps
  // INDEPENDENTLY — scaling the footprint proportionally could drive the short
  // side under the degenerate floor and blank the room. The drawn box clamps and
  // the dimension LABELS keep the true feet, via labelK below.
  var SCENE_MAX = 60; // ft — longest drawn floor side
  var SCENE_MAX_H = 20; // ft — tallest drawn ceiling
  // trueDim / drawnDim per axis. All 1 whenever nothing is clamped (the normal case).
  var labelK = { L: 1, W: 1, H: 1 };
  var CW_MAX = 2.6;
  var CW_MIN = 1.4;
  var UNIT_MIN_PX = 22;
  // Floor strip along the near x=L wall reserved for the FRONT cleaners;
  // furniture is clamped out of it. Its counterpart at the far end of the room —
  // the BACK units' zone — is not a constant, because those units move with the
  // layout; it is the rectangle backZone() derives and layoutDetails() reserves.
  // Wall thickness + floor slab depth give the cutaway its visible top caps, cut
  // edges and front edges.
  var CLEANER_STRIP = 3.8;
  var WALL_T = 0.35;
  var FLOOR_D = 0.35;
  var sceneSentinel = root.querySelector('[data-safe]');
  var sentinel = sceneSentinel || document.createElement('div');
  var hasScene = !!(sceneSvg && sceneStage && sceneSentinel);
  var isResponsive = root.getAttribute('data-variant') === 'responsive';
  // Must match syncSceneLive()'s condition below — data-section is unset until the
  // first renderStep, i.e. not yet the result step.
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

  // Everything the ring pulse needs, in SCREEN space, refreshed by drawScene.
  // A ring is a world-space circle of radius r on the floor around the unit's
  // center; the projection is linear, so its image is exactly the ellipse
  // P(t) = C + r * (cos t * E + sin t * F), where C is the projected unit center
  // and E/F are the projections of the unit-foot world vectors +1x and +1y from
  // it. Caching those three screen vectors per cleaner keeps the animation tick
  // to plain arithmetic. null = that cleaner isn't drawn right now.
  var ringDefs = [];
  // Ripples in flight per cleaner, and the angular resolution of each.
  var RING_COUNT = 3;
  var RING_STEPS = 28;
  var sceneN = 1;
  var MAX_CLEANERS = 4;
  // The 4 x 3 ring polygons are static markup, so they're looked up ONCE here
  // rather than re-queried every frame. ringPolys[i][k] is cleaner i's ring k.
  var ringPolys = [];
  for (var rp = 0; hasScene && rp < MAX_CLEANERS; rp++) {
    var found = svg.querySelectorAll(
      '.smaqmd-cityview__rings[data-rings="' + (rp + 1) + '"] .smaqmd-cityview__ring',
    );
    ringPolys[rp] = [];
    for (var rq = 0; rq < found.length; rq++) ringPolys[rp].push(found[rq]);
  }

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

  var detailsG = svg.querySelector('[data-room-details]');
  var furnG = svg.querySelector('[data-furniture]');
  var setDetail = function (sel, on, pts) {
    var el = svg.querySelector(sel);
    if (!el) return;
    el.style.visibility = on ? '' : 'hidden';
    if (on && pts) el.setAttribute('points', ptsAttr(pts));
  };

  // N air cleaners standing ON THE FLOOR, filling the room from BOTH ends so
  // added units read as covering the room rather than crowding one wall. The
  // side assignment is FIXED by index (and mirrored by the two unit blocks in
  // the markup, which is what makes the units' static paint order correct):
  //
  //   1 -> front (the strip along the open x=L edge)   2 -> back (the x=0 wall)
  //   3 -> front, beside 1                             4 -> back, across from 3
  //
  // A side carrying ONE unit centers it at W/2; a side carrying TWO straddles
  // W/2 with a gap g between them, and both sides use the SAME two y-centers, so
  // every back unit stands directly across the room from its front partner
  // (1<->2, 3<->4). The footprint scales with the room up to CW_MAX, then stops,
  // with an absolute 3.2 ft cap so even a widened (readability-pass) unit stays
  // appliance-sized.
  var layoutCleaners = function (L, W, n, cwOpt) {
    var cwBase = Math.min(Math.max(Math.min(L, W) * 0.16, CW_MIN), CW_MAX);
    var cw = Math.min(cwOpt == null ? cwBase : cwOpt, W * 0.55, 3.2);
    // Anti-overlap ceilings, applied once a side actually carries a pair (n >= 3)
    // or the two sides face each other (n >= 2).
    //   ACROSS the width: 2*cw + g <= 0.7*W with g = max(1, 0.5*cw), so the
    //   largest admissible cw is 0.28*W where that lands at or above the
    //   g = 0.5*cw branch point (cw >= 2, i.e. W >= 7.14 ft), and 0.35*W - 0.5
    //   below it.
    //   ALONG the length: the front and back boxes keep a 0.6 ft aisle between
    //   them -> cw <= (L - 2.4)/2.
    if (n >= 3) cw = Math.min(cw, W * 0.28 >= 2 ? W * 0.28 : W * 0.35 - 0.5);
    if (n >= 2) cw = Math.min(cw, (L - 2.4) / 2);
    cw = Math.max(cw, 0.2);
    var ch = cw * 1.5;
    // Gap between the two units of a pair, and the resulting slot offset from the
    // room's mid-width: each unit's CENTER sits at W/2 -/+ (cw/2 + g/2).
    var g = Math.max(1, cw * 0.5);
    var slot = cw / 2 + g / 2;
    var frontPair = n >= 3;
    var backPair = n >= 4;
    var out = [];
    for (var k = 0; k < n; k++) {
      var side = k % 2 === 0 ? 'front' : 'back';
      var paired = side === 'front' ? frontPair : backPair;
      // Index 0/1 take the lower-y slot of their side, 2/3 the higher one.
      var cyc = !paired ? W / 2 : W / 2 + (k < 2 ? -slot : slot);
      // Front: 1.2 ft of clearance from the x=L edge the cutaway opens on.
      // Back:  0.6 ft off the x=0 wall (a wall gap, not a walking aisle).
      var x0 = side === 'front' ? L - 1.2 - cw : 0.6;
      out.push({
        x0: x0,
        y0: cyc - cw / 2,
        x1: x0 + cw,
        y1: cyc + cw / 2,
        h: ch,
        side: side,
      });
    }
    return out;
  };
  // The floor rectangle the BACK units occupy (plus a walking margin), or null
  // when no unit stands against the x=0 wall. layoutDetails keeps furniture out
  // of it.
  var backZone = function (cls) {
    var M = 0.6;
    var x1 = -Infinity;
    var y0 = Infinity;
    var y1 = -Infinity;
    var any = false;
    for (var i = 0; i < cls.length; i++) {
      if (cls[i].side !== 'back') continue;
      any = true;
      if (cls[i].x1 > x1) x1 = cls[i].x1;
      if (cls[i].y0 < y0) y0 = cls[i].y0;
      if (cls[i].y1 > y1) y1 = cls[i].y1;
    }
    if (!any) return null;
    return { x0: 0, x1: x1 + M, y0: y0 - M, y1: y1 + M };
  };

  var WIN_POOL = 2;
  var WIN_W = 3.0;
  // Furniture pool, ordered BACK-TO-FRONT by (fx + fy) so document order IS
  // painter order. fx/fy place the item's CENTER as a fraction of L/W; sx/sy/h
  // are its world size in feet; minArea is the floor area at which it appears;
  // snap pins it flush against the x=0 ('x') or y=0 ('y') wall.
  // A BED IS A WALL PIECE: its head goes against the y=0 wall, never adrift in
  // the middle of the floor. It cannot take the x=0 wall instead — that wall now
  // hosts back cleaner units 2 and 4 at mid-width, and a 5 ft-deep bed would land
  // in their reserved zone. So the y=0 wall carries three pieces (dresser, bed,
  // desk) that have to share its length; they are spaced low-x -> center ->
  // door-end here, and packed for real in the wall pass below.
  var FURN_DEFS = [
    { fx: 0.12, fy: 0.06, sx: 3.6, sy: 1.5, h: 2.7, minArea: 90, snap: 'y' }, // 1 dresser
    { fx: 0.05, fy: 0.28, sx: 1.1, sy: 3.2, h: 5.6, minArea: 0, snap: 'x' }, // 2 bookshelf
    { fx: 0.42, fy: 0.06, sx: 6.4, sy: 5.0, h: 1.7, minArea: 0, snap: 'y' }, // 3 bed (head to the wall)
    { fx: 0.72, fy: 0.06, sx: 3.2, sy: 1.6, h: 2.5, minArea: 260, snap: 'y' }, // 4 desk
    { fx: 0.05, fy: 0.74, sx: 1.4, sy: 1.4, h: 2.1, minArea: 140, snap: 'x' }, // 5 nightstand
    { fx: 0.1, fy: 0.9, sx: 1.1, sy: 1.1, h: 3.0, minArea: 220 }, // 6 plant
    { fx: 0.7, fy: 0.86, sx: 1.9, sy: 1.9, h: 2.4, minArea: 320 }, // 7 armchair
  ];
  // Placement priority on the y=0 wall (FURN_DEFS indices: bed, dresser, desk).
  // NOT paint order — the table above stays sorted back-to-front, which along
  // this wall means by x, so document order is still painter order.
  var WALL_ORDER = [2, 0, 3];
  // The rug is the one flat piece — a quad on the floor at the foot of the bed,
  // no height. It follows the bed toward the y=0 wall.
  var RUG = { fx: 0.46, fy: 0.4, sx: 8.0, sy: 6.5, minArea: 150 };
  var clamp = function (v, lo, hi) {
    return Math.max(Math.min(v, hi), lo);
  };
  var winCenters = function (span0, span1, n) {
    var S = span1 - span0;
    if (n < 1 || S < WIN_W) return [];
    var out = [];
    for (var i = 0; i < n; i++) out.push(span0 + (S * (i + 0.5)) / n);
    return out;
  };
  var layoutDetails = function (L, W, H, zone) {
    var degenerate = L < 3 || W < 3 || H < 3.5;
    // ONE row of windows per wall, seen from inside: sill at ~0.38H, opening
    // ~0.42H tall, both clamped so the head never runs into the ceiling.
    var sill = Math.min(3.2, H * 0.38);
    var winH = Math.min(Math.min(3.4, H * 0.42), Math.max(0.4, 0.85 * H - sill));
    var nL = degenerate ? 0 : W >= 15 ? 2 : W >= 6 ? 1 : 0;
    var winL = winCenters(0, W, nL);
    // The y=0 wall carries the DOOR near the (L,0) corner the cutaway opens on,
    // so its windows share what is left of that wall.
    var doorOn = !degenerate && L >= 8 && H >= 5;
    var doorH = Math.min(6.8, H * 0.8);
    var winSpan0 = 1.5;
    var winSpan1 = doorOn ? L - 5.5 : L - 1.5;
    var span = winSpan1 - winSpan0;
    var nR = degenerate ? 0 : span >= 12 ? 2 : span >= 3 ? 1 : 0;
    var winR = winCenters(winSpan0, winSpan1, nR);
    // Furniture: a room too small to walk around gets none; beyond that each
    // piece is gated purely on floor area, sized to at most 30% of the room and
    // 75% of the ceiling.
    var furn = [];
    var roomy = !degenerate && Math.min(L, W) >= 5;
    var area = L * W;
    // WALL PASS — the three y=0-wall pieces share one stretch of wall, so their
    // x-spans are packed in PRIORITY order (bed, then dresser, then desk) before
    // the pool loop below. Each takes its preferred x, is pushed off any span
    // already claimed to whichever free side is nearer, and is simply not placed
    // when the wall has nothing left. The window is [lo, hi]: WALL_LO in from the
    // x=0 wall, stopping short of the door when there is one, and starting past
    // the back cleaners' zone for any piece deep enough to reach into it.
    // WALL_LO clears the CORNER: a piece against the x=0 wall reaches x = 0.3 +
    // its width, and the two walls' pieces would otherwise overlap where they
    // meet.
    var WALL_LO = 1.8;
    var wallX = [];
    var taken = [];
    var clashAt = function (v, sx) {
      for (var t = 0; t < taken.length; t++) {
        if (v < taken[t][1] - 1e-9 && v + sx > taken[t][0] + 1e-9) return taken[t];
      }
      return null;
    };
    for (var wi = 0; wi < WALL_ORDER.length; wi++) {
      var wk = WALL_ORDER[wi];
      var wd = FURN_DEFS[wk];
      if (!roomy || area < wd.minArea) {
        wallX[wk] = null;
        continue;
      }
      var wsx = Math.min(wd.sx, L * 0.3);
      var wsy = Math.min(wd.sy, W * 0.3);
      var hi = Math.min(L - CLEANER_STRIP - wsx, doorOn ? L - 4.6 - wsx : Infinity);
      var lo = zone && 0.3 < zone.y1 && 0.3 + wsy > zone.y0 ? Math.max(WALL_LO, zone.x1) : WALL_LO;
      if (hi < lo) {
        wallX[wk] = null;
        continue;
      }
      var wx0 = clamp(wd.fx * L - wsx / 2, lo, hi);
      for (var pass = 0; wx0 != null && pass <= taken.length; pass++) {
        var clash = clashAt(wx0, wsx);
        if (!clash) break;
        var at = wx0;
        var cand = [clash[1], clash[0] - wsx];
        var opts = [];
        for (var oi = 0; oi < cand.length; oi++) {
          if (cand[oi] >= lo - 1e-9 && cand[oi] <= hi + 1e-9) opts.push(cand[oi]);
        }
        opts.sort(function (p, q) {
          return Math.abs(p - at) - Math.abs(q - at);
        });
        wx0 = opts.length ? opts[0] : null;
      }
      if (wx0 == null || clashAt(wx0, wsx)) {
        wallX[wk] = null;
        continue;
      }
      taken.push([wx0, wx0 + wsx]);
      wallX[wk] = wx0;
    }
    for (var k = 0; k < FURN_DEFS.length; k++) {
      var d = FURN_DEFS[k];
      if (!roomy || area < d.minArea) {
        furn.push(null);
        continue;
      }
      var sx = Math.min(d.sx, L * 0.3);
      var sy = Math.min(d.sy, W * 0.3);
      // A piece whose clamp window has collapsed (the floor cannot hold it clear
      // of both the cleaners' strip and the front edge) is simply not placed.
      var hiX = L - CLEANER_STRIP - sx;
      var hiY = W - 1 - sy;
      if ((d.snap !== 'x' && hiX < 1) || (d.snap !== 'y' && hiY < 1)) {
        furn.push(null);
        continue;
      }
      // Wall-snapped pieces sit 0.3 ft off their wall — the y=0 ones at the x the
      // wall pass above packed them into (null there means the wall could not
      // hold them).
      var wx = d.snap === 'y' ? (wallX[k] == null ? null : wallX[k]) : null;
      if (d.snap === 'y' && wx == null) {
        furn.push(null);
        continue;
      }
      var x0 = d.snap === 'x' ? 0.3 : d.snap === 'y' ? wx : clamp(d.fx * L - sx / 2, 1, hiX);
      var y0 = d.snap === 'y' ? 0.3 : clamp(d.fy * W - sy / 2, 1, hiY);
      // BACK-ZONE RESERVATION (n >= 2). The far end of the room belongs to the
      // x=0-wall cleaners, exactly as the near end belongs to the x=L ones via
      // CLEANER_STRIP. The y=0-wall pieces already dodged it in the wall pass
      // (they dodge along x); everything else slides along y to whichever side of
      // the zone is nearer and still fits between the floor clamps, or is not
      // placed at all when neither side has room. A piece already flush against
      // the x=0 wall may run all the way into the corner (y = 0.3); a
      // free-standing piece may not — there it would sit in the middle of the
      // other wall's row.
      if (
        zone &&
        d.snap !== 'y' &&
        x0 < zone.x1 &&
        x0 + sx > zone.x0 &&
        y0 < zone.y1 &&
        y0 + sy > zone.y0
      ) {
        var near = zone.y0 - sy;
        var far = zone.y1;
        var order = Math.abs(y0 - near) <= Math.abs(y0 - far) ? [near, far] : [far, near];
        var loY = d.snap === 'x' ? 0.3 : 1;
        var slotY = null;
        for (var oj = 0; oj < order.length; oj++) {
          if (order[oj] >= loY && order[oj] <= hiY) {
            slotY = order[oj];
            break;
          }
        }
        if (slotY == null) {
          furn.push(null);
          continue;
        }
        y0 = slotY;
      }
      furn.push({ x0: x0, y0: y0, x1: x0 + sx, y1: y0 + sy, h: Math.min(d.h, H * 0.75) });
    }
    var rugOn = roomy && area >= RUG.minArea;
    var rsx = Math.min(RUG.sx, L * 0.5);
    var rsy = Math.min(RUG.sy, W * 0.55);
    var rx0 = clamp(RUG.fx * L - rsx / 2, 0.8, L - CLEANER_STRIP - rsx);
    var ry0 = clamp(RUG.fy * W - rsy / 2, 0.8, W - 0.8 - rsy);
    return {
      degenerate: degenerate,
      sill: sill,
      winH: winH,
      doorOn: doorOn,
      doorH: doorH,
      winL: winL,
      winR: winR,
      furn: furn,
      rugOn: rugOn,
      rx0: rx0,
      ry0: ry0,
      rx1: rx0 + rsx,
      ry1: ry0 + rsy,
    };
  };

  var drawScene = function (L, W, H) {
    if (!hasScene) return;
    var n = Math.min(Math.max(1, sceneN), MAX_CLEANERS);

    // The ghost is flush with the room's open FRONT side (x=L) — where the first
    // cleaner stands — and centered on the width, growing back across the room.
    var drawCap = capS > 0.01;
    var gL = L * capS;
    var gW = W * capS;
    var gx0 = L - gL;
    var gy0 = (W - gW) / 2;
    var gy1 = (W + gW) / 2;

    // Shadow pad under the diorama: the room footprint plus a margin that grows
    // with the room, at the underside of the floor slab. Its corners also cover
    // the walls' WALL_T overhang behind the origin.
    var shadowM = Math.max(2, 0.08 * (L + W));

    var computeFit = function (cls) {
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
      // The room box carries all of its own dressing — furniture and cleaners are
      // clamped strictly inside it — except when the readability pass has widened
      // a cleaner past what the room can hold, so the cleaner boxes still go in.
      box(0, 0, L, W, H);
      for (var ci = 0; ci < cls.length; ci++) {
        var c = cls[ci];
        box(c.x0, c.y0, c.x1, c.y1, c.h);
      }
      if (drawCap) box(gx0, gy0, L, gy1, H);
      var pad = [
        [-shadowM, -shadowM],
        [L + shadowM, -shadowM],
        [L + shadowM, W + shadowM],
        [-shadowM, W + shadowM],
      ];
      for (var li = 0; li < 4; li++) fitPts.push(project(pad[li][0], pad[li][1], -FLOOR_D));

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
      return { scale: scale, ox: ox, oy: oy };
    };

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
    // Room dressing is laid out AFTER the cleaners because it has to dodge them:
    // the furniture reserves the back units' zone, which depends on the FINAL
    // cleaner width (the readability pass above can widen it).
    var det = layoutDetails(L, W, H, backZone(cleaners));
    var w = function (x, y, z) {
      var p = project(x, y, z);
      return [ox + p[0] * scale, oy + p[1] * scale];
    };

    setPoly('[data-ground]', [
      w(-shadowM, -shadowM, -FLOOR_D),
      w(L + shadowM, -shadowM, -FLOOR_D),
      w(L + shadowM, W + shadowM, -FLOOR_D),
      w(-shadowM, W + shadowM, -FLOOR_D),
    ]);

    // The two back walls, each as three faces: the INTERIOR face (x=0 left, y=0
    // right), the WALL_T-wide top cap, and the cut edge at the near corner.
    setPoly('[data-room="left"]', [w(0, 0, H), w(0, W, H), w(0, W, 0), w(0, 0, 0)]);
    setPoly('[data-room="right"]', [w(0, 0, H), w(L, 0, H), w(L, 0, 0), w(0, 0, 0)]);
    setPoly('[data-wall-top="left"]', [w(0, 0, H), w(0, W, H), w(-WALL_T, W, H), w(-WALL_T, 0, H)]);
    setPoly('[data-wall-top="right"]', [w(0, 0, H), w(L, 0, H), w(L, -WALL_T, H), w(0, -WALL_T, H)]);
    setPoly('[data-wall-cap="left"]', [w(0, W, H), w(-WALL_T, W, H), w(-WALL_T, W, 0), w(0, W, 0)]);
    setPoly('[data-wall-cap="right"]', [w(L, 0, H), w(L, -WALL_T, H), w(L, -WALL_T, 0), w(L, 0, 0)]);

    // The floor slab — the floor plane plus the two front edges of its depth.
    var floorQuad = [w(0, 0, 0), w(L, 0, 0), w(L, W, 0), w(0, W, 0)];
    setPoly('[data-room="floor"]', floorQuad);
    setPoly('[data-floor-edge="left"]', [
      w(0, W, 0),
      w(L, W, 0),
      w(L, W, -FLOOR_D),
      w(0, W, -FLOOR_D),
    ]);
    setPoly('[data-floor-edge="right"]', [
      w(L, 0, 0),
      w(L, W, 0),
      w(L, W, -FLOOR_D),
      w(L, 0, -FLOOR_D),
    ]);
    // …and the same quad again as the clip every cleaning pulse rides inside, so
    // a ring at full radius stops at the floor's edge instead of spilling up the
    // walls or out onto the dot paper.
    setPoly('[data-floor-clip]', floorQuad);

    // Room dressing — re-derived every frame from the eased dims, so a window
    // opens or a piece of furniture arrives ONE at a time as the room grows. A
    // degenerate room draws bare walls + floor only, so all three dressing groups
    // go hidden together (style.visibility, never display).
    if (detailsG) detailsG.style.visibility = det.degenerate ? 'hidden' : '';
    if (furnG) furnG.style.visibility = det.degenerate ? 'hidden' : '';
    if (det.degenerate) setDetail('[data-rug]', false);
    if (!det.degenerate) {
      var hw = WIN_W / 2;
      var z0 = det.sill;
      var z1 = det.sill + det.winH;
      for (var s = 1; s <= WIN_POOL; s++) {
        var cl = det.winL[s - 1];
        setDetail(
          '[data-win-l="' + s + '"]',
          cl != null,
          cl != null
            ? [w(0, cl - hw, z1), w(0, cl + hw, z1), w(0, cl + hw, z0), w(0, cl - hw, z0)]
            : undefined
        );
        var cr = det.winR[s - 1];
        setDetail(
          '[data-win-r="' + s + '"]',
          cr != null,
          cr != null
            ? [w(cr - hw, 0, z1), w(cr + hw, 0, z1), w(cr + hw, 0, z0), w(cr - hw, 0, z0)]
            : undefined
        );
      }
      setDetail(
        '[data-door]',
        det.doorOn,
        det.doorOn
          ? [w(L - 4.2, 0, det.doorH), w(L - 1.2, 0, det.doorH), w(L - 1.2, 0, 0), w(L - 4.2, 0, 0)]
          : undefined
      );
      setDetail(
        '[data-rug]',
        det.rugOn,
        det.rugOn
          ? [
              w(det.rx0, det.ry0, 0),
              w(det.rx1, det.ry0, 0),
              w(det.rx1, det.ry1, 0),
              w(det.rx0, det.ry1, 0),
            ]
          : undefined
      );

      // Furniture — each piece the same 3-face mini-box as a cleaner unit, but
      // standing on the floor. The pool is already back-to-front, so drawing it
      // in index order is correct depth.
      for (var k2 = 0; k2 < FURN_DEFS.length; k2++) {
        var u2 = det.furn[k2];
        var g = svg.querySelector('[data-furn="' + (k2 + 1) + '"]');
        if (g) g.style.visibility = u2 ? '' : 'hidden';
        if (!u2) continue;
        var zt = u2.h;
        setPoly('[data-furn="' + (k2 + 1) + '"] [data-furn-face="top"]', [
          w(u2.x0, u2.y0, zt),
          w(u2.x1, u2.y0, zt),
          w(u2.x1, u2.y1, zt),
          w(u2.x0, u2.y1, zt),
        ]);
        setPoly('[data-furn="' + (k2 + 1) + '"] [data-furn-face="left"]', [
          w(u2.x0, u2.y1, zt),
          w(u2.x1, u2.y1, zt),
          w(u2.x1, u2.y1, 0),
          w(u2.x0, u2.y1, 0),
        ]);
        setPoly('[data-furn="' + (k2 + 1) + '"] [data-furn-face="right"]', [
          w(u2.x1, u2.y0, zt),
          w(u2.x1, u2.y1, zt),
          w(u2.x1, u2.y1, 0),
          w(u2.x1, u2.y0, 0),
        ]);
      }
    }

    // Capacity ghost — the same cutaway language the room uses (floor + the two
    // faces away from the viewer), flush with the open front, centered on width.
    if (drawCap) {
      // Uniform scale means the body is entirely inside the room (in-front twin)
      // or entirely beyond it (behind-the-walls twin) — pick per frame, blank the
      // other. Both twins' visibility belongs to recompute().
      var bodyG = gx0 < -1e-6 ? '[data-capg-back]' : '[data-capg]';
      var idleG = gx0 < -1e-6 ? '[data-capg]' : '[data-capg-back]';
      setPoly(idleG + ' [data-cap="floor"]', []);
      setPoly(idleG + ' [data-cap="left"]', []);
      setPoly(idleG + ' [data-cap="right"]', []);
      setPoly(bodyG + ' [data-cap="floor"]', [w(gx0, gy0, 0), w(L, gy0, 0), w(L, gy1, 0), w(gx0, gy1, 0)]);
      setPoly(bodyG + ' [data-cap="left"]', [w(gx0, gy0, H), w(gx0, gy1, H), w(gx0, gy1, 0), w(gx0, gy0, 0)]);
      setPoly(bodyG + ' [data-cap="right"]', [w(gx0, gy0, H), w(L, gy0, H), w(L, gy0, 0), w(gx0, gy0, 0)]);
      // Fill-less top face + near-corner vertical complete the box outline.
      setPoly('[data-cap="top"]', [w(gx0, gy0, H), w(L, gy0, H), w(L, gy1, H), w(gx0, gy1, H)]);
      var capEdge = svg.querySelector('[data-cap-edge]');
      if (capEdge) {
        var ce0 = w(L, gy1, 0);
        var ce1 = w(L, gy1, H);
        capEdge.setAttribute('x1', ce0[0]); capEdge.setAttribute('y1', ce0[1]);
        capEdge.setAttribute('x2', ce1[0]); capEdge.setAttribute('y2', ce1[1]);
      }
      // Label just past the ghost's near corner (L, gy1) on the open side.
      var capPt = w(L, gy1, 0);
      var prefix = capClamped ? '≥' : '';
      var capFt3 = raw('units') === 'ft3';
      var capText = capFt3 ? fmt(capMaxVol, 0) + ' ft³' : fmt(capMaxVol / 8, 0) + ' ft²';
      setLabel('capacity', [capPt[0] + 8, capPt[1] + 16], 'covers a room up to ' + prefix + capText);
    }

    // Per cleaner: its cleaning-pulse group (rings lying on the floor) and its
    // unit group (the box standing on the floor). Groups beyond n are hidden via
    // style.visibility — NOT display: this scene toggles everything the same way,
    // and a group that was ever display:none has bitten WebKit here before.
    ringDefs.length = 0;
    for (var i2 = 0; i2 < MAX_CLEANERS; i2++) {
      var ringsG = svg.querySelector('.smaqmd-cityview__rings[data-rings="' + (i2 + 1) + '"]');
      var unitG = svg.querySelector('.smaqmd-cityview__unitg[data-unitg="' + (i2 + 1) + '"]');
      var on = i2 < n;
      if (ringsG) ringsG.style.visibility = on ? '' : 'hidden';
      if (unitG) unitG.style.visibility = on ? '' : 'hidden';
      if (!on) {
        // Blank as well as hide: visibility alone would leave last draw's stale
        // points on the ring polygons, which flash for a frame when the group
        // comes back at a different room size.
        ringDefs[i2] = null;
        var stale = ringPolys[i2] || [];
        for (var si = 0; si < stale.length; si++) stale[si].setAttribute('points', '');
        continue;
      }
      var cc = cleaners[i2];

      // The cleaning pulse's geometry, cached for the animation tick. Center is
      // the unit's footprint center; the pulse starts just outside the box (0.75 x
      // its width, so the first ring reads as leaving the unit rather than being
      // drawn on it) and travels out to rMax. rMax is a share of the room's SHORT
      // side, floored so a tiny room still shows a ripple and capped so a huge
      // room's pulse stays a local radius — the floor clip trims the overrun.
      var cw2 = cc.x1 - cc.x0;
      var ucx = (cc.x0 + cc.x1) / 2;
      var ucy = (cc.y0 + cc.y1) / 2;
      var r0 = 0.75 * cw2;
      var rMax = Math.max(r0 + 0.5, Math.min(7, Math.max(2.5, 0.45 * Math.min(L, W))));
      // The projection is linear, so a world circle maps to an exact ellipse and
      // the two unit-foot basis vectors below capture it completely.
      var basePt = w(ucx, ucy, 0);
      var exPt = w(ucx + 1, ucy, 0);
      var fyPt = w(ucx, ucy + 1, 0);
      ringDefs[i2] = {
        cx: basePt[0],
        cy: basePt[1],
        ex: exPt[0] - basePt[0],
        ey: exPt[1] - basePt[1],
        fx: fyPt[0] - basePt[0],
        fy: fyPt[1] - basePt[1],
        r0: r0,
        rMax: rMax,
      };

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

    // Text reads the TRUE feet (drawn x labelK) — identical to the drawn value
    // unless SCENE_MAX has clamped the box.
    var lm = mid(w(0, W, 0), w(L, W, 0));
    setLabel('length', [lm[0] - 4, lm[1] + 20], fmt(L * labelK.L, 1) + ' ft');
    var wm = mid(w(0, 0, H), w(0, W, H));
    setLabel('width', [wm[0] - 12, wm[1] - 12], fmt(W * labelK.W, 1) + ' ft');
    var hm = mid(w(0, W, 0), w(0, W, H));
    setLabel('height', [hm[0] - 26, hm[1]], fmt(H * labelK.H, 1) + ' ft');

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
    setLine('width', w(0, 0, H), w(0, W, H));
    setLine('height', w(0, W, 0), w(0, W, H));

    // Repaint the pulse from the bases just cached. Doing it HERE rather than
    // only in the rAF tick keeps the rings correct on the draws that aren't part
    // of the animation — the initial render, and the re-fit after a resize (which
    // under prefers-reduced-motion is the only draw there is).
    paintRings();
  };

  // Time scale: HOUR_SECONDS of wall-clock = one hour. ONE RING travelling from
  // the unit out to its full radius and fading out is ONE AIR CHANGE, so a fresh
  // ring leaves a cleaner every HOUR_SECONDS / ACH seconds. RING_COUNT rings are
  // in flight at a time, evenly spaced through the cycle.
  var HOUR_SECONDS = 5;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The pulse's explicit stop (SC 2.2.2: auto-playing, indefinite motion needs
  // one). Toggled by the corner button; starts paused under
  // prefers-reduced-motion — the same standstill those users always got, now
  // reversible in either direction.
  var pulsePaused = reduced;
  var cur = { L: 12, W: 10, H: 8 };
  var tgt = { L: 12, W: 10, H: 8 };
  var capS = 0;
  var capSTgt = 0;
  var capMaxVol = 0;
  var capClamped = false;
  var capG = svg.querySelector('[data-capg]');
  var capGBack = svg.querySelector('[data-capg-back]');
  // The ghost's caption is a sibling drawn after the room contents — shown and
  // hidden in lockstep with capG.
  // Upper outline (top face + near vertical) + caption: the late-painted half of
  // the ghost, shown/hidden in lockstep with capG.
  var capLabel = svg.querySelector('[data-capg-top]');
  // Per-cleaner air-change cadence: laneAch[i] = that cleaner's flow x 60 / room
  // volume. Zero (blank cleaner) -> no pulse on that unit.
  var laneAch = [];
  // idle | pass | fail | shop (aggregate tint). 'shop' is the preview state: no
  // cleaner entered, but a room + a target are, so the scene shows what buying to
  // the recommended rating would look like. Everything that asks "is the scene
  // live?" asks stateNow !== 'idle', so 'shop' animates by construction; only the
  // two places that name 'pass'/'fail' explicitly (the verdict copy and the fail
  // recolour) treat it differently.
  var stateNow = 'idle';
  var running = false;
  var last = 0;
  // Where each cleaner's pulse sits in its cycle, 0…1. One full cycle is one air
  // change for THAT cleaner; ring k rides k/RING_COUNT ahead of the phase, which
  // keeps the three ripples evenly spaced no matter the cadence.
  var ringPhase = [];
  for (var rf = 0; rf < MAX_CLEANERS; rf++) ringPhase[rf] = 0;
  var animating = function () {
    return stateNow !== 'idle' && !pulsePaused;
  };

  // Paint every drawn cleaner's rings at the CURRENT phase, off the screen bases
  // drawScene cached. A ring's radius travels linearly from r0 out to rMax across
  // one cycle while its stroke fades to nothing, so it dissolves at its widest
  // rather than snapping back to the unit.
  var paintRings = function () {
    for (var i = 0; i < MAX_CLEANERS; i++) {
      var d = ringDefs[i];
      var polys = ringPolys[i];
      if (!d || !polys) continue;
      for (var k = 0; k < RING_COUNT; k++) {
        var poly = polys[k];
        if (!poly) continue;
        // While paused (the corner button, or prefers-reduced-motion's initial
        // state) the phase never advances, so the rings park at their static
        // offsets (p = k/RING_COUNT).
        var p = (ringPhase[i] + k / RING_COUNT) % 1;
        var r = d.r0 + (d.rMax - d.r0) * p;
        var pts = [];
        for (var s = 0; s < RING_STEPS; s++) {
          var th = (s / RING_STEPS) * Math.PI * 2;
          var ca = Math.cos(th);
          var sa = Math.sin(th);
          pts.push(
            (d.cx + r * (d.ex * ca + d.fx * sa)).toFixed(1) +
              ',' +
              (d.cy + r * (d.ey * ca + d.fy * sa)).toFixed(1)
          );
        }
        poly.setAttribute('points', pts.join(' '));
        poly.setAttribute('stroke-opacity', (0.55 * (1 - p)).toFixed(2));
      }
    }
  };

  // Advance each cleaner's pulse — one cycle per air change for THAT cleaner,
  // with the interval clamped so a very high ACH doesn't strobe and a very low one
  // still visibly moves. Pure arithmetic: the repaint is drawScene's job and runs
  // immediately after on the same tick.
  var updateRings = function (dt) {
    if (stateNow === 'idle' || pulsePaused) return;
    for (var i = 0; i < MAX_CLEANERS && i < sceneN; i++) {
      var ach = laneAch[i];
      if (!ach || !isFinite(ach)) continue;
      // Quarter of the air-change cadence — faster rates read as too frenetic.
      var interval = Math.max(1.2, Math.min(80, (4 * HOUR_SECONDS) / ach));
      ringPhase[i] = (ringPhase[i] + dt / interval) % 1;
    }
  };

  // Flag every ring group the scene should NOT pulse: cleaners past sceneN, and
  // cleaners with no cadence. The CSS hides a flagged group outright, so this is
  // the per-lane counterpart to the container's data-state. It runs after EVERY
  // laneAch fill — recompute has two (the measured cleaners, and shop mode's
  // split of the target) — so the flags can never drift from the cadences.
  var syncLaneIdle = function () {
    for (var i = 0; i < MAX_CLEANERS; i++) {
      var idle = !(i < sceneN && laneAch[i] > 0);
      var g = svg.querySelector('.smaqmd-cityview__rings[data-rings="' + (i + 1) + '"]');
      if (!g) continue;
      if (idle) g.setAttribute('data-lane-idle', '');
      else g.removeAttribute('data-lane-idle');
    }
  };

  var frame = function (ts) {
    if (!sceneLive) {
      running = false;
      return;
    }
    var dt = Math.min(0.05, (ts - last) / 1000 || 0);
    last = ts;

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
    // Advance the pulse BEFORE drawing: drawScene re-caches each cleaner's ring
    // bases for the room's current size and then repaints from them, so this order
    // paints this tick's phase against this tick's geometry.
    updateRings(dt);
    drawScene(cur.L, cur.W, cur.H);

    if (morphing || animating()) requestAnimationFrame(frame);
    else running = false;
  };
  var startLoop = function () {
    if (!sceneLive || running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  };

  // Soft upper bounds on room size. NOT a validity gate — the ACH arithmetic is
  // correct at any size, so an over-size room still computes and still shows a
  // result; it only raises the [data-room-warn] alert, because at this scale the
  // overwhelmingly likely cause is a typo. The DRAG grips clamp to the same
  // numbers, so pulling an edge and typing a value can never disagree.
  var ROOM_MAX = { length: 100, width: 100, height: 30, area: 10000, volume: 300000 };
  var ROOM_MIN = 1;
  // Is any entered field, in the CURRENT entry mode, past its bound?
  var roomOversize = function () {
    var over = function (name) {
      var v = num(name);
      return isFinite(v) && v > ROOM_MAX[name];
    };
    switch (raw('roomMethod')) {
      case 'dimensions':
        return over('length') || over('width') || over('height');
      case 'area':
        return over('area') || over('height');
      case 'volume':
        return over('volume');
      default:
        return false;
    }
  };
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
    // Clamp what we DRAW at SCENE_MAX, and record how far the true box overran
    // so the dimension labels can still read the entered feet.
    tgt.L = Math.min(b.L, SCENE_MAX);
    tgt.W = Math.min(b.W, SCENE_MAX);
    tgt.H = Math.min(b.H, SCENE_MAX_H);
    labelK.L = b.L / tgt.L;
    labelK.W = b.W / tgt.W;
    labelK.H = b.H / tgt.H;
    startLoop();
  };

  // ---- scene pause ----
  // TWO things can hide the scene under 68rem: the breakpoint itself, and the
  // step — narrow shows the scene ONLY on the result section, whose id renderStep
  // stamps on the root (and toIntro clears). The condition below is the exact
  // complement of the CSS in the 68rem block, so the loop is live if and only if
  // the band is on screen. Coming back, the eased room box and the ghost's scale
  // are SNAPPED rather than replayed (a morph the user never triggered, of a scene
  // they were not looking at), then refit and restarted via morphScene.
  var syncSceneLive = function () {
    var live =
      hasScene && !(isResponsive && mqMobile.matches && root.getAttribute('data-section') !== '3');
    if (live === sceneLive) return;
    sceneLive = live;
    if (!live) return;
    cur.L = tgt.L;
    cur.W = tgt.W;
    cur.H = tgt.H;
    capS = capSTgt;
    syncViewport();
    morphScene();
  };
  if (isResponsive && hasScene) mqMobile.addEventListener('change', syncSceneLive);

  // ---- pulse pause/play ----
  // Label + glyph swap together (a media-style toggle, not aria-pressed).
  // Resuming must call startLoop(): a fully settled scene has no rAF in flight
  // to pick the phase back up.
  var pulseToggle = root.querySelector('[data-pulse-toggle]');
  var syncPulseToggle = function () {
    if (!pulseToggle) return;
    var label = (pulsePaused ? 'Play' : 'Pause') + ' the air-cleaning animation';
    pulseToggle.setAttribute('aria-label', label);
    pulseToggle.setAttribute('title', label);
    var icons = pulseToggle.querySelectorAll('[data-icon]');
    for (var ic = 0; ic < icons.length; ic++) {
      icons[ic].style.display =
        (icons[ic].getAttribute('data-icon') === 'pause') === pulsePaused ? 'none' : '';
    }
  };
  if (pulseToggle) {
    syncPulseToggle();
    pulseToggle.addEventListener('click', function () {
      pulsePaused = !pulsePaused;
      syncPulseToggle();
      if (!pulsePaused) startLoop();
    });
  }

  var cleanersHost = root.querySelector('[data-cleaners]');
  var template = root.querySelector('[data-cleaner-template]');
  var cleanerBlocks = function () {
    return qa('[data-cleaner-block]:not([data-removing])');
  };
  var nextId = 0;

  var CLEANER_FIELDS = [
    'unit',
    'airflow',
    'ach',
    'refMethod',
    'refArea',
    'refLength',
    'refWidth',
    'refHeight',
  ];

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

  var resetCleaners = function () {
    cleanersHost.replaceChildren();
    nextId = 0;
    addCleaner();
  };

  var removeCleaner = function (b) {
    // Move focus OFF the doomed block before anything collapses — the activated
    // Remove button is inside it, and removing a focused element drops focus to
    // <body>. Nearest surviving block's Remove button when 2+ remain (theirs
    // stay visible); otherwise the Add button (the sole survivor's Remove
    // button is about to hide).
    var all = cleanerBlocks();
    var idx = all.indexOf(b);
    var rest = all.filter(function (x) {
      return x !== b;
    });
    var next = null;
    if (rest.length > 1) {
      var neighbor = rest[Math.min(idx, rest.length - 1)];
      next = neighbor.querySelector('[data-remove-cleaner] button');
    }
    if (!next) next = root.querySelector('[data-add-cleaner] button');
    if (next) next.focus();
    kitAnnounce('Air cleaner ' + (idx + 1) + ' removed.');
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
    b.getBoundingClientRect();
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
    recompute();
  };

  var showEl = function (el, on) {
    if (el) el.hidden = !on;
  };
  var syncVisibility = function () {
    var method = raw('roomMethod') || 'dimensions';
    qa('[data-room]').forEach(function (el) {
      showEl(el, el.getAttribute('data-room').split(' ').indexOf(method) !== -1);
    });
    container.dataset.entryMode = method;

    showEl(root.querySelector('[data-cleaner-entry]'), raw('hasCleaner') !== 'no');

    var blocks = cleanerBlocks();
    blocks.forEach(function (b, i) {
      var title = b.querySelector('.smaqmd-aerb__cleaner-title');
      if (title) title.textContent = 'Air cleaner ' + (i + 1);
      var rm = b.querySelector('[data-remove-cleaner]');
      showEl(rm, blocks.length > 1);
      var btn = rm ? rm.querySelector('button') : null;
      if (btn) btn.setAttribute('aria-label', 'Remove air cleaner ' + (i + 1));
      var unitMode = raw('unit', b.getAttribute('data-cleaner-block'));
      showEl(b.querySelector('[data-unit-mode="airflow"]'), unitMode !== 'ach');
      showEl(b.querySelector('[data-unit-mode="ach"]'), unitMode === 'ach');
      // Reference-room entry mode inside the ACH sub-form — the same wrapper rule
      // as [data-room] above, but queried on the BLOCK so each cleaner keeps its
      // own choice.
      var refMethod = raw('refMethod', b.getAttribute('data-cleaner-block')) || 'area';
      var refWraps = b.querySelectorAll('[data-ref]');
      for (var r = 0; r < refWraps.length; r++) {
        showEl(refWraps[r], refWraps[r].getAttribute('data-ref').split(' ').indexOf(refMethod) !== -1);
      }
    });
    var atCap = blocks.length >= MAX_CLEANERS;
    showEl(root.querySelector('[data-add-cleaner]'), !atCap);
    showEl(root.querySelector('[data-cap-note]'), atCap);
  };

  var block = root.querySelector('[data-result]');
  var setMetric = function (name, html) {
    var el = root.querySelector('[data-metric="' + name + '"] .smaqmd-stat__value');
    if (el) el.innerHTML = html;
  };
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
    if (on && wasHidden && el.hasAttribute('data-alert')) {
      kitAnnounce((el.textContent || '').trim(), {
        assertive: el.getAttribute('data-alert') === 'assertive',
      });
    }
  };

  // In ACH mode the flow is derived from the reported ACH x the manufacturer's
  // reference room volume / 60. That volume is L*W*(H||8) or area*(H||8), whichever
  // way the block's refMethod says the room was given.
  var cleanerFlow = function (id) {
    var f;
    if (raw('unit', id) === 'ach') {
      var refH = pos('refHeight', id) || 8;
      var refVol =
        raw('refMethod', id) === 'dimensions'
          ? num('refLength', id) * num('refWidth', id) * refH
          : num('refArea', id) * refH;
      f = (pos('ach', id) * refVol) / 60;
    } else {
      f = pos('airflow', id);
    }
    return isFinite(f) && f > 0 ? f : 0;
  };
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

  var setVerdictCard = function (state) {
    var cards = block.querySelectorAll('[data-verdict-card]');
    for (var i = 0; i < cards.length; i++) {
      show(cards[i], cards[i].getAttribute('data-verdict-card') === state);
    }
  };

  var answerG = block.querySelector('[data-group="answer"]');
  var answerTitle = block.querySelector('[data-answer-title]');
  var targetWarn = root.querySelector('[data-target-warn]');
  var targetInvalid = root.querySelector('[data-target-invalid]');
  var roomWarn = root.querySelector('[data-room-warn]');
  // The quick-set slider above the target field. It FOLLOWS the field — every
  // path that can alter the target (a drag, typing, the initial paint) ends in
  // recompute(), so the sync lives there and nowhere else.
  var targetSliderEl = root.querySelector('[data-field="targetSlider"]');
  var SLIDER_MIN = 1;
  var SLIDER_MAX = 8;
  var SLIDER_STEP = 0.5;
  // What the notched landmark labels say, for the ear. The label row is
  // aria-hidden decoration, and a bare range announces "3.5" — no unit, no hint
  // that 2 or 5 or 6 means anything — so aria-valuetext carries both. Only the
  // three landmark values get a meaning; every other stop is just the number and
  // its unit. Both paths that can move this thumb (a drag, and the programmatic
  // sync below) go through here, so the two can never disagree.
  var TARGET_LANDMARK_TEXT = {
    2: 'CARB minimum',
    5: 'what box ratings assume',
    6: 'wildfire smoke level',
  };
  var targetValueText = function (v) {
    var meaning = TARGET_LANDMARK_TEXT[v];
    return v + ' air changes per hour' + (meaning ? ' — ' + meaning : '');
  };
  var setTargetValueText = function (v) {
    if (!targetSliderEl) return;
    targetSliderEl.setAttribute('aria-valuetext', targetValueText(v));
  };
  var syncTargetSlider = function (entered) {
    if (!targetSliderEl) return;
    // A blank or junk field leaves the thumb exactly where it is: there is no
    // "no value" position on a slider, and snapping it to the minimum would show
    // a target the user never asked for.
    if (!isFinite(entered)) return;
    // Clamp to the track, then round to the step — the native input snaps the
    // THUMB to the step anyway, and the painted fill below is computed from this
    // same number, so rounding here keeps the two from disagreeing by half a step
    // on a typed 3.3. The field keeps the exact 3.3.
    var clamped = Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, entered));
    var next = Math.round(clamped / SLIDER_STEP) * SLIDER_STEP;
    // Writing .value fires no event, so this can never loop back into onEdit.
    if (parseFloat(targetSliderEl.value) !== next) {
      targetSliderEl.value = String(next);
    }
    // The lego paints its track fill from (value - min) / (max - min); a native
    // input has no such hook, so app.js hands the same number to the stylesheet.
    targetSliderEl.style.setProperty(
      '--_fill-percent',
      ((next - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100 + '%'
    );
    // Announce the rounded number the thumb actually sits on, not the raw 3.3
    // still in the field — the two are the field's business, and a slider that
    // reads out a position it is not in would be a lie.
    setTargetValueText(next);
  };
  var achWrap = block.querySelector('[data-metric="ach"]');
  var achEvidence = block.querySelector('[data-ach-evidence]');
  var fixWrap = block.querySelector('[data-metric="fix"]');
  // The fix stat's label + sub are REWRITTEN per rating mode (see renderFix), so
  // they are grabbed once here alongside the wrapper rather than re-queried.
  var fixLabel = fixWrap ? fixWrap.querySelector('.smaqmd-stat__label') : null;
  var fixSub = fixWrap ? fixWrap.querySelector('.smaqmd-stat__sub') : null;
  var fixEquiv = fixWrap ? fixWrap.querySelector('[data-ach-equiv]') : null;
  var fixEquivRows = fixWrap ? fixWrap.querySelector('[data-ach-equiv-rows]') : null;
  var cadrHighEl = block.querySelector('[data-cadr-high]');
  var setAnswer = function (title, verdict) {
    if (answerTitle) answerTitle.textContent = title;
    if (answerG) {
      if (verdict) answerG.setAttribute('data-verdict', verdict);
      else answerG.removeAttribute('data-verdict');
      show(answerG, verdict != null);
    }
  };

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
    var cleanerCount = hasCleaners() ? Math.max(1, blocks.length) : 1;
    sceneN = Math.min(Math.max(1, blocks.length), MAX_CLEANERS);
    var target = pos('target') || 2;
    setReadout('target', fmt(target, 2));
    var enteredTarget = num('target');
    var targetIsInvalid = isFinite(enteredTarget) && enteredTarget <= 0;
    show(targetInvalid, targetIsInvalid);
    show(roomWarn, roomOversize());
    show(targetWarn, isFinite(enteredTarget) && enteredTarget > 0 && enteredTarget < 2);
    syncTargetSlider(enteredTarget);

    var flow = combinedFlow();
    var vol = roomVolume();
    var hasFlow = flow > 0;
    var hasRoom = isFinite(vol) && vol > 0;
    // The shop flow's scene preview: no cleaner to measure, but a room AND a real
    // target, which is everything the recommendation is made of — so the scene can
    // show it. `target` alone can't gate this (it falls back to 2 when the field is
    // blank); a preview of a number the user hasn't given would be the tool
    // answering its own question, so it takes the ENTERED target. The three result
    // branches below key their scene state off this same flag.
    var shopPreview = !hasFlow && hasRoom && isFinite(enteredTarget) && enteredTarget > 0;

    var area = roomArea();
    var coverVol = hasFlow ? (flow * 60) / target : NaN;
    var asFt3 = raw('units') === 'ft3';
    // Which rating the "shop for" stat states (the toggle under it).
    var asAch = raw('rating') === 'ach';
    setReadout('coversubj', blocks.length > 1 ? 'Your cleaners cover' : 'Your cleaner covers');
    setReadout(
      'roomarea',
      hasRoom && isFinite(area) ? (asFt3 ? fmt(vol, 0) + ' ft³' : fmt(area, 0) + ' ft²') : '—'
    );
    setReadout(
      'coverarea',
      hasFlow ? (asFt3 ? fmt(coverVol, 0) + ' ft³' : fmt(coverVol / 8, 0) + ' ft²') : '—'
    );
    var ach = hasFlow && hasRoom ? (flow / vol) * 60 : NaN;
    var pass = hasFlow && hasRoom && ach >= target;
    showGroup('secondary', pass);

    if (hasFlow && hasRoom) {
      capMaxVol = (flow * 60) / target;
      var sScale = Math.sqrt(capMaxVol / vol);
      capSTgt = Math.min(sScale, 3);
      capClamped = sScale > 3;
      container.dataset.capCompare = capMaxVol >= vol ? 'bigger' : 'smaller';
      if (capG) capG.style.visibility = '';
      if (capGBack) capGBack.style.visibility = '';
      if (capLabel) capLabel.style.visibility = '';
    } else if (shopPreview) {
      // Shop mode: the ghost is the RECOMMENDED setup's coverage, and the
      // recommendation is sized to this room by construction — combined CADR =
      // target x vol / 60, so the volume it covers backs out to (CADR x 60) /
      // target = vol exactly. The ghost therefore lands FLUSH on the room box
      // (scale 1, never clamped, never the smaller of the two). That coincidence is
      // the whole point of showing it: the label reads "covers a room up to <this
      // room>", which turns an abstract rating into the box the user is standing
      // in. Computed straight from vol rather than through the CADR — needCadr is
      // declared further down, and threading it up here would make the ghost depend
      // on statement order for a value we already know.
      capMaxVol = vol;
      capSTgt = 1;
      capClamped = false;
      container.dataset.capCompare = 'bigger';
      if (capG) capG.style.visibility = '';
      if (capGBack) capGBack.style.visibility = '';
      if (capLabel) capLabel.style.visibility = '';
    } else {
      capSTgt = 0;
      capClamped = false;
      if (capG) capG.style.visibility = 'hidden';
      if (capGBack) capGBack.style.visibility = 'hidden';
      if (capLabel) capLabel.style.visibility = 'hidden';
    }

    laneAch.length = 0;
    blocks.forEach(function (b, i) {
      if (i >= MAX_CLEANERS) return;
      var f = cleanerFlow(b.getAttribute('data-cleaner-block'));
      laneAch[i] = hasRoom && f > 0 ? (f / vol) * 60 : 0;
    });
    syncLaneIdle();

    var needCadr = (target * vol) / 60;
    // The "shop for" stat, written in whichever rating the toggle asks for. Both
    // the FAIL and the SHOP path below render it, so it lives here as one function
    // rather than as two copies that could word the same number differently.
    //   CADR - the number printed on the box, in CFM. Combined, because a CADR is
    //          not bought per unit: it is the sum the setup has to reach.
    //   ACH  - the user's own target, restated as the claim a box would have to
    //          make: N air changes an hour IN A ROOM AT LEAST THIS BIG. There is no
    //          standard test room to convert a CADR against, so the qualification
    //          is their room, not a fictional one.
    var renderFix = function () {
      if (asAch) {
        setMetric('fix', fmt(target, 2) + unitSpan('ACH'));
        if (fixLabel) fixLabel.textContent = 'ACH coverage to shop for';
        if (fixSub) {
          fixSub.textContent =
            fmt(target, 2) + ' air changes per hour in your ' +
            fmt(area, 0) + ' ft² room';
        }
        // The equivalence rows: a listing pair (A ACH, S ft²) implies a CADR of
        // A * S * 8 / 60, so the pair qualifies when S >= needCadr * 7.5 / A.
        // Printed at the ACH levels listings actually quote, plus the user's own
        // target when it isn't one of them; ceil keeps every row conservative.
        if (fixEquivRows) {
          var levels = [1, 2, 4, 5];
          if (target > 0 && levels.indexOf(target) === -1) levels.push(target);
          levels.sort(function (a, b) { return a - b; });
          fixEquivRows.textContent = '';
          for (var li = 0; li < levels.length; li++) {
            var row = document.createElement('li');
            row.textContent =
              fmt(levels[li], 2) + ' ACH — covers ' +
              fmt(Math.ceil((needCadr * 7.5) / levels[li]), 0) + ' ft² or more';
            fixEquivRows.appendChild(row);
          }
        }
        show(fixEquiv, true);
      } else {
        setMetric('fix', fmt(needCadr, 0) + unitSpan('CFM (ft³/min)'));
        if (fixLabel) fixLabel.textContent = 'combined CADR to shop for';
        if (fixSub) fixSub.textContent = 'added up across all the air cleaners in the room';
        show(fixEquiv, false);
      }
    };
    var setPrompt = function (on) {
      show(block.querySelector('[data-prompt="empty"]'), on);
    };

    if (targetIsInvalid) {
      show(achWrap, false);
      show(achEvidence, false);
      show(fixWrap, false);
      setAnswer('', null);
      setVerdictCard(null);
      showGroup('secondary', false);
      stateNow = 'idle';
      container.dataset.state = 'idle';
      setPrompt(true);
      announce('');
    } else if (hasFlow && hasRoom) {
      setMetric('ach', fmt(ach, 1));
      setReadout('ach', fmt(ach, 1));
      show(achWrap, pass);
      show(achEvidence, !pass);
      var achSub = achWrap ? achWrap.querySelector('.smaqmd-stat__sub') : null;
      if (achSub) {
        achSub.textContent =
          (pass ? 'Meets' : 'Below') + ' your ' + fmt(target, 2) + ' air changes per hour target';
      }
      renderFix();
      show(fixWrap, !pass);
      if (!pass) {
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
        setReadout('unitnoun', moreUnits === 1 ? 'air cleaner' : 'air cleaners');
      }
      // The >700 caution is SHOP-mode-only: here "Add N more" already carries
      // the multi-unit reality.
      show(cadrHighEl, false);
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
      show(achWrap, false);
      show(achEvidence, false);
      renderFix();
      show(fixWrap, true);
      // The over-700 caution stays keyed to needCadr and worded in CFM in BOTH
      // rating modes — the ceiling it warns about is a limit on how much air a
      // consumer unit can physically move, which does not change because the stat
      // above is currently phrased as air changes.
      show(cadrHighEl, needCadr > 700);
      setAnswer('Shop for this rating', 'shop');
      setVerdictCard('shop');
      setPrompt(false);
      if (shopPreview) {
        // Preview the recommended setup in the scene. The units drawn are the ones
        // the user PLANS to buy — cleanerCount, the same divisor the CADR guidance
        // is written against — not blocks.length, so a shopper who entered cleaners
        // and then answered "No" doesn't get a room full of units they said they
        // don't have. Clamped to what the scene can draw.
        sceneN = Math.min(Math.max(1, cleanerCount), MAX_CLEANERS);
        // Each planned unit pulses at its SHARE of the target, so the ripples
        // together read as exactly the target rate — the same cadence the pass
        // state will show once the recommended cleaners are actually in the room.
        // Lanes past the planned count get 0 and go idle, which is why this
        // re-syncs the flags: sceneN just moved under them.
        laneAch.length = 0;
        for (var si = 0; si < MAX_CLEANERS; si++) laneAch[si] = si < sceneN ? target / sceneN : 0;
        syncLaneIdle();
        stateNow = 'shop';
        container.dataset.state = 'shop';
        startLoop();
      } else {
        // No target entered — there is no rate to preview, so the scene stays idle
        // exactly as it did before the preview existed. The ghost gate above
        // already zeroed capSTgt; wake the loop only to ease a residual ghost away,
        // the same guard the no-room branch uses.
        stateNow = 'idle';
        container.dataset.state = 'idle';
        if (capS > 0.01) startLoop();
      }
      // The announcement follows the rating mode, so what is heard matches what is
      // shown. Spelled out, not "ACH": this string is spoken.
      announce(
        asAch
          ? 'Look for a listing that covers at least ' + fmt(Math.ceil(needCadr * 7.5), 0) +
              ' square feet at 1 air change per hour, or a matching size from the on-screen list at a higher ACH.'
          : cleanerCount > 1
            ? 'To reach ' + fmt(target, 1) + " air changes per hour, your cleaners' combined " +
                'CADR needs to be at least ' + fmt(needCadr, 0) + ' CFM.'
            : 'To reach ' + fmt(target, 1) + ' air changes per hour in this room, look for an ' +
                'air cleaner with a CADR of at least ' + fmt(needCadr, 0) + ' CFM.'
      );
    } else {
      show(achWrap, false);
      show(achEvidence, false);
      show(fixWrap, false);
      setAnswer('', null);
      setVerdictCard(null);
      stateNow = 'idle';
      container.dataset.state = 'idle';
      setPrompt(true);
      announce('');
      if (capS > 0.01) startLoop();
    }
  };

  var sanitizeNumeric = function (s) {
    var out = s.replace(/[^0-9.]/g, '');
    var dot = out.indexOf('.');
    if (dot !== -1) out = out.slice(0, dot + 1) + out.slice(dot + 1).replace(/\./g, '');
    return out;
  };

  var prefillMode = function (method) {
    // labelK un-clamps the drawn box back to the entered feet, so switching modes
    // on an over-SCENE_MAX room prefills the TRUE area/volume.
    var tL = tgt.L * labelK.L;
    var tW = tgt.W * labelK.W;
    var tH = tgt.H * labelK.H;
    if (method === 'area') {
      var fa = field('area');
      if (fa && !raw('area')) setFieldValue(fa, String(Math.round(tL * tW)));
    } else if (method === 'volume') {
      var fv = field('volume');
      if (fv && !raw('volume')) setFieldValue(fv, String(Math.round(tL * tW * tH)));
    }
  };

  var onEdit = function (e) {
    var el = e.target;
    if (!el || !el.tagName) return;
    if (el.hasAttribute && el.hasAttribute('data-numeric')) {
      var clean = sanitizeNumeric(el.value || '');
      if (clean !== el.value) el.value = clean;
    }
    if (el.type === 'radio' && el.closest) {
      var group = el.closest('[data-field]');
      if (group && group.getAttribute('data-field') === 'roomMethod') {
        prefillMode(getFieldValue(group) || 'dimensions');
      }
    }
    // The slider writes its number into the target field and stops being
    // consulted — everything downstream reads the field. No synthetic input
    // event: this IS the pipeline, and the recompute() below re-derives the thumb
    // (and the painted fill) from the field it just wrote. A native range fires
    // 'input' on every drag tick, so the existing delegation already carries it.
    if (el.getAttribute && el.getAttribute('data-field') === 'targetSlider') {
      var ft = field('target');
      if (ft) setFieldValue(ft, el.value);
      // Rewrite the readout from the thumb's OWN value, in the same tick as the
      // input event: recompute() below reaches the same string via
      // syncTargetSlider, but a screen reader reads aria-valuetext as the event
      // is handled, so it has to be current before the round trip through the
      // field, not after it.
      setTargetValueText(parseFloat(el.value));
    }
    morphScene();
    recompute();
  };
  root.addEventListener('input', onEdit);
  root.addEventListener('change', onEdit);

  root.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('[data-add-cleaner]')) {
      e.preventDefault();
      if (cleanerBlocks().length >= MAX_CLEANERS) return;
      addCleaner({ copyLast: true, animate: true });
      morphScene();
      recompute();
      // The add that reaches the cap hides this very button (syncVisibility
      // inside recompute), which would drop focus to <body>. Land it on the new
      // block's first control, and say why the button went away — the cap note
      // appears silently otherwise.
      var atCapNow = cleanerBlocks();
      if (atCapNow.length >= MAX_CLEANERS) {
        var newest = atCapNow[atCapNow.length - 1];
        var firstInput = newest ? newest.querySelector('input') : null;
        if (firstInput) firstInput.focus();
        var capNote = root.querySelector('[data-cap-note]');
        kitAnnounce(
          capNote && capNote.textContent
            ? capNote.textContent.trim()
            : 'You have added the maximum number of air cleaners.'
        );
      }
      return;
    }
    var rm = t.closest('[data-remove-cleaner]');
    if (rm) {
      e.preventDefault();
      var b = rm.closest('[data-cleaner-block]');
      if (b && !b.hasAttribute('data-removing')) removeCleaner(b);
    }
  });

  var AXIS = { length: [COS30, SIN30], width: [COS30, -SIN30], height: [0, -1] };
  var KEY = { length: 'L', width: 'W', height: 'H' };
  var drag = null;

  svg.addEventListener('pointerdown', function (e) {
    if (raw('roomMethod') !== 'dimensions') return;
    var grip = e.target && e.target.closest ? e.target.closest('[data-grip]') : null;
    if (!grip) return;
    var dim = grip.getAttribute('data-grip');
    // v0 is the ENTERED value, not tgt — they differ only on a room past
    // SCENE_MAX, where tgt holds the clamped drawn box and dragging from it would
    // yank the field down to the clamp.
    drag = { dim: dim, sx: e.clientX, sy: e.clientY, v0: pos(dim) || tgt[KEY[dim]], sc: fitScale };
    if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
    container.dataset.dragging = dim;
    e.preventDefault();
  });
  svg.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var ax = AXIS[drag.dim];
    var ft = ((e.clientX - drag.sx) * ax[0] + (e.clientY - drag.sy) * ax[1]) / drag.sc;
    var next = Math.min(ROOM_MAX[drag.dim], Math.max(ROOM_MIN, Math.round((drag.v0 + ft) * 2) / 2));
    var f = field(drag.dim);
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

  var renderStep = function (dir) {
    if (dir === undefined) dir = 0;
    var isResult = stepIdx >= plan.length;
    var section = isResult ? RESULT_SECTION : plan[stepIdx];
    // The narrow layout keys the scene's visibility off the section (result only
    // — see the 68rem block in styles.css); sceneLive re-reads the same flag so
    // the rAF loop starts and stops with the band.
    root.setAttribute('data-section', String(section));
    syncSceneLive();
    stepSections.forEach(function (s) {
      show(s, Number(s.getAttribute('data-step')) === section);
    });
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
      show(d, !isResult && i < plan.length);
      d.toggleAttribute('data-active', i === stepIdx && !isResult);
      d.toggleAttribute('data-done', i < stepIdx);
    });
    show(root.querySelector('.smaqmd-wizard__dots'), !isResult);
    if (stepCountEl) {
      stepCountEl.textContent = isResult
        ? 'Result'
        : 'Step ' + (stepIdx + 1) + ' of ' + plan.length;
    }
    if (stepTitleEl) {
      var answerText = isResult && answerTitle ? (answerTitle.textContent || '').trim() : '';
      stepTitleEl.textContent = answerText && answerText !== '—' ? answerText : TITLES[section];
    }
    var verdict = isResult && answerG ? answerG.getAttribute('data-verdict') : null;
    if (wizardEl) {
      if (verdict) wizardEl.setAttribute('data-verdict', verdict);
      else wizardEl.removeAttribute('data-verdict');
    }
    show(navEl('back'), stepIdx > 0 || !!introEl);
    show(navEl('next'), stepIdx < plan.length - 1);
    show(navEl('result'), stepIdx === plan.length - 1);
    show(navEl('restart'), isResult);
    if (roomHint && section !== 0) show(roomHint, false);
    syncViewport();
    if (dir !== 0 && stepTitleEl) stepTitleEl.focus();
  };

  var goStep = function (i) {
    var next = Math.min(Math.max(0, i), plan.length);
    if (next > stepIdx && plan[stepIdx] === 0 && !roomValid()) {
      if (roomHint) show(roomHint, true);
      return;
    }
    var dir = next === stepIdx ? 0 : next > stepIdx ? 1 : -1;
    stepIdx = next;
    renderStep(dir);
  };

  var toIntro = function () {
    stepIdx = 0;
    // No section is on screen while the opening slide is — clear the flag so the
    // narrow layout hides the scene again (and the loop stops with it).
    root.removeAttribute('data-section');
    syncSceneLive();
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
    var intent = t.closest('[data-nav="check"], [data-nav="shop"]');
    if (intent) {
      e.preventDefault();
      var shopping = intent.matches('[data-nav="shop"]');
      setFieldValue(field('hasCleaner'), shopping ? 'no' : 'yes');
      syncVisibility();
      recompute();
      plan = shopping ? SHOP_PLAN : FULL_PLAN;
      stepIdx = 0;
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

  root.addEventListener('input', function () {
    if (stepIdx === 0 && roomHint && roomValid()) show(roomHint, false);
  });

  resetCleaners();
  drawScene(cur.L, cur.W, cur.H);
  syncVisibility();
  morphScene();
  recompute();
  renderStep();
})();
