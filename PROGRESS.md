# Classroom Launchpad progress

Updated November 5, 2026.

## Colt Radio: latest completed work

Integrated Mariachi Fiesta, Symphony Hall and Rockabilly Jukebox into the production skin registry and styles, bringing the chooser to 19 options including Original. The user approved the detailed-v4 designs and retained distinct selected-filter/station colors. The later matching-color draft was canceled and is excluded.

- Mariachi: mahogany bay Colt, burgundy charro styling and silver trim.
- Symphony: pearl-silver conductor Colt, mahogany and gold controls.
- Rockabilly: warm champagne buckskin Colt with black pompadour, cream jukebox buttons, cherry selection, chrome trim and vinyl details. The earlier teal Colt was rejected.

The new skins reuse the current player and artwork-crop mechanism. Existing skin assets and playback code are preserved; cache version URLs were refreshed for the expanded collection.

Production verification passed: syntax, radio reliability, favorites API and all 19 skin/browser checks. Six integrated desktop/mobile screenshots exactly match approved previews. See work/radio-mariachi-symphony-rockabilly.md for validation details and work/radio-music-genres-prompts.md for artwork prompts.

## Latest selector work

The user approved and requested committing/pushing the thumbnail gallery. The gallery is integrated into the actual player with the site's maroon/neutral light/dark colors, All/Music/Fantasy filters, selected checks, Original reset and keyboard navigation.

All 19 thumbnails were checked and corrected. Dedicated scene/portrait captures use each skin's real crop, including Bayou Nights and Hip-Hop DJ. Existing source artwork was usable and did not need repainting. Original's thumbnail uses a plain maroon/speaker-cloth background to avoid a second horse watermark. See work/radio-skin-gallery.md for behavior, asset rebuilding and complete validation.

Syntax, gallery, all-skin browser, favorites/reliability/API and lossless-artwork checks passed. The new thumbnail builder also rendered all 38 assets to a separate review directory. The previous skin batch is already pushed as be323e1; use Git history/status to confirm delivery of this later selector change. Live deployment and external stream availability require separate observation.

For future skin work, preserve the existing collection's appearance and update this note after meaningful changes so another chat can continue from project files.

## Four additional music skins — November 5, 2026

The user approved the actual-player previews and requested adding, committing and pushing Funk Groove, Tropical Steel Band, Irish Folk and Gospel Sunday. All four skins and their eight matching scene/portrait gallery thumbnails are integrated, bringing the gallery to 23 choices including Original (17 Music, 5 Fantasy). Distinct stompbox, steel-pan, carved-oak and organ-stop controls preserve the reviewed designs. Existing skins and the site's selector palette are preserved. Cache version URLs are refreshed.

Details: work/radio-funk-tropical-irish-gospel.md. Exact built-in ImageGen prompts: work/radio-funk-tropical-irish-gospel-prompts.json. Recoverable previews and screenshots: C:/Users/Sinister/Documents/Email/outputs/radio-next-four-20261105/.

Validation passed: npm run check, npm run test:radio and npm run test:radio-artwork. All 23 choices, day/night gallery, mobile/short viewports, persistence, audio continuity, favorites and pop-out controls passed. User authorized commit and push; use Git history/status for delivery confirmation.

## Cozy music collection — November 6, 2026

Integrated the approved Rainy Day Records, Snowfall Stereo, Golden Hour Tapes and Midnight Mixtape skins with four atlases, eight matching gallery thumbnails and themed controls. The gallery now has 27 choices including Original (21 Music, 5 Fantasy). The user requested keeping the name Colt Radio with unique lettering on each of these four skins; completed with record-shop serif, frosted rounded lettering, typewriter cassette lettering and handwritten/tape-label lettering respectively. Existing skins and the site's selector colors are preserved. Cajun Dance Hall remains a local preview and is outside this integration.

Details and validation: work/radio-cozy-collection.md. Exact ImageGen prompts: work/radio-cozy-collection-prompts.json. Final production screenshots and a recovery note are under C:/Users/Sinister/Documents/Email/radio-cozy-integration/.

Validation passed: npm run check, npm run test:radio and npm run test:radio-artwork. All 27 choices, accessible titles and heading bounds, day/night gallery, desktop/mobile/short viewports, persistence, audio continuity, favorites and pop-out controls passed. Actual production-player desktop and 320px captures were visually reviewed. User authorized commit and push; confirm delivery from Git history/status.

## After-School Audio pair — November 6, 2026

The user approved adding both After-School Audio versions. Integrated the boy and girl atlases, four matching gallery thumbnails, scoped sampler-pad/audio-interface controls and handwritten/label-maker title lettering. The gallery now has 29 choices including Original (23 Music, 5 Fantasy). Both Colt portraits keep the approved three-quarter head angle and eyes toward the viewer.

Details: work/radio-after-school.md. Exact built-in ImageGen prompts and final gaze edits: work/radio-after-school-prompts.json. Production captures: C:/Users/Sinister/Documents/Email/radio-after-school-integration/screenshots/. All four desktop/mobile screenshots are byte-identical to the approved previews. Registry/CSS/player cache URLs were refreshed.
Validation passed: npm run check, npm run test:radio and npm run test:radio-artwork. All 29 choices, heading accessibility/bounds, day/night gallery, mobile/short viewports, playback continuity, favorites, persistence and pop-out passed. Integration is local; no commit or push was requested for this pair.

## Paperback, Attic and Window Seat collection — November 6, 2026

The user approved the actual-player previews and requested commit/push. Integrated Paperback Playback, Attic Acoustics and Window Seat Sessions with three atlas images, six matching gallery thumbnails, scoped themed controls and distinct Colt Radio title lettering. The gallery now has 32 choices including Original (26 Music, 5 Fantasy). Existing skins, artwork and site selector palette are preserved. Loader cache URLs are refreshed.

Details: work/radio-reading-travel.md. Exact ImageGen prompts: work/radio-reading-travel-prompts.json. Six production desktop/mobile screenshots match approved preview PNGs byte-for-byte; final captures are under C:/Users/Sinister/Documents/Email/radio-reading-travel-integration/screenshots/.
Validation passed: npm run check, npm run test:radio and npm run test:radio-artwork. All 32 choices, title accessibility/bounds, day/night gallery, mobile/short viewports, persistence, audio continuity, favorites and pop-out passed. All six production desktop/mobile captures match approved previews byte-for-byte. User authorized commit and push; confirm delivery from Git history/status.

## MJ and Prince-inspired skins — November 7, 2026

User approved adding the latest Moonwalk Magic and Purple Rain designs. Integrated both skins, five active artwork assets and four gallery thumbnails; gallery now has 34 choices including Original (28 Music, 5 Fantasy). Preserved MJ's full framed mane/shoulder, fedora and raised glove; Prince uses the final lavender Colt with photo-matched short curls/studded jacket, lively expression, lighter rain palette, pink/gold Purple Rain lettering on a contrasting nameplate, and rain/spotlight backgrounds inside both portraits. The earlier brown/brocade Prince drafts are excluded.

Added optional skin badge wording with default restoration. MJ badge: King of Pop Tribute. Prince badge: Purple Rain. Existing Colt Radio headings, prior collection and site gallery colors are preserved. Cache URLs refreshed.

Details: work/radio-artist-tributes.md. Exact ImageGen prompts/edits: work/radio-artist-tributes-prompts.json. Production capture folder: C:/Users/Sinister/Documents/Email/radio-artist-tributes-integration/screenshots/.

Validation passed: npm run check, npm run test:radio and npm run test:radio-artwork. All 34 choices, title accessibility/bounds, badge wording/restoration, gallery day/night/category/keyboard behavior, mobile/short screens, playback continuity, favorites, persistence and pop-out passed. All four production desktop/mobile captures are byte-identical to the latest previews. Integration is local; no commit or push was requested for this pair.

## Alphabetical skin chooser — November 7, 2026

User requested alphabetizing Choose a skin. Gallery cards now stay in A–Z order by displayed label across All, Music and Fantasy. Selected skins retain their alphabetical position and checkmark. Sorting only the card DOM preserves the registry/image/category associations; the prior current-first/recent-first reorder on opening is removed. Keyboard navigation follows the displayed order, and the Original reset remains available. Player/skin script cache URLs refreshed.

Validation: node syntax checks for radio-skins.js and colt-radio.js passed; work/verify-radio-gallery.cjs passed in day/night modes for all 34 image pairs, alphabetical order in every category and after selection/reopening, arrow/End navigation, Original reset, unchanged audio, and mobile/short viewports. Screenshots: C:/Users/Sinister/Documents/Email/radio-gallery-alphabetical/.

User preference: always include a suggested commit message when reporting code changes. Suggested message: Alphabetize the Colt Radio skin chooser. Changes are local; no commit or push requested.
