# Saber-tooth Tiger

Rendering quality: production keeps a fixed GPU-limited 2048px animation surface instead of reducing it to 384–640px at normal pet sizes. Hidden initialization and moving between Studio and the classroom no longer change that resolution. Source textures, geometry, animation timing and display sizes are unchanged.

Production integration of the approved `work/saber-tooth-preview` artwork and animation rig. The original tiger, hidden limb underlay, platform and nameplate are copied without recompression. The platform remains 1160 × 480 at (-68,720); the nameplate remains at (90,1180). Production uses a wider viewBox to include the platform in layout sizing.

Includes animated greeting, brow expression, blink, mouth/teeth, ear flick, paw wave, nose wiggle, body shake, eye scan, anchored breathing, idle rotation, sleep/snoring/Zs, wake/yawn and dance with alternating front paws, subtle rear-leg motion, headphones and notes. Headphones are also selectable in Headwear. All layers share one frame clock; hidden pets stop rendering. SVG identifiers are namespaced to prevent interference with other pets.

The shared picker owns account persistence and Studio interaction. The server validates the `saber` settings separately from other pets. Position is stored per account on the device. Shared pet speech provides the themed bubble and move message.

Verification: `work/verify-saber-production.cjs` starts an isolated server with temporary test data. It checks persistence, all controls, radio, visibility, invalid settings, and Studio layout at 1920, 1440, 800 and 390px. It does not change live accounts or application data.

Image-generation provenance for the historical platform, nameplate and hidden limb underlay is in `work/saber-tooth-preview/README.md`. The visible tiger is the user's exact supplied transparent PNG.
