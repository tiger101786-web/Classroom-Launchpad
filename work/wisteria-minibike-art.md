# Wisteria shelf, Doma, Mufasa and minibike track

Statues are the supplied transparent PNGs copied byte-for-byte; originals retain their resolution, colors and alpha. Doma is in Anime and Mufasa is in Disney.

Assets:
- assets/collectible-shelf-demon-slayer-wisteria.png — built-in image-generation background extraction from the supplied shelf.
- assets/shelf-anime-doma-bust.png — original supplied PNG.
- assets/shelf-disney-mufasa-bust.png — original supplied PNG.
- assets/launchpad-scene-minibike-track.png — built-in image generation, track setting and final sun placement.
- assets/scene-frame-match-minibike-track-thin-v2.png — built-in image generation using an existing thin frame as the architecture reference.

Scene and matching frame are categorized as Sports. The frame uses the shared exterior overlay and leaves the scene size unchanged. Sun center measured at (71.1%,14.7%); only its glow and rays animate. Pause and reduced-motion are honored. The full 1448x1086 shelf anchors object bases at y=486 with the shared homepage baseline.

## Final shelf extraction prompt
Use case: background-extraction. Input image 1 is the EDIT TARGET: supplied Demon Slayer wisteria shelf. Remove ONLY the dark studio backdrop surrounding the shelf and in the openings beneath it, replacing it with genuine transparent alpha. Preserve the supplied shelf's exact architecture and finish: wide dark red wood display ledge, black/silver/red sword crest with crimson sun disc, purple hanging wisteria, gold leaves, green-black checkerboard apron, two long hanging supports and downward central ornament. Keep the tabletop empty. Preserve original composition and proportions and all the supports, do not trim canvas, no redesign, no added objects. Transparent PNG with complete shelf, clean edges, no matte or floor.

## Track revision prompt
Use case: precise-object-edit. Input image is EDIT TARGET. User correction: change this scene to a MINIBIKE RACING TRACK. Remove the entire workshop/shop, all buildings, garage, hanging lamps, tools, barrels and cabin props. Replace the background with a broad clearly visible groomed dirt minibike circuit with winding hairpin turns, banked berms, low jumps, track fencing, tire barriers and modest black-and-white checkered track flags. Beautiful golden sunset, green wooded hills beyond track. Keep all four reference-inspired blue purple green yellow compact fat-tire minibikes with black seats and exposed engines. Arrange the entire bikes and both wheels naturally on the track staging area WITHIN the center 75% of square, slightly smaller than existing so a circular display won't cut them off. Cinematic richly detailed painted scene. Full-bleed square, no circular border or matte, no frame, no letters or logos. It must read clearly as a racing track landscape, not a forest trail or shop.

## Sun placement prompt
Use case: precise-object-edit. Input image is EDIT TARGET. Single targeted change: move the sun disc and its surrounding rays LEFT from far-right edge to position x=75% of square width, y=20% of height, above the forested horizon. This scene displays in a circle; the sun must be clearly visible inside the circle. Make one visible warm luminous sunset sun disc there; remove old sun at far right and integrate its old area into ordinary sunset clouds. Keep all four minibikes, track, berms, fencing, checkered flags, mechanical detail, entire composition and other artwork unchanged. No shop/buildings. Full-bleed square unchanged. No frame or black matte.

## Final thin frame prompt
Use case: style-transfer. Asset type: very thin transparent circular MINIBIKE RACING TRACK decorative scene frame. Input image 1 is STRUCTURE AND THICKNESS REFERENCE: match its huge centered opening and thin rim exactly. Input image 2 is THEME REFERENCE ONLY; its bulky rim and big flags are rejected. Create the minibike-themed variant of image1: narrow polished steel rim with subtle knobby tire tread inlay, tiny silver chain links integrated into the same narrow rim, cobalt blue purple emerald and yellow enamel/tubular segments. Replace the top crest with TWO TINY checkered flag accents lying along the ring, no large flags. Absolutely match input1 thin architecture: entire ring no thicker than 4% of square canvas width, perfectly circular empty opening diameter90% of square canvas centered50%50%. Keep all material and decorative detail in that extremely narrow ring, no ornament hanging into opening. Genuinely transparent alpha center and exterior, no background or scene, no text, no opaque white outline. Fine premium sculpted detail, straight-on front, square canvas, full rim visible.

