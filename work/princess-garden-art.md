# Princess Garden scene and supplied shelf statues

Added Disney • Princess Garden as a scene and Disney • Princess Garden Crown as its matching frame, both under Disney in their existing pickers. The supplied scene JPG and all three transparent statue PNGs were copied unchanged. New rows are appended in the shelf catalog, preserving previous item IDs and sprite indices.

Statue categories:
- Music: Ariana Grande Pink Microphone Bust
- Cats: Calico Persian Cat Bust
- Cats: Tortoiseshell Cat Bust

Saved artwork paths:
- C:/Users/Sinister/Documents/GitHub/Classroom-Launchpad/assets/launchpad-scene-disney-princess-garden.jpg
- C:/Users/Sinister/Documents/GitHub/Classroom-Launchpad/assets/scene-frame-match-disney-princess-garden-thin.png
- C:/Users/Sinister/Documents/GitHub/Classroom-Launchpad/assets/shelf-music-ariana-grande-bust.png
- C:/Users/Sinister/Documents/GitHub/Classroom-Launchpad/assets/shelf-cat-calico-persian-bust.png
- C:/Users/Sinister/Documents/GitHub/Classroom-Launchpad/assets/shelf-cat-tortoiseshell-bust.png

Frame generated with built-in ImageGen: narrow gold filigree, green ivy, small garden flowers, crown, bluebird and rose. Complete prompt and references are in princess-garden-frame-prompt.json. Transparent center and exterior; continuous rim measured at 360 angles. Its measured fit uses the existing exterior-frame formula and footprint cap. Frame fitting does not resize the scene or move shelves. Source dimensions/bounds are recorded in princess-garden-statue-assets.json and princess-garden-frame-audit.json.

Production changes: launchpad-scenes.js (catalog), server.js (allowed saved scene/frame IDs), scene-exterior-frames.css (measured frame fit), collectible-shelf.js (statue entries/artwork bounds), index.html (cache refresh).

Verification: work/verify-princess-garden.cjs passed scene/frame category filtering, selection, save/reload, unchanged scene/shelf layout and frame clearance at 1280/1024/820/390 widths in light/night themes, statue categories, shelf picker selection, left/right shelf persistence, and no browser errors. npm run check, collectible-shelf.js syntax and git diff --check passed.

Preview: C:/Users/Sinister/.codex/visualizations/2026/11/03/01a19f35-f5fe-7a53-be7e-17a3b74d1da1/princess-garden-20261112/princess-garden-and-statues.png

Commit message: Add Princess Garden scene, matching frame, and three shelf statues
