# Retro Diner and Bacon Cheddar

Retro Diner is an optional device-local Studio theme. Choose it from the existing Studio theme menu; Crimson remains the default. Real interface controls overlay the generated scenery. The control panel and footer have opaque cream surfaces with no gap, keeping the table and its props behind the selector. The desktop companion group is centered inside the chrome header independently of the close button. Mobile uses a stacked layout.

Bacon Cheddar is registered in the shared Nugget skin catalog with a matching dip. It uses the established photographic layer and animation pipeline. Generated masters were copied at native resolution without resizing; gallery thumbnails use the existing thumbnail pipeline.

## Assets and sources

- `assets/pet-studio/diner-dashboard-frame.png`: generated from the user's Retro Diner Pet Studio Interface.png.
- `nugget-pet/skins/bacon-cheddar-character-v2.png`: generated from Screenshot 2026-11-01 at 15-32-01 Nugget Skin Ideas.png, with facial features removed for the existing animated face.
- `nugget-pet/skins/bacon-cheddar-material.png`: generated matching cheddar and bacon dip material.

## Image-generation prompts

### diner-shell

Edit this Retro Diner Pet Studio reference into a reusable decorative background plate for a LIVE HTML interface, keeping its same landscape canvas proportions and overall composition. Preserve the highly detailed1950s diner room at the left: red-and-cream vinyl booths, chrome table, checkered floor and wall, window sunset, pendant lamps, jukebox, wall clock and framed food art. Preserve the large illuminated Pet Studio sign with its exact readable wording, cream script, red neon and checkered accents in the upper-left. Preserve the right panel's rounded chrome/red structural border and cream blank inner surface, the upper-right chrome companion-selector surround as a BLANK cream field, and the diner counter/milkshake/burger/napkin-holder decorative still life in the lower-right foreground. REMOVE every interactive UI element from the image: all tabs, headings, captions, skin count, icons, buttons, dropdown arrow, companion name, eagle portrait, search box, filters, skin card, checkmark and bottom tagline text. Remove the Say Hello and Try Dancing button artwork entirely and fill those areas seamlessly with the diner setting. Right panel interior from roughly x=39% to98%, y=23% to81% must be clean plain softly lit warm cream, with no text or objects, for real controls. The tabs strip near x40–98%, y16–23% must be blank red enamel/chrome with no tab labels or raised fake controls. Header upper-right blank cream surround must have no text or animal. Remove the entire illustrated eagle card. The left-middle pet preview area must have no mascot or placeholders, just the diner booth setting. Keep only the Pet Studio wording in the neon sign, and no other readable words anywhere in the plate. High-resolution polished photoreal diner craftsmanship, not a flat schematic. This is a production background image, not a screenshot of controls.

### bacon-cheddar

Reconstruct this exact bacon cheddar chicken nugget mascot as a high-resolution transparent animation skin. Match the golden crispy breaded body, vivid orange melted cheddar ribbons and thick rounded drips, glossy little pools, and distinct crisp reddish-brown bacon pieces scattered in the same style and density as the reference. Keep a warm exposed golden center where the face is. Preserve the rounded irregular silhouette, two small golden breaded arms, two feet and front-facing pose and proportions. Remove BOTH eyes and mouth completely and fill those tiny areas with continuous matching local cheddar/breading, because animated features are rendered by code. Remove the checkerboard and all background completely to TRUE alpha transparency. No basket, sauce bowl, paper, props, lettering, ground or shadow. Entire faceless mascot fully visible with transparent margin, no cropped limbs, no spike-shaped scraps. Native high-resolution sharp food detail, no texture quality reduction, no noise overlay, no oversharpening or blur. Keep as close as possible to the reference.

### bacon-cheddar-dip

High-resolution photoreal macro closeup of creamy glossy orange melted cheddar dipping sauce with tiny crisp reddish-brown bacon crumbles lightly scattered, subtle smooth liquid swirls, warm soft food-photography light. Fill the whole square edge to edge entirely with sauce. Straight overhead, fine sharp surface detail. No bowl, plate, mascot, breading, objects, text, checkerboard, background, border or divisions. This is a texture sampled into an existing photographed dip cup.

## Verification

- `npm run check`: passed.
- `work/verify-retro-diner.cjs`: passed; all tabs at 1440, 1366, 800 and 390 pixels, opaque panel/footer and zero gap, centered companion group and menu text, theme persistence and account preference isolation, live greeting/dance, Bacon Cheddar selection/save/reload, and return to Crimson.
- `work/verify-studio-style-loading.cjs`: passed; all seven existing styles remain delayed until Studio opens, including retry and logout behavior.
- `work/verify-nugget-photo-skins.cjs "Bacon Cheddar"`: passed; native-resolution layers, transparent edges, resting-foot source pixels, wave/foot movement, extra-large canvas, thumbnails, sleep/dance and legacy skin switching.

Desktop and mobile screenshots were visually inspected. Browser tests use isolated temporary account data.

