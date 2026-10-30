# Saber skin assets

## October 30 replacement — current implementation

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
