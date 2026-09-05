# addicted

A wordmark rendered as a live grid of hex glyphs, sitting on a reflective floor
with a spinning [donut.c](https://www.a1k0n.net/2011/07/20/donut-math.html) torus
beside it. Recreation of the [21st.dev ASCII effect](https://21st.dev/community/ascii)
in plain Canvas2D.

No build step, no dependencies. Open `index.html`.

## Query flags

| Flag | Effect |
|---|---|
| `?fps` | Real frame interval and fps, script time, grid size, cell pitch and live render scale in the corner |
| `?selftest` | Assert sweep over every render mode, blur type, anim style and post-effect, plus the grid-pitch law across window and phone sizes, the composition landing inside the visible viewport, the font gate, the contact line's fixed slots and its copy targets. Logs `PASS`/`FAIL` to the console |

## How it works

1. `drawSource()` composes the frame that gets ASCII-ified — shaded torus, wordmark,
   tilt, mirrored floor reflection, contact line. Stands in for the photo the original
   effect uses. The contact line goes in here too, so it becomes glyphs like the rest
   of the piece; its copy targets are invisible DOM boxes placed from the same layout.
2. The source is downscaled to one pixel per cell (the GPU box-filters it far faster
   than a JS sampling loop), then each cell becomes a glyph or shape.
3. Colour chain, blur, post-effects, then the composite.

## Parameters

Everything lives in the `PARAMS` object at the top of `index.html`.

| Key | Notes |
|---|---|
| `renderMode` | 25 of them — `hexdump`, `characters`, `braille`, `matrix`, `contour`, `halfblocks`, … |
| `cellSize` | Grid pitch in device pixels at `cellRef`. Smaller = finer, quadratically more work |
| `cellRef` / `cellMin` / `cellBudget` | The pitch follows the lockup so a small window keeps as many cells inside each letter as a big one, floored at what a hex digit can draw and capped in total cells |
| `maxDpr` / `pixelBudget` | Render at device pixels for crisp glyphs, up to a backing-store cap |
| `autoQuality` / `targetMs` / `warmupMs` / `sampleMs` / `minScale` | Measures real frame intervals once the page has settled, then picks the render scale in a single step and stops — every change re-tiles the mosaic, so it only ever does it once per window |
| `qualityFadeMs` | That one re-tile is a dissolve, not a cut: the frame before it is kept and faded out over the new grid |
| `fontGraceMs` | Boot waits this long for Instrument Serif before drawing anything, so the wordmark is never measured in the fallback and then re-measured |
| `pauseWhenIdle` | Hidden or unfocused: the loop stops rescheduling, nothing runs at all |
| `marginX` / `marginY` / `tilt` | Lockup placement and lean |
| `linkSize` / `linkRoom` / `minXCells` | Contact line: x-height in cells, the width past which it stacks instead of shrinking, and the legibility floor every piece of text is held to |
| `pfx` | 9 post-effects, each `{enabled, intensity}` |
| `animStyle` | `shimmer`, `wave`, `pulse`, `ripple`, `flicker` |

## Phones

The canvas is `100svh`, the *small* viewport — the height that stays visible while the
browser toolbars are up. `100vh` and `innerHeight` are the *large* viewport, the height
you only get once they have collapsed, and the composition is bottom-anchored, so
laying it out at that height puts the wordmark and its whole reflection behind the
toolbars on load. `svh` rather than `dvh` because `dvh` tracks the toolbars as they
slide, and a composition that re-lays-out while you scroll is the same defect wearing
a different hat.

Everything downstream reads the canvas element's own box (`vpW()` / `vpH()`) rather
than `innerWidth` / `innerHeight`, so the backing store, the glyph grid and the
invisible copy targets cannot disagree about what the viewport is. `resize()` returns
whether anything actually changed, and does nothing when it has not — a phone fires
`resize` on every toolbar slide, and each rebuild re-tiles the whole mosaic.

Note when testing: `Emulation.setDeviceMetricsOverride` over CDP has **no browser
chrome**, so `innerHeight` there is the whole screen and this class of bug is
invisible. Test on a device, or pin the canvas shorter than `innerHeight` by hand.

## Credits

- Effect concept: [21st.dev/community/ascii](https://21st.dev/community/ascii)
- Torus: Andy Sloane's donut.c
- Link buttons ported from [addicted.md](https://addicted.md)
