# Saber skin assets

## October 30 natural-coat revision — current implementation

Arctic, Shadow, Bengal, Snow Leopard, Sandstone and Woodland now use lossless full-size `*-v3.png` / `*-v3-underlay.png` pairs. The image-editing tool used the original tiger as its edit target and the rejected skins only as color/marking references. The original broad face, rounded eyes, fangs and paw layout were the design constraints; generated pixels are not claimed to be byte-identical to the original. The existing animation geometry and timing are unchanged. Storm and the original artwork retain their previous SHA-256 hashes.

The procedural RGB filters and mathematical markings described below are retired. `materials.js` now only caches decoded source images, with no recoloring or source downsampling. The gallery and animated pet use the same PNGs. All pairs are tested for full-size matching dimensions; production tests capture idle, paw, sleep and dance for visual review.

### Coat-transfer prompt and provenance

Built-in image editing, transparent background enabled. First reference: `saber-pet/tiger.png`. Second reference: the archived coat listed in the source table below. Each output was copied unchanged from the generated-images folder into this directory.

> EDIT IMAGE 1 ONLY. Image 1 is the locked ORIGINAL saber-tooth character; image 2 is ONLY a fur color/pattern reference. Paint the reference coat onto the ORIGINAL image 1. Preserve image 1's exact full body proportions, huge rounded eyes and eyelid/expression shapes, brows, muzzle, nose, cheek tufts, head width, paw and claw positions, fang lengths/shapes, detailed fur direction/strand texture, canvas alignment and silhouette. Do NOT copy image 2's narrower eyes, face, head or different body. Pigment-only edit to original fur; preserve original anatomy and shading. Rich natural photographic fur markings, not flat recolor, not procedural dots or bands. Transparent background. Same original full square framing, no zoom/crop/movement, no platform, no text, high resolution. Original design identity is the highest priority; only iris color and fur pigmentation can change.

Coat directions: Arctic ivory with subtle warm-gray stripes and icy eyes; Shadow dimensional charcoal with silver guard hairs; Bengal orange/cream with natural tapered black stripes; Snow Leopard warm pale gray/cream with irregular dark rosettes; Sandstone sandy buff with tawny spots; Woodland earthy gold/brown with dark markings and olive-gold eyes.

Underlays use the original `limb-underlay.png` as the locked first reference and each new coat as the second:

> Image 1 is the locked ORIGINAL animation underlay: a saber tiger WITHOUT front legs. Image 2 is a fur pigmentation reference ONLY. Repaint only image 1's fur colors, iris color and natural markings to match image 2 exactly. KEEP IMAGE 1 GEOMETRY, pose, face, belly, rear legs and every rear claw, transparent background, scale and framing unchanged. Do NOT add front legs or front paws. Do NOT change anatomy to match image 2. This image will be behind moving front legs from image 2. Need seamless matching chest/side fur color and natural markings. Detailed high-resolution fur, no text, same square canvas.

## Earlier October 30 procedural replacement — retired

The six separately drawn skins below were rejected and removed from the project. They are recoverable at `C:/Users/Sinister/Documents/Email/saber-rejected-skins-20261030`. Storm and its underlay are retained unchanged.

Arctic, Shadow, Bengal, Snow Leopard, Sandstone, and Woodland now use the **original tiger.png and limb-underlay.png**. `../materials.js` changes only RGB coat colors and UV-attached markings at each source's native resolution. No pixel positions, alpha values, face features, animation masks or mesh vertices are changed. The same material renders thumbnails, visible fur and hidden limbs. No replacement AI drawing is used for these six coats. Production checks verify every original alpha value and source dimensions, alongside animations and persistence.

The nameplate is now 12% larger, centered with its previous top clearance. The base font increased from 73 to 80 units (plus the plate scale); longer names still fit automatically. Storm artwork, platform and tiger size are unchanged.

## Historical preparation record (only Storm remains in use)

Seven user-supplied 1254 × 1254 PNGs were prepared with the built-in image-generation editing tool. The originals had opaque black backgrounds. The delivered transparent cutouts retain the original canvas dimensions and are stored as full-size lossless PNGs, not thumbnail textures. Original desktop files were not overwritten.

| Skin | Asset prefix | User source (Desktop) |
| --- | --- | --- |
| Arctic | white | ChatGPT Image Oct 29, 2026, 07_40_06 PM-1.png |
| Shadow | shadow | ChatGPT Image Oct 29, 2026, 07_40_07 PM-2.png |
| Bengal | bengal | ChatGPT Image Oct 29, 2026, 07_40_07 PM-3.png |
| Snow Leopard | snow | ChatGPT Image Oct 29, 2026, 07_40_08 PM-4.png |
| Sandstone | sand | ChatGPT Image Oct 29, 2026, 07_40_09 PM-5.png |
| Woodland | woodland | ChatGPT Image Oct 29, 2026, 07_40_09 PM-6.png |
| Storm | storm | ChatGPT Image Oct 29, 2026, 07_35_15 PM.png |

Each `<prefix>.png` is the visible cutout. Each `<prefix>-underlay.png` supplies matching hidden chest, belly, and rear paws when the forelegs move. The animation mesh, paw masks, platform placement and overall size remain unchanged. Sleep eyelid colors are specified in `../skins.js`. The same catalog is used by the server validator and browser gallery. Texture switching waits for both layers and discards superseded loads.

## Preparation prompts (built-in tool, transparent background enabled)

Cutout prompt, repeated once for each supplied skin (Arctic was described as white):

> Use case: background-extraction. Edit target: supplied saber-tooth tiger. Remove ONLY the solid black exterior background, make it genuinely transparent. Preserve the tiger's exact pose, canvas framing, colors, all fur detail, markings, eyes, whiskers, claws and teeth. Do not redraw, restyle, recolor, crop, move or resize the animal. Full high-resolution clean cutout, no black fringe, no shadow, no added objects.

Underlay prompt, repeated for each transparent cutout with the original saber underlay as the second reference:

> Use case: precise-object-edit. Image 1 is edit target. Image 2 is ONLY an anatomical guide for a hidden animation layer. Make image 1 into a hidden body underlay by removing ONLY its two FRONT forelegs and front paws, revealing the continuous chest/belly fur and the complete rear feet behind them, like the anatomy in image 2. Preserve image 1's exact colors, markings, fur texture, head, face, pose, silhouette of rear haunches, canvas framing and scale. Do NOT copy the orange color from image 2. The two rear paws stay anchored in their original positions and every rear claw is intact. Transparent background. No other objects, no text. Keep high detail. This layer goes behind the unchanged original front legs.

## Verification

`work/verify-saber-production.cjs` checks all eight skin choices, captures idle/paw/sleep/dance poses for each, tests rapid selection changes and persisted Storm selection, and runs the existing production controls/layout tests. The 2048px animation canvas and display-aware trilinear filtering remain enabled.
