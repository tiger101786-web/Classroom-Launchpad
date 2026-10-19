# Colt accessories

Headwear: headphones, a spiral metallic unicorn horn, or a burgundy star sleep cap.
Eyewear: fitted burgundy/silver sunglasses with lenses, reflections, and side arms.
Neckwear: a striped school-color scarf with fringe, or a layered jeweled bow tie.

Categories save independently under `robo.headwear`, `robo.eyewear`, and
`robo.neckwear`. Older preferences default the new categories to none; old-client
saves preserve existing eyewear/neckwear. All six accessories use the production
transparent PNG artwork in `accessory-*-v2.png` (cap/scarf: `v3`) directly, placed by SVG image layers
attached to the head rig, outside all skin filters. The final headband is a continuous
shaded SVG arch; the detailed cups and other accessories retain their raster artwork.
The headset follows the head rather than separating when ears twitch. Its original
cup artwork is independently positioned and angled to fit the ears. The larger horn
exposes its crystal and jeweled base. The cap has no ear holes. The larger front-view
scarf has no clipping mask, preserving its full striped wrap, tail, and fringe.
V4 fits the cups lower and outside the ears against the supplied front-fit reference;
the band is a separate layer in front of the ears. The horn base sits 40 atlas
units farther back/up. The scarf fits directly under the chin. V5 restores its
original hanging end in front of the foreleg, per the user's revised layering
request. Cups sit another 14 atlas units lower with mirrored 10-degree tilts.
A copy of the original skin-painted forelock renders above the cups, using a
generous contour that retains its tips. It is registered before the skin painter
so the hair automatically matches every skin, including custom artwork.
Preview captures include 32px top clearance to show the complete raised horn.

Final V10: the headband is one continuous shaded SVG arch extending directly to the
earcups. The two silver hinge fittings above the cups have been removed at the
user's request. This replaces the split raster band whose joins left gaps.
Ear cups retain their artwork and placement. Foreground hair is limited
to the single swept strand, without the ear-removal mask or an ear-shaped overlay.
`work/inspect-colt-headset.cjs <output-directory>` provides enlarged inspection views.
`node work/verify-colt-headset-continuity.cjs` checks actual rendered pixel connectivity
from the left cup through the band to the right cup. The scarf sits below the muzzle
with its hanging end in front of the foreleg. The rejected silver mouth outline
remains a local preview only and is not included in the website.
Radio headphones temporarily
replace headwear and restore the user's choice when playback stops.

The sleep mouth is enlarged to rx=10, ry=13 before skin-specific fitting; its
centered 2.8-second motion and accessibility settings remain unchanged.

Verify with `node work/verify-colt-accessories.cjs`,
`node work/verify-colt-sleep-mouth.cjs`, and `npm run test:robo`.

Artwork generated with built-in image generation from the accessory reference sheet
and the approved raised-headphone reference. Each extraction prompt requested only
one front-view accessory, preserved materials/detail, transparent background and
openings, no horse/body/text, and production sprite output. Assets are displayed
directly in previews and production; future approved artwork must not be redrawn
or visibly redesigned without approval.

Run `node work/verify-colt-accessory-art.cjs <output-directory>` to capture all six
actual in-renderer accessories. This is the source of truth for appearance, not
the earlier concept sheets.

V3 built-in image edit prompts: close both cap ear holes with continuous matching
velvet, preserving cuff/embroidery/pompom; change scarf to straight front neck-level
view without a hollow rear ring, preserving both stripes, knot, tail and all fringe.
Both edited files retain transparency and are used directly in the renderer.
