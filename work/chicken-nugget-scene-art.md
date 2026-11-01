# Chicken Nugget scene and narrow frame

The original gold/red frame described below has been replaced by the nugget-only narrow frame. Current asset, prompts, measurements and validation: [chicken-nugget-only-frame.md](chicken-nugget-only-frame.md). The scene photograph remains unchanged.

Added as optional scene `chicken-nugget` and frame `match-chicken-nugget`. Existing selections and artwork are preserved.

Generated with the built-in imagegen tool. Prompt briefs: a photoreal diner basket of crispy chicken nuggets, fries, honey mustard and ketchup, warm natural window lighting, with the food composed safely inside a circular crop; a separate thin dimensional gold circular rim with miniature nugget/fries relief and crimson accents, transparent center and exterior, without hearts, faces, lettering or a scene inside. Earlier cartoon and thicker frame drafts were rejected.

Final generated sources under `C:/Users/Sinister/.codex/generated_images/01a19363-e9fe-7dc2-86a1-e1134a57d914/`:

- Scene: `exec-3f7b11d8-9cb8-4571-bf49-d9e429614a5e.png`, copied unchanged to `assets/launchpad-scene-chicken-nugget.png`.
- Frame: `exec-30b246bc-6671-411b-9e6e-0690828336ad.png`, copied unchanged to `assets/scene-frame-match-chicken-nugget-thin-v2.png`.

The final frame is 1254 × 1254 with transparent center/exterior and a continuous rim. Its minimum opening radius is 42.823% of the canvas. Frame-only scaling produces a 349.86px footprint around the 310px homepage stage (112.86%, below the 116% cap). The scene image retains its unframed dimensions, position and crop. Shelves retain their positions, with no frame overlap, including the stacked mobile layout.

Only three faint heat wisps animate; the photograph stays still. The existing motion toggle pauses them and reduced-motion preferences disable them.

Validation: `work/verify-chicken-nugget-scene.cjs` checks saving/reloading, asset alpha/rim geometry, unchanged scene and shelf metrics at 1280/1024/820/390px, footprint and shelf clearance, pause and reduced motion, and browser errors. `work/verify-scene-pages.js` checks desktop/mobile chooser pagination and search. JavaScript syntax checks and Git whitespace checks also pass.
