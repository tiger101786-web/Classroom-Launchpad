# Michael Jackson and Prince-inspired Colt Radio skins

Integrated locally November 7, 2026 after the user approved adding both latest preview designs. Gallery: 34 choices including Original (28 Music, 5 Fantasy). No commit or push was requested for this integration.

## Moonwalk Magic
Black Colt in a tilted ivory-banded fedora, white V-neck shirt and black sequined stage jacket, with a large white sequined hoof-glove raised beside the brim. The dedicated transparent upper-body portrait uses auto 108% height, center top, showing the left mane/shoulder, hat and glove together.
Glowing sidewalk tiles, blue stage lighting, chrome rails, illuminated station keys, sequined play key and record-style volume dial. Heading remains Colt Radio; badge is King of Pop Tribute.
Assets: moonwalk-atlas.png and moonwalk-portrait-v3.png under assets/radio-skins/illustrated/, plus moonwalk-scene.png and moonwalk-colt.png under assets/radio-gallery-thumbnails/.

## Purple Rain
Colt himself has a lavender-purple coat, short high asymmetric black curls, a cocked ear, lively eyes and playful half-smile. Jacket follows the user's Prince photo: sleek purple satin/leather, tall turned-up collar, silver triangular studs on one shoulder, open white collar and pocket square. The discarded brown coat, long mane, ornate brocade and ruffled jabot are excluded.
Light lavender rain scene and silver/lilac controls, plum selected keys and readable plum text. Pink/gold reference-style Purple Rain lettering sits on a plum nameplate with a dark edge for contrast. Circle and square portrait backgrounds layer rain and spotlights behind the transparent horse, rather than a flat fill. Heading stays Colt Radio and the real accessible badge text is Purple Rain.
Assets: purplerain-atlas.png, purplerain-portrait.png and purplerain-wordmark.png under assets/radio-skins/illustrated/, plus purplerain-scene.png and purplerain-colt.png under assets/radio-gallery-thumbnails/.

## Behavior and validation
The skin engine supports an optional kicker value on a definition. It captures each new player's original feature-kicker text and restores that text when switching to skins without a custom badge. Existing titles, skin definitions, audio logic and site-colored gallery are preserved. All artwork stays lazy through registered asset lists. Player/skin/definition/style loader cache URLs are refreshed.

Approved-skin checks verify the two dedicated portrait asset URLs, atlas-backed body rails and custom badge wording/restoration, alongside the existing accessible title/bounds checks. Gallery assertions cover 28 Music entries.

- npm run check: passed.
- npm run test:radio: passed across all 34 choices, accessible titles, badge update/restoration, desktop/mobile/short viewports, gallery categories, keyboard/reset, persistence, audio continuity, favorites, close/minimize and pop-out.
- npm run test:radio-artwork: passed; existing source hashes and image decoding preserved, exact desktop/mobile source-versus-delivery screenshots for all 34 choices.
- Actual production captures passed for both; all four desktop/mobile PNGs are byte-identical to the latest approved local previews.

Final production captures: C:/Users/Sinister/Documents/Email/radio-artist-tributes-integration/screenshots/. Source previews and revision notes are under outputs/radio-moonwalk-20261107/ and outputs/radio-purple-rain-20261107/ in the Email workspace.
Exact built-in ImageGen prompts and edits: radio-artist-tributes-prompts.json. The Prince reference files were supplied as user attachments; originals may not be available on Desktop.

Browser media is simulated; live stream availability and live deployment were not verified.
