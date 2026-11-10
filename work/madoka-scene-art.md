# Madoka Magica rooftop scene and narrow frame

Added optional scene `madoka-mitakihara` and frame `match-madoka-mitakihara`. Existing selections remain unchanged. Both assets were generated using the built-in image-generation tool and copied at native 1254 x 1254 resolution without recompression.

Scene: `assets/launchpad-scene-madoka-mitakihara.png`. Final source: `exec-e735c353-5162-49cf-8d29-8d0f4ed88b75.png` in the session generated_images directory.
Frame: `assets/scene-frame-match-madoka-mitakihara-thin.png`. Source: `exec-6b45c496-5871-4846-9aea-e739d079b648.png` in the same directory.

Scene prompt: A wide environment-focused view of Puella Magi Madoka Magica's Mitakihara school rooftop, distinctive geometric fencing, futuristic skyline and pink-lavender sunset. Madoka and Homura are tiny distant Easter eggs beside the railing, at most 4% of image height. Keep essential scenery within the circular crop. Full-bleed square anime background, no border or lettering. Final corrective edit removed an artificial circular boundary and extended the environment seamlessly to the square edges while preserving the central composition.

Frame prompt: A narrow centered continuous rose-gold circular filigree ring, pink woven ribbon, restrained rosebuds and five small Soul Gems in pink, purple, blue, yellow and red. Outer diameter 98%, transparent opening about 88%, no bulky protrusions, characters or text. Truly transparent center and exterior.

Location reference: https://wiki.puella-magi.net/Gallery:Mitakihara_Town

Frame uses the existing maximum-opening fitting formula: -min(.08, (.498/max - 1)/2)*100. Measured maximum opening radius .44338118; inset -6.159%. All 360 directions have a continuous rim. Scene crop and shelf placement stay unchanged.

Nine low-opacity sparkles drift over nine seconds; the image remains stationary. Existing pause and reduced-motion settings stop the effect.

Validation: `work/verify-madoka-scene.cjs` checks frame transparency, continuous rim, no inner gap, unchanged photo/shelf geometry, footprint cap, desktop/mobile at four widths in both themes, chooser preview/save/reload, pause, reduced motion and browser errors. JavaScript syntax and git whitespace checks passed. Nothing committed or pushed.
