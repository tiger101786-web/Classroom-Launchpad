# Gummy Bear

## Seamless ear wobble

Ear motion now uses a smoothly fading displacement map on the continuous body artwork. There are no ear cutouts or separately rotating ear pieces. The bend fades to zero above the attachment roots; the face and platform remain stationary relative to the body. Action cancellation, sleep, hidden state, and reduced motion clear the deformation. Both maximum bend directions were visually checked in the actual renderer.

## Animation revision

The complete empty platform is now a separate stationary image, `platform-solid-v1.png`. Animated expressions use only the clean lower-muzzle crop from `mouth-clean-v1.png`, retaining the approved face at rest. Both assets were edited using built-in image generation. Ear wobble separates the original ear pixels; no new ear artwork replaces them. Dancing repeats the jelly-squish sequence at 0.6 seconds with happy eyes and an open smile. Sleep uses the same 2.8-second soft-snore timing and scale as Squishy/Colt. Mouth movement and Ear wobble are available in the preview and Pet Studio.

### Platform edit prompt

Use case: precise-object-edit. Edit target approved gummy bear on candy dish. Remove the ENTIRE gummy bear, leaving ONLY the empty candy dish in its EXACT original position at the bottom of the same 1024x1536 canvas. Reconstruct the entire solid unbroken smooth pale pink oval top of the dish where the bear and its feet previously covered it. NO footprints, NO indentations, NO holes, NO feet, NO bear. Preserve the original ruby-red scalloped glass rim, perspective, width and bottom position. Dish spans x75 to950 and y1190 to1475. Empty top ellipse extends behind former feet. Do not enlarge or recenter dish. Transparent background outside dish.

### Mouth edit prompt

Use case: precise-object-edit. EDIT the approved gummy bear image. Remove ONLY the engraved smile and vertical line between nose and smile, restoring smooth glossy cherry-red gummy surface on the lower muzzle. Keep the nose EXACTLY as is. The area to clean is x415..610 y515..580 on this 1024x1536 image. Do not change anything else: preserve same bear, same face proportions, eyes, nose, ears, bubbles, lighting, color, pose, feet and dish and exact pixel registration. No new mouth or facial expression. This is a clean-mouth backing for animated mouth overlays. Keep original canvas and background.

The production renderer uses `cherry-approved.png`, the exact approved built-in image-generation artwork. SVG silhouette crops remove its background at display time; body, dish, and eye crops reuse the same pixels. The attempted background-extraction generation did not remove the background reliably, so it is not used. No replacement bear was drawn.

Eight runtime color finishes preserve geometry and white reflections: Cherry, Strawberry, Orange, Lemon, Green Apple, Pineapple, Blue Raspberry, and Grape. Pet Studio thumbnails are captured from the real renderer. No fur, patterns, or armor.

The controller supports jelly wobble, bounce, blink, sleep/breathing, radio dance, motion preferences, system reduced motion, naming, sizing, hide/show, keyboard positioning, and per-account dragging. Server-validated preferences are stored separately under `gummy`, keeping the other pets unchanged. No accessories are offered yet.

Open `work/gummy-bear-preview.html` for the actual interactive pet. Run `node work/verify-gummy.cjs` for rendering checks and thumbnail capture; the production Studio suite covers both account roles and persistence.

## Original built-in generation prompt

Polished standalone cherry-red gummy bear desktop companion, full body facing forward. Real molded gummy candy, round ears, chunky head, rounded muzzle, oval belly, short arms and stubby feet. Glossy translucent ruby gelatin with amber-pink transmitted light, soft internal scattering, tiny trapped bubbles and controlled reflections. Small glossy dark oval eyes, white highlights, cherry nose and friendly smile. Low round candy dish with scalloped raspberry-glass rim and pale pink center. Preserve readability at desktop size. No fur, clothing, armor, text, collage, or environment.

## Background-extraction attempt (unused)

Remove only the dark red background and halo, preserve exact approved bear and dish pixels and placement, genuine transparent background, no redesign or recoloring. The renderer instead retains the original approved artwork with native SVG silhouette crops.
