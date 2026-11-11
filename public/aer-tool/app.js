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

  var mqMobile = window.matchMedia('(max-width: 68rem)');

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
  var MAX_SCALE = 24;
  var SCENE_MAX = 60;
  var SCENE_MAX_H = 20;
  var labelK = { L: 1, W: 1, H: 1 };
  var CW_BASE = 1.4;
  var CW_HARD_MAX = 2.4;
  var UNIT_MIN_PX = 22;
  var WALL_T = 0.35;
  var FLOOR_D = 0.35;
  var sceneSentinel = root.querySelector('[data-safe]');
  var sentinel = sceneSentinel || document.createElement('div');
  var hasScene = !!(sceneSvg && sceneStage && sceneSentinel);

  var pulseToggle = root.querySelector('[data-pulse-toggle]');

  var pauseBox = null;

  var capStrokeEl = svg.querySelector('[data-cap="top"]');
  var capStroke = capStrokeEl ? parseFloat(getComputedStyle(capStrokeEl).strokeWidth) || 0 : 0;
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

    var p = pulseToggle ? pulseToggle.getBoundingClientRect() : null;
    pauseBox =
      p && p.width ? { x: p.left - c.left, y: p.top - c.top, w: p.width, h: p.height } : null;
    drawScene(cur.L, cur.W, cur.H);
  };
  if (hasScene && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncViewport).observe(sentinel);
  }

  var ringDefs = [];
  var RING_COUNT = 4;
  var RING_STEPS = 28;
  var sceneN = 1;
  var sceneTarget = 2;
  var MAX_CLEANERS = 4;
  var UNIT_MAX_CFM = 700;
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
  var elCache = {};
  var el1 = function (sel) {
    if (!Object.prototype.hasOwnProperty.call(elCache, sel)) elCache[sel] = svg.querySelector(sel);
    return elCache[sel];
  };
  var setPoly = function (sel, pts) {
    var el = el1(sel);
    if (el) el.setAttribute('points', ptsAttr(pts));
  };
  var setLabel = function (name, at, text) {
    var el = el1('[data-label="' + name + '"]');
    if (!el) return;
    el.setAttribute('x', at[0].toFixed(1));
    el.setAttribute('y', at[1].toFixed(1));
    el.textContent = text;
  };
  var mid = function (p, q) {
    return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  };

  var q = function (sel) {
    return svg.querySelector(sel);
  };
  var vis = function (el, on) {
    if (el) el.style.visibility = on ? '' : 'hidden';
  };
  var setPts = function (el, pts) {
    if (el) el.setAttribute('points', ptsAttr(pts));
  };
  var FACE_IDS = ['top', 'left', 'right'];
  var boxEls = function (scope) {
    return FACE_IDS.map(function (f) {
      return q(scope + ' [data-face="' + f + '"]');
    });
  };
  var detailsG = q('[data-room-details]');
  var furnG = q('[data-furniture]');
  var waveClip = q('[data-wave-clip]');
  var winEls = function (side) {
    return {
      g: q('[data-win="' + side + '"]'),
      pane: q('[data-win="' + side + '"] [data-win-pane]'),
      mull: q('[data-win="' + side + '"] [data-win-mull]'),
    };
  };
  var winBack = winEls('back');
  var winLeft = winEls('left');
  var doorG = q('[data-door]');
  var doorLeaf = q('[data-door-leaf]');
  var doorPanels = q('[data-door-panels]');
  var boardsEl = q('[data-boards]');
  var rugEl = q('[data-rug]');
  var bedEls = {
    g: q('[data-piece="bed"]'),
    head: boxEls('[data-box="headboard"]'),
    frame: boxEls('[data-box="frame"]'),
    mattress: boxEls('[data-box="mattress"]'),
    pillowL: boxEls('[data-box="pillow-l"]'),
    pillowR: boxEls('[data-box="pillow-r"]'),
    blanketTop: q('[data-blanket="top"]'),
    blanketFront: q('[data-blanket="front"]'),
    blanketSide: q('[data-blanket="side"]'),
    fold: q('[data-fold]'),
  };
  var POOL_IDS = ['dresser', 'plant', 'bookshelf', 'desk', 'chair', 'armchair', 'wardrobe', 'sofa', 'table'];
  var poolEls = {};
  POOL_IDS.forEach(function (id) {
    var at = '[data-piece="' + id + '"]';
    var parts = {};
    var partEls = svg.querySelectorAll(at + ' [data-box]');
    for (var pi = 0; pi < partEls.length; pi++) {
      var part = partEls[pi].getAttribute('data-box');
      parts[part] = boxEls(at + ' [data-box="' + part + '"]');
    }
    poolEls[id] = {
      g: q(at),
      seam: q(at + ' [data-seam]'),
      box: function (name) {
        return parts[name] || [];
      },
    };
  });
  var nsEls = ['l', 'r'].map(function (s) {
    var at = '[data-piece="ns-' + s + '"]';
    return {
      g: q(at),
      box: boxEls(at + ' [data-box="ns"]'),
      seam: q(at + ' [data-seam]'),
      stem: boxEls(at + ' [data-box="stem"]'),
      shade: boxEls(at + ' [data-box="shade"]'),
    };
  });
  var clearEls = [1, 2, 3, 4].map(function (i) {
    return q('[data-clear="' + i + '"]');
  });
  var ringGroups = [1, 2, 3, 4].map(function (i) {
    return q('.smaqmd-cityview__rings[data-rings="' + i + '"]');
  });
  var unitEls = [1, 2, 3, 4].map(function (i) {
    var at = '[data-unitg="' + i + '"]';
    return {
      g: q(at),
      faces: [q(at + ' [data-unit="top"]'), q(at + ' [data-unit="left"]'), q(at + ' [data-unit="right"]')],
      front: q(at + ' [data-unit-face="front"]'),
      side: q(at + ' [data-unit-face="side"]'),
      top: q(at + ' [data-unit-face="top"]'),
      grilleF: q(at + ' [data-unit-face="front"] [data-grille]'),
      grilleS: q(at + ' [data-unit-face="side"] [data-grille]'),
      vent: q(at + ' [data-vent]'),
      label: q('[data-unit-label="' + i + '"]'),
    };
  });

  var setBox = function (els, w, x0, y0, z0, x1, y1, z1) {
    if (!els) return;
    setPts(els[0], [w(x0, y0, z1), w(x1, y0, z1), w(x1, y1, z1), w(x0, y1, z1)]);
    setPts(els[1], [w(x0, y1, z1), w(x1, y1, z1), w(x1, y1, z0), w(x0, y1, z0)]);
    setPts(els[2], [w(x1, y0, z1), w(x1, y1, z1), w(x1, y1, z0), w(x1, y0, z0)]);
  };
  var xy = function (p) {
    return p[0].toFixed(1) + ',' + p[1].toFixed(1);
  };
  var segD = function (a, b) {
    return 'M' + xy(a) + 'L' + xy(b);
  };
  var quadD = function (pts) {
    return 'M' + pts.map(xy).join('L') + 'Z';
  };
  var FACE_U = 0.1;
  var faceMatrix = function (w, o, u, v) {
    var p = w(o[0], o[1], o[2]);
    var pu = w(o[0] + u[0] * FACE_U, o[1] + u[1] * FACE_U, o[2] + u[2] * FACE_U);
    var pv = w(o[0] + v[0] * FACE_U, o[1] + v[1] * FACE_U, o[2] + v[2] * FACE_U);
    return (
      'matrix(' +
      (pu[0] - p[0]).toFixed(4) + ' ' + (pu[1] - p[1]).toFixed(4) + ' ' +
      (pv[0] - p[0]).toFixed(4) + ' ' + (pv[1] - p[1]).toFixed(4) + ' ' +
      p[0].toFixed(2) + ' ' + p[1].toFixed(2) + ')'
    );
  };

  var BEDROOM = {
    bedW: 5.0, bedD: 6.7, bedMinW: 3, bedMinD: 4.5, headT: 0.3, headH: 3.4, frameH: 1.0, mattH: 0.7,
    pillowD: 1.0, pillowH: 0.3, blanketFrom: 0.33, ns: 1.4, nsH: 1.8, lampStem: 0.3, lampStemH: 0.7,
    shade: 0.8, shadeH: 0.6, doorW: 2.8, doorFrom: 3.6, doorTo: 0.8, winBackInset: 0.8, winSideW: 3.4,
    winSill: 3.8, winH: 3.4, clr: 1, board: 1,
    dresser: { w: 3.6, d: 1.6, h: 2.7, area: 140 },
    plant: { pot: 1.2, potH: 1.0, crown: 1.4, crownH: 1.6, area: 200 },
    bookshelf: { w: 1.1, d: 3.2, h: 5.6, area: 220 },
    desk: { w: 3.2, d: 1.6, h: 2.5, area: 280 },
    chair: { w: 1.4, d: 1.4, h: 1.6, seatH: 0.9, back: 0.3 },
    armchair: { w: 1.9, d: 1.9, h: 2.4, seatH: 1.4, back: 0.8, area: 340 },
    wardrobe: { w: 2.4, d: 4.0, h: 6.4, area: 420 },
    sofa: { w: 2.4, d: 6.0, h: 2.6, seatH: 1.4, back: 0.8, area: 520 },
    table: { w: 1.6, d: 3.0, h: 1.4, gap: 1.0 },
  };
  var clamp = function (v, lo, hi) {
    return Math.max(Math.min(v, hi), lo);
  };
  var inside = function (v, lo, hi) {
    return lo > hi ? (lo + hi) / 2 : clamp(v, lo, hi);
  };
  var OFFS = [0, 1, -1, 2, -2, 3, -3, 4, -4, 6, -6];
  var RING = [];
  OFFS.forEach(function (dx) {
    OFFS.forEach(function (dy) {
      RING.push([dx, dy]);
    });
  });
  RING.sort(function (a, b) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1]) - Math.sqrt(b[0] * b[0] + b[1] * b[1]);
  });
  var overlaps = function (a, b) {
    return a.x0 < b.x1 - 1e-6 && a.x1 > b.x0 + 1e-6 && a.y0 < b.y1 - 1e-6 && a.y1 > b.y0 + 1e-6;
  };
  var depthOrder = function (rs) {
    var behind = function (a, b) {
      return (
        (a.x1 <= b.x0 + 1e-6 && a.y0 < b.y1 - 1e-6 && b.y0 < a.y1 - 1e-6) ||
        (a.y1 <= b.y0 + 1e-6 && a.x0 < b.x1 - 1e-6 && b.x0 < a.x1 - 1e-6)
      );
    };
    var key = function (r) {
      return r.x0 + r.x1 + r.y0 + r.y1;
    };
    var left = rs.map(function (_, i) {
      return i;
    });
    var out = [];
    var isReady = function (i) {
      return !left.some(function (j) {
        return j !== i && behind(rs[j], rs[i]);
      });
    };
    var nearer = function (a, b) {
      return key(rs[b]) < key(rs[a]) ? b : a;
    };
    while (left.length) {
      var ready = left.filter(isReady);
      var pool = ready.length ? ready : left;
      var pick = pool.reduce(nearer);
      out.push(pick);
      left.splice(left.indexOf(pick), 1);
    }
    return out;
  };
  var pieceOrderSig = '';

  var layoutRoom = function (L, W, H, n, cwOpt) {
    var BR = BEDROOM;
    var CLR = BR.clr;
    var degenerate = L < 3 || W < 3 || H < 3.5;
    var doorOn = !degenerate && W >= 8 && H >= 5;
    var doorY0 = W - BR.doorFrom;
    var doorY1 = W - BR.doorTo;
    var cw = Math.min(cwOpt == null ? CW_BASE : cwOpt, Math.min(L, W) * 0.55, CW_HARD_MAX);
    if (n >= 4) cw = Math.min(cw, W * 0.16 >= 2 ? W * 0.16 : W * 0.2 - 0.5);
    cw = Math.max(cw, 0.2);
    var m = 0;
    var cs = [];
    var bed = { x0: 0, w: 0, d: 0, on: false };
    var clampCentre = function (c) {
      return [inside(c[0], 0.3 + cw / 2, L - 0.3 - cw / 2), inside(c[1], 0.3 + cw / 2, W - 0.3 - cw / 2)];
    };
    for (var tries = 0; ; tries++) {
      m = CLR + cw / 2;
      var g = Math.max(1, 0.5 * cw);
      var bx0 = 2 * CLR + cw + 0.2;
      var d = Math.min(Math.max(Math.min(BR.bedD, 0.6 * W), BR.bedMinD), W - 2 * m - 0.3);
      var bw = Math.min(Math.max(Math.min(BR.bedW, 0.42 * L, L - 2 * m - bx0), BR.bedMinW), BR.bedW);
      var bedOn = !degenerate && d >= BR.bedMinD - 1e-9 && bx0 + bw + 0.3 <= L;
      var want = [
        [m, clamp(0.45 * W, 0.1 + BR.ns + m, (doorOn ? doorY0 : W) - m)],
        [L - m, 0.7 * W],
        [bedOn ? bx0 + bw / 2 : L / 2, W - m],
        [L - m, Math.max(0.3 * W, 0.1 + BR.ns + m + 0.2)],
      ];
      cs = want.slice(0, n).map(clampCentre);
      if (n >= 4 && cs[1][1] - cs[3][1] < cw + g) cs[3][1] = Math.max(0.3 + cw / 2, cs[1][1] - cw - g);
      bed = { x0: bx0, w: bw, d: d, on: bedOn };
      var clash = false;
      for (var i = 0; i < cs.length; i++) {
        for (var j = i + 1; j < cs.length; j++) {
          if (Math.abs(cs[i][0] - cs[j][0]) < cw + g - 1e-6 && Math.abs(cs[i][1] - cs[j][1]) < cw + g - 1e-6) clash = true;
        }
      }
      if (!clash || cw <= 0.2 || tries >= 12) break;
      cw = Math.max(0.2, cw * 0.85);
    }
    var ch = Math.min(Math.max(1.6 * cw, 2.0), 2.6, Math.max(0.3, 0.85 * H));
    var cleaners = cs.map(function (c) {
      return { x0: c[0] - cw / 2, y0: c[1] - cw / 2, x1: c[0] + cw / 2, y1: c[1] + cw / 2, h: ch };
    });
    var clear = cleaners.map(function (c) {
      return { x0: c.x0 - CLR, y0: c.y0 - CLR, x1: c.x1 + CLR, y1: c.y1 + CLR };
    });
    var free = function (r) {
      return !clear.some(function (c) {
        return overlaps(r, c);
      });
    };
    bx0 = bed.x0;
    bw = bed.w;
    var bd = bed.d;
    var bedRect = { x0: bx0 - 0.2, y0: 0, x1: bx0 + bw + 0.2, y1: bd };
    bedOn =
      bed.on &&
      free({ x0: bx0 - 0.2, y0: 0, x1: bx0 + bw + 0.2, y1: BR.headT }) &&
      free({ x0: bx0, y0: 0.3, x1: bx0 + bw, y1: bd });
    var nsL = { x0: bx0 - 0.2 - BR.ns, y0: 0.1, x1: bx0 - 0.2, y1: 0.1 + BR.ns };
    var nsR = { x0: bx0 + bw + 0.2, y0: 0.1, x1: bx0 + bw + 0.2 + BR.ns, y1: 0.1 + BR.ns };
    var nsLOn = bedOn && nsL.x0 >= 0.3 && free(nsL);
    var nsROn = bedOn && nsR.x1 <= L - 0.3 && free(nsR);
    var rug = {
      x0: Math.max(0.2, bx0 - 0.8),
      y0: bd - 2.2,
      x1: Math.min(L - 0.2, bx0 + bw + 0.8),
      y1: Math.min(bd + 4, W - 0.4),
    };
    var rugOn = bedOn && rug.y1 - rug.y0 >= 2.5;

    var GAP = 0.2;
    var hCap = 0.75 * H;
    var area = L * W;
    var blocked = clear.slice();
    if (doorOn) blocked.push({ x0: 0, y0: doorY0, x1: BR.doorW, y1: doorY1 });
    if (bedOn) blocked.push(bedRect);
    if (nsLOn) blocked.push(nsL);
    if (nsROn) blocked.push(nsR);
    var fits = function (r) {
      return (
        r.x0 >= 0.3 - 1e-6 && r.y0 >= 0.3 - 1e-6 && r.x1 <= L - 0.3 + 1e-6 && r.y1 <= W - 0.3 + 1e-6 &&
        !blocked.some(function (b) {
          return overlaps(r, { x0: b.x0 - GAP, y0: b.y0 - GAP, x1: b.x1 + GAP, y1: b.y1 + GAP });
        })
      );
    };
    var u1 = cleaners[0];
    var unitShadow = function (r) {
      return [u1.y0 - 0.2, u1.y1 + 0.2 + Math.max(0, r.x1 - u1.x0)];
    };
    var slide = function (axis, len, make, pref, lo) {
      if (lo === undefined) lo = 0.3;
      var hi = (axis === 'x' ? L : W) - 0.3 - len;
      if (hi < lo) return null;
      var cands = [clamp(pref, lo, hi)];
      blocked.forEach(function (b) {
        var a0 = axis === 'x' ? b.x0 : b.y0;
        var a1 = axis === 'x' ? b.x1 : b.y1;
        cands.push(a1 + GAP + 1e-3, a0 - GAP - len - 1e-3);
      });
      var shade = axis === 'y' ? unitShadow(make(lo)) : null;
      if (shade) cands.push(shade[1] + 1e-3, shade[0] - len - 1e-3);
      cands.sort(function (p, p2) {
        return Math.abs(p - pref) - Math.abs(p2 - pref);
      });
      for (var k = 0; k < cands.length; k++) {
        var t = cands[k];
        if (t < lo - 1e-9 || t > hi + 1e-9) continue;
        var r = make(t);
        if (shade && r.y1 > shade[0] && r.y0 < shade[1]) continue;
        if (fits(r)) return r;
      }
      return null;
    };
    var near = function (sx, sy, cx, cy) {
      for (var k = 0; k < RING.length; k++) {
        var x0 = cx + RING[k][0] - sx / 2;
        var y0 = cy + RING[k][1] - sy / 2;
        var r = { x0: x0, y0: y0, x1: x0 + sx, y1: y0 + sy };
        if (fits(r)) return r;
      }
      return null;
    };
    var take = function (r, gate) {
      if (!degenerate && area >= gate && r) {
        blocked.push(r);
        return r;
      }
      return null;
    };
    var pieces = {
      dresser: null, plant: null, bookshelf: null, desk: null, chair: null,
      armchair: null, wardrobe: null, sofa: null, table: null,
    };
    var D = BR.dresser;
    var dr = area >= D.area ? take(slide('x', D.w, function (t) {
      return { x0: t, y0: 0.3, x1: t + D.w, y1: 0.3 + D.d };
    }, (nsROn ? nsR.x1 : bedOn ? bedRect.x1 : 0.5 * L) + 0.4), D.area) : null;
    if (dr) {
      var hDr = Math.min(D.h, hCap);
      pieces.dresser = {
        rect: dr,
        boxes: { body: [dr.x0, dr.y0, 0, dr.x1, dr.y1, hDr] },
        seams: [hDr / 3, (2 * hDr) / 3].map(function (z) {
          return [[dr.x0 + 0.2, dr.y1, z], [dr.x1 - 0.2, dr.y1, z]];
        }),
      };
    }
    var Pl = BR.plant;
    var pr = area >= Pl.area ? take(slide('x', Pl.crown, function (t) {
      return { x0: t, y0: 0.3, x1: t + Pl.crown, y1: 0.3 + Pl.crown };
    }, L - 1.5 - Pl.crown / 2, 0.5 * L), Pl.area) : null;
    if (pr) {
      var pcx = (pr.x0 + pr.x1) / 2;
      var pcy = (pr.y0 + pr.y1) / 2;
      var hp = Pl.pot / 2;
      var potH = Math.min(Pl.potH, hCap);
      pieces.plant = {
        rect: pr,
        boxes: {
          pot: [pcx - hp, pcy - hp, 0, pcx + hp, pcy + hp, potH],
          crown: [pr.x0, pr.y0, potH, pr.x1, pr.y1, Math.min(potH + Pl.crownH, hCap)],
        },
        seams: [],
      };
    }
    var Bk = BR.bookshelf;
    var br = area >= Bk.area ? take(slide('y', Bk.d, function (t) {
      return { x0: 0.3, y0: t, x1: 0.3 + Bk.w, y1: t + Bk.d };
    }, (nsLOn ? nsL.y1 : 0) + 0.3), Bk.area) : null;
    if (br) {
      var hBk = Math.min(Bk.h, hCap);
      pieces.bookshelf = {
        rect: br,
        boxes: { body: [br.x0, br.y0, 0, br.x1, br.y1, hBk] },
        seams: [0.25, 0.5, 0.75].map(function (f) {
          return [[br.x1, br.y0 + 0.1, hBk * f], [br.x1, br.y1 - 0.1, hBk * f]];
        }),
      };
    }
    var Dk = BR.desk;
    var Ch = BR.chair;
    var deep = Dk.d + GAP + Ch.d;
    if (area >= Dk.area && !degenerate) {
      var hd = Math.min(Dk.h, hCap);
      var hs = Math.min(Ch.seatH, hCap);
      var hb = Math.min(Ch.h, hCap);
      var onY = slide('x', Dk.w, function (t) {
        return { x0: t, y0: 0.3, x1: t + Dk.w, y1: 0.3 + deep };
      }, (dr ? dr.x1 : nsROn ? nsR.x1 : 0.5 * L) + 0.4);
      var onX = onY ? null : slide('y', Dk.w, function (t) {
        return { x0: 0.3, y0: t, x1: 0.3 + deep, y1: t + Dk.w };
      }, (br ? br.y1 : 2) + 0.4);
      var dg = take(onY || onX, Dk.area);
      if (dg && onY) {
        var dcx = (dg.x0 + dg.x1) / 2;
        var da = dcx - Ch.w / 2;
        var db = dcx + Ch.w / 2;
        var ds0 = dg.y0 + Dk.d + GAP;
        pieces.desk = {
          rect: { x0: dg.x0, y0: dg.y0, x1: dg.x1, y1: dg.y0 + Dk.d },
          boxes: { body: [dg.x0, dg.y0, 0, dg.x1, dg.y0 + Dk.d, hd] },
          seams: [],
        };
        pieces.chair = {
          rect: { x0: da, y0: ds0, x1: db, y1: dg.y1 },
          boxes: { seat: [da, ds0, 0, db, dg.y1 - Ch.back, hs], back: [da, dg.y1 - Ch.back, 0, db, dg.y1, hb] },
          seams: [],
        };
      } else if (dg) {
        var dcy = (dg.y0 + dg.y1) / 2;
        var ea = dcy - Ch.w / 2;
        var eb = dcy + Ch.w / 2;
        var es0 = dg.x0 + Dk.d + GAP;
        pieces.desk = {
          rect: { x0: dg.x0, y0: dg.y0, x1: dg.x0 + Dk.d, y1: dg.y1 },
          boxes: { body: [dg.x0, dg.y0, 0, dg.x0 + Dk.d, dg.y1, hd] },
          seams: [],
        };
        pieces.chair = {
          rect: { x0: es0, y0: ea, x1: dg.x1, y1: eb },
          boxes: { seat: [es0, ea, 0, dg.x1 - Ch.back, eb, hs], back: [dg.x1 - Ch.back, ea, 0, dg.x1, eb, hb] },
          seams: [],
        };
      }
    }
    var Ac = BR.armchair;
    var ar = area >= Ac.area ? take(near(Ac.w, Ac.d, 0.7 * L, 0.5 * W), Ac.area) : null;
    if (ar) {
      pieces.armchair = {
        rect: ar,
        boxes: {
          back: [ar.x0, ar.y0, 0, ar.x0 + Ac.back, ar.y1, Math.min(Ac.h, hCap)],
          seat: [ar.x0 + Ac.back, ar.y0, 0, ar.x1, ar.y1, Math.min(Ac.seatH, hCap)],
        },
        seams: [],
      };
    }
    var Wd = BR.wardrobe;
    var wr = area >= Wd.area ? take(slide('y', Wd.d, function (t) {
      return { x0: 0.3, y0: t, x1: 0.3 + Wd.w, y1: t + Wd.d };
    }, 0.5 * W - Wd.d / 2), Wd.area) : null;
    if (wr) {
      var hWd = Math.min(Wd.h, hCap);
      pieces.wardrobe = {
        rect: wr,
        boxes: { body: [wr.x0, wr.y0, 0, wr.x1, wr.y1, hWd] },
        seams: [1 / 3, 2 / 3].map(function (f) {
          var y = wr.y0 + (wr.y1 - wr.y0) * f;
          return [[wr.x1, y, 0.2], [wr.x1, y, hWd - 0.2]];
        }),
      };
    }
    var Sf = BR.sofa;
    var Tb = BR.table;
    var sr = area >= Sf.area ? take(near(Sf.w + Tb.gap + Tb.w, Sf.d, 0.45 * L, 0.72 * W), Sf.area) : null;
    if (sr) {
      var sx1 = sr.x0 + Sf.w;
      var ty0 = (sr.y0 + sr.y1) / 2 - Tb.d / 2;
      pieces.sofa = {
        rect: { x0: sr.x0, y0: sr.y0, x1: sx1, y1: sr.y1 },
        boxes: {
          back: [sr.x0, sr.y0, 0, sr.x0 + Sf.back, sr.y1, Math.min(Sf.h, hCap)],
          seat: [sr.x0 + Sf.back, sr.y0, 0, sx1, sr.y1, Math.min(Sf.seatH, hCap)],
        },
        seams: [],
      };
      var tr = { x0: sx1 + Tb.gap, y0: ty0, x1: sr.x1, y1: ty0 + Tb.d };
      pieces.table = { rect: tr, boxes: { body: [tr.x0, tr.y0, 0, tr.x1, tr.y1, Math.min(Tb.h, hCap)] }, seams: [] };
    }

    var sill = Math.min(BR.winSill, H * 0.48);
    var winH = Math.min(BR.winH, H * 0.42, Math.max(0.4, 0.9 * H - sill));
    var doorH = Math.min(6.8, H * 0.8);
    var winBackX = degenerate
      ? null
      : bedOn
        ? [bx0 + BR.winBackInset, bx0 + bw - BR.winBackInset]
        : L >= 6
          ? [L / 2 - 1.5, L / 2 + 1.5]
          : null;
    var sideHi = (doorOn ? doorY0 : W) - 1.2;
    var sideSpan = sideHi - 1.2;
    var sideW = Math.min(BR.winSideW, sideSpan);
    var sideC = (1.2 + sideHi) / 2;
    var winLeftY = !degenerate && sideSpan >= 1.4 ? [sideC - sideW / 2, sideC + sideW / 2] : null;
    var boardStep = L > 30 ? Math.ceil(L / 30) : BR.board;
    return {
      degenerate: degenerate, cw: cw, ch: ch, cleaners: cleaners, clear: clear,
      bedOn: bedOn, bed: { x0: bx0, w: bw, d: bd }, bedRect: bedRect, nsL: nsL, nsR: nsR,
      nsLOn: nsLOn, nsROn: nsROn, rug: rug, rugOn: rugOn, pieces: pieces,
      sill: sill, winH: winH, doorOn: doorOn, doorY0: doorY0, doorY1: doorY1, doorH: doorH,
      winBackX: winBackX, winLeftY: winLeftY, boardStep: boardStep,
    };
  };

  var CAP_GAP = 8;
  var capLabelEl = svg.querySelector('[data-label="capacity"]');

  var capMetrics = null;

  var edgeInset = function () {
    return Math.max(
      2,
      Math.min(safe.x, safe.y, viewW - (safe.x + safe.w), viewH - (safe.y + safe.h)),
    );
  };
  var capLabelMetrics = function (text) {
    if (!capLabelEl) return null;
    if (capMetrics && capMetrics.key === text) return capMetrics;
    capLabelEl.textContent = text;
    capLabelEl.setAttribute('x', '0');
    capLabelEl.setAttribute('y', '0');

    var b = null;
    try {
      b = capLabelEl.getBBox();
    } catch (e) {
      b = null;
    }
    if (!b || !b.width) return null;
    capMetrics = { key: text, w: b.width, h: b.height, dx: b.x, dy: b.y };
    return capMetrics;
  };
  var capLabelAt = function (cx, cy, text) {
    var x = cx + CAP_GAP;
    var y = cy + 2 * CAP_GAP;
    var m = capLabelMetrics(text);
    if (!m) return [x, y];
    var pad = edgeInset();

    var place = function (bx, by) {
      x = bx - m.dx;
      y = by - m.dy;
    };
    place(
      clamp(x + m.dx, pad, Math.max(pad, viewW - pad - m.w)),
      clamp(y + m.dy, pad, Math.max(pad, viewH - pad - m.h)),
    );
    if (pauseBox) {
      var k0x = pauseBox.x - pad;
      var k0y = pauseBox.y - pad;
      var k1x = pauseBox.x + pauseBox.w + pad;
      var k1y = pauseBox.y + pauseBox.h + pad;
      var bx = x + m.dx;
      var by = y + m.dy;
      if (bx < k1x && bx + m.w > k0x && by < k1y && by + m.h > k0y) {
        if (k0x - m.w >= pad) place(k0x - m.w, by);
        else place(bx, Math.max(pad, k0y - m.h));
      }
    }
    return [x, y];
  };

  var drawScene = function (L, W, H) {
    if (!hasScene) return;
    var n = Math.min(Math.max(1, sceneN), MAX_CLEANERS);

    var drawCap = capS > 0.01;
    var gL = L * capS;
    var gW = W * capS;

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
      box(0, 0, L, W, H);
      for (var ci = 0; ci < cls.length; ci++) {
        var c = cls[ci];
        box(c.x0, c.y0, c.x1, c.y1, c.h);
      }
      if (drawCap) box(0, 0, gL, gW, H);
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

      var bleed = capStroke / 2;
      var fw = Math.max(1, safe.w - capStroke);
      var fh = Math.max(1, safe.h - capStroke);
      var scale = Math.min(fw / (maxX - minX || 1), fh / (maxY - minY || 1), MAX_SCALE);
      var ox = safe.x + bleed + (fw - (maxX - minX) * scale) / 2 - minX * scale;
      var oy = safe.y + bleed + (fh - (maxY - minY) * scale) / 2 - minY * scale;
      return { scale: scale, ox: ox, oy: oy };
    };

    var lay = layoutRoom(L, W, H, n);
    var fit = computeFit(lay.cleaners);
    if (lay.cw * fit.scale < UNIT_MIN_PX) {
      lay = layoutRoom(L, W, H, n, (UNIT_MIN_PX * 1.1) / fit.scale);
      fit = computeFit(lay.cleaners);
    }
    var scale = fit.scale;
    var ox = fit.ox;
    var oy = fit.oy;
    fitScale = scale;
    var cleaners = lay.cleaners;
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

    setPoly('[data-room="left"]', [w(0, 0, H), w(0, W, H), w(0, W, 0), w(0, 0, 0)]);
    setPoly('[data-room="right"]', [w(0, 0, H), w(L, 0, H), w(L, 0, 0), w(0, 0, 0)]);
    setPoly('[data-wall-top="left"]', [w(0, 0, H), w(0, W, H), w(-WALL_T, W, H), w(-WALL_T, 0, H)]);
    setPoly('[data-wall-top="right"]', [w(0, 0, H), w(L, 0, H), w(L, -WALL_T, H), w(0, -WALL_T, H)]);
    setPoly('[data-wall-cap="left"]', [w(0, W, H), w(-WALL_T, W, H), w(-WALL_T, W, 0), w(0, W, 0)]);
    setPoly('[data-wall-cap="right"]', [w(L, 0, H), w(L, -WALL_T, H), w(L, -WALL_T, 0), w(L, 0, 0)]);

    setPoly('[data-room="floor"]', [w(0, 0, 0), w(L, 0, 0), w(L, W, 0), w(0, W, 0)]);
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
    var ch = lay.ch;
    setPts(waveClip, [w(0, 0, ch), w(L, 0, ch), w(L, W, ch), w(0, W, ch)]);

    var dressed = !lay.degenerate;
    vis(detailsG, dressed);
    vis(boardsEl, dressed);
    if (dressed && boardsEl) {
      var boardD = '';
      for (var bxs = lay.boardStep; bxs < L - 1e-6; bxs += lay.boardStep) boardD += segD(w(bxs, 0, 0), w(bxs, W, 0));
      boardsEl.setAttribute('d', boardD);
    }
    var setWindow = function (els, quad) {
      vis(els.g, !!quad);
      if (!quad) return;
      setPts(els.pane, quad);
      if (els.mull) {
        els.mull.setAttribute('d', segD(mid(quad[0], quad[1]), mid(quad[3], quad[2])) + segD(mid(quad[0], quad[3]), mid(quad[1], quad[2])));
      }
    };
    var z0 = lay.sill;
    var z1 = lay.sill + lay.winH;
    var wb = lay.winBackX;
    var wl = lay.winLeftY;
    setWindow(winBack, wb ? [w(wb[0], 0, z1), w(wb[1], 0, z1), w(wb[1], 0, z0), w(wb[0], 0, z0)] : null);
    setWindow(winLeft, wl ? [w(0, wl[0], z1), w(0, wl[1], z1), w(0, wl[1], z0), w(0, wl[0], z0)] : null);
    vis(doorG, lay.doorOn);
    if (lay.doorOn) {
      var dy0 = lay.doorY0;
      var dy1 = lay.doorY1;
      var dh = lay.doorH;
      var inset = 0.4;
      setPts(doorLeaf, [w(0, dy0, dh), w(0, dy1, dh), w(0, dy1, 0), w(0, dy0, 0)]);
      var panel = function (za, zb) {
        return quadD([w(0, dy0 + inset, za), w(0, dy1 - inset, za), w(0, dy1 - inset, zb), w(0, dy0 + inset, zb)]);
      };
      if (doorPanels) doorPanels.setAttribute('d', panel(dh * 0.93, dh * 0.56) + panel(dh * 0.49, dh * 0.09));
    }

    vis(bedEls.g, lay.bedOn);
    vis(rugEl, lay.rugOn);
    if (lay.rugOn) {
      var rg = lay.rug;
      setPts(rugEl, [w(rg.x0, rg.y0, 0), w(rg.x1, rg.y0, 0), w(rg.x1, rg.y1, 0), w(rg.x0, rg.y1, 0)]);
    }
    vis(nsEls[0].g, lay.nsLOn);
    vis(nsEls[1].g, lay.nsROn);
    if (lay.bedOn) {
      var BR = BEDROOM;
      var x0 = lay.bed.x0;
      var bw = lay.bed.w;
      var d = lay.bed.d;
      var zf = BR.frameH;
      var zm = zf + BR.mattH;
      var zb = zm + 0.04;
      var zd = zb - 0.9;
      setBox(bedEls.head, w, x0 - 0.2, 0, 0, x0 + bw + 0.2, BR.headT, BR.headH);
      setBox(bedEls.frame, w, x0, 0.3, 0, x0 + bw, d, zf);
      setBox(bedEls.mattress, w, x0 + 0.1, 0.3, zf, x0 + bw - 0.1, d - 0.1, zm);
      var pw = bw / 2 - 0.6;
      setBox(bedEls.pillowL, w, x0 + 0.4, 0.5, zm, x0 + 0.4 + pw, 0.5 + BR.pillowD, zm + BR.pillowH);
      setBox(bedEls.pillowR, w, x0 + bw / 2 + 0.2, 0.5, zm, x0 + bw / 2 + 0.2 + pw, 0.5 + BR.pillowD, zm + BR.pillowH);
      var ba = x0 + 0.1;
      var bb = x0 + bw - 0.1;
      var by0 = 0.3 + (d - 0.4) * BR.blanketFrom;
      var by1 = d - 0.1;
      setPts(bedEls.blanketTop, [w(ba, by0, zb), w(bb, by0, zb), w(bb, by1, zb), w(ba, by1, zb)]);
      setPts(bedEls.blanketFront, [w(ba, by1, zb), w(bb, by1, zb), w(bb, by1, zd), w(ba, by1, zd)]);
      setPts(bedEls.blanketSide, [w(bb, by0, zb), w(bb, by1, zb), w(bb, by1, zd), w(bb, by0, zd)]);
      if (bedEls.fold) bedEls.fold.setAttribute('d', segD(w(ba, by0 + 0.5, zb), w(bb, by0 + 0.5, zb)));
      var stands = [[lay.nsLOn, lay.nsL], [lay.nsROn, lay.nsR]];
      stands.forEach(function (st, k) {
        if (!st[0]) return;
        var r = st[1];
        var e = nsEls[k];
        var zs = BR.nsH;
        var zt = zs + BR.lampStemH;
        var cx = (r.x0 + r.x1) / 2;
        var cy = (r.y0 + r.y1) / 2;
        var hs = BR.lampStem / 2;
        var hh = BR.shade / 2;
        setBox(e.box, w, r.x0, r.y0, 0, r.x1, r.y1, zs);
        if (e.seam) e.seam.setAttribute('d', segD(w(r.x0 + 0.2, r.y1, zs - 0.7), w(r.x1 - 0.2, r.y1, zs - 0.7)));
        setBox(e.stem, w, cx - hs, cy - hs, zs, cx + hs, cy + hs, zt);
        setBox(e.shade, w, cx - hh, cy - hh, zt, cx + hh, cy + hh, zt + BR.shadeH);
      });
    }
    POOL_IDS.forEach(function (id) {
      var p = lay.pieces[id];
      var e = poolEls[id];
      vis(e.g, !!p);
      if (!p) return;
      Object.keys(p.boxes).forEach(function (part) {
        var b = p.boxes[part];
        setBox(e.box(part), w, b[0], b[1], b[2], b[3], b[4], b[5]);
      });
      if (e.seam) {
        e.seam.setAttribute('d', p.seams.map(function (s) {
          return segD(w(s[0][0], s[0][1], s[0][2]), w(s[1][0], s[1][1], s[1][2]));
        }).join(''));
      }
    });
    var items = [];
    if (lay.bedOn && bedEls.g) items.push({ el: bedEls.g, r: lay.bedRect });
    if (lay.nsLOn && nsEls[0].g) items.push({ el: nsEls[0].g, r: lay.nsL });
    if (lay.nsROn && nsEls[1].g) items.push({ el: nsEls[1].g, r: lay.nsR });
    POOL_IDS.forEach(function (id) {
      var p = lay.pieces[id];
      var el = poolEls[id].g;
      if (p && el) items.push({ el: el, r: p.rect });
    });
    lay.cleaners.forEach(function (c, i) {
      var el = unitEls[i].g;
      if (el) items.push({ el: el, r: c });
    });
    var order = depthOrder(items.map(function (it) {
      return it.r;
    })).map(function (k) {
      return items[k].el;
    });
    var sig = order.map(function (el) {
      return el.getAttribute('data-piece') || 'unit-' + el.getAttribute('data-unitg');
    }).join(',');
    if (furnG && sig !== pieceOrderSig) {
      pieceOrderSig = sig;
      order.forEach(function (el) {
        furnG.appendChild(el);
      });
    }

    var capOn = drawCap && capSTgt > 0;
    vis(capG, capOn);
    vis(capLabel, capOn);
    if (capOn) {
      setPoly('[data-capg] [data-cap="floor"]', [w(0, 0, 0), w(gL, 0, 0), w(gL, gW, 0), w(0, gW, 0)]);
      setPoly('[data-capg] [data-cap="left"]', [w(0, 0, H), w(0, gW, H), w(0, gW, 0), w(0, 0, 0)]);
      setPoly('[data-capg] [data-cap="right"]', [w(0, 0, H), w(gL, 0, H), w(gL, 0, 0), w(0, 0, 0)]);
      setPoly('[data-cap="top"]', [w(0, 0, H), w(gL, 0, H), w(gL, gW, H), w(0, gW, H)]);
      var capEdge = el1('[data-cap-edge]');
      if (capEdge) {
        var ce0 = w(gL, gW, 0);
        var ce1 = w(gL, gW, H);
        capEdge.setAttribute('x1', ce0[0]); capEdge.setAttribute('y1', ce0[1]);
        capEdge.setAttribute('x2', ce1[0]); capEdge.setAttribute('y2', ce1[1]);
      }
      var capPt = w(gL, gW, 0);
      var capFt3 = raw('units') === 'ft3';
      var capText = capFt3 ? fmt(capMaxVol, 0) + ' ft³' : fmt(capMaxVol / 8, 0) + ' ft²';
      var capCaption = 'covers a room up to ' + capText;
      setLabel('capacity', capLabelAt(capPt[0], capPt[1], capCaption), capCaption);
    }

    var cw = lay.cw;
    var cu = cw / FACE_U;
    var hu = ch / FACE_U;
    var grilleD = '';
    var ventD = '';
    for (var gk = 0; gk < 5; gk++) {
      var gx = (cu * (0.2 + 0.15 * gk)).toFixed(2);
      grilleD += 'M' + gx + ',' + (0.45 * hu).toFixed(2) + 'V' + (0.88 * hu).toFixed(2);
    }
    for (var vk = 0; vk < 4; vk++) {
      var vy = (cu * (0.25 + vk / 6)).toFixed(2);
      ventD += 'M' + (0.21 * cu).toFixed(2) + ',' + vy + 'H' + (0.79 * cu).toFixed(2);
    }
    var r0 = cw;
    var reachLo = Math.max(2.5, r0 + 1);
    var reachHi = 0.6 * Math.max(L, W);
    ringDefs.length = 0;
    for (var i2 = 0; i2 < MAX_CLEANERS; i2++) {
      var u = unitEls[i2];
      var on = i2 < n;
      vis(ringGroups[i2], on);
      var ghost = on && i2 === laneGhost;
      vis(u.g, on);
      vis(u.label, on);
      vis(clearEls[i2], on && !ghost);
      if (u.g) { if (ghost) u.g.setAttribute('data-ghost', ''); else u.g.removeAttribute('data-ghost'); }
      if (!on) {
        ringDefs[i2] = null;
        var stale = ringPolys[i2] || [];
        for (var si = 0; si < stale.length; si++) stale[si].setAttribute('points', '');
        continue;
      }
      var cc = cleaners[i2];
      var cr = lay.clear[i2];
      var qx0 = Math.max(0, cr.x0);
      var qy0 = Math.max(0, cr.y0);
      var qx1 = Math.min(L, cr.x1);
      var qy1 = Math.min(W, cr.y1);
      setPts(clearEls[i2], [w(qx0, qy0, 0), w(qx1, qy0, 0), w(qx1, qy1, 0), w(qx0, qy1, 0)]);

      var ucx = (cc.x0 + cc.x1) / 2;
      var ucy = (cc.y0 + cc.y1) / 2;
      var share = laneAch[i2] > 0 && sceneTarget > 0 ? laneAch[i2] / sceneTarget : 0;
      var rMax = clamp(Math.sqrt((share * L * W) / Math.PI), reachLo, reachHi);
      var basePt = w(ucx, ucy, ch);
      var exPt = w(ucx + 1, ucy, ch);
      var fyPt = w(ucx, ucy + 1, ch);
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

      setBox(u.faces, w, cc.x0, cc.y0, 0, cc.x1, cc.y1, ch);
      if (u.front) u.front.setAttribute('transform', faceMatrix(w, [cc.x0, cc.y1, ch], [1, 0, 0], [0, 0, -1]));
      if (u.side) u.side.setAttribute('transform', faceMatrix(w, [cc.x1, cc.y1, ch], [0, -1, 0], [0, 0, -1]));
      if (u.top) u.top.setAttribute('transform', faceMatrix(w, [cc.x0, cc.y0, ch], [1, 0, 0], [0, 1, 0]));
      if (u.grilleF) u.grilleF.setAttribute('d', grilleD);
      if (u.grilleS) u.grilleS.setAttribute('d', grilleD);
      if (u.vent) u.vent.setAttribute('d', ventD);
      if (u.label) {
        var tagText = laneTag[i2] || '';
        var topY = w(cc.x0, cc.y0, ch)[1];
        u.label.setAttribute('x', basePt[0].toFixed(1));
        u.label.setAttribute('y', (topY - 5).toFixed(1));
        if (u.label.textContent !== tagText) u.label.textContent = tagText;
      }
    }

    var lm = mid(w(0, W, 0), w(L, W, 0));
    setLabel('length', [lm[0] - 4, lm[1] + 20], fmt(L * labelK.L, 1) + ' ft');
    var wm = mid(w(0, 0, H), w(0, W, H));
    setLabel('width', [wm[0] - 12, wm[1] - 12], fmt(W * labelK.W, 1) + ' ft');
    var hm = mid(w(0, W, 0), w(0, W, H));
    setLabel('height', [hm[0] - 26, hm[1]], fmt(H * labelK.H, 1) + ' ft');

    var HANDLE_DEG = { length: 30, width: 150, height: 90 };
    var setLine = function (dim, p, q2) {
      var lineEl = el1('.smaqmd-cityview__hit[data-grip="' + dim + '"]');
      if (lineEl) {
        lineEl.setAttribute('x1', p[0].toFixed(1));
        lineEl.setAttribute('y1', p[1].toFixed(1));
        lineEl.setAttribute('x2', q2[0].toFixed(1));
        lineEl.setAttribute('y2', q2[1].toFixed(1));
      }
      var hmid = mid(p, q2);
      var handle = el1('.smaqmd-cityview__handle[data-grip="' + dim + '"]');
      if (handle) {
        handle.setAttribute(
          'transform',
          'translate(' + hmid[0].toFixed(1) + ' ' + hmid[1].toFixed(1) + ') rotate(' + HANDLE_DEG[dim] + ')'
        );
      }
    };
    setLine('length', w(0, W, 0), w(L, W, 0));
    setLine('width', w(0, 0, H), w(0, W, H));
    setLine('height', w(0, W, 0), w(0, W, H));

    paintRings();
    drawKey = sceneKey(L, W, H);
  };
  var drawKey = '';
  var sceneKey = function (L, W, H) {
    return [
      L, W, H, sceneN, capS, capSTgt, capMaxVol, sceneTarget,
      safe.x, safe.y, safe.w, safe.h, viewW, viewH,
      pauseBox ? pauseBox.x + ',' + pauseBox.y + ',' + pauseBox.w + ',' + pauseBox.h : '',
      labelK.L, labelK.W, labelK.H, laneAch.join('/'), raw('units'),
      laneTag.join('/'), laneGhost,
    ].join('|');
  };

  var HOUR_SECONDS = 5;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pulsePaused = reduced;
  var cur = { L: 12, W: 10, H: 8 };
  var tgt = { L: 12, W: 10, H: 8 };
  var capS = 0;
  var capSTgt = 0;
  var capMaxVol = 0;
  var capG = svg.querySelector('[data-capg]');
  var capLabel = svg.querySelector('[data-capg-top]');
  var laneAch = [];
  var laneTag = [];
  var laneGhost = -1;
  var stateNow = 'idle';
  var running = false;
  var last = 0;
  var ringPhase = [];
  for (var rf = 0; rf < MAX_CLEANERS; rf++) ringPhase[rf] = 0;
  var animating = function () {
    return stateNow !== 'idle' && !pulsePaused;
  };

  var paintRings = function () {
    for (var i = 0; i < MAX_CLEANERS; i++) {
      var d = ringDefs[i];
      var polys = ringPolys[i];
      if (!d || !polys) continue;
      for (var k = 0; k < RING_COUNT; k++) {
        var poly = polys[k];
        if (!poly) continue;
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
        poly.setAttribute('stroke-opacity', (0.85 * Math.pow(1 - p, 1.2)).toFixed(3));
      }
    }
  };

  var updateRings = function (dt) {
    if (stateNow === 'idle' || pulsePaused) return;
    for (var i = 0; i < MAX_CLEANERS && i < sceneN; i++) {
      var ach = laneAch[i];
      if (!ach || !isFinite(ach)) continue;
      var interval = Math.max(1.2, Math.min(80, (4 * HOUR_SECONDS) / ach));
      ringPhase[i] = (ringPhase[i] + dt / interval) % 1;
    }
  };

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
    var dt = Math.max(0, Math.min(0.05, (ts - last) / 1000 || 0));
    last = ts;

    var k = 1 - Math.pow(1 - 0.22, dt * 60);
    cur.L += (tgt.L - cur.L) * k;
    cur.W += (tgt.W - cur.W) * k;
    cur.H += (tgt.H - cur.H) * k;
    capS += (capSTgt - capS) * k;
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
    updateRings(dt);
    if (sceneKey(cur.L, cur.W, cur.H) !== drawKey) drawScene(cur.L, cur.W, cur.H);
    else paintRings();

    if (morphing || animating()) requestAnimationFrame(frame);
    else running = false;
  };
  var startLoop = function () {
    if (!sceneLive || running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  };

  var ROOM_MAX = { length: 100, width: 100, height: 30, area: 10000 };

  var AIR_QUALITY_ACH = { good: 2, unhealthy: 5, smoke: 7.5 };
  var ROOM_MIN = 1;
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
    return { L: pos('length') || 0.5, W: pos('width') || 0.5, H: pos('height') || 0.5 };
  };
  var morphScene = function () {
    var b = sceneBox();
    tgt.L = Math.min(b.L, SCENE_MAX);
    tgt.W = Math.min(b.W, SCENE_MAX);
    tgt.H = Math.min(b.H, SCENE_MAX_H);
    labelK.L = b.L / tgt.L;
    labelK.W = b.W / tgt.W;
    labelK.H = b.H / tgt.H;
    startLoop();
  };

  var syncSceneLive = function () {
    var live =
      hasScene && !(isResponsive && mqMobile.matches && !root.hasAttribute('data-section'));
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
      var ease = 'cubic-bezier(0.32, 0.72, 0, 1)';
      b.style.transition = 'block-size ' + dur + 'ms ' + ease + ', opacity ' + dur + 'ms ' + ease;
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
  var achWrap = block.querySelector('[data-metric="ach"]');
  var achEvidence = block.querySelector('[data-ach-evidence]');
  var fixWrap = block.querySelector('[data-metric="fix"]');

  var ratingWrap = block.querySelector('[data-rating-wrap]');
  var showFix = function (on) {
    show(fixWrap, on);
    show(ratingWrap, on);
  };
  var fixStat = fixWrap ? fixWrap.querySelector('.smaqmd-stat') : null;
  var fixLabel = fixWrap ? fixWrap.querySelector('.smaqmd-stat__label') : null;
  var fixSub = fixWrap ? fixWrap.querySelector('.smaqmd-stat__sub') : null;
  var fixEquiv = fixWrap ? fixWrap.querySelector('[data-ach-equiv]') : null;
  var fixEquivLede = fixWrap ? fixWrap.querySelector('.smaqmd-aerb__equiv-lede') : null;
  var fixEquivRows = fixWrap ? fixWrap.querySelector('[data-ach-equiv-rows]') : null;
  var fixGapLine = fixWrap ? fixWrap.querySelector('[data-ach-gap]') : null;
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

  var targetCommitted = true;
  var targetWarnAcked = false;
  var recompute = function () {
    syncVisibility();

    var blocks = cleanerBlocks();
    var cleanerCount = hasCleaners() ? Math.max(1, blocks.length) : 1;
    sceneN = Math.min(Math.max(1, blocks.length), MAX_CLEANERS);
    var target = pos('target') || 2;
    sceneTarget = target;
    setReadout('target', fmt(target, 2));
    var enteredTarget = num('target');
    var targetIsInvalid = isFinite(enteredTarget) && enteredTarget <= 0;
    var targetBelow = isFinite(enteredTarget) && enteredTarget > 0 && enteredTarget < 2;
    show(targetInvalid, targetIsInvalid && (targetCommitted || (targetInvalid && !targetInvalid.hidden)));
    show(roomWarn, roomOversize());
    show(targetWarn, targetBelow && (targetCommitted || (targetWarn && !targetWarn.hidden)));

    var flow = combinedFlow();
    var vol = roomVolume();
    var hasFlow = flow > 0;
    var hasRoom = isFinite(vol) && vol > 0;
    var shopPreview = !hasFlow && hasRoom && isFinite(enteredTarget) && enteredTarget > 0;

    var area = roomArea();
    var coverVol = hasFlow ? (flow * 60) / target : NaN;
    var asFt3 = raw('units') === 'ft3';
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
      container.dataset.capCompare = capMaxVol >= vol ? 'bigger' : 'smaller';
      if (capG) capG.style.visibility = '';
      if (capLabel) capLabel.style.visibility = '';
    } else if (shopPreview) {
      capMaxVol = vol;
      capSTgt = 1;
      container.dataset.capCompare = 'bigger';
      if (capG) capG.style.visibility = '';
      if (capLabel) capLabel.style.visibility = '';
    } else {
      capSTgt = 0;
      container.dataset.capCompare = 'bigger';
      if (capG) capG.style.visibility = 'hidden';
      if (capLabel) capLabel.style.visibility = 'hidden';
    }

    laneAch.length = 0;
    laneTag.length = 0;
    laneGhost = -1;
    blocks.forEach(function (b, i) {
      if (i >= MAX_CLEANERS) return;
      var f = cleanerFlow(b.getAttribute('data-cleaner-block'));
      laneAch[i] = hasRoom && f > 0 ? (f / vol) * 60 : 0;
      laneTag[i] = f > 0 ? fmt(Math.round(f), 0) + ' CFM' : '';
    });
    syncLaneIdle();

    var needCadr = (target * vol) / 60;

    var renderFix = function (isGap) {
      var cadrGoal = isGap ? needCadr - flow : needCadr;

      setReadout('needcadr', fmt(needCadr, 0) + ' CFM');
      if (asAch) {
        show(fixStat, !isGap);
        setMetric('fix', fmt(target, 2) + unitSpan('ACH'));
        if (fixLabel) fixLabel.textContent = 'ACH coverage to shop for';
        if (fixSub) {
          fixSub.textContent =
            fmt(target, 2) + ' air changes per hour in your ' + fmt(area, 0) + ' ft² room';
        }
        if (fixEquivLede) {
          fixEquivLede.textContent = isGap
            ? 'Your next cleaner qualifies if its listing claims any ONE of these:'
            : 'A listing qualifies if it claims any ONE of these:';
        }
        if (fixGapLine) {
          fixGapLine.textContent =
            "That’s +" + fmt(target - ach, 2) + ' air changes per hour on top of the ' +
            fmt(ach, 1) + ' your cleaners already deliver.';
        }
        show(fixGapLine, isGap);
        if (fixEquivRows) {
          var levels = [1, 2, 4, 5];
          if (target > 0 && levels.indexOf(target) === -1) levels.push(target);
          levels.sort(function (a, b) { return a - b; });
          fixEquivRows.textContent = '';
          for (var li = 0; li < levels.length; li++) {
            var row = document.createElement('li');
            row.textContent =
              fmt(levels[li], 2) + ' ACH — covers ' +
              fmt(Math.ceil((cadrGoal * 7.5) / levels[li]), 0) + ' ft² or more';
            fixEquivRows.appendChild(row);
          }
        }
        show(fixEquiv, true);
      } else {
        show(fixStat, true);
        setMetric('fix', (isGap ? '+' : '') + fmt(cadrGoal, 0) + unitSpan('CFM (ft³/min)'));
        if (fixLabel) {
          fixLabel.textContent = isGap ? 'combined CADR still needed' : 'combined CADR to shop for';
        }
        if (fixSub) {
          fixSub.textContent = isGap
            ? 'your cleaners deliver ' + fmt(flow, 0) + ' CFM of the ' + fmt(needCadr, 0) + ' CFM this room needs'
            : 'added up across all the air cleaners in the room';
        }
        show(fixEquiv, false);
      }
    };
    var setPrompt = function (on) {
      show(block.querySelector('[data-prompt="empty"]'), on);
    };

    if (targetIsInvalid) {
      show(achWrap, false);
      show(achEvidence, false);
      showFix(false);
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
      renderFix(!pass);
      showFix(!pass);
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

      show(cadrHighEl, !pass && needCadr - flow > 700);

      var subj = blocks.length > 1 ? 'Your air cleaners are' : 'Your air cleaner is';
      setAnswer(
        pass ? subj + ' the right size for this room' : subj + ' too small for this room',
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
      showFix(true);
      show(cadrHighEl, needCadr > 700);
      setAnswer('Air cleaner calculation', 'shop');
      setVerdictCard('shop');
      setPrompt(false);
      if (shopPreview) {
        var needUp = Math.ceil(needCadr);
        var unitsNeeded = Math.max(cleanerCount, Math.ceil(needUp / UNIT_MAX_CFM));
        var unitCfm = [];
        laneTag.length = 0;
        laneGhost = -1;
        if (unitsNeeded > MAX_CLEANERS) {
          unitCfm = [UNIT_MAX_CFM, UNIT_MAX_CFM, UNIT_MAX_CFM];
          laneGhost = MAX_CLEANERS - 1;
        } else {
          for (var ui = 0; ui < unitsNeeded; ui++) unitCfm.push(Math.ceil(needUp / unitsNeeded));
        }
        sceneN = laneGhost >= 0 ? MAX_CLEANERS : unitCfm.length;
        for (var ti = 0; ti < unitCfm.length; ti++) laneTag[ti] = fmt(unitCfm[ti], 0) + ' CFM';
        if (laneGhost >= 0) laneTag[laneGhost] = '+' + fmt(needUp - UNIT_MAX_CFM * (MAX_CLEANERS - 1), 0) + ' CFM';
        laneAch.length = 0;
        for (var si = 0; si < MAX_CLEANERS; si++) laneAch[si] = si < unitCfm.length ? (unitCfm[si] / vol) * 60 : 0;
        syncLaneIdle();
        stateNow = 'shop';
        container.dataset.state = 'shop';
        startLoop();
      } else {
        stateNow = 'idle';
        container.dataset.state = 'idle';
        if (capS > 0.01) startLoop();
      }
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
      showFix(false);
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
    var tL = tgt.L * labelK.L;
    var tW = tgt.W * labelK.W;
    var tH = tgt.H * labelK.H;
    if (method === 'area') {
      var fa = field('area');
      if (fa && !raw('area')) setFieldValue(fa, String(Math.round(tL * tW)));
    }
  };

  var ERROR_ICON =
    '<svg class="smaqmd-field__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
    ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line>' +
    '<line x1="12" x2="12.01" y1="16" y2="16"></line></svg>';
  var setFieldError = function (input, msg) {
    var wrap = input.closest('.smaqmd-field');
    if (!wrap) return;
    var id = input.id + '-error';
    var line = wrap.querySelector('.smaqmd-field__error');
    if (!line) {
      line = document.createElement('p');
      line.className = 'smaqmd-field__error smaqmd-type-body-sm';
      line.id = id;
      wrap.insertBefore(line, wrap.querySelector('.smaqmd-field__help'));
    }
    line.innerHTML = ERROR_ICON + '<span class="smaqmd-visually-hidden">Error: </span><span></span>';
    line.lastChild.textContent = msg;
    wrap.classList.add('smaqmd-field--error');
    input.setAttribute('aria-invalid', 'true');
    var ids = (input.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (x) {
      return x && x !== id;
    });
    ids.unshift(id);
    input.setAttribute('aria-describedby', ids.join(' '));
  };
  var clearFieldError = function (input) {
    var wrap = input.closest && input.closest('.smaqmd-field');
    if (!wrap || !wrap.classList.contains('smaqmd-field--error')) return;
    var id = input.id + '-error';
    var line = wrap.querySelector('.smaqmd-field__error');
    if (line) line.parentNode.removeChild(line);
    wrap.classList.remove('smaqmd-field--error');
    input.removeAttribute('aria-invalid');
    var ids = (input.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (x) {
      return x && x !== id;
    });
    if (ids.length) input.setAttribute('aria-describedby', ids.join(' '));
    else input.removeAttribute('aria-describedby');
  };

  var onEdit = function (e) {
    var el = e.target;
    if (!el || !el.tagName) return;
    if (el.hasAttribute && el.hasAttribute('data-numeric')) {
      var clean = sanitizeNumeric(el.value || '');
      if (clean !== el.value) el.value = clean;
      var rf = el.getAttribute('data-field');
      if (clean && (rf === 'airflow' || rf === 'ach')) clearRatingErrors();
      else if (clean) clearFieldError(el);
      if (el.getAttribute('data-field') === 'target') {
        targetCommitted = false;
        targetWarnAcked = false;
      }
    }
    if (el.type === 'radio' && el.closest) {
      var group = el.closest('[data-field]');
      if (group && group.getAttribute('data-field') === 'roomMethod') {
        prefillMode(getFieldValue(group) || 'dimensions');
      }
    }

    if (el.type === 'radio' && el.name === 'airQuality') {
      var customWrap = root.querySelector('[data-target-custom]');
      if (customWrap) customWrap.hidden = el.value !== 'custom';
      var presetWrap = root.querySelector('[data-target-preset]');
      if (presetWrap) presetWrap.hidden = el.value === 'custom';
      var ft = field('target');
      if (ft && AIR_QUALITY_ACH.hasOwnProperty(el.value)) {
        setFieldValue(ft, String(AIR_QUALITY_ACH[el.value]));
        var readout = root.querySelector('[data-r="presetach"]');
        if (readout) readout.textContent = String(AIR_QUALITY_ACH[el.value]);
      }
    }
    morphScene();
    recompute();
  };
  root.addEventListener('input', onEdit);
  root.addEventListener('change', onEdit);
  var fwdPressing = false;
  root.addEventListener('pointerdown', function (e) {
    fwdPressing = !!(e.target && e.target.closest && e.target.closest('[data-nav="next"], [data-nav="result"]'));
  });
  var endFwdPress = function () {
    if (!fwdPressing) return;
    fwdPressing = false;
    window.setTimeout(function () {
      var a = document.activeElement;
      if (!targetCommitted && !(a && a.getAttribute && a.getAttribute('data-field') === 'target')) {
        targetCommitted = true;
        recompute();
      }
    }, 0);
  };
  root.addEventListener('pointerup', endFwdPress);
  root.addEventListener('pointercancel', endFwdPress);
  root.addEventListener('focusout', function (e) {
    var t = e.target;
    if (t && t.getAttribute && t.getAttribute('data-field') === 'target' && !targetCommitted && !fwdPressing) {
      targetCommitted = true;
      recompute();
    }
  });

  root.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('[data-add-cleaner]')) {
      e.preventDefault();
      if (cleanerBlocks().length >= MAX_CLEANERS) return;
      addCleaner({ copyLast: true, animate: true });
      morphScene();
      recompute();
      var atCapNow = cleanerBlocks();
      if (atCapNow.length >= MAX_CLEANERS) {
        var newest = atCapNow[atCapNow.length - 1];
        var landing = newest ? newest.querySelector('[data-remove-cleaner] button') : null;
        if (landing) landing.focus();
        var capNote = root.querySelector('[data-cap-note]');
        kitAnnounce(
          capNote && capNote.textContent
            ? capNote.textContent.trim()
            : 'You have added the maximum number of air cleaners.'
        );
      }
      return;
    }

    var swap = t.closest('[data-unit-swap]');
    if (swap) {
      e.preventDefault();
      var sb = swap.closest('[data-cleaner-block]');
      var sid = sb ? sb.getAttribute('data-cleaner-block') : null;
      var to = swap.getAttribute('data-unit-swap');
      if (sid != null) setFieldValue(field('unit', sid), to);
      morphScene();
      recompute();
      var nextField = sb ? sb.querySelector('[data-field="' + to + '"][data-cleaner]') : null;
      if (nextField) nextField.focus();
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
    "What is your air cleaner’s rating?",
    'What air quality conditions will you use the air cleaner in?',
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
    var ledes = root.querySelectorAll('[data-step-lede]');
    for (var li = 0; li < ledes.length; li++) {
      show(ledes[li], Number(ledes[li].getAttribute('data-step-lede')) === section);
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

  var SHEET_EXIT_MS = 200;
  var placeSheet = function (sheet) {
    var anchor = sheet.closest('[data-sheet-anchor]');
    var box = anchor ? anchor.getBoundingClientRect() : null;
    var pad = anchor ? getComputedStyle(anchor) : null;
    var r = box
      ? {
          top: box.top + parseFloat(pad.paddingTop),
          left: box.left + parseFloat(pad.paddingLeft),
          width: box.width - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight),
          height: box.height - parseFloat(pad.paddingTop) - parseFloat(pad.paddingBottom),
          bottom: box.bottom - parseFloat(pad.paddingBottom),
        }
      : null;
    var onScreen = !!r && r.top >= 0 && r.bottom <= window.innerHeight && r.width > 0;
    var full = mqMobile.matches || !onScreen;
    var st = sheet.style;
    if (!full) {
      st.top = r.top + 'px';
      st.left = r.left + 'px';
      st.width = r.width + 'px';
      st.height = r.height + 'px';
      st.right = 'auto';
      st.bottom = 'auto';
      sheet.setAttribute('data-fit', 'anchor');
    } else {
      st.top = '0px';
      st.right = '0px';
      st.bottom = '0px';
      st.left = '0px';
      st.width = 'auto';
      st.height = 'auto';
      sheet.setAttribute('data-fit', 'viewport');
    }
  };
  var lockPage = function (on) {
    document.documentElement.style.overflow = on ? 'hidden' : '';
  };
  var watchSheet = function (sheet, on) {
    if (!on) {
      if (sheet._ro) sheet._ro.disconnect();
      sheet._ro = null;
      return;
    }
    var anchor = sheet.closest('[data-sheet-anchor]');
    if (!anchor || sheet._ro || typeof ResizeObserver === 'undefined') return;
    sheet._ro = new ResizeObserver(function () {
      if (sheet.open) placeSheet(sheet);
    });
    sheet._ro.observe(anchor);
    sheet._ro.observe(document.documentElement);
  };
  var openSheet = function (sheet) {
    if (sheet._closeTimer) {
      window.clearTimeout(sheet._closeTimer);
      sheet._closeTimer = 0;
    }
    sheet.removeAttribute('data-closing');
    if (!sheet.open) {
      lockPage(true);
      placeSheet(sheet);
      watchSheet(sheet, true);
      sheet.showModal();
      sheet.scrollTop = 0;
      void sheet.offsetWidth;
    }
    sheet.setAttribute('data-open', '');
    var panel = sheet.querySelector('.smaqmd-sheet__panel');
    if (panel) panel.focus({ preventScroll: true });
  };
  var closeSheet = function (sheet) {
    if (!sheet.open || !sheet.hasAttribute('data-open')) return;
    sheet.removeAttribute('data-open');
    sheet.setAttribute('data-closing', '');
    sheet._closeTimer = window.setTimeout(function () {
      sheet._closeTimer = 0;
      sheet.removeAttribute('data-closing');
      sheet.close();
      watchSheet(sheet, false);
      if (!document.querySelector('dialog[data-sheet][open]')) lockPage(false);
    }, SHEET_EXIT_MS);
  };
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var opener = t.closest('[data-sheet-open]');
    if (opener) {
      var target = document.querySelector(
        'dialog[data-sheet="' + opener.getAttribute('data-sheet-open') + '"]'
      );
      if (target) {
        e.preventDefault();
        openSheet(target);
      }
      return;
    }
    if (t.tagName === 'DIALOG' && t.hasAttribute('data-sheet')) {
      if (!t.hasAttribute('data-sheet-required')) closeSheet(t);
      return;
    }
    var closer = t.closest('[data-sheet-close]');
    var sheet = closer ? closer.closest('dialog[data-sheet]') : null;
    if (sheet) closeSheet(sheet);
  });
  document.addEventListener(
    'cancel',
    function (e) {
      var t = e.target;
      if (t && t.tagName === 'DIALOG' && t.hasAttribute('data-sheet')) {
        e.preventDefault();
        if (!t.hasAttribute('data-sheet-required')) closeSheet(t);
      }
    },
    true
  );
  document.addEventListener(
    'keydown',
    function (e) {
      if (e.key !== 'Escape') return;
      if (document.querySelector('dialog[data-sheet-required][open]')) e.preventDefault();
    },
    true
  );
  window.addEventListener('resize', function () {
    var open = document.querySelectorAll('dialog[data-sheet][open]');
    for (var si = 0; si < open.length; si++) placeSheet(open[si]);
  });

  var noRatingChoice = null;
  var skipNoRating = false;
  var noRatingSheet = root.querySelector('dialog[data-sheet="no-rating"]');
  var ratingFields = function () {
    var out = [];
    cleanerBlocks().forEach(function (b) {
      var id = b.getAttribute('data-cleaner-block');
      var f = field(raw('unit', id) === 'ach' ? 'ach' : 'airflow', id);
      if (f) out.push(f);
    });
    return out;
  };
  var clearRatingErrors = function () {
    var all = root.querySelectorAll('[data-cleaners] [data-field="airflow"], [data-cleaners] [data-field="ach"]');
    for (var ci = 0; ci < all.length; ci++) clearFieldError(all[ci]);
  };
  root.addEventListener('click', function (e) {
    var c = e.target && e.target.closest ? e.target.closest('[data-no-rating]') : null;
    if (c) noRatingChoice = c.getAttribute('data-no-rating');
  });
  if (noRatingSheet) {
    noRatingSheet.addEventListener('close', function () {
      if (noRatingChoice === 'continue') {
        skipNoRating = true;
        goStep(stepIdx + 1);
      } else if (noRatingChoice === 'enter') {
        var fields = ratingFields();
        var f = fields[0];
        if (f) {
          if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
          var many = fields.length > 1;
          fields.forEach(function (fld) {
            setFieldError(
              fld,
              fld.getAttribute('data-field') === 'ach'
                ? many
                  ? 'Enter the air changes per hour for at least one air cleaner.'
                  : 'Enter the air changes per hour from your air cleaner’s label.'
                : many
                  ? 'Enter the CADR or airflow for at least one air cleaner.'
                  : 'Enter the CADR or airflow from your air cleaner’s label.'
            );
          });
          f.focus();
        }
      }
      noRatingChoice = null;
    });
  }

  var goStep = function (i) {
    var next = Math.min(Math.max(0, i), plan.length);
    if (next > stepIdx && plan[stepIdx] === 0 && !roomValid()) {
      if (roomHint) show(roomHint, true);
      return;
    }
    if (next > stepIdx && plan[stepIdx] === 1 && hasCleaners() && combinedFlow() === 0 && !skipNoRating) {
      noRatingChoice = null;
      if (noRatingSheet) openSheet(noRatingSheet);
      return;
    }
    skipNoRating = false;
    if (next > stepIdx && plan[stepIdx] === 2) {
      if (!targetCommitted) {
        targetCommitted = true;
        recompute();
      }
      var stopAt = function (el) {
        el.scrollIntoView({
          block: 'nearest',
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
      };
      if (targetInvalid && !targetInvalid.hidden) {
        stopAt(targetInvalid);
        return;
      }
      if (targetWarn && !targetWarn.hidden && !targetWarnAcked) {
        targetWarnAcked = true;
        stopAt(targetWarn);
        return;
      }
    }
    if (!targetCommitted) {
      targetCommitted = true;
      recompute();
    }
    var dir = next === stepIdx ? 0 : next > stepIdx ? 1 : -1;
    stepIdx = next;
    renderStep(dir);
  };

  var toIntro = function () {
    stepIdx = 0;
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
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.isComposing || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey) return;
    var origin = e.target;
    if (!origin || origin.tagName !== 'INPUT' || origin.type !== 'text') return;
    var fwd = root.querySelector(
      '[data-nav="next"]:not([hidden]) button, [data-nav="result"]:not([hidden]) button'
    );
    if (!fwd) return;
    e.preventDefault();
    fwd.click();
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
