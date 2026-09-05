# addicted

A wordmark rendered as a live grid of hex glyphs, sitting on a reflective floor
with a spinning [donut.c](https://www.a1k0n.net/2011/07/20/donut-math.html) torus
beside it. Recreation of the [21st.dev ASCII effect](https://21st.dev/community/ascii)
in plain Canvas2D.

No build step, no dependencies. Open `index.html`.

## Query flags

| Flag | Effect |
|---|---|
| `?fps` | Frame time, grid size, cell pitch and live render scale in the corner |
| `?selftest` | Assert sweep over every render mode, blur type, anim style and post-effect, plus the grid-pitch law across window sizes. Logs `PASS`/`FAIL` to the console |

## How it works

1. `drawSource()` composes the frame that gets ASCII-ified — shaded torus, wordmark,
   tilt, mirrored floor reflection. Stands in for the photo the original effect uses.
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
| `autoQuality` / `targetMs` / `minScale` | Measures real frame cost, walks the render scale to fit, never past the floor |
| `pauseWhenIdle` | Hidden or unfocused: the loop stops rescheduling, nothing runs at all |
| `marginX` / `marginY` / `tilt` | Lockup placement and lean |
| `pfx` | 9 post-effects, each `{enabled, intensity}` |
| `animStyle` | `shimmer`, `wave`, `pulse`, `ripple`, `flicker` |

## Credits

- Effect concept: [21st.dev/community/ascii](https://21st.dev/community/ascii)
- Torus: Andy Sloane's donut.c
- Link buttons ported from [addicted.md](https://addicted.md)
