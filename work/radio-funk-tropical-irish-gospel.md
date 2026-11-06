# Funk Groove, Tropical Steel Band, Irish Folk and Gospel Sunday

Approved for integration, commit and push on November 5, 2026, after actual-player desktop and phone previews.

These four music skins bring the selector to 23 choices including Original (17 Music, 5 Fantasy). Each includes a dedicated Colt portrait, scenic header, decorative side material, themed station/filter buttons, play control, volume knob and playback frame. The selector keeps the site's maroon/neutral day/night colors.

- Funk Groove: orange stompbox keys, plum selected keys, brass footswitch icons and amplifier grille; cocoa Colt with curly mane, amber glasses and retro clothing.
- Tropical Steel Band: hammered silver pan keys, coral selected keys and bamboo playback frame; cream Colt with floral shirt and hibiscus. Its reviewed scenic header is 3.3:1; the other new headers are 3:1.
- Irish Folk: carved oak keys, emerald selected keys, Celtic medallions and brass details; chestnut Colt with tweed cap, waistcoat and braided mane.
- Gospel Sunday: ivory organ-stop keys, purple selected keys and gilded arched playback frame; charcoal Colt with silver mane and purple choir robe.

The four atlas PNGs are in assets/radio-skins/illustrated/. Eight scene/portrait thumbnails in assets/radio-gallery-thumbnails/ were captured through the actual player renderer so they match the gallery composition. Artwork was generated with built-in ImageGen; exact prompts are preserved in radio-funk-tropical-irish-gospel-prompts.json. All previously approved assets remain intact. The new style rules apply only to these four IDs, and the existing station list and audio logic are preserved.

The skin registry and CSS loader cache versions were refreshed, along with the radio loader on index.html and radio-skins-test.html. Browser checks now cover the additional framed controls and Tropical's reviewed header ratio. Gallery assertions cover all 23 choices and 17 Music entries.

Validation:
- npm run check: passed.
- npm run test:radio-artwork: passed, including preserved source hashes, decoded images and exact desktop/mobile source-versus-delivery rendering.
- npm run test:radio: passed for all 23 skin choices, day/night gallery, keyboard/reset, phone/short viewports, persistence, audio continuity, favorites and pop-out/return.
- Review captures: C:/Users/Sinister/Documents/Email/outputs/radio-next-four-20261105/screenshots/.

Browser audio is simulated in tests; external stream availability and live deployment are not asserted by these checks.
