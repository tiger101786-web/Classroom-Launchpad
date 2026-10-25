# Cloud Sky and Scrapbook Pet Studio themes

Added as local display preferences in the existing Studio theme selector. Pet/account preferences and controls are unchanged.

## Artwork

Built-in image editing tool used to clear static pets, text and controls from each supplied screenshot while retaining the decorative shell and logo. These are reference-derived themes, not a pixel-identical reproduction of the screenshot: controls remain live, skin galleries accommodate varying counts, and narrow screens reflow.

- `assets/pet-studio/sky-dashboard-frame.png`
- `assets/pet-studio/scrapbook-dashboard-frame.png`

## Edit prompts

### Cloud Sky

Use case: precise-object-edit. Edit target: the supplied Pet Studio screenshot. Produce a clean reusable application background skin, same aspect ratio, same composition and positions. Preserve identically as much as possible the blue sky, fluffy clouds, blue PetStudio logo, cyan outer frame, dark-blue left preview panel and blue right content panel. Keep the PetStudio logo and paw branding at the top-left EXACTLY. Remove ALL other lettering, ALL other text, ALL eagles/pets, both branches, both nameplates, all functional controls: dropdowns, close button, tabs, buttons, search bar, filter pills, count badge, skin card, checkmarks. Inpaint those areas with their surrounding original material. The left preview panel and the large right content panel must remain with their original borders/paper edges intact but now empty, ready for live HTML controls. Keep all decorative details not part of controls. Keep original outer silhouette. No new elements. This is an asset extraction/edit, NOT a redesign. Preserve the illustrated texture and crispness.

### Scrapbook

Use case: precise-object-edit. Edit target: the supplied Pet Studio screenshot. Produce a clean reusable application background skin, same aspect ratio, same composition and positions. Preserve identically as much as possible the wood desk, torn notebook paper, pink PetStudio sticker logo, tape, leaves, scissors, pencil cup, flowers, doodles, pushpins and layered craft supplies. Keep the PetStudio logo and paw branding at the top-left EXACTLY. Remove ALL other lettering, ALL other text, ALL eagles/pets, both branches, both nameplates, all functional controls: dropdowns, close button, tabs, buttons, search bar, filter pills, count badge, skin card, checkmarks. Inpaint those areas with their surrounding original material. The left preview panel and the large right content panel must remain with their original borders/paper edges intact but now empty, ready for live HTML controls. Keep all decorative details not part of controls. Keep original outer silhouette. No new elements. This is an asset extraction/edit, NOT a redesign. Preserve the illustrated texture and crispness.

## Fonts

Cloud Sky uses the existing bundled Nunito. Scrapbook uses Patrick Hand from https://github.com/google/fonts/tree/main/ofl/patrickhand, redistributed under the accompanying `PatrickHand-OFL.txt` SIL Open Font License. All fonts and artwork are served locally.

## Verification

`work/verify-studio-themes.cjs`: all four theme choices at 1920, 1440, 800 and 390px, stable tab geometry and persisted new theme selections.

