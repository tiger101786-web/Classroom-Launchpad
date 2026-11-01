# Buffalo and Extra Crispy photographic skins

Generated with the built-in imagegen tool from the original mascot and the user's November 1 screenshots. Both final generated PNGs are copied unchanged, with no asset resizing, lossy conversion or sharpening. Runtime registration uses native-size canvases and high-quality smoothing; the live rig retains its 2048 × 2048 buffer. Existing animation masks and eye positions are retained. Source screenshots are visual references; these are generated approximations, not pixel-identical extractions.

Buffalo bypasses the old texture multiplication that darkened the original breading and added speckle. Extra Crispy also uses its photograph directly, retaining the larger crust clusters. Other flavors continue through their existing paths. The original basket and matching dips remain in place.

## Buffalo

Final asset: `nugget-pet/skins/buffalo-character-v2.png`.

Generated source: `exec-4e6628b0-af9c-48aa-ac88-a771f9fa944d.png` under `C:/Users/Sinister/.codex/generated_images/01a19363-e9fe-7dc2-86a1-e1134a57d914/`.

Prompt:

Edit reference image 1 (the transparent golden nugget mascot in a red basket) into a production animation skin layer. Reference image 2 is the EXACT desired Buffalo food texture: vivid orange-red glossy buffalo sauce, wet smooth highlights on chunky breaded ridges, lighter golden-orange center, no dark burnt speckles. Match reference 2's texture/color/material closely, not a noisy texture overlay. Retain image 1's EXACT mascot shape, size, position, arms and feet, identical square canvas registration: mascot top around 4.5% canvas height; eyes formerly at (42.8%,31.4%) and (58.3%,31.4%); feet end at 73%. Do NOT enlarge or recenter the mascot. Remove the entire basket, liner, sauce bowl and nameplate to full transparency. Remove eyes and mouth COMPLETELY, filling those small areas with continuous buffalo breading; no facial features because existing animated features are added by code. Deliver ONLY the complete faceless nugget body with both arms and both feet, on transparent background in the same exact image-1 registration, plenty of transparent margin below and at sides. Full native resolution, crisp photoreal microdetail, coherent lighting and three-dimensional food relief, no black sharpening speckles, no pixelation, no blur, no painted illustration.

## Extra Crispy

Final asset: `nugget-pet/skins/extra-crispy-character-v2.png`.

Generated source: `exec-afe90944-a53d-4652-a700-e456ea857828.png` in the same generated-images directory.

Prompt:

Edit reference image 1 (transparent golden nugget mascot in basket) into a production animation skin layer. Reference image 2 is the EXACT desired EXTRA CRISPY texture. Match its dry, crunchy large irregular flaky golden-orange breading, raised craggy clusters especially around outer ridges, toasted reddish-brown tips, lighter honey-gold center. No wet buffalo glaze, no burnt black specks, no uniform fine noise. Retain image 1's EXACT mascot shape, size, position, arms and feet and square-canvas registration: top around 4.5% height, feet end around73% height. Do NOT enlarge, recenter, change pose or proportions. Remove entire basket, paper, sauce bowl, nameplate to full transparency. Remove eyes and mouth entirely and fill with continuous crispy breading (animated features added separately). Deliver only complete FACELESS nugget with both arms and feet on transparent square canvas, same position as image1 with ample transparent margin below. Full native resolution, photoreal detailed food texture matching image2 closely, natural coherent lighting and real chunky relief, never pixelated, oversharpened, blurry, or illustrated.

## Validation

`work/verify-nugget-photo-skins.cjs` starts an isolated server with temporary account data. It checks both skins in Pet Studio, native layer dimensions, saved preferences and reload, extra-large rendering at device scale factor 2, blink/talk/wave/hands/foot actions, dance and sleep. Browser screenshots are saved outside the repository for visual review. JavaScript syntax and Git whitespace checks pass.
