# addicted

My personal landing page: the word "addicted" and a figure (`fig.webp`), rendered
as a live grid of hex glyphs on a reflective floor, with a contact button below.
Based on the [21st.dev ASCII effect](https://21st.dev/community/ascii), rebuilt in
plain Canvas2D. Add `?donut` to swap the figure for a spinning
[donut.c](https://www.a1k0n.net/2011/07/20/donut-math.html) torus.

No build step, no dependencies. Open `index.html`.

Drop a `music.mp4` beside it for the soundtrack — the entry gate is the click
browsers require before audio may start, and it fades in over four seconds. With no
file there, the gate still opens and the piece runs silent.

## The gate

`[ enter ]` is drawn into the source canvas like everything else, so it reaches the
screen as hex glyphs through the same grid, colour chain and post-effects. The DOM
holds one transparent full-screen button over it — something to click, tab to and
read out, nothing to paint.

It is a door with a job. Behind it the piece is drawn in full, held at a tenth of its
brightness: the donut still tumbles and a frame still costs exactly what it will cost
afterwards, so auto-quality can walk to this machine's resolution somewhere you can
barely see it. Every scale change re-tiles the whole mosaic, so that walk runs to
convergence before the door opens and then stops for good — what you enter on is what
you keep. Entering raises the field from a tenth to full over 1.4s; it is the same
frame throughout, so there is nothing to swap in and nothing to jump.

## Query flags

| Flag | Effect |
|---|---|
| `?fps` | Frame interval, fps, script time, grid size and live render scale in the corner |
| `?selftest` | Assert sweep over every render mode, blur type, anim style and post-effect. Logs `PASS`/`FAIL` to the console |
| `?diag` | Every re-tile with the reason that caused it, marked if it happened after entry. A visible jump is always one of these |
| `?bench` | Sweeps render scale x cell size, then breaks one frame into stages and prices each post-effect. Flushed with a pixel readback, because canvas work is deferred and unflushed numbers lie |
| `?q=sharp` / `?q=smooth` | Pin the trade: never degrade, or buy framerate with resolution. Default walks the ladder |
| `?fx=off` | Start on the second rung: no post-effects, no backdrop haze |
| `?donut` | Spinning donut.c torus instead of the figure |

## How it works

1. `drawSource()` composes the frame that gets ASCII-ified — figure (or shaded torus),
   wordmark, tilt, mirrored floor reflection. Stands in for the photo the original effect uses.
2. The source is downscaled to one pixel per cell by repeated halving (bilinear at
   each step is a real box filter, and far cheaper than one `imageSmoothingQuality:
   "high"` draw), then each cell becomes a glyph or shape.
3. Glyph-only modes composite the layer in JS and upload it with one `putImageData`.
   A canvas-to-canvas `drawImage` costs ~2µs whatever its size, and a frame is
   thousands of them.
4. Colour chain, blur, post-effects, then the composite.

## Parameters

Everything lives in the `PARAMS` object at the top of `index.html`.

| Key | Notes |
|---|---|
| `renderMode` | 25 of them — `hexdump`, `characters`, `braille`, `matrix`, `contour`, `halfblocks`, … |
| `cellSize` / `minXCells` | Requested grid pitch in backing-store pixels (default 4). The effective pitch is capped by the measured x-height of the wordmark, contact text and entry text: each keeps at least 6 cells, including at reduced render scale. `?fps` reports the effective pitch. This can increase rendering cost; see `AUDIT.md` for before/after measurements. |
| `maxDpr` | Render at device pixels for crisp glyphs. Capped by `pixelBudget` |
| `pixelBudget` | **The sharpness knob.** Backing-store cap. At `9e6` a 3440x1440 or 4K window renders 1:1 with no CSS upscaling (~45fps there); `2.4e6` gives 8.6px cells at ~80fps |
| `autoQuality` / `targetMs` / `floorMs` / `minScale` | Degrades in one order, cheapest loss first: **post-effects and the blurred backdrop**, then **grid detail** (`cellSize` up its ladder), then **resolution** (`renderScale`, quantised to 1/k). Atmosphere costs no geometry and does not even re-tile; resolution is last because the browser then stretches the result and everything goes soft. Measured on Gecko at 1.72Mpx: 58ms with effects, 22ms without, same pixels and same cells — 17fps to 45fps for the glow. Chromium renders the lot inside budget and never reaches the first rung. The walk runs behind the gate, discards 8 frames after each change (a realloc is not a fair sample), converges, and then stops for good |
| `pauseWhenIdle` | Hidden or unfocused: the loop stops rescheduling, nothing runs at all |
| `maxFps` | Frame ceiling once you are past the gate. A 144Hz panel was doing 2.4x the work for a shimmer that does not read any faster. Uncapped behind the gate, where auto-quality still needs the true cost of a frame |
| `linkSize` | Contact line height. An eight-em-cell rule selects a row or a column; the column budgets the longest label and its brackets. |
| `marginX` / `marginY` / `tilt` | Lockup placement and lean |
| `pfx` | 9 post-effects, each `{enabled, intensity}` |
| `animStyle` | `shimmer`, `wave`, `pulse`, `ripple`, `flicker` |

The eight-em-cell rule selects the contact arrangement; it is not the legibility
guarantee. The six **x-height** cell limit is measured separately from the actual
font. Stacked contact rows retain their brackets and include them in the width budget.

Font CSS loads without blocking the page. Boot waits up to 1.5 seconds, then commits
to Instrument Serif or the local fallback for the visit; a late font cannot move the
art or change its grid. Quality adaptation is limited to six adjustments across all
three controls, and an unverified adjustment is reverted before entry.

Portrait starts below a width/height ratio of 0.8. A two-CSS-pixel deadband prevents
one-pixel resize jitter from switching the entire composition back and forth.

## hands.html

A second piece: Adam's and God's hands from Michelangelo's *Creation of Adam*, cut out
of the fresco itself, reaching across a black field while a glossy white 3D "addicted"
turns between their fingertips. Unlike `index.html` it has dependencies: three.js r170
from jsDelivr (pinned, no SRI) and the assets in `hands/`.

- `adam.webp`, `god.webp`: the fresco's forearms (public domain, Wikimedia Commons'
  3524px scan), matted with BiRefNet, super-resolved 2x with EDSR, background seen
  through the fingers removed, edges decontaminated, the far end of each arm faded into
  the dark. `cutout.py` rebuilds them and prints the fingertips the CSS pins them by.
- `addicted.glb`: the wordmark modelled in Blender in Instrument Serif, extruded with a
  rounded bevel, meshopt-compressed to ~0.5MB. `word.py` rebuilds it (`--render` for a
  Cycles still).

The layout is CSS (container queries), so the hands arrive with no script at all. A
tall screen turns the composition onto a diagonal. The word turns through its front
half only, so it never reads backwards, under a studio of hard lights so the gloss
travels across it; it renders at the device's pixel ratio up to 3. Until three.js and
the model arrive (or if they never do) the word is set as type. `?selftest` projects
the word through a whole turn and checks it never reaches a fingertip, never shows its
back, and that both hands and the word reach the screen. Reduced motion gets one still
frame.

## Credits

- Effect concept: [21st.dev/community/ascii](https://21st.dev/community/ascii)
- Torus: Andy Sloane's donut.c
- Link buttons ported from [addicted.md](https://addicted.md)
