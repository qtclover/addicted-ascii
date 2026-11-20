"""Cut Adam's and God's forearms out of the Creation of Adam fresco.

Builds hands/adam.webp and hands/god.webp (transparent, the far end of each arm
fading into the dark) and prints each index fingertip, which hands.html places.

  python cutout.py FRESCO.jpg EDSR_x2.pb OUT_DIR [adam|god]

The optional last argument does one arm per run: BiRefNet and EDSR together want
more memory than a small machine has twice over.

FRESCO.jpg  Wikimedia Commons, "Michelangelo - Creation of Adam (cropped).jpg"
            (3524x1599; public domain)
EDSR_x2.pb  github.com/Saafke/EDSR_Tensorflow models/EDSR_x2.pb
needs       rembg[cpu] (BiRefNet), opencv-contrib-python-headless<5, numpy, Pillow
"""
import sys
import numpy as np
import cv2
from PIL import Image
from rembg import remove, new_session

fresco, edsr, out_dir = sys.argv[1:4]
only = sys.argv[4] if len(sys.argv) > 4 else None
src = Image.open(fresco).convert("RGB")
assert src.size == (3524, 1599), "crop boxes below are for the 3524x1599 file"

seg = new_session("birefnet-general")
sr = cv2.dnn_superres.DnnSuperResImpl_create()
sr.readModel(edsr)
sr.setModel("edsr", 2)


def arm(box):
    """Crop, matte with BiRefNet, and super-resolve 2x. Returns RGBA float32 at 2x."""
    crop = src.crop(box)
    alpha = np.array(remove(crop, session=seg).split()[3])
    return crop, alpha


def upscale(crop, alpha):
    rgb = cv2.cvtColor(sr.upsample(cv2.cvtColor(np.array(crop), cv2.COLOR_RGB2BGR)), cv2.COLOR_BGR2RGB)
    a = np.array(Image.fromarray(alpha).resize((rgb.shape[1], rgb.shape[0]), Image.LANCZOS))
    return np.dstack([rgb, a]).astype(np.float32)


def finish(im, fade_from, fade_to, name, flip):
    """Largest component only, far end faded, tight crop, fringe darkened. Pointing
    side is on the right while this runs; `flip` turns God's back afterwards."""
    a = im[..., 3]
    n, lab, stats, _ = cv2.connectedComponentsWithStats((a > 128).astype(np.uint8), 8)
    keep = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
    a *= cv2.dilate((lab == keep).astype(np.uint8), np.ones((9, 9), np.uint8))
    # Sky through a gap between fingers is background, however the matte scored it:
    # blue-grey with no warmth in it. Skin and the plaster both run warm (R well above
    # B), so this takes the sky and nothing else.
    warm = im[..., 0] - im[..., 2]
    a[(warm < 15) & (im[..., :3].mean(axis=2) > 70)] = 0   # light and cool; deep shadow is spared
    # Then no partial alpha inside the silhouette: more than 2.5px from the matte's
    # edge a pixel is arm or it is not. Partial alpha stays only as edge antialiasing.
    b = (a > 128).astype(np.uint8)
    edge_d = np.where(b > 0, cv2.distanceTransform(b, cv2.DIST_L2, 3),
                      cv2.distanceTransform(1 - b, cv2.DIST_L2, 3))
    inner = edge_d > 2.5
    a[inner] = np.where(b[inner] > 0, 255, 0)
    assert not ((a > 15) & (a < 240) & inner).any()
    # Edge pixels keep their alpha but take their colour from the solid arm beside
    # them: as matted they are half plaster or sky, and on black that reads as a halo.
    solid = (a >= 250).astype(np.float32)
    num = cv2.GaussianBlur(im[..., :3] * solid[..., None], (0, 0), 2.0)
    den = cv2.GaussianBlur(solid, (0, 0), 2.0)[..., None]
    edge = (a > 0) & (a < 250) & (den[..., 0] > 0.02)
    im[..., :3][edge] = (num / np.maximum(den, 1e-6))[edge]
    t = np.clip((np.arange(a.shape[1], dtype=np.float32) - fade_from) / (fade_to - fade_from), 0, 1)
    a *= (t * t * (3 - 2 * t))[None, :]
    ys, xs = np.nonzero(a > 8)
    pad = 6
    y0, y1 = max(0, ys.min() - pad), min(a.shape[0], ys.max() + 1 + pad)
    x0, x1 = max(0, xs.min() - pad), min(a.shape[1], xs.max() + 1 + pad)
    c = im[y0:y1, x0:x1].copy()
    # colour under near-zero alpha is still plaster: pull it toward black
    c[..., :3] *= np.clip(c[..., 3:4] / 255 * 1.6, 0, 1) ** 0.25
    ca = c[..., 3]
    tx = np.nonzero((ca > 128).any(axis=0))[0].max()
    ty = int(np.nonzero(ca[:, tx] > 128)[0].mean())
    img = Image.fromarray(c.clip(0, 255).astype(np.uint8), "RGBA")
    if flip:
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
        tx = img.width - 1 - tx
    img.save(f"{out_dir}/{name}.webp", "WEBP", quality=92, method=6)
    print(f"{name}: {img.width}x{img.height}, index fingertip at ({tx}, {ty})")


# Adam: his knee rises into the bottom of the crop and touches the forearm, so the
# matte runs them together. Cut along the arm's lower edge (traced from the matte's
# column runs where they part), feathered over 3px.
def adam():
    crop, alpha = arm((640, 560, 1350, 920))
    edge = [(130, 300), (140, 294), (160, 287), (180, 281), (200, 279), (220, 281), (240, 279), (260, 277),
            (280, 275), (300, 272), (320, 268), (340, 259), (360, 247), (380, 232), (400, 218), (420, 210)]
    ex, ey = zip(*edge)
    for x in range(130, 421):
        yc = int(round(np.interp(x, ex, ey) + np.interp(x, [130, 170, 320, 360], [2, -3, -3, 2])))
        alpha[yc:, x] = 0
        for k in range(1, 4):
            alpha[yc - k, x] = min(alpha[yc - k, x], int(255 * k / 4))
    im = upscale(crop, alpha)
    # The gap between his thumb and fingers is fresco background, pale plaster going
    # to sky, and the matte half-kept it. In this box (2x crop coordinates) everything
    # light and joined to it is background; the dark finger contours wall it off from
    # the lit skin of the thumb, so a flood fill from inside the gap stops at them.
    box = im[270:340, 1140:1215]
    light = (box[..., :3].mean(axis=2) > 120).astype(np.uint8)
    n, lab = cv2.connectedComponents(light, connectivity=4)
    seed = lab[305 - 270, 1175 - 1140]
    assert seed > 0, "gap seed is not on a light pixel"
    box[..., 3][lab == seed] = 0
    finish(im, 80, 520, "adam", flip=False)


def god():
    # mirrored while processing so both arms fade from the left
    crop, alpha = arm((1330, 560, 2000, 900))
    finish(upscale(crop, alpha)[:, ::-1].copy(), 40, 420, "god", flip=True)


if only in (None, "adam"):
    adam()
if only in (None, "god"):
    god()
