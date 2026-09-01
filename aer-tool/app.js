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

  var mqMobile = window.matchMedia('(max-width: 68rem)');

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
  var CW_MAX = 4.5;
  var CW_MIN = 2;
  var GAP_MAX = 10;
  var UNIT_MIN_PX = 22;
  var sceneSentinel = root.querySelector('[data-safe]');
  var sentinel = sceneSentinel || document.createElement('div');
  var hasScene = !!(sceneSvg && sceneStage && sceneSentinel);
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

  var detailsG = svg.querySelector('[data-room-details]');
  var setDetail = function (sel, on, pts) {
    var el = svg.querySelector(sel);
    if (!el) return;
    el.style.visibility = on ? '' : 'hidden';
    if (on && pts) el.setAttribute('points', ptsAttr(pts));
  };

  var layoutCleaners = function (L, W, n, cwOpt) {
    var gap = Math.min(Math.max(3, Math.min(L, W) * 0.55), GAP_MAX);
    var cwBase = Math.min(Math.max(Math.min(L, W) * 0.18, CW_MIN), CW_MAX);
    var cw = Math.min(cwOpt == null ? cwBase : cwOpt, (W / n) * 0.55);
    var ch = cw * 1.3;
    var off = cw * 0.3;
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

  var WIN_POOL = 8;
  var WIN_W = 2.4;
  var RTU_DEFS = [
    { fx: 0.66, fy: 0.38, sx: 2.4, sy: 1.8, h: 1.4 },
    { fx: 0.4, fy: 0.7, sx: 1.8, sy: 1.8, h: 1.0 },
    { fx: 0.8, fy: 0.68, sx: 1.4, sy: 1.4, h: 0.8 },
  ];
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
    var stories = Math.min(Math.max(Math.floor(H / 8), 1), 3);
    var storyH = H / stories;
    var winH = Math.min(3, storyH * 0.4);
    var sills = [];
    for (var r = 0; r < stories; r++) sills.push(r * storyH + Math.min(3, storyH * 0.36));
    var doorOn = !degenerate && L >= 8 && H >= 5;
    var doorH = Math.min(6.8, H * 0.8);
    var winL = degenerate ? [] : winCenters(1.5, doorOn ? L - 5.5 : L - 1.5);
    var winR = degenerate ? [] : winCenters(1.5, W - 1.5);
    var rtus = [];
    if (!degenerate && Math.min(L, W) >= 5) {
      var count = Math.min(3, 1 + Math.floor(Math.sqrt(L * W) / 14));
      for (var k = 0; k < count; k++) {
        var d = RTU_DEFS[k];
        var sx = Math.min(d.sx, L * 0.28);
        var sy = Math.min(d.sy, W * 0.28);
        var x0 = Math.max(Math.min(d.fx * L - sx / 2, L - 1 - sx), 1.6);
        var y0 = Math.max(Math.min(d.fy * W - sy / 2, W - 1 - sy), 1);
        rtus.push({ x0: x0, y0: y0, x1: x0 + sx, y1: y0 + sy, h: Math.min(d.h, H * 0.2) });
      }
    }
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

  var drawScene = function (L, W, H) {
    if (!hasScene) return;
    var n = Math.min(Math.max(1, sceneN), MAX_CLEANERS);
    var det = layoutDetails(L, W, H);

    var drawCap = capS > 0.01;
    var gL = L * capS;
    var gW = W * capS;
    var gx0 = L - gL;
    var gy0 = W - gW;

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
      if (det.towerOn) box(det.tx0, det.ty0, det.tx1, det.ty1, H + 4.8);
      if (det.mastOn) box(L / 2, W / 2, L / 2, W / 2, H + det.mastH);
      for (var ci = 0; ci < cls.length; ci++) {
        var c = cls[ci];
        box(c.x0, c.y0, c.x1, c.y1, c.h);
      }
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

    setPoly('[data-ground]', [
      w(fit.lotX0, fit.lotY0, 0),
      w(fit.lotX1, fit.lotY0, 0),
      w(fit.lotX1, fit.lotY1, 0),
      w(fit.lotX0, fit.lotY1, 0),
    ]);

    setPoly('[data-room="top"]', [w(0, 0, H), w(L, 0, H), w(L, W, H), w(0, W, H)]);
    setPoly('[data-room="left"]', [w(0, W, H), w(L, W, H), w(L, W, 0), w(0, W, 0)]);
    setPoly('[data-room="right"]', [w(L, 0, H), w(L, W, H), w(L, W, 0), w(L, 0, 0)]);

    if (detailsG) detailsG.style.visibility = det.degenerate ? 'hidden' : '';
    if (!det.degenerate) {
      var hw = WIN_W / 2;
      for (var r = 0; r < 3; r++) {
        var rowOn = r < det.stories;
        var z0 = det.sills[r] == null ? 0 : det.sills[r];
        var z1 = z0 + det.winH;
        for (var c2 = 0; c2 < WIN_POOL; c2++) {
          var s = r * 8 + c2 + 1;
          var cl = det.winL[c2];
          var onL = rowOn && cl != null;
          setDetail(
            '[data-win-l="' + s + '"]',
            onL,
            onL
              ? [w(cl - hw, W, z1), w(cl + hw, W, z1), w(cl + hw, W, z0), w(cl - hw, W, z0)]
              : undefined
          );
          var cr = det.winR[c2];
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
      var pin = Math.min(0.9, 0.15 * Math.min(L, W));
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
        var zt = H + u2.h;
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
        var ztt = H + 4.8;
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

    if (drawCap) {
      setPoly('[data-cap="top"]', [w(gx0, gy0, H), w(L, gy0, H), w(L, W, H), w(gx0, W, H)]);
      setPoly('[data-cap="left"]', [w(gx0, W, H), w(L, W, H), w(L, W, 0), w(gx0, W, 0)]);
      setPoly('[data-cap="right"]', [w(L, gy0, H), w(L, W, H), w(L, W, 0), w(L, gy0, 0)]);
      var capPt = w(gx0, gy0, H);
      var prefix = capClamped ? '≥' : '';
      var capFt3 = raw('units') === 'ft3';
      var capText = capFt3 ? fmt(capMaxVol, 0) + ' ft³' : fmt(capMaxVol / 8, 0) + ' ft²';
      setLabel('capacity', [capPt[0] + 6, capPt[1] - 8], 'covers a room up to ' + prefix + capText);
    }

    returnPaths.length = 0;
    outPaths.length = 0;
    for (var i2 = 0; i2 < MAX_CLEANERS; i2++) {
      var laneG = svg.querySelector('.smaqmd-cityview__lanes[data-lanes="' + (i2 + 1) + '"]');
      var unitG = svg.querySelector('.smaqmd-cityview__unitg[data-unitg="' + (i2 + 1) + '"]');
      var on = i2 < n;
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

      var setLaneG = (function (lg) {
        return function (sel, pts) {
          var el = lg ? lg.querySelector(sel) : null;
          if (el) el.setAttribute('points', ptsAttr(pts));
        };
      })(laneG);
      var cyc2 = (cc.laneOut + cc.laneRet) / 2;
      setLaneG('[data-road]', [w(L, cyc2, 0), w(cc.x0, cyc2, 0)]);
      var outPath = [w(L, cc.laneOut, 0), w(cc.x0, cc.laneOut, 0)];
      setLaneG('[data-flow="out-track"]', outPath);
      setLaneG('[data-flow="out-wave"]', outPath);
      var returnPath = [w(cc.x0, cc.laneRet, 0), w(L, cc.laneRet, 0)];
      setLaneG('[data-flow="return-track"]', returnPath);
      setLaneG('[data-flow="wave"]', returnPath);
      outPaths[i2] = outPath;
      returnPaths[i2] = returnPath;

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

    var lm = mid(w(0, W, 0), w(L, W, 0));
    setLabel('length', [lm[0] - 4, lm[1] + 20], fmt(L, 1) + ' ft');
    var wm = mid(w(0, 0, H), w(0, W, H));
    setLabel('width', [wm[0] - 12, wm[1] - 12], fmt(W, 1) + ' ft');
    var hm = mid(w(0, W, 0), w(0, W, H));
    setLabel('height', [hm[0] - 26, hm[1]], fmt(H, 1) + ' ft');

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
  };

  var HOUR_SECONDS = 5;
  var TRAVEL = 2.2;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = { L: 12, W: 10, H: 8 };
  var tgt = { L: 12, W: 10, H: 8 };
  var capS = 0;
  var capSTgt = 0;
  var capMaxVol = 0;
  var capClamped = false;
  var capG = svg.querySelector('[data-capg]');
  var laneAch = [];
  var stateNow = 'idle';
  var running = false;
  var last = 0;
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
      var v = Ln / TRAVEL;
      var wl = Math.max(8, v * interval);
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
    drawScene(cur.L, cur.W, cur.H);

    updateWave(dt);

    if (morphing || animating()) requestAnimationFrame(frame);
    else running = false;
  };
  var startLoop = function () {
    if (!sceneLive || running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
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
    tgt.L = b.L;
    tgt.W = b.W;
    tgt.H = b.H;
    startLoop();
  };

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

  var cleanersHost = root.querySelector('[data-cleaners]');
  var template = root.querySelector('[data-cleaner-template]');
  var cleanerBlocks = function () {
    return qa('[data-cleaner-block]:not([data-removing])');
  };
  var nextId = 0;

  var CLEANER_FIELDS = ['unit', 'airflow', 'ach', 'refLength', 'refWidth', 'refHeight'];

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
      var refVol = num('refLength', id) * num('refWidth', id) * (pos('refHeight', id) || 8);
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
    show(targetWarn, isFinite(enteredTarget) && enteredTarget > 0 && enteredTarget < 2);

    var flow = combinedFlow();
    var vol = roomVolume();
    var hasFlow = flow > 0;
    var hasRoom = isFinite(vol) && vol > 0;

    var area = roomArea();
    var coverVol = hasFlow ? (flow * 60) / target : NaN;
    var asFt3 = raw('units') === 'ft3';
    setReadout('coversubj', blocks.length > 1 ? 'Your cleaners cover' : 'Your cleaner covers');
    setReadout(
      'roomarea',
      hasRoom && isFinite(area) ? (asFt3 ? fmt(vol, 0) + ' ft³' : fmt(area, 0) + ' ft²') : '—'
    );
    setReadout(
      'coverarea',
      hasFlow ? (asFt3 ? fmt(coverVol, 0) + ' ft³' : fmt(coverVol / 8, 0) + ' ft²') : '—'
    );
    showGroup('secondary', hasRoom && hasFlow);

    var ach = hasFlow && hasRoom ? (flow / vol) * 60 : NaN;
    var pass = hasFlow && hasRoom && ach >= target;

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

    var needCadr = (target * vol) / 60;
    var setPrompt = function (on) {
      show(block.querySelector('[data-prompt="empty"]'), on);
    };

    if (targetIsInvalid) {
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
      setMetric('ach', fmt(ach, 1));
      setReadout('ach', fmt(ach, 1));
      show(achWrap, true);
      if (achWrap) achWrap.toggleAttribute('data-below', !pass);
      setMetric('fix', fmt(needCadr, 0) + unitSpan('ft³/min'));
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
        show(cadrHighEl, needCadr > 700);
      } else {
        show(cadrHighEl, false);
      }
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
      if (achWrap) achWrap.removeAttribute('data-below');
      setMetric('fix', fmt(needCadr, 0) + unitSpan('ft³/min'));
      show(fixWrap, true);
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
      show(achWrap, false);
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
      show(d, i < plan.length);
      d.toggleAttribute('data-active', i === stepIdx && !isResult);
      d.toggleAttribute('data-done', i < stepIdx);
    });
    if (stepCountEl) {
      stepCountEl.textContent = isResult
        ? 'Result'
        : 'Step ' + (stepIdx + 1) + ' of ' + plan.length;
    }
    if (stepTitleEl) {
      stepTitleEl.hidden = isResult;
      if (!isResult) stepTitleEl.textContent = TITLES[section];
    }
    show(navEl('back'), stepIdx > 0 || !!introEl);
    show(navEl('next'), stepIdx < plan.length - 1);
    show(navEl('result'), stepIdx === plan.length - 1);
    show(navEl('restart'), isResult);
    if (roomHint && section !== 0) show(roomHint, false);
    syncViewport();
    if (dir !== 0) {
      var heading = isResult ? answerTitle : stepTitleEl;
      if (heading) heading.focus();
    }
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
