# Cozy Colt Radio collection

Integrated November 6, 2026 after the user approved adding Rainy Day Records, Snowfall Stereo, Golden Hour Tapes and Midnight Mixtape, then committing and pushing. The heading keeps the name "Colt Radio" with distinct lettering for each skin.

The selector now has 27 choices including Original: 21 Music and 5 Fantasy. The existing site colors and all prior skins are preserved.

- Rainy Day Records: dark bay Colt, glasses and cream sweater; rainy record shop, walnut/brass frame, sage keys, vinyl-style controls; cream italic serif "Colt" paired with a brass-underlined small-cap "Radio".
- Snowfall Stereo: pearl-gray Colt in a beanie/scarf; snowy cabin, birch/silver frame, frosted-blue receiver keys and amber indicators; rounded frosted title lettering.
- Golden Hour Tapes: chestnut Colt with vintage headphones and corduroy shirt; sunset recording desk, honey cassette keys, terracotta selection and bronze controls; warm typewriter lettering with cassette-spine underlines.
- Midnight Mixtape: blue-roan Colt in lavender headphones/cardigan; rainy midnight listening nook, lavender tape keys and peach play control; handwritten-style "Colt" paired with a compact lavender "Radio" tape label.

Four atlases are under assets/radio-skins/illustrated/. Eight matching scene/portrait thumbnails are under assets/radio-gallery-thumbnails/. Exact built-in ImageGen prompts: radio-cozy-collection-prompts.json.
The original Cajun Dance Hall concept remains a separate local preview; it was not part of this approved integration.

Each new definition uses the existing word-span title mechanism and retains the accessible name "Colt Radio". Existing title checks cover the heading's accessible name, bounds and separation from portrait/actions at desktop and phone widths. No new playback behavior is introduced. Registry, stylesheet and player loader cache URLs were refreshed.

Validation completed:
- npm run check: passed.
- npm run test:radio: passed; 27 choices, all title bounds/accessibility, day/night gallery, categories, keyboard/reset, 390px/320px/short viewports, persistence, audio continuity, favorites, close/minimize and pop-out.
- npm run test:radio-artwork: passed; existing artwork hashes and decoding preserved, all 27 desktop/phone source-versus-delivery renders pixel-identical.
- Actual production player capture passed for all four skins, with 89 stations and desktop/320px phone screenshots; visually reviewed final comparison and lettering.
- Final captures: C:/Users/Sinister/Documents/Email/radio-cozy-integration/screenshots/.

Media is simulated in browser tests. Live stream availability and live deployment were not checked.
