# Reference photographic nugget skins, version 3

Built with the built-in imagegen tool. The user authorized regenerating the skins to get as close as possible to the supplied references. These are faithful generated approximations, not pixel-identical extractions. The second round of BBQ, Garlic Parm, Honey Mustard and Teriyaki Sesame uses only the respective supplied screenshot as its visual reference, avoiding the original mascot texture influencing the coating. Spicy uses the supplied full-resolution PNG with only the facial features removed for animation.

Each final generated PNG is copied byte-for-byte into the repository, without downsampling, lossy compression or added sharpening. Native dimensions are preserved in the working layer canvases; the shared live renderer remains 2048 × 2048. Gallery thumbnails remain 320px and are never used for live rendering. The five reference skins use rounded arm masks. All seven photographic skins keep the body and feet as one continuous source layer, without legacy ankle cutouts. Foot lifts and dance steps gently deform the lower part of that layer with smooth positional weights. This removes triangular scraps and clipping at the wider feet. The resting pose draws the complete native layer directly, avoiding extra registration resampling. Golden and Frozen retain their original rendering paths.

Skin IDs are shared by the server and browser through `skins.js`, so the new Teriyaki Sesame skin is available in the picker and supported by preference validation, saving and reload. The original basket, wrapper, bowl and nameplate are unchanged. The four existing flavors retain their matching dips, and Teriyaki Sesame has a dedicated dip texture.

## Final assets and prompts

### bbq

Final asset: `nugget-pet/skins/bbq-character-v2.png`.

Generated source: `C:\Users\Sinister\.codex\generated_images\01a19363-e9fe-7dc2-86a1-e1134a57d914\exec-9de70c42-95c4-4a87-90c0-b326b2da9666.png`.

Prompt:

Faithful high-resolution reconstruction of THIS exact supplied nugget reference, NOT a different nugget model. Preserve its exact rounded irregular silhouette, proportions, little arms, feet, original coating layout, color and lighting. rich deep reddish mahogany barbecue sauce, thick sticky wet lacquer pooled in broad glossy ribbons on the ridges, strong creamy white reflected highlights, golden-orange breaded center visible, dark red-brown outline; match reference 2 exactly, not a black char coating. This is a faithful recreation task: do not invent a different pattern or enlarge the garnishes. The sauce needs to be DARK rich red-brown pooled glaze with BROAD almost-white wet reflection patches at the top and sides, not thin orange buffalo coating or bright uniformly orange breading. Keep center warm golden red-orange as in supplied image. Only necessary changes: remove the checkerboard, any black screenshot bars, any stray cropped neighboring objects at bottom, and background entirely to TRUE alpha transparency; remove the two eyes and mouth and fill those tiny areas with matching local food texture, so existing software can animate the face. Keep both small arms and both feet, front-facing same pose. No basket, no ground shadow, no props, no typography. Native high-resolution transparent PNG. Do not reduce detail, do not exaggerate details, do not sharpen into grit or add fine noise. Entire nugget visible within canvas, modest clear transparent margin around edges. Match the reference closely enough that it reads as the same exact food skin.

### garlic-parm

Final asset: `nugget-pet/skins/garlic-parm-character-v2.png`.

Generated source: `C:\Users\Sinister\.codex\generated_images\01a19363-e9fe-7dc2-86a1-e1134a57d914\exec-014e26bc-d088-4bc7-b63b-164858560844.png`.

Prompt:

Faithful high-resolution reconstruction of THIS exact supplied nugget reference, NOT a different nugget model. Preserve its exact rounded irregular silhouette, proportions, little arms, feet, original coating layout, color and lighting. golden orange breading coated in many clearly visible thin ivory shredded parmesan slivers, small chopped deep green parsley leaves distributed exactly in the style of reference 2, tiny buttery highlights, exposed golden-orange center; NOT a white cream-sauce skin. This is a faithful recreation task: do not invent a different pattern or enlarge the garnishes. Parmesan must be MANY tiny fine short ivory grated slivers, NOT oversized long cheese strands. Parsley must be small chopped leaf flecks, NOT large whole parsley flowers. Only necessary changes: remove the checkerboard, any black screenshot bars, any stray cropped neighboring objects at bottom, and background entirely to TRUE alpha transparency; remove the two eyes and mouth and fill those tiny areas with matching local food texture, so existing software can animate the face. Keep both small arms and both feet, front-facing same pose. No basket, no ground shadow, no props, no typography. Native high-resolution transparent PNG. Do not reduce detail, do not exaggerate details, do not sharpen into grit or add fine noise. Entire nugget visible within canvas, modest clear transparent margin around edges. Match the reference closely enough that it reads as the same exact food skin.

### honey-mustard

Final asset: `nugget-pet/skins/honey-mustard-character-v2.png`.

Generated source: `C:\Users\Sinister\.codex\generated_images\01a19363-e9fe-7dc2-86a1-e1134a57d914\exec-924bd32e-1cc4-477f-b7d5-42173467da9c.png`.

Prompt:

Faithful high-resolution reconstruction of THIS exact supplied nugget reference, NOT a different nugget model. Preserve its exact rounded irregular silhouette, proportions, little arms, feet, original coating layout, color and lighting. the EXACT pale creamy ivory/light honey-yellow coating in reference 2, irregular thick creamy ribbons and puddles over golden breading with fine dark pepper flecks and small green herb bits, softer satin gloss, golden peaks peeking through. Despite the skin name Honey Mustard, follow this reference's pale cream appearance, NOT orange or uniform yellow. This is a faithful recreation task: do not invent a different pattern or enlarge the garnishes. Creamy pale ivory sauce should cover most of the raised breading in soft uneven patches with fine pepper and tiny herbs, as shown. Only necessary changes: remove the checkerboard, any black screenshot bars, any stray cropped neighboring objects at bottom, and background entirely to TRUE alpha transparency; remove the two eyes and mouth and fill those tiny areas with matching local food texture, so existing software can animate the face. Keep both small arms and both feet, front-facing same pose. No basket, no ground shadow, no props, no typography. Native high-resolution transparent PNG. Do not reduce detail, do not exaggerate details, do not sharpen into grit or add fine noise. Entire nugget visible within canvas, modest clear transparent margin around edges. Match the reference closely enough that it reads as the same exact food skin.

### teriyaki-sesame

Final asset: `nugget-pet/skins/teriyaki-sesame-character-v2.png`.

Generated source: `C:\Users\Sinister\.codex\generated_images\01a19363-e9fe-7dc2-86a1-e1134a57d914\exec-ecf108f3-031e-431e-ac52-9dd46b88e427.png`.

Prompt:

Faithful high-resolution reconstruction of THIS exact supplied nugget reference, NOT a different nugget model. Preserve its exact rounded irregular silhouette, proportions, little arms, feet, original coating layout, color and lighting. the EXACT glossy deep amber mahogany teriyaki glaze of reference 2, richly lacquered brown sauce and broad bright wet reflections, numerous distinct ivory sesame seeds scattered across the breading, golden amber center and darker caramel-brown perimeter; sesame seeds must remain crisp and individually visible. This is a faithful recreation task: do not invent a different pattern or enlarge the garnishes. Sesame seeds must be SMALL slender ivory seeds, exactly the reference's density and scale, NOT enlarged oval kernels. Only necessary changes: remove the checkerboard, any black screenshot bars, any stray cropped neighboring objects at bottom, and background entirely to TRUE alpha transparency; remove the two eyes and mouth and fill those tiny areas with matching local food texture, so existing software can animate the face. Keep both small arms and both feet, front-facing same pose. No basket, no ground shadow, no props, no typography. Native high-resolution transparent PNG. Do not reduce detail, do not exaggerate details, do not sharpen into grit or add fine noise. Entire nugget visible within canvas, modest clear transparent margin around edges. Match the reference closely enough that it reads as the same exact food skin.

### spicy

Final asset: `nugget-pet/skins/spicy-character-v2.png`.

Generated source: `C:\Users\Sinister\.codex\generated_images\01a19363-e9fe-7dc2-86a1-e1134a57d914\exec-f307c05b-44ce-4adb-b049-4da3428f9f8b.png`.

Prompt:

Edit this supplied high-resolution spicy nugget image with exactly ONE change: remove the two eyes and smile completely and fill those small former feature areas with matching local spicy glazed food surface. The animated face will be drawn separately in code. Keep ALL other artwork as close to identical as possible: this exact upright nugget silhouette, pose, proportions, little arms, feet, vivid glossy orange-red chili glaze, broad wet white highlights, black pepper flecks, tiny golden chili seeds and red chili pieces. Do not redesign, recolor, relight, change texture scale, change the coating, add garnish or add extra limbs. Maintain native resolution and sharp photoreal food detail with no quality reduction. Keep true transparent background, do not add a checkerboard or black background. Entire character visible. Face-free animation layer only.

### Sesame teriyaki dip

Final asset: `nugget-pet/skins/teriyaki-sesame-material.png`.

Generated source: `C:\Users\Sinister\.codex\generated_images\01a19363-e9fe-7dc2-86a1-e1134a57d914\exec-f2e1a3a4-9585-467d-ac36-d87e94f2026d.png`.

Prompt:

Photorealistic macro closeup of smooth glossy deep amber mahogany teriyaki dipping sauce, a few tiny ivory sesame seeds scattered lightly, subtle rounded liquid swirls and warm reflected highlights. The entire square canvas is filled edge to edge with sauce. Straight overhead, even lighting, sharp liquid surface detail throughout. No bowl, food chunks, breading, body, face, props, text, labels, division, borders or background. This is a high-resolution texture used inside an existing photographed dipping-sauce cup.

## Verification

`work/verify-nugget-photo-skins.cjs` checks all seven photographic skins in the real Pet Studio against an isolated server with temporary account data. It verifies native-source/layer dimension equality, selection, save/reload, the extra-large 250px display with a 2048px render buffer at device scale factor 2, actual pixel changes during blink/talk/wave/hands/foot animation, dance and sleep. A pixel comparison of the entire ankle/foot region against the uncut source artwork must have zero changed channels for every photographic skin. Switching back to Golden and Frozen is also checked. Idle, wave, dance, sleep and extra-large previews are saved outside the repository. JavaScript syntax and Git whitespace checks are also required.
