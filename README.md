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
| `?selftest` | Assert sweep over every render mode, blur type, anim style and post-effect, plus the grid-pitch law across window and phone sizes, the composition landing inside the visible viewport, the font gate, the contact line's fixed slots and its copy targets, and — at every render scale the regulator can reach — the legibility floor and the contact line's arrangement. Logs `PASS`/`FAIL` to the console |

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
| `autoQuality` / `targetMs` / `warmupMs` / `sampleMs` / `minScale` | Measures real frame intervals once the page has settled, then picks the render scale in a single step and stops — every change re-tiles the mosaic, so it only ever does it once per window. `minScale` is the coarsest it may go; `scaleFloor()` raises that on the few viewports where `minScale` would cost the wordmark its sixth cell (see Render scale below) |
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

## Render scale

Auto-quality drops `renderScale` about 1.6s after load on a machine that cannot hold
the frame budget. That shrinks the backing store; it must not change the composition.
Two things keep it honest.

**The layout is measured at full resolution.** `cellPitchFor` already measured the
grid pitch on `backing(..., 1)`, and the contact line's arrangement is decided on the
same store — `linkFit` takes the full-resolution width. Testing the row against the
live, shrunken store instead made the stacking decision a function of the frame rate:
133 of the 16:9 windows between 900 and 2220 CSS px wide put the line on one row at
full resolution and two at `minScale`, so a slow machine watched `[ discord | mail ]`
reorganise itself into two rows a second and a half after load. The cross-dissolve
covers a re-tiled mosaic, not a changed layout. Only the last-resort clamp that stops
the row overrunning the margins still reads the live store, because overrunning the
canvas is about real pixels; across the whole space the piece targets it never fires
(the worst row is 0.84 of the margin box at `minScale`).

The line is sized in cells and the cell count does not move with the scale, so on a
down-scaled canvas it does take proportionally more of the visible width — 809 CSS px
to 1079 at 1600x900, measured. That is not new and not the arrangement changing: it is
what sizing text in cells means, and the alternative is a contact line that drops under
the legibility floor exactly when the mosaic gets coarser.

**Legibility bounds how coarse it may get.** The pitch holds still while the lockup
shrinks with the scale, so `minScale` spends about a quarter of the cells the letters
are made of — fine on most windows (an iPhone 15 goes 9.8 x-cells to 7.4), not fine on
a few narrow or very tall ones: 5.99 x-cells at 320x568 (iPhone 5 / SE-1) and 5.71 at
383x938, against a floor of 6. `scaleFloor()` gives those viewports a shallower floor
instead — 0.76 and 0.78 rather than 0.75 — and returns `minScale` unchanged on every
window 800 CSS px or wider, so nothing that was fast enough before pays for it. The
floor was a rule written beside an assertion that only skipped the windows where it
did not hold; it is enforced now, and `?selftest` checks it at the coarsest scale each
viewport can actually reach, with no exemptions.

## Credits

- Effect concept: [21st.dev/community/ascii](https://21st.dev/community/ascii)
- Torus: Andy Sloane's donut.c
- Link buttons ported from [addicted.md](https://addicted.md)
