# Scene-matched Disney and anime frames

49 original transparent PNG frame overlays: 25 Disney and 24 anime/anime-style scenes, including Anime Sunset.

Created with the built-in image-generation tool using the imagegen skill. Original generated files remain in the Codex generated-images directory. The application copies are in `assets/scene-frame-match-*.png`.

The complete one-to-one asset mapping and exact prompts are recorded in [scene-matched-frame-plan.json](scene-matched-frame-plan.json). Each generation used the shared prompt followed by that frame's design prompt.

Frame picker names match the scene names (anime entries have an Anime prefix where needed). Frames remain independently selectable; adding them does not change saved scenes, animation preferences, or existing frames.

Fit geometry in `scene-matched-frames.css` is measured from the unmodified artwork's alpha channel using `work/measure-scene-frame-openings.js --matched`. No raster assets were programmatically edited.

Verification:

- All 49 assets have transparent centers and corners.
- All 49 frame IDs pass server validation.
- Desktop and mobile searches, previews, and mocked saves preserve each scene and its animation preference.
- Seven browser-rendered contact sheets visually checked all 49 matching combinations.

Re-run `work/verify-scene-matched-frames.js` for the functional checks and `work/preview-scene-matched-frames.js` for temporary contact sheets.
