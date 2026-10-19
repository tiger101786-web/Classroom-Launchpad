# Colt skins

The customization panel replaces the independent eye-glow selector with Original,
Arctic, Emerald, Galaxy, Royal, and School Spirit. Four choices per page keep the
existing panel dimensions. Original comes first, followed by alphabetical names.

`skins.js` recolors only the original parts/platform image layers using SVG
filters; positions, masks, pivots, silhouettes, and motion remain unchanged.
Only saturated red areas are recolored; the original black armor is retained.
Galaxy and Emerald add procedural glitter inside that same red-area mask.
Each palette also supplies its iris, glow, happy-eye, and sleeping-eye colors.
Accessories remain outside these filters. Keep future accessories on separate
layers, not baked into the character's parts atlas.

Old eye-only preferences migrate to Original while keeping size, headwear,
platform, motion, and sleep settings. Older clients cannot overwrite an existing
skin when saving an eye-only payload.

Checks: `node work/verify-colt-skins.cjs` (six visual captures and geometry checks)
and `npm run test:robo` (saved selection, radio, sleep/wake, and Squishy regression).
The standalone preview is `work/colt-skins-preview.html`.
