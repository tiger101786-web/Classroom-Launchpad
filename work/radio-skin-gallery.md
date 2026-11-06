# Colt Radio thumbnail gallery

Replaces the gear's text/swatch list with the approved two-column thumbnail gallery. Site colors come from the existing maroon, surface, text, border and shadow variables, so the selector follows light/dark mode independently of the selected radio skin.

## Behavior

- Current skin is first, followed by recent additions.
- All 19, Music 13 and Fantasy 5 filters; selected card checkmarks and an Original reset.
- Card selection applies the existing skin and closes the popover without restarting audio.
- Arrow keys move through the visible two-column card grid, Home/End select a focus position, and Enter/Space applies a card. Escape/close returns focus to the gear. Focus leaving the gallery closes it.
- Existing popover placement keeps the gear exposed, clamps to the viewport and follows scrolling/resizing, including floating player windows.

## Corrected thumbnails

The old trial used one atlas crop for every portrait. Older layouts differ: Hip-Hop DJ could show a miniature interface, and Bayou Nights included a wooden atlas section. Each skin now has a dedicated scenic header and a correctly rendered Colt capture in `assets/radio-gallery-thumbnails/`, using the actual skin renderer. Every card shares the same composition and sizing. Original uses a native maroon/speaker-cloth thumbnail backdrop so its watermark does not create a second horse. The live Original artwork and all other skin artwork are unchanged.

The 38 PNGs total 8,030,859 bytes. Thumbnail elements are created on first gallery opening and use native lazy loading. They do not load during initial page or radio startup.

Rebuild with `node work/build-radio-gallery-thumbnails.cjs`, with Playwright available to Node and a local Edge installation. `RADIO_BROWSER_PATH` selects another Chromium executable; `RADIO_THUMBNAIL_OUTPUT` writes a review build somewhere else. Keep the reviewed assets until replacement captures are checked, since font/rendering differences across machines can affect screenshots. New registry entries need matching scene/portrait files; update the Fantasy classification when appropriate.

## Validation

- `npm run check`: passed.
- `work/verify-radio-gallery.cjs`: passed for light/dark site colors, all 19 corrected scene/portrait pairs, categories, two-dimensional keyboard navigation, Original reset, close/Escape, audio identity/source/volume/call preservation, and desktop, 390px, 320px and short viewport placement.
- `work/verify-approved-radio-skins.cjs`: passed for all 19 choices, keyboard/reset, lazy artwork loading, menu toggling, persistence, close/minimize, favorites, audio continuity and pop-out/return.
- `work/verify-radio-reliability.cjs` and `work/verify-radio-favorites.js`: passed.
- `work/verify-radio-lossless.cjs`: passed, preserving original artwork hashes, exact decoded pixels and desktop/mobile source-versus-delivery appearance.
- The thumbnail builder successfully rendered all 38 scene/portrait images to a separate review directory.

Browser media is simulated. Live stream availability and production deployment were not checked.
