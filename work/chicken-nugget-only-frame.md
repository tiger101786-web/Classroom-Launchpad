# Nugget-only narrow frame replacement

Replaces the decorative artwork for the existing `match-chicken-nugget` frame selection, without changing the scene photograph or any saved scene/frame IDs. The frame is exclusively realistic chicken nuggets; there is no metallic ring, red trim, fries, sauce, hearts, gems or other decorative object.

Generated with the built-in imagegen tool. Final source: `C:\Users\Sinister\.codex\generated_images\01a19363-e9fe-7dc2-86a1-e1134a57d914\exec-d5197a1d-c28a-4878-9ab8-7277209d3cd7.png`.

Final asset copied unchanged into the repository: `assets/scene-frame-match-chicken-nugget-thin-v3.png`. The older v2 asset is preserved. The catalog's artwork override is shared by the homepage and frame-picker thumbnails, and the new filename plus script/style version updates avoid stale cached artwork.

Measured asset: 1254 × 1254 PNG, transparent center and exterior, continuous rim across all 360 measured directions. Minimum opening radius at alpha100 is 0.41706539 of the canvas. The frame-only inset of -10.2% produces a 353.97px footprint around the 310px homepage stage (114.18%, below the 116% cap). The photograph keeps its unframed dimensions, position, crop and transforms. Shelf positions are unchanged, with no frame overlap at 1280, 1024, 820 or 390px viewport widths.

## Initial generation prompt

Production website decorative frame asset: a VERY NARROW perfect circular wreath made EXCLUSIVELY of realistic golden fried CHICKEN NUGGETS. Front-on, centered at 50%,50%, square transparent PNG. Around 40 small individual real chicken nuggets arranged tangent to the circle in one tightly touching, gently overlapping row, creating a continuous thin circular perimeter. Each nugget has richly detailed craggy crispy breading, irregular rounded/boot-shaped food silhouette, golden amber peaks and toasted brown crevices, soft natural photographic lighting. These must look like edible chicken nuggets, not gold jewelry or carved nuggets. Absolutely no metal rim, gold band, red trim, fries, sauces, basket, gems, beads, hearts, leaves, faces, text, ribbon or any other object. The nuggets themselves are the entire frame. STRICT NARROW-FRAME GEOMETRY: the completely transparent central opening is 90% of the full square canvas width and height (radius45% of canvas). All nugget pixels stay between radius45% and49.5% of canvas, a slim band only4.5% of canvas wide; miniaturize the nugget objects to obey this, do not make a thick wreath. Full outer circle visible with a little transparent margin. True transparent center and transparent outside, no white/black/checkerboard fill, no background, no scene. Native high-resolution food photography detail, realistic rounded breading relief, no illustration, no blur.

The initial result had the correct nugget-only appearance but was too thick for the narrow-frame rules. It was rejected.

## Final refinement prompt

Refine this nugget-only circular frame to obey a STRICT MUCH NARROWER frame width. Preserve the photoreal breading detail and exclusively-chicken-nugget design. Current nuggets are far too large. Make EACH nugget roughly ONE THIRD its present size, and use about 90 tiny touching nuggets to fill the circle instead. Every nugget must lie inside the very thin annulus between radius47% and radius49.5% of the full square canvas; completely transparent inner opening DIAMETER94% of the canvas. This means only2.5% of the canvas radial thickness, visibly an extremely slim perimeter. Do not let even one nugget extend into the central94% opening. Entire frame visible, circular and centered exactly, square PNG. Keep each tiny nugget realistically rounded with richly detailed crispy golden breading. There is no metal support ring, trim, fries, sauce, gems, text or other decorative object: the tiny real nuggets alone form the slim rim. True transparent background, center and outer margin. Do not keep the current thick wreath, reduce the nugget size drastically while leaving the outer circle the same size.

## Validation

`work/verify-chicken-nugget-scene.cjs`: saves/reloads the existing selection, measures the actual selected frame's alpha and rim, checks scene/shelf equality against No Frame at four widths, checks the 116% footprint cap and shelf clearance, and verifies animation pause/reduced-motion behavior without browser errors. `work/verify-scene-pages.js`: desktop/mobile pagination, searching, selection and page boundaries. JavaScript syntax and Git whitespace checks pass. Visual review includes the 1280px and 390px homepage previews saved outside the repository.
