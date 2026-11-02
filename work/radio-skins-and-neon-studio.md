# Radio skin preview, Neon Gaming Studio, and diner chrome repair

## Try the radio skins

Open `/radio-skins-test.html` on the local server. This standalone test page automatically enables `?radioSkins=preview`. Open the player and click the gear beside Favorites. Original, Retro Arcade and Neon Graffiti are available. To test with the rest of Launchpad, visit `/?radioSkins=preview`.

Normal visits do not load the radio preview script, stylesheet or artwork, and do not show the gear. A saved test choice never applies without the preview query. This is a reviewable trial, not a rollout of radio skins. The preview preference uses the separate localStorage key `coltRadioSkinPreview` and does not change account data.

## Artwork

The two radio references were copied byte-for-byte into `assets/radio-skins/`, retaining native dimensions (924×1702 Arcade; 923×1703 Graffiti). CSS displays their original header, Colt portrait and lower decorative artwork. Station tiles, titles, favorites, search, playback, status and volume remain real controls displaying the existing catalog and current state. The reference's illustrative station selection and favorite count are not baked into the controls.

The Arcade player portrait uses a square source region around x65–266, y1039–1240. Its placement is independent of player size so the muzzle is retained. The browser check verifies the complete portrait bounds at all four sizes; original artwork is unchanged.

All radio skins now inherit the normal player's width, height, section spacing, station tile sizing, fonts and playback-control dimensions directly from styles.css. Skins change paint only. The extra footer artwork row has been removed; lower decoration is painted beneath the existing note. The gear uses the same ⚙ glyph and dashboard-nav-icon class as Launchpad Settings. The gear opens a compact three-row dropdown with color swatches, hover highlights and a selected checkmark. Its trim follows the active skin. There is no settings-panel heading, card gallery or explanatory footer. A top-layer popover avoids clipping and never participates in player layout. Arrow keys, Home/End, Enter, Escape and outside-click dismissal are supported. Browser assertions compare panel and section dimensions to Original at 1440, 800, 390 and 320 pixels, compare the preview to the normal site, and verify the floating player's dimensions.

Both artwork skins use square outer corners so the original player's rounded overflow clipping cannot trim the supplied rectangular art. The original skin retains its existing corners. All four radii are asserted at each tested size; this does not change player dimensions.

The gear is registered as the dropdown's native popover invoker. A second click closes it without light-dismiss reopening it. Selection, outside clicks and Escape also dismiss it; the selected option receives native autofocus for keyboard navigation. Repeated gear toggles are covered by the browser checks.

Neon Gaming is an optional Pet Studio theme saved with the existing device-local Studio theme preference. Its backdrop is `assets/pet-studio/neon-gaming-dashboard-frame.png`. The original theme choices remain available. The background is requested only when Neon Gaming is selected, and Studio still uses its existing seven delayed stylesheets.

The diner now uses `assets/pet-studio/diner-room-backdrop-v2.png`: the large illustrated board and fake tabs were removed and replaced with matching red diner wall/booth scenery. A single live chrome frame wraps the actual tabs, opaque content and footer, avoiding independent chrome edges when switching tabs.

## Generated asset prompts

### Neon Gaming backdrop

Edit target: supplied Neon Pet Studio Companion UI image. Produce a clean decorative website dashboard shell at the same landscape proportions. Preserve as closely as possible the exact gaming-room composition, glossy neon cyan/magenta/purple lighting, dark navy surfaces, vines, books, paw monitors, RGB tower, gaming chair, glowing paw rug, controller, plants, and the large Pet Studio logo at upper left. Keep header frame at x53%-99%, y5%-20%, and large right controls frame at x49%-99%, y20%-69%. REMOVE all other text and all functional UI inside those two right-hand frames: companion label/dropdown/close, four tabs and labels, heading/subtitle/count, skins/accessories toggles, search and filters. Replace those interiors with completely empty clean opaque dark navy subtly graded panels, keeping the external cyan/magenta beveled glow trim. Main right panel interior must be blank and uninterrupted: NO leaves, controller, props or scenery may overlap the right panel interior. Do not add an eagle or pet. Keep Pet Studio title exactly. This image will sit BEHIND real accessible HTML controls, so do not draw controls, tiny icons, placeholder text or fake widgets inside blank panels. High-detail crisp polished original illustration, no watermark.

### Diner scenery repair

Precise object edit of supplied retro diner dashboard backdrop. Keep exact existing Pet Studio sign, lamps, upper-right small blank cream/chrome companion header, left diner booths/window/jukebox, neon burger and shake lights, and foreground diner table with milkshake burger napkin holder. REMOVE the entire LARGE right-hand interface board from x36%-100%, y14%-86%: remove its red outer backing, four fake red tabs, big cream rectangle, and ALL of its outer and inner chrome rails. Fill that whole removed-board area naturally with the existing retro diner interior: glossy deep red diner wall panels, continuous horizontal chrome wall trim, lower red booth/back-wall, appropriate warm lighting. No replacement board, no interface outlines, no cards, no text in the removed area. Live HTML will render a single correctly sized board there. Preserve original composition and all remaining objects as closely as possible. Upper-right SMALL companion header MUST remain at same position and dimensions, unchanged and blank. Seamless realistic polished red/chrome diner scenery where large board used to be. Same landscape aspect ratio.

Both were produced with the built-in image-generation tool from the supplied/existing reference assets and copied into the project at native resolution. Original source art remains available.

## Validation

- `npm run check` and JavaScript syntax checks for the new preview code.
- `node work/verify-radio-skins-neon-studio.cjs`: opt-in isolation, gear settings/Escape/reset, reload persistence, unchanged audio element/source/play-pause-load calls/volume/favorites, floating-window skin switching and return, four radio sizes in light/dark modes, standalone test page, neon lazy artwork and account preference isolation, all Studio tabs at four sizes, theme persistence and diner backdrop.
- Audio calls are simulated in this layout test; it verifies that skin changes never restart playback, without relying on external radio availability.
- `node work/verify-retro-diner.cjs`: four-size tab sizing, readable labels, opaque content/footer with zero gap, centered companion selector, pet controls and skin persistence.
- `node work/verify-studio-style-loading.cjs`: unchanged seven-sheet delayed loading, retries, reopening and logout cancellation.
- `git diff --check`.

Browser checks use isolated temporary data. Preview captures go to `PREVIEW_OUTPUT` when supplied, otherwise to a temporary directory. Desktop/mobile screenshots were visually reviewed. No commit, push or deployment is performed by these changes.

