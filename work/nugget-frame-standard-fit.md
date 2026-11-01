# Chicken Nugget frame: standard proportions and no inner gap

The v3 frame was sized from its minimum inner radius and kept outside the scene image. That left a visible background band between the photo and frame. The collection's established method uses the maximum inner radius and permits overlap at the photo perimeter. The scene image itself must never be resized or recropped.

## Artwork

Generated with the built-in imagegen tool, using a generation followed by a narrow-frame refinement. The final frame contains only realistic chicken nuggets. Fewer, longer nuggets replace the small bead-like pieces, exposing larger recognizable shapes and crisp golden breading while keeping a narrow radial band.

Final generated source: `C:\Users\Sinister\.codex\generated_images\01a19363-e9fe-7dc2-86a1-e1134a57d914\exec-fb42f8d5-5fe1-4dc4-951c-8278dc3ababa.png`.

Final project asset: `assets/scene-frame-match-chicken-nugget-thin-v4.png`. It is copied unchanged at its native 1254 × 1254 resolution, with a transparent center and exterior. Earlier frame assets remain available.

## Standard fitting method

The sizing formula is exactly the one in `work/audit-thin-frame-assets.js`:

`inset = -min(0.08, (0.498 / maximumInnerRadius - 1) / 2) * 100`

The 360-direction alpha audit finds minimum opening radius0.39393939 and maximum0.43381180, with no missing rim directions. The resulting inset is -7.39816176%, rounded to -7.398% in CSS. This is the same fit and rendered geometry as the existing USA Patriotic frame. At the 310px homepage stage, the frame box is about337.50px wide (108.87% of the stage), within the common116% cap. The largest inner radius lies slightly over the image perimeter, so there is no annular background gap. Details paint above the unchanged photograph through the existing exterior-frame layer; no image masking or new photo fit is introduced.

## Prompts

Initial prompt:

A production high-resolution photoreal circular decorative picture frame made EXCLUSIVELY from about 30 distinct REAL CHICKEN NUGGETS, all arranged lengthwise tangentially around one narrow circular perimeter. Each nugget is a recognizable elongated rounded rectangle or boot-shaped fried chicken nugget, with richly detailed flaky crispy golden breading, irregular crunchy amber peaks, toasted brown recesses and soft appetizing dimensional food lighting. Make the nugget SHAPES substantially LONGER along the circle than they are thick radially, about 2 to 2.5 times longer, so they are recognizable nuggets rather than tiny bead-like squares. Keep them in a single touching/slightly overlapping row. Technical geometry: square transparent PNG, perfectly centered full circle, outer edge near radius49% of canvas, transparent opening near radius43% of canvas; the entire rim is only about6% of canvas wide radially. Tangential nugget length roughly9% of canvas. Inner edge follows a regular circular opening with only small natural breading irregularities, no inward protruding big pieces or large gaps between nuggets. Native crisp food detail, no blur or grainy sharpening. No supporting metal rim, gold band, red trim, fries, sauce, basket, faces, hearts, beads, gems, text, props or any other object: only chicken nuggets form the frame. True transparent center and true transparent exterior, no background or shadow halo, no black/white/checkerboard fill. Entire frame visible within a small transparent margin.

Final refinement prompt:

Make THIS detailed chicken-nugget frame conform to an established NARROW circular frame design. Keep the same approximately30 recognizable real nuggets and their beautiful crispy photographic detail. Do NOT increase the nugget count or make tiny bead-like pieces. Keep each nugget's LENGTH along the circle, but reduce its RADIAL THICKNESS BY HALF. Every nugget must be oriented LENGTHWISE TANGENTIAL to the circle, not pointing inward/outward. The top and bottom nuggets should be wide horizontal elongated rounded rectangles; left and right nuggets should be long vertical rounded rectangles. The entire narrow row follows a regular circle. The hole must have a transparent diameter of88–90% of the square canvas, and outer frame diameter98%. The nugget band is only4–5% of the canvas thick. Current rim is much too thick: slim it dramatically without changing the count or losing texture detail. No metallic ring, support, fries, sauce, hearts, text or any other object. The frame remains only detailed real fried chicken nuggets. True transparent background, center, exterior and a little outside margin. No scene or shadow halo. Square PNG, centered, full circle visible.

## Verification

`work/verify-chicken-nugget-scene.cjs` now checks maximum-radius contact rather than incorrectly demanding that every frame detail stay outside the image. It verifies the exact collection formula, no gap at any measured angle, identical scene geometry/crop and shelf positions, shelf clearance, the116% footprint cap, the existing overlay/pointer behavior, and matching frame-box proportions against USA Patriotic at1280/1024/820/390px in both light and night themes. It also checks the real frame chooser preview, saving/reload and existing animation pause/reduced-motion behavior. Syntax and Git whitespace checks pass.

Visual previews are saved outside the repository as `nugget-frame-v4-night-1280.png`, `nugget-frame-v4-light-1280.png`, `nugget-frame-v4-night-390.png` and `nugget-frame-v4-light-390.png` under the session visualization directory.
