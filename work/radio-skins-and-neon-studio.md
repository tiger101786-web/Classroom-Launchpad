# Colt Radio skins and shared Pet Studio layouts

## Try the radio skins

Colt Radio now offers Original, Retro Arcade and Neon Graffiti on regular website visits. Open the player and use the gear beside Favorites. `/radio-skins-test.html` remains a standalone comparison page, using the same production code.

`radio-skins.js` and `radio-skins.css` load only when the radio is first opened. Theme artwork loads only when selected. The choice is stored in `coltRadioSkin`, with migration from the previous `coltRadioSkinPreview` key. Original remains the default for new devices. Account preferences and playback are unchanged.

## Artwork

The two radio references were copied byte-for-byte into `assets/radio-skins/`, retaining native dimensions (924×1702 Arcade; 923×1703 Graffiti). CSS displays their original header, Colt portrait and lower decorative artwork. Station tiles, titles, favorites, search, playback, status and volume remain real controls displaying the existing catalog and current state. The reference's illustrative station selection and favorite count are not baked into the controls.

The Arcade player portrait uses a square source region around x65–266, y1039–1240. Its placement is independent of player size so the muzzle is retained. The browser check verifies the complete portrait bounds at all four sizes; original artwork is unchanged.

All radio skins now inherit the normal player's width, height, section spacing, station tile sizing, fonts and playback-control dimensions directly from styles.css. Skins change paint only. The extra footer artwork row has been removed; lower decoration is painted beneath the existing note. The gear uses the same ⚙ glyph and dashboard-nav-icon class as Launchpad Settings. The gear opens a compact three-row dropdown with color swatches, hover highlights and a selected checkmark. Its trim follows the active skin. There is no settings-panel heading, card gallery or explanatory footer. A top-layer popover avoids clipping and never participates in player layout. Arrow keys, Home/End, Enter, Escape and outside-click dismissal are supported. Browser assertions compare panel and section dimensions to Original at 1440, 800, 390 and 320 pixels, compare the preview to the normal site, and verify the floating player's dimensions.

Both artwork skins use square outer corners so the original player's rounded overflow clipping cannot trim the supplied rectangular art. The original skin retains its existing corners. All four radii are asserted at each tested size; this does not change player dimensions.

The gear is registered as the dropdown's native popover invoker. A second click closes it without light-dismiss reopening it. Selection, outside clicks and Escape also dismiss it; the selected option receives native autofocus for keyboard navigation. Repeated gear toggles are covered by the browser checks.

Dropdown placement is measured after the popover opens, rather than from a beforetoggle microtask that can run before usable layout exists. The menu stays within the active visual viewport, flips above the gear when space below is insufficient, and updates when scrolling, resizing or loading the skin stylesheet. Event listeners follow the current document when controls move into and out of the floating player and are removed when the dropdown closes.

Neon Gaming is an optional Pet Studio theme saved with the existing device-local Studio theme preference. Its current backdrop is `assets/pet-studio/neon-gaming-room-v2.png`, with no baked selection board. The original theme choices remain available. The background is requested only when Neon Gaming is selected, and Studio still uses its existing seven delayed stylesheets.

The diner now uses `assets/pet-studio/diner-room-backdrop-v2.png`: the large illustrated board and fake tabs were removed and replaced with matching red diner wall/booth scenery. A single live chrome frame wraps the actual tabs, opaque content and footer, avoiding independent chrome edges when switching tabs.

## Standard-size Neon Gaming room update

The former large illustrated board was removed so a live neon frame can follow the shared Studio geometry. The new room master remains at native resolution.

### Reflow reference prompt

Edit this supplied Neon Gaming Pet Studio decorative dashboard shell to match the larger standard Studio selection area. Keep the exact neon cyan/magenta/violet gaming-room style, paw graphics, furniture, monitors, vines, floor, chair and controller as closely as practical. Reflow layout precisely: shrink and move the Pet Studio logo entirely into x4%-36%, y1%-14%; move the SMALL blank companion header frame into x69%-99%, y1%-14%; EXPAND the LARGE blank selector frame into x38%-99%, y16%-88%, keeping its glowing cyan left/bottom and violet right beveled border. This is a substantial increase in width and height of the blank right panel. Remove all traces of its old x49%-99%, y20%-69% frame so there are no duplicate borders. Recompose gaming-room scenery into left x0%-37% and bottom strip, with objects and plants always BEHIND the right selector panel, never intruding into its blank interior. Keep both panel interiors completely blank opaque dark navy, without any controls, labels, text or placeholder widgets. The only text is the existing Pet Studio logo. Same landscape proportions and high detailed quality. Main panel must stay thin-edged with maximum interior usable space, not a thick border.

### Remove baked board prompt

Precise edit: remove ONLY the large blank right-hand rectangular dashboard panel and ALL its neon border rails from this image. This large panel occupies roughly x36%-100%, y16%-81%. Fill the removed rectangle seamlessly with the same dark navy gaming-room wall and floor, with cyan/magenta architectural lighting, but no replacement board, no panels and no rectangular border outlines. Keep the SMALL top-right companion header frame completely unchanged. Preserve Pet Studio logo, vines, existing left gaming desk/monitors/tower/chair, rug, controller and bottom-right plant. Keep these objects in their existing left/bottom areas; do not add props or text in the clear right wall area. This room image will be underneath a correctly sized live HTML frame. Preserve the exact visual style and composition of all remaining art. Only remove large board/frame, reconstruct underlying room naturally. Same dimensions/aspect.

## Generated asset prompts

### Neon Gaming backdrop

Edit target: supplied Neon Pet Studio Companion UI image. Produce a clean decorative website dashboard shell at the same landscape proportions. Preserve as closely as possible the exact gaming-room composition, glossy neon cyan/magenta/purple lighting, dark navy surfaces, vines, books, paw monitors, RGB tower, gaming chair, glowing paw rug, controller, plants, and the large Pet Studio logo at upper left. Keep header frame at x53%-99%, y5%-20%, and large right controls frame at x49%-99%, y20%-69%. REMOVE all other text and all functional UI inside those two right-hand frames: companion label/dropdown/close, four tabs and labels, heading/subtitle/count, skins/accessories toggles, search and filters. Replace those interiors with completely empty clean opaque dark navy subtly graded panels, keeping the external cyan/magenta beveled glow trim. Main right panel interior must be blank and uninterrupted: NO leaves, controller, props or scenery may overlap the right panel interior. Do not add an eagle or pet. Keep Pet Studio title exactly. This image will sit BEHIND real accessible HTML controls, so do not draw controls, tiny icons, placeholder text or fake widgets inside blank panels. High-detail crisp polished original illustration, no watermark.

### Diner scenery repair

Precise object edit of supplied retro diner dashboard backdrop. Keep exact existing Pet Studio sign, lamps, upper-right small blank cream/chrome companion header, left diner booths/window/jukebox, neon burger and shake lights, and foreground diner table with milkshake burger napkin holder. REMOVE the entire LARGE right-hand interface board from x36%-100%, y14%-86%: remove its red outer backing, four fake red tabs, big cream rectangle, and ALL of its outer and inner chrome rails. Fill that whole removed-board area naturally with the existing retro diner interior: glossy deep red diner wall panels, continuous horizontal chrome wall trim, lower red booth/back-wall, appropriate warm lighting. No replacement board, no interface outlines, no cards, no text in the removed area. Live HTML will render a single correctly sized board there. Preserve original composition and all remaining objects as closely as possible. Upper-right SMALL companion header MUST remain at same position and dimensions, unchanged and blank. Seamless realistic polished red/chrome diner scenery where large board used to be. Same landscape aspect ratio.

Both were produced with the built-in image-generation tool from the supplied/existing reference assets and copied into the project at native resolution. Original source art remains available.

## Validation

- `npm run check` and JavaScript syntax checks for the new preview code.
- `node work/verify-radio-skin-menu-position.cjs`: gear-relative placement on desktop, mobile and short displays; resize/scroll while open; floating/returned controls; delayed stylesheet loading; repeated gear toggling.
- `node work/verify-radio-skins-neon-studio.cjs`: delayed production loading, normal-visit saved choices, gear settings/Escape/reset, reload persistence, unchanged audio element/source/play-pause-load calls/volume/favorites, floating-window skin switching and return, four radio sizes in light/dark modes, standalone test page, neon lazy artwork and account preference isolation, exact layout comparisons for all eight themes across all Studio tabs at four sizes, eight visible desktop cards, theme persistence and diner backdrop.
- Audio calls are simulated in this layout test; it verifies that skin changes never restart playback, without relying on external radio availability.
- `node work/verify-retro-diner.cjs`: four-size tab sizing, readable labels, opaque content/footer with zero gap, centered companion selector, pet controls and skin persistence.
- `node work/verify-studio-style-loading.cjs`: unchanged seven-sheet delayed loading, retries, reopening and logout cancellation.
- `git diff --check`.

Browser checks use isolated temporary data. Preview captures go to `PREVIEW_OUTPUT` when supplied, otherwise to a temporary directory. Desktop/mobile screenshots were visually reviewed. All eight Studio themes share the same geometry in pet-studio-responsive.css; desktop galleries show four columns and two full rows within one scroll region, with a 440px minimum selection area. Mobile uses a shared two-column layout. Decorative frames follow live controls instead of controlling their size. No commit, push or deployment is performed by these changes.

