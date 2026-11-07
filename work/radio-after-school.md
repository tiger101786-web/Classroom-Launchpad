# After-School Audio — boy and girl

Integrated November 6, 2026 after the user approved adding both actual-player previews.

Two new music skins bring the gallery to 29 choices including Original: 23 Music and 5 Fantasy. Each has a teen-bedroom scenic header, matching Colt portraits in the header and playback panel, decorative rails, rubber sampler-pad station keys, a peach play control, an audio-interface playback frame and volume knob, and handwritten Colt / label-maker RADIO lettering.

- afterschoolboy: smoky-gray Colt, tousled charcoal mane, sage hoodie and cream/peach headphones; dusty-blue bedroom, music posters, skateboard and beat-making desk.
- afterschoolgirl: chestnut Colt, wavy chocolate mane with small braid, lavender hoodie and cream/peach headphones; lilac bedroom, photo prints/music posters and keyboard desk.

Both retain the approved three-quarter head angle with eyes toward the viewer. These are the final gaze revisions. Active atlas files are assets/radio-skins/illustrated/{afterschoolboy,afterschoolgirl}-atlas.png; four matching gallery scene/portrait images are under assets/radio-gallery-thumbnails/.

Built-in ImageGen generated and edited the artwork. Initial and final approved edit prompts: radio-after-school-prompts.json. Source previews and provenance: C:/Users/Sinister/Documents/Email/outputs/radio-after-school-20261106/.

The CSS remains scoped to the two IDs. The middle fabric is sampled into a smaller pseudo-element and stretched to the established decorative tile height, keeping body rails continuous while excluding bedroom/portrait fragments. Checks recognize atlas artwork on the backdrop span or its pseudo-element. Existing definitions, skins, gallery palette and playback code are preserved. Registry, CSS and player loader cache URLs are refreshed.

Validation:
- npm run check: passed.
- npm run test:radio: passed across all 29 choices, day/night gallery, title accessibility/bounds, mobile/short viewports, playback, favorites, persistence and pop-out.
- npm run test:radio-artwork: passed; existing hashes and decoded artwork preserved, exact source/delivery desktop/mobile renders for all 29 choices.
- Production capture.cjs: passed for both, including 89 stations, desktop/320px phone, selector visibility, Escape and no JS errors.
- All four production desktop/mobile screenshots are byte-identical to the approved preview captures.
- Final captures: C:/Users/Sinister/Documents/Email/radio-after-school-integration/screenshots/.

Browser media is simulated. Live stream availability and live deployment have not been checked.
