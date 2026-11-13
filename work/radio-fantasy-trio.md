# Colt Radio fantasy trio

Added Jade Serpent Palace, Phoenix Rebirth, and Anubis's Tomb to Fantasy in the existing radio skin gallery. Each uses the exact reviewed artwork and real-player preview styling. Original PNGs are copied byte-for-byte with no resizing, compression changes or quality reduction. Artwork hashes and zero-difference stabilized screenshot comparisons are recorded in radio-fantasy-trio-artwork.json. Built-in ImageGen prompts are in radio-fantasy-trio-prompts.json.

- Jade Serpent Palace: jade/gold architecture and serpent rails, with the approved Chinese emperor Colt in an imperial dragon robe and ceremonial crown. Background uses jade-serpent-atlas.png; both portraits use jade-serpent-emperor-atlas.png.
- Phoenix Rebirth: obsidian/copper feather trim, ember accents, and ivory Colt with a flaming feather mane and phoenix regalia.
- Anubis's Tomb: basalt, turquoise/gold scarab rails, and black pharaoh Colt with a nemes headdress and jeweled collar. Portrait crop keeps crown and ears visible.

All four full-resolution atlases are saved under C:/Users/Sinister/Documents/GitHub/Classroom-Launchpad/assets/radio-skins/illustrated/. The six gallery scene/portrait thumbnails are rendered from the actual player under assets/radio-gallery-thumbnails/. Skin registry entries keep existing control geometry, use the shared layout, and retain normal saved-device preferences. Script/style versions are refreshed through the existing lazy-loading chain.

The existing thumbnail builder now accepts RADIO_THUMBNAIL_SKINS as a comma-separated optional filter, so adding skins does not regenerate existing reviewed thumbnails. Gallery regression coverage includes nine Fantasy designs and forty total skins; the emperor portrait assertion checks its separate source atlas.

Validation: all three production skins match their approved preview renderings at 414x786 with zero different color channels when transient animations/transitions are disabled. The earlier Anubis difference was confined to the active button's transition glow, not artwork or layout. Full radio checks cover playback/audio continuity, favorites, gallery filtering/search, thumbnails, keyboard access, skin persistence, pop-out/return, small screens, and actual close/minimize controls. npm run check and git diff --check are included in final verification.

Preview comparison folder: C:/Users/Sinister/.codex/visualizations/2026/11/03/01a19f35-f5fe-7a53-be7e-17a3b74d1da1/radio-fantasy-production-20261112.

Commit message: Add Jade Serpent, Phoenix, and Anubis Colt Radio skins
