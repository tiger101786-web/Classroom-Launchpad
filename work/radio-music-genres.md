# Colt Radio music genre skins

Four locally implemented skins: Country Music, Heavy Metal, Jazz Club and DJ Club. Previews are screenshots of the real working player; they use the same assets and controls as the implementation.

Final artwork saved in:

- `C:/Users/Sinister/Documents/GitHub/Classroom-Launchpad/assets/radio-skins/illustrated/country-atlas.png`
- `C:/Users/Sinister/Documents/GitHub/Classroom-Launchpad/assets/radio-skins/illustrated/metal-atlas.png`
- `C:/Users/Sinister/Documents/GitHub/Classroom-Launchpad/assets/radio-skins/illustrated/jazz-atlas.png`
- `C:/Users/Sinister/Documents/GitHub/Classroom-Launchpad/assets/radio-skins/illustrated/djclub-atlas.png`

Each atlas supplies a full 3:1 scene header, a horse-free material band with illustrated side rails, and one complete Colt portrait. Proportional CSS crops use that portrait in the header and now-playing box without stretching. Header windows are 80 by 88 pixels on desktop and 72 by 80 on mobile, reducing to 68 by 76 only on the narrowest screens. No pet or other website features were modified.

## Final artwork prompt set

Tool: built-in ImageGen. Four independent redesigns using each prior atlas as its reference, retaining the three-region atlas structure. Original generated files remain in the Codex generated_images folder; selected final assets are copied into the repository.

Common prompt:

> Redesign this Colt Radio production artwork atlas. Preserve the SQUARE format and exact THREE REGIONS: top 0-33% scenic header with no horse; middle 33-56% blank material panel with detailed narrow side rails but no horse; bottom 56-100% ONE large horse mascot head-and-shoulders portrait centered horizontally. Keep lower portrait entirely below y56%, full hat/ears/muzzle, no clipped head, no hands. Replace the reused same face/long flowing hair: design a DISTINCT horse character with new facial expression, head shape, mane styling and wardrobe for this genre. Recognizable polished illustrated anthropomorphic horse mascot, familiar three-quarter portrait oriented RIGHT. Rich premium illustrated game UI, sharp intricate material details, school appropriate. Top header leaves dark readable space in upper center for actual website title/buttons. NO TEXT, no logos, no UI, no second horse.

Genre-specific production instructions:

- Country Honky-Tonk Festival: open barn stage looking onto golden sunset prairie; turquoise/amber stained-glass starburst, rope string bulbs, carved western floral leather, turquoise conchos, guitars, wagon wheel, wheat and sunset reflections. Middle rails: braided rope, carved leather, conchos, star studs and amber bulbs. Golden buckskin palomino Colt with creamy muzzle, small white forehead star, short swept flaxen forelock and braided side mane, broad tooth-showing grin and raised chin. Teal-trimmed ivory cowboy hat, feather/concho, burnt-orange fringed vest, cream/teal embroidered shirt, turquoise bolo. Keep the complete wide hat visible.
- Heavy Metal Arena: black steel, rivets, guitars, speaker stacks, red/orange stage flames and decorated steel/flame rails. Charcoal Colt with angular cheekbones, white lightning-shaped forehead blaze, red swept-up spiky rock mane, open rockstar grin, energetic head tilt. Studded black jacket, metallic red lapels, layered silver chains, chrome ear cuff, crimson shirt and ember rim lighting. No long flowing hair, skulls, gore or frightening face.
- Jazz Club Art Deco: mahogany club, brass lamps, saxophones, piano, double bass, burgundy curtains, saxophone-key rails. Mature espresso Colt with elegant muzzle, relaxed hazel eyes, gentle knowing half-smile, short slicked-back mane and silver temples. Tilted narrow porkpie hat, ivory dinner jacket, brass/gold embroidered lapels, burgundy waistcoat, cream shirt, black bowtie and brass tie pin. Soft amber highlights. No long mane, drinks or smoking.
- DJ Club LED Dance Floor: purple/cyan lasers, speakers, turntables, mixer and equalizer/fader rails. Youthful cobalt Colt with silver-blue muzzle, cyan dapples, short violet side-swept undercut, transparent cyan visor glasses, silver/black cyan-ring headphones, high-collar iridescent purple/black techwear with cyan seams. Excited open smile, raised eyebrow and listening head tilt. No long mane, hat, gold chain or hands.

## Validation

Passed `work/verify-approved-radio-skins.cjs`: twelve choices; both selected-theme portraits and real illustrated side artwork; desktop geometry; large header portrait windows; mobile viewports; scrollable skin menu fit and gear toggle; actual close/minimize; saved selection and keyboard selection; audio continuity; favorites; pop-out and return. Media playback is stubbed to validate controls without depending on external streams. Syntax checks and `git diff --check` also pass.

The longer menu now uses available space above or below its gear and scrolls so a second gear click remains possible. Existing hidden-state close/minimize fix is preserved.

Final browser screenshot directory:
`C:/Users/Sinister/.codex/visualizations/2026/11/03/01a19f35-f5fe-7a53-be7e-17a3b74d1da1/music-genres-20261104`.

Commit message: `Add four distinctive music-themed Colt Radio skins and larger portraits`
