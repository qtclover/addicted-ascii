# addicted

The landing page of [addicted.md](https://addicted.md). Adam's and God's hands from
Michelangelo's *Creation of Adam* reach across a black field, and between their
fingertips a glossy white 3D "addicted" sways in the gap.

No build step to run it: open `index.html` from any static server. Everything it loads
is in this repository.

## What happens on a visit

1. The page stays black until it can all arrive together: both hands decoded and the
   word ready, with its shaders compiled and a first frame drawn.
2. Both arms slide in along their length and the word rises out of the dark.
3. The hands breathe, reaching a little toward each other and back, and never touch.
4. The word sways ±20° about face-on. It never turns side-on, so it never reads
   backwards.

On a tall screen the composition turns onto a diagonal: Adam comes in from the lower
left and God from the upper right. If the 3D isn't ready within 4s, or can't load,
the entrance goes ahead with the word set as type. With reduced motion turned on,
everything holds still.

## Files

| Path | What it is |
|---|---|
| `index.html` | The page: layout in CSS, the 3D word in a small module script |
| `hands/adam.webp`, `hands/god.webp` | The two forearms, cut out of the fresco |
| `hands/addicted.glb` | The word, modelled in Blender (~340KB, meshopt) |
| `hands/three-word.js` | three.js r170, only the parts the page uses, bundled |
| `hands/instrument.woff2` | Instrument Serif, the face the word is set in |
| `hands/cutout.py` | Rebuilds the hand cut-outs |
| `hands/word.py` | Rebuilds the 3D word |
| `hands/three-word.entry.js` | Entry point for the three.js bundle |
| `_redirects` | Sends the old `/hands.html` address to `/` |
| `PROMPT.md` | Working rules for AI coding sessions on this repo |

## Query flags

| Flag | Effect |
|---|---|
| `?follow` | The word turns toward the pointer, or the phone's tilt, instead of swaying |
| `?selftest` | Console checks. The word never reaches a fingertip in any pose, even with the hands at their nearest. It never leaves its canvas. Both hands decode and land on screen. The word renders at the device's pixel ratio |

## Performance

- **Five requests, one origin.** Everything is requested from the `<head>` at once.
- **No font download.** The type fallback uses Instrument Serif cut to the six
  letters of "addicted" and inlined (3KB), so it never swaps fonts.
- **Smooth arm motion.** The arms animate on the compositor: one transform
  animation at a time, plain percentage keyframes, and a slight turn about each
  fingertip so Firefox doesn't pixel-snap the slow breathing into steps.
- **A small 3D canvas.** The canvas covers only the word's box and renders its
  window of the full view with `setViewOffset`. That's about an eighth of the
  pixels of a full-screen canvas.

## Rebuilding the assets

The hands need rembg (BiRefNet), opencv-contrib-python-headless < 5, numpy, Pillow
and the EDSR x2 model:

    python hands/cutout.py FRESCO.jpg EDSR_x2.pb hands/ [adam|god]

`cutout.py` prints each index fingertip. `index.html` pins the cut-outs by those
fingertips, so update its CSS if they change.

The word needs `bpy` from PyPI (Blender 5.3) and gltf-transform:

    python hands/word.py instrument.ttf OUT_DIR
    npx @gltf-transform/cli meshopt OUT_DIR/addicted.raw.glb hands/addicted.glb --level high

The three.js bundle needs `three@0.170.0` and esbuild:

    esbuild hands/three-word.entry.js --bundle --format=esm --minify --target=es2020 --legal-comments=eof --outfile=hands/three-word.js

The inline font comes from:

    pyftsubset hands/instrument.woff2 --text=addicted --flavor=woff2

## Credits

- *The Creation of Adam*, Michelangelo, c. 1512, Sistine Chapel. Public domain, from
  Wikimedia Commons' 3524×1599 scan.
- [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif), SIL Open
  Font License.
- [three.js](https://threejs.org), MIT License.
- Cut-outs matted with [BiRefNet](https://github.com/ZhengPeng7/BiRefNet) via
  [rembg](https://github.com/danielgatis/rembg), and upscaled with
  [EDSR](https://github.com/Saafke/EDSR_Tensorflow).
