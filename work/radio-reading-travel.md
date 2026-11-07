# Paperback Playback, Attic Acoustics and Window Seat Sessions

Approved for integration, commit and push on November 6, 2026 after actual-player desktop and phone previews.

These three music skins bring the gallery to 32 choices including Original: 26 Music and 5 Fantasy. Existing skin definitions, artwork, playback behavior and the site-colored selector are preserved.

- Paperback Playback: dapple gray Colt with silver mane, brass reading glasses and oatmeal cardigan; quiet bookshop listening corner. Forest-green cloth-bound book-spine keys, ivory selection, brass bookmark/bookplate details, and serif/small-cap Colt Radio lettering.
- Attic Acoustics: auburn Colt with copper mane, moss-brown knitted vest and ivory henley; sunlit timber attic music room. Worn ivory piano keys, aged-oak/copper controls, rosette icon surrounds, sound-hole play button and handwritten Colt Radio lettering.
- Window Seat Sessions: blue-roan Colt with charcoal mane, ochre sweater and cream/navy headphones; rainy night-train listening scene. Perforated ticket-style keys, navy selection, brass controls, carriage-upholstery playback panel and station-placard Colt Radio lettering.

All use the approved three-quarter equine head pose with visible eyes toward the viewer. The existing title mechanism keeps the accessible heading Colt Radio.

Three atlases are under assets/radio-skins/illustrated/. Six matching scene/portrait thumbnails under assets/radio-gallery-thumbnails/ were captured through the real player. Exact built-in ImageGen artwork prompts: radio-reading-travel-prompts.json.
Preview source and original-generation provenance: C:/Users/Sinister/Documents/Email/outputs/radio-reading-travel-20261106/.

The CSS is scoped to the three new IDs. Clean middle-material samples use a pseudo-element stretched to the established decorative tile height, keeping rails continuous and avoiding repeated header/portrait fragments. Player, registry and stylesheet cache URLs are refreshed. Existing radio checks include the new framed keys and playback panels; gallery checks expect 26 Music entries.

Validation:
- Production capture passed for all three: 89 stations, 414px desktop, 320px phone, selector visibility, Escape and no browser JavaScript errors.
- All six integrated desktop/mobile PNG captures are byte-identical to the approved previews.
- npm run check, npm run test:radio and npm run test:radio-artwork passed across all 32 choices, accessible titles and heading bounds, site-colored day/night gallery, mobile/short viewports, persistence, audio continuity, favorites and pop-out. Existing source artwork hashes/decoding were preserved; desktop/mobile source-versus-delivery rendering was pixel-identical.
- Production capture output: C:/Users/Sinister/Documents/Email/radio-reading-travel-integration/screenshots/.

Browser media is simulated. Live streams and live deployment have not been checked.
