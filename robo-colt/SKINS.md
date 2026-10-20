# Colt skins

Custom-art alignment: body, both front-leg sprites, and tail are independently
fitted to the original atlas component bounds. The platform, crop windows, and
animation pivots do not move. Facial anchors are mapped through the body fit;
Custom skins share that registration across every expression.

The customization panel includes 24 skins. Four choices per page keep the
existing panel dimensions. Original comes first, followed by alphabetical names.
The expanded collection adds Ancient Bronze, Candy Chrome, Carbon Racer,
Copper Circuit, Deep Sea, Desert Relic, Frostfire, Moonstone, Obsidian Ember,
Porcelain, Rose Quartz, and Woodland Guardian. Each includes its own eye glow.
Code-native SVG patterns and procedural textures are clipped to source alpha.
Frostfire uses side-specific filters for separate limbs so its split colors
do not depend on where those limbs were packed in the original image atlas.

Refined finishes: Candy Chrome uses clean raspberry enamel without aqua stripes;
Copper Circuit uses sparse traces. Porcelain and Obsidian Ember now use the
user-approved custom parts atlases (`parts-porcelain-v1.png` and
`parts-obsidian-v1.png`). These are rendered without recoloring or pattern filters;
their platforms retain the clean complementary finishes from the approved preview.
Switching to another skin restores the original atlas. Existing animation crops,
eye/mouth layers, and accessory attachment points are unchanged.

The custom atlases have slightly shifted sockets: `facePositions` in skins.js
aligns each eye independently, including happy and sleeping eyes, using wrappers
outside the animated blink groups. Porcelain also has a centered, slightly smaller
mouth fitted to its muzzle. Other skins reset to the original facial coordinates.

`skins.js` recolors only the original parts/platform image layers using SVG
filters; positions, masks, pivots, silhouettes, and motion remain unchanged.
Royal and School Spirit recolor saturated red areas and retain the black armor.
Arctic restores the original pearl-silver full-body finish. Emerald combines
brushed gunmetal with jade accents; Galaxy combines blue-gray armor with violet
nebula accents. Both use continuous procedural texture, without glitter.
Each palette also supplies its iris, glow, happy-eye, and sleeping-eye colors.
Accessories remain outside these filters. Keep future accessories on separate
layers, not baked into the character's parts atlas.

Old eye-only preferences migrate to Original while keeping size, headwear,
platform, motion, and sleep settings. Older clients cannot overwrite an existing
skin when saving an eye-only payload.

Checks: `node work/verify-colt-skins.cjs` (six visual captures and geometry checks)
and `npm run test:robo` (saved selection, radio, sleep/wake, and Squishy regression).
The standalone preview is `work/colt-skins-preview.html`.

The October 20 collection adds five painted atlases: Camo, Rainbow, Crocodile,
Tiger, and Zebra. Their silhouettes are registered independently per component,
using measured alpha bounds. Tiger has dedicated facial anchors. Tiger's amber
round pupils and Crocodile's golden-green slit pupils reuse the original animated
eye groups; other skins restore the original pupil geometry. Platforms and
nameplates share complementary finishes. Generation prompts and implementation
notes are in `PAINTED-SKINS-20261020.md`; the interactive production-art preview
is `work/colt-painted-skins-preview.html`.

Panda adds a smooth black/white robotic atlas with round black ears and natural
panda markings (no fur). Its eye/mouth anchors and round-ear cutouts are fitted
individually, restoring original horse cutouts on skin change. See
`PANDA-AND-TAIL.md` for its final prompt and the faster fluid tail animation.
