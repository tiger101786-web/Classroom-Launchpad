# Labubu companion

## Macaron palette

The original Tan remains available alongside Soymilk, Lychee Berry, Green Grape, Sea Salt Coconut, Toffee, and Sesame Bean. Names verified against POP MART's official Exciting Macaron listing: https://www.popmart.com/us/products/1789/the-monsters-exciting-macaron-vinyl-face-blind-box . Palette values are visual matches to the user's reference, not official numerical color specifications. `skins.js` is shared by browser and server. SVG fur masking preserves the original face, hands, feet, inner ears, alpha and fur texture; nameplate heads and gallery thumbnails use the same color renderer. The nameplate is enlarged independently of pet size.

Promoted from the approved local Labubu preview. The production controller keeps the same tan artwork, masked face layer, expressions, continuous ear/hand/nose deformation, platform and editable nameplate with actual character heads.

`tan.png` and `face-underlay.png` were created with the built-in image-generation tool. Original artwork prompt: front-facing tan Labubu plush, peach face, tall ears, glossy brown eyes, nine-tooth grin, separated arms, full body and transparent background. Final extraction requested removal of background halo without changing the character. Face-underlay prompt requested removal of eyes, brows, mouth and teeth with matching peach skin while preserving nose, pose, dimensions and alpha. SVG layers restore and animate the original eyes and grin.

Size widths account for the tall 1224:1920 canvas, including platform and nameplate. Measured small/medium/large/extra-large heights are approximately 157/182/212/265 CSS pixels, compared with the Colt's 158/183/214/267 pixels. Compact viewport sizing follows the existing companions. Studio uses a separate fixed preview size regardless of the saved classroom size.

Verification: `work/verify-labubu-production.cjs` uses an isolated test database and checks selection, persistence, animations, sleep/wake, headset, layout, and size comparisons. The old local experiment remains excluded; production depends only on this directory, not ignored work assets.
