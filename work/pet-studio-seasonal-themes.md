# Tropical and Autumn Studio themes

Selectable in the existing Studio theme dropdown; stored on this device using the existing localStorage preference. These themes do not alter pet artwork, animations, account preferences, or the other four Studio themes.

## Artwork

- assets/pet-studio/tropical-dashboard-frame.png
- assets/pet-studio/autumn-dashboard-frame.png

Created with the built-in image-editing tool from the user's Tropical Pet Studio Interface.png and Autumn Pet Studio Eagle Interface.png. Outputs were copied unchanged as PNGs into the project. The pictured eagle and all pictured controls were removed; real DOM controls and animated pets are rendered above the decorative backgrounds.

## Prompt set

For each reference: Use case: precise-object-edit. Create a clean high-resolution landscape background shell for the live website, preserving the colorful polished illustrated style, Pet Studio logo in the upper left, and surrounding scenery. Tropical: palms, sunset ocean, hibiscus, surfboards. Autumn: leaves, red barn, windmill, pumpkins, lantern. Remove both eagles, perch, nameplate, all buttons, tabs, fields, icons, labels and text except the logo. Reconstruct scenery behind the left pet. Right side: one empty dark warm wooden panel with rounded carved golden frame and no interior controls. Upper right: matching empty wooden header panel. Leave the left middle open for the live pet. Keep outer decorations modest without obscuring the right panel interior. No animals, fake controls or other text. Landscape 3:2, opaque background.

## Verification

work/verify-studio-themes.cjs tests all six themes at 1920, 1440, 800 and 390px, tab dimensions on desktop, pet fit, persistence after reload, skin selection, accessories, naming and play actions. Mobile content is intentionally allowed to grow with its contents, following the existing responsive layout.
