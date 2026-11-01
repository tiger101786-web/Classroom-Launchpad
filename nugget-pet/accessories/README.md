# Tater tots and fried pickle basket sides

Both accessories use the existing French-fries/waffle-fries production pipeline. They are selectable in Pet Studio under Appearance → Accessories and are saved as `tater-tots` and `fried-pickles`. The server's validation and normalization accept both IDs, and the existing lazy image cache loads their files only when selected.

The existing renderer is shared unchanged: one reference-aligned U-shaped food arrangement behind the animated pet, the same inside-basket clip, the same two foot clearances, and the same ceramic-rim mask restoring the current skin's sauce cup. The original basket rim, nameplate, sauce material, skin, body and animation remain separate. Sides stay fixed to the basket and disappear when the platform is hidden.

Generated with the built-in imagegen tool. The existing transparent French-fries layer is the geometry reference; the user's tater-tot and fried-pickle basket pictures are the appearance references. Final PNGs are copied unchanged at native resolution, without downsampling, lossy conversion or sharpening. The live renderer remains 2048 × 2048.

## Tater tots

Final asset: `nugget-pet/accessories/tater-tots-v2.png`.

Generated source: `C:\Users\Sinister\.codex\generated_images\01a19363-e9fe-7dc2-86a1-e1134a57d914\exec-d480077f-fc02-40f4-a8a8-7a947b1a9d0b.png`.

Prompt:

Use reference image1 (existing transparent fry accessory) as the EXACT SQUARE CANVAS REGISTRATION and U-SHAPED PLACEMENT template for a new basket accessory. Use reference image2 only for the desired food appearance. Create ONLY realistic golden TATER TOTS: small chunky rounded potato cylinders, crisp shredded-potato crust, toasted golden-brown freckles, pale golden centers, subtle oil highlights, occasional tiny green herb flecks as in the appearance reference. Not nuggets, not hash-brown patties, no fries. Replace all fries from reference1 with generous piles of this food at BOTH sides and a few loose pieces along the front, in the SAME approximate positions, perspective, lighting and scale footprint. Keep top quarter completely transparent. Food fits within x=2–98%, y=28–75% of square canvas. Leave a tall clear central opening for the pet body between approximately x=36–65%, y=0–67%. Leave bare foot clearances centered around x39% and60%, y70%, including a little extra space for lifted/dancing feet. At right, leave a sauce-cup opening roughly x=69–94%, y=49–67%. NO nugget mascot, eyes, arms, feet, basket, paper, sauce cup, sauce, nameplate, labels, hearts, star, table, ground shadow or background. Do not copy any such objects from reference2. Do not recenter or enlarge this U arrangement to fill the square; retain the empty top quarter and empty center from the existing layer. True alpha transparency throughout empty areas, no black/white/checkerboard fill. Sharp high-resolution food photography detail, native PNG resolution, warm golden upper-left light matching the existing accessory; no blur or reduction in texture quality. One unified composition, not repeated identical miniature cutouts.

## Fried pickles

Final asset: `nugget-pet/accessories/fried-pickles-v2.png`.

Generated source: `C:\Users\Sinister\.codex\generated_images\01a19363-e9fe-7dc2-86a1-e1134a57d914\exec-ab1c1ebe-806d-443b-88e1-8d4743dba38d.png`.

Initial prompt:

Use reference image1 (existing transparent fry accessory) as the EXACT SQUARE CANVAS REGISTRATION and U-SHAPED PLACEMENT template for a new basket accessory. Use reference image2 only for the desired food appearance. Create ONLY realistic FRIED PICKLE CHIPS: round and oval sliced pickle disks with unmistakable dark olive-green crinkled skin edges, golden crispy battered faces with fine fried bubbles and pepper flecks, a few tilted to reveal the green pickle layer and thickness. Match the appearance reference, not onion rings, not nuggets, no fries. Replace all fries from reference1 with generous piles of this food at BOTH sides and a few loose pieces along the front, in the SAME approximate positions, perspective, lighting and scale footprint. Keep top quarter completely transparent. Food fits within x=2–98%, y=28–75% of square canvas. Leave a tall clear central opening for the pet body between approximately x=36–65%, y=0–67%. Leave bare foot clearances centered around x39% and60%, y70%, including a little extra space for lifted/dancing feet. At right, leave a sauce-cup opening roughly x=69–94%, y=49–67%. NO nugget mascot, eyes, arms, feet, basket, paper, sauce cup, sauce, nameplate, labels, hearts, star, table, ground shadow or background. Do not copy any such objects from reference2. Do not recenter or enlarge this U arrangement to fill the square; retain the empty top quarter and empty center from the existing layer. True alpha transparency throughout empty areas, no black/white/checkerboard fill. Sharp high-resolution food photography detail, native PNG resolution, warm golden upper-left light matching the existing accessory; no blur or reduction in texture quality. One unified composition, not repeated identical miniature cutouts.

Final layout refinement (keeps the complete back chips below the common basket clip):

Precise layout correction to this transparent fried-pickle basket accessory. Preserve the exact photoreal fried-pickle chips, golden battered faces, dark olive crinkle skin edges, fine breading detail and U-shaped composition. The uppermost LEFT pickle is too high and gets clipped by the existing basket renderer. Make both side piles a little LOWER and more compact vertically: absolutely NO food pixels above y=33% of the square canvas, and no food below y=75%. Keep the left and right piles within x=2–36% and x=65–98%, with a few loose front chips y=69–75%. Keep the center empty for the body, foot spaces empty, and sauce area x69–94% y49–67% clear where possible. Do not recenter the overall arrangement into the middle of the canvas or fill the empty top third. TOP THIRD must remain fully transparent; bottom quarter fully transparent. All pickle chips fully shaped and rounded, no straight sliced-off tops or cropped pieces. True transparent background, no mascot, basket, paper, plate, bowl, face, text or any non-pickle object. Native full-resolution PNG with no reduction in texture detail.

## Verification

`work/verify-nugget-new-sides.cjs` starts an isolated server using temporary account data. It checks native resolution, transparent top/center, no food above the approved basket boundary, visible portions on both basket sides, exact protected foot pixels, preserved sauce and foreground-rim appearance across Golden/Ranch/Teriyaki Sesame, and restoring the original basket with None. Sauce checks allow the existing alpha253 source cup's tiny source-over compositing difference; rim checks allow one level of canvas readback rounding.

The real Pet Studio check selects both accessories with reference-matching skins, verifies stationary basket draw transforms during wave/foot/dance, toggles the platform, saves and reloads the selections, checks extra-large 2048px rendering at mobile width, and confirms invalid side IDs are rejected. Previews are saved outside the repository under the system temp `nugget-new-sides` directory. JavaScript syntax and Git whitespace checks also pass.
