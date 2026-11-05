# Mariachi, Symphony and Rockabilly radio skins

Adds three approved genre skins to the shared registry, bringing the chooser to 19 options including Original. Each atlas supplies the scenic header and both matching Colt portraits.

- Mariachi Fiesta: deep mahogany/burgundy bay Colt in charro attire; stitched burgundy controls, silver coin icons, decorative studs and silver selected keys.
- Symphony Hall: pearl-silver conductor Colt; mahogany-grain buttons, gold frames, ivory key accents and gold selected keys.
- Rockabilly Jukebox: warm champagne buckskin Colt with black pompadour; ivory jukebox keys, cherry-red selection, chrome trim and vinyl-record details.

The user retained different colors for the selected station/filter. The abandoned matching-color draft is excluded. Artwork was edited with built-in ImageGen; complete production and final recoloring prompts are in radio-music-genres-prompts.md.

The added CSS is scoped to these three skin IDs. Existing artwork is untouched. Playback, stations, favorites and search reuse the current player. Asset/version URLs are refreshed so browsers load the expanded registry and styles.

## Validation

- `npm run check`: passed.
- `work/verify-radio-reliability.cjs`: passed, including favorites errors/retry, account transitions, launcher state and registered artwork.
- `work/verify-radio-favorites.js`: passed against an isolated API server/database.
- `work/verify-approved-radio-skins.cjs`: passed for all 19 choices, with desktop, 390px/320px and short viewports, lazy loading, keyboard/menu controls, close/minimize, persistence, unchanged audio identity/source/volume/call counts, favorites and pop-out/return.
- Integrated desktop and 320px screenshots for all three new skins are byte-identical to the approved detailed-v4 previews (six screenshots).
- Fourteen existing skin captures matched the before-integration captures byte-for-byte. Inferno's initial capture had a maximum three-level channel difference during transition rendering; a separate comparison of the old and new stylesheets with transitions disabled produced identical decoded pixels. Existing artwork files were not changed.
- `git diff --check`: passed.

Browser media is simulated in the regression suite. Live external stream availability and audible playback were not tested.
