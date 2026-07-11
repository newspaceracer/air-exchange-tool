# Study Notes — How the Isometric "City" Visualization Works

Notes on the main graph in `src/components/smaqmd-aer-calculator-b.astro`
(the "Option B" isometric room + air-cleaner scene). Written to study later.

---

## 1. The big picture: no library

The visualization is **not** D3, Chart.js, or Three.js. It's three plain
web technologies:

1. **Inline SVG** — the shapes (`<polygon>`, `<polyline>`, `<text>`) live
   directly in the markup.
2. **CSS transitions** — for small state changes (hover, color/opacity fades).
3. **A hand-written `requestAnimationFrame` loop** — for everything dynamic
   (the flowing air waves, the room morphing as you change dimensions).

There is **no 3D engine**. The "isometric" look is faked with 2D math
(a 2.5D projection), not real 3D.

---

## 2. The key insight: the SVG is not a drawing

This is the thing that's easy to miss.

A normal SVG polygon has baked-in coordinates:

```html
<polygon points="10,10 90,10 90,90" />
```

But the shapes in this file are **empty, labeled shells** — no coordinates:

```html
<polygon class="bcn-cityview__room-face" data-room="left"></polygon>
<polygon class="bcn-cityview__room-face" data-room="right"></polygon>
<polygon class="bcn-cityview__room-face" data-room="top"></polygon>
```

The coordinates are **injected by JavaScript** every frame. The left wall is
defined as a *formula* in terms of L, W, H (line ~659):

```js
setPoly('[data-room="left"]', [w(0, W, H), w(L, W, H), w(L, W, 0), w(0, W, 0)]);
// ↳ ends up calling el.setAttribute('points', ...)
```

**So the "drawing" lives in code, not in the SVG.** When L/W/H change,
`drawScene` recomputes those points and overwrites the `points` attribute.
That "erase old points, write new points" (~60×/second) *is* the morph.

### Why a Figma export can't morph
A Figma SVG export is a **photograph of one fixed state** — every shape has
hard-coded numbers describing that specific room at that specific size. There's
no `L` variable in there for code to change.

**Rule of thumb:** if geometry changes in response to data/input, it has to be
**computed in code**. Figma gives you the target *look*; the code generates
every specific *frame* of it.

### Where Figma still fits
- Design the *look* of one frozen state (angle, colors, proportions, strokes),
  then translate that into projection constants + CSS.
- Export genuinely **static** pieces (backgrounds, icons, label chips) as-is.
- Inspect shapes to read exact coordinates/colors to hard-code as start values.

### Corrected pipeline
1. Figma: draw the look at one representative state.
2. Code: create empty tagged shapes (`<polygon data-room="left">`).
3. Code: write the math mapping inputs (L, W, H) → screen coordinates.
4. On any change: recompute and `setAttribute('points', …)`.
5. Match colors/strokes/angles to the Figma reference via CSS + constants.

---

## 3. The isometric projection — the one piece of real math

This is the whole "isometric" trick (lines ~543–548):

```js
const COS30 = Math.cos(Math.PI / 6); // ≈ 0.866
const SIN30 = 0.5;
project(x, y, z) => [
  (x - y) * COS30,       // → screen X (horizontal)
  (x + y) * SIN30 - z,   // → screen Y (vertical, down = positive)
];
```

Input: a 3D point — `x` = length, `y` = width, `z` = height.
Output: a 2D `[screenX, screenY]` pixel.

### Why these formulas
Pick a fixed screen direction for each 3D axis, then sum how far the point
travels along each:

| 3D axis        | Moves on screen…      | Contribution                     |
|----------------|-----------------------|----------------------------------|
| **x** (length) | down-and-**right**    | `+x·cos30` right, `+x·sin30` down |
| **y** (width)  | down-and-**left**     | `−y·cos30` right (=left), `+y·sin30` down |
| **z** (height) | straight **up**       | `−z` in Y (up = negative)        |

- Horizontal contributions add to `(x − y)·cos30`.
- Vertical contributions add to `(x + y)·sin30 − z`.

Intuition:
- **x and y both push down** the screen (`+…·sin30`) → floor receding away.
- **x pushes right, y pushes left** (`x − y`) → splays the floor into the iso "V".
- **z only subtracts from Y** → height lifts straight up, no sideways shift.

The `cos30`/`sin30` set the angle: `cos(30°)≈0.866`, `sin(30°)=0.5`, giving the
**2:1** ratio (2 px sideways per 1 px drop) that reads as isometric.
Use `cos45`/`sin45` instead → steeper "dimetric" look.

### Worked example — room L=10, W=8, H=9

Top-far corner `(10, 0, 9)`:
```
screenX = (10 − 0)·0.866 = 8.66
screenY = (10 + 0)·0.5 − 9 = 5 − 9 = −4   → [8.66, −4]
```
Floor corner directly below it `(10, 0, 0)`:
```
screenX = (10 − 0)·0.866 = 8.66
screenY = (10 + 0)·0.5 − 0 = 5            → [8.66, 5]
```
Same `screenX`, `screenY` differs by 9 → the two points sit **exactly
vertically stacked**, 9 px apart (the wall height). That's why vertical box
edges are always perfectly plumb: `z` only moves you up/down. Change `H` and
only that vertical gap grows; the footprint doesn't move.

### project() vs w()
- `project(x,y,z)` → abstract "world" coordinates.
- `w(x,y,z)` (lines ~649–652) → scales + centers those into the SVG viewport
  (fit-to-viewport). Keeping them separate is what lets the scene auto-resize.

So `drawScene` runs `project()` on the box's 8 corners, `w()` fits them to
pixels, and writes them into the empty `<polygon>` slots.

---

## 4. The animation loop (dynamic parts)

A single `requestAnimationFrame` loop (`frame(ts)`, lines ~788–804) does three
things per frame, then re-schedules itself **only while something is moving**:

### a) Room morph (ease toward target)
```js
cur.L += (tgt.L - cur.L) * 0.22;  // exponential ease / lerp
```
Type a new dimension → `cur` eases toward `tgt` at 22%/frame, `drawScene`
re-projects every frame until it settles. (Standard `cur += (tgt-cur)*k`.)

### b) Flow waves (the moving air)
Each street is a `<polyline>` stroked with a **repeating `<linearGradient>`**
(`gradientUnits="userSpaceOnUse"`, `spreadMethod="repeat"`). The loop doesn't
move the line — it moves the **gradient's start point** each frame
(`updateWave`), and `spreadMethod="repeat"` tiles the rest.

Speed is tied to the physics: one wave passes a point every
`HOUR_SECONDS / ACH` seconds → higher air-change rate literally scrolls faster.
**The animation encodes the calculator's output.**

### c) Delta time
`dt = (ts - last)/1000` makes motion speed consistent across monitors
(don't animate by fixed per-frame steps).

### Accessibility
Checks `prefers-reduced-motion` (`reduced`) and freezes the waves. Build this
in from the start.

---

## 5. Gotchas / things to know to build it yourself

- **The projection formula** — the reusable ~5 lines. Shape to memorize:
  horizontal = `(x−y)·cos`, vertical = `(x+y)·sin − z`.
- **Draw order matters (painter's algorithm)** — SVG has no depth buffer.
  You paint back-to-front by hand: room walls in order, cleaners drawn *after*
  the room so they sit in front. This is the #1 thing that bites people.
- **Separate projection from fit/scale** — `project()` = world units,
  `w()` = fit to pixel viewport. Separation enables auto-resize.
- **Pointer Events** for the drag grips — the room edges are draggable `<line>`
  handles that write back into the `esa-text-field` form inputs (inputs stay
  the source of truth). Requires converting screen coords → SVG coords.
- **CSS transitions** for pure state changes (hover, show/hide) so you don't
  spend animation-loop code on them.

---

## 6. Learn-it-in-steps plan

1. Build a **static** isometric box from L/W/H inputs (just `project` + `w`).
2. Add the **ease-toward-target** morph on input change.
3. Add **one scrolling-gradient** flow line.
4. Add a **drag grip** that writes back to an input.

Each is small and self-contained. Master the projection first — the rest is
repetition.

---

## Key line references (`smaqmd-aer-calculator-b.astro`)
- `project()` isometric math — ~543–548
- `drawScene()` — ~616 onward (room faces ~658–660)
- `setAttribute('points', …)` injection — ~580, ~680, ~696
- `w()` fit-to-viewport — ~649–652
- Animation `frame()` loop — ~788–804
- `updateWave()` flow scrolling — ~764–785
- Empty polygon shells (markup) — ~105–107
- Wave gradients (markup) — ~64–81
- Drag grips (markup) — ~127–134
