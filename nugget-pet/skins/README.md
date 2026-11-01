# Nugget flavor materials

Generated with the built-in image-generation tool. Spicy, Buffalo, BBQ, Garlic Parm, Honey Mustard, Extra Crispy, Teriyaki Sesame, Ranch and Burnt use dedicated native-resolution photographic character layers instead of multiplying two breading textures. See [reference-skins-v4.md](reference-skins-v4.md) for the latest Buffalo/Extra Crispy/Burnt replacements, new Ranch skin, arm correction, prompts and validation. Earlier sources are documented in [photo-skins-v2.md](photo-skins-v2.md) and [reference-skins-v3.md](reference-skins-v3.md). Matching dips use their material atlases; Ranch has a dedicated herbed ranch dip texture. The bowl, basket, deli paper and nameplate remain unchanged.

The runtime samples the top 65% and bottom 79–99% of each atlas, avoiding the generated transition. Coated layers retain the source image dimensions; the pet renders at 2048×2048. Only gallery thumbnails use smaller images. Coating work yields between scanline groups and caches a bounded number of full-size layer sets. Latest-selection tokens prevent stale image loads from replacing a newer choice.

## Flavors and dips

- **Spicy** — [spicy-material.png](spicy-material.png); dip: Chili sauce.
- **Buffalo** — [buffalo-material.png](buffalo-material.png); dip: Buffalo sauce.
- **BBQ** — [bbq-material.png](bbq-material.png); dip: Smoky BBQ.
- **Garlic Parm** — [garlic-parm-material.png](garlic-parm-material.png); dip: Garlic parmesan.
- **Honey Mustard** — [honey-mustard-material.png](honey-mustard-material.png); dip: Honey mustard.
- **Extra Crispy** — [extra-crispy-material.png](extra-crispy-material.png); dip: Toasted butter pepper.
- **Burnt** — [burnt-material.png](burnt-material.png); dip: Charred-pepper BBQ.

## Final prompts and generated sources

### Spicy

Source: exec-9570358a-7583-4506-bcea-fbe3a7f1bfde.png

Use case: stylized-concept. Asset type: high-resolution photorealistic food material atlas for an existing animated chicken nugget. Generate a square image filled edge-to-edge, no transparency, no text, no labels, no border, no plates or bowls, no whole nugget silhouette, no face, no props, no background. This is a technical texture map, not a presentation. TWO horizontal regions with a precise straight transition at 75% of image height: TOP 75% is a close-up evenly distributed surface texture of deep brick-red cayenne dry rub on rugged fried chicken breading, paprika powder, tiny red chili flakes, toasted gold crumbs peeking through, scattered dark pepper flecks. BOTTOM 25% is an uninterrupted close-up surface texture of glossy deep red chili dipping sauce with very fine chili flecks. Both regions shot straight overhead, uniform scale, sharp macro texture across the entire image, neutral diffuse lighting, realistic food highlights, no depth of field blur. Keep all surface features small enough that dozens of crumbs fit across the top width. Top should be physically convincing coated fried breading with relief and fine details, not a flat color. Bottom should be visibly smoother liquid sauce with subtle swirls. No dividing stripe, margins or gaps.

### Buffalo

Source: exec-732a4550-498f-475b-8e7f-1b21e2480189.png

Use case: stylized-concept. Asset type: high-resolution photorealistic food material atlas for an existing animated chicken nugget. Generate a square image filled edge-to-edge, no transparency, no text, no labels, no border, no plates or bowls, no whole nugget silhouette, no face, no props, no background. This is a technical texture map, not a presentation. TWO horizontal regions with a precise straight transition at 75% of image height: TOP 75% is a close-up evenly distributed surface texture of rich vivid burnt-orange buffalo butter sauce clinging to craggy chicken breading, silky glossy glaze gathered in tiny valleys, small golden crispy exposed peaks. BOTTOM 25% is an uninterrupted close-up surface texture of smooth glossy orange buffalo sauce with subtle buttery swirls. Both regions shot straight overhead, uniform scale, sharp macro texture across the entire image, neutral diffuse lighting, realistic food highlights, no depth of field blur. Keep all surface features small enough that dozens of crumbs fit across the top width. Top should be physically convincing coated fried breading with relief and fine details, not a flat color. Bottom should be visibly smoother liquid sauce with subtle swirls. No dividing stripe, margins or gaps.

### BBQ

Source: exec-6aa9825c-4bd0-45d5-99dc-093355869b81.png

Use case: stylized-concept. Asset type: high-resolution photorealistic food material atlas for an existing animated chicken nugget. Generate a square image filled edge-to-edge, no transparency, no text, no labels, no border, no plates or bowls, no whole nugget silhouette, no face, no props, no background. This is a technical texture map, not a presentation. TWO horizontal regions with a precise straight transition at 75% of image height: TOP 75% is a close-up evenly distributed surface texture of dark reddish mahogany barbecue glaze on crispy breaded chicken, sticky lacquered highlights, caramelized ridges and tiny char specks; brown-red not black. BOTTOM 25% is an uninterrupted close-up surface texture of thick glossy mahogany barbecue sauce, smooth swirls and subtle smoky seasoning. Both regions shot straight overhead, uniform scale, sharp macro texture across the entire image, neutral diffuse lighting, realistic food highlights, no depth of field blur. Keep all surface features small enough that dozens of crumbs fit across the top width. Top should be physically convincing coated fried breading with relief and fine details, not a flat color. Bottom should be visibly smoother liquid sauce with subtle swirls. No dividing stripe, margins or gaps.

### Garlic Parm

Source: exec-e66ed676-90c0-46fa-bb2d-ae7da41eae6f.png

Use case: stylized-concept. Asset type: high-resolution photorealistic food material atlas for an existing animated chicken nugget. Generate a square image filled edge-to-edge, no transparency, no text, no labels, no border, no plates or bowls, no whole nugget silhouette, no face, no props, no background. This is a technical texture map, not a presentation. TWO horizontal regions with a precise straight transition at 75% of image height: TOP 75% is a close-up evenly distributed surface texture of creamy golden garlic-butter coated crispy breading with many finely grated ivory parmesan shavings, small toasted minced garlic pieces, sparsely scattered little green parsley flecks; pale golden cream rather than orange. BOTTOM 25% is an uninterrupted close-up surface texture of ivory creamy garlic parmesan dip with fine parmesan grains and tiny green parsley flecks. Both regions shot straight overhead, uniform scale, sharp macro texture across the entire image, neutral diffuse lighting, realistic food highlights, no depth of field blur. Keep all surface features small enough that dozens of crumbs fit across the top width. Top should be physically convincing coated fried breading with relief and fine details, not a flat color. Bottom should be visibly smoother liquid sauce with subtle swirls. No dividing stripe, margins or gaps.

### Honey Mustard

Source: exec-c5f37d8e-01bf-4b7a-b0e8-41b6ccdba9ff.png

Use case: stylized-concept. Asset type: high-resolution photorealistic food material atlas for an existing animated chicken nugget. Generate a square image filled edge-to-edge, no transparency, no text, no labels, no border, no plates or bowls, no whole nugget silhouette, no face, no props, no background. This is a technical texture map, not a presentation. TWO horizontal regions with a precise straight transition at 75% of image height: TOP 75% is a close-up evenly distributed surface texture of warm golden ochre honey mustard glaze over textured crispy chicken breading, glossy honey ribbons, tiny mustard seed flecks, pale golden highlights; yellow gold rather than orange. BOTTOM 25% is an uninterrupted close-up surface texture of silky golden-yellow honey mustard sauce, delicate honey swirls and fine mustard seed specks. Both regions shot straight overhead, uniform scale, sharp macro texture across the entire image, neutral diffuse lighting, realistic food highlights, no depth of field blur. Keep all surface features small enough that dozens of crumbs fit across the top width. Top should be physically convincing coated fried breading with relief and fine details, not a flat color. Bottom should be visibly smoother liquid sauce with subtle swirls. No dividing stripe, margins or gaps.

### Extra Crispy

Source: exec-a2bb69fb-e446-4582-aaec-fd04f47e09aa.png

Use case: stylized-concept. Asset type: high-resolution photorealistic food material atlas for an existing animated chicken nugget. Generate a square image filled edge-to-edge, no transparency, no text, no labels, no border, no plates or bowls, no whole nugget silhouette, no face, no props, no background. This is a technical texture map, not a presentation. TWO horizontal regions with a precise straight transition at 75% of image height: TOP 75% is a close-up evenly distributed surface texture of deep golden amber double-breaded fried chicken crust, highly detailed chunky jagged panko flakes, bubbled crispy ridges and caramelized toasted brown crumb tips, matte dry crunch with restrained oil sheen. BOTTOM 25% is an uninterrupted close-up surface texture of warm golden-brown toasted butter pepper dipping sauce with tiny toasted crumb flecks. Both regions shot straight overhead, uniform scale, sharp macro texture across the entire image, neutral diffuse lighting, realistic food highlights, no depth of field blur. Keep all surface features small enough that dozens of crumbs fit across the top width. Top should be physically convincing coated fried breading with relief and fine details, not a flat color. Bottom should be visibly smoother liquid sauce with subtle swirls. No dividing stripe, margins or gaps.

### Burnt

Source: exec-34ea0db5-5c3a-4049-8f7d-74bac46f0f65.png

Use case: stylized-concept. Asset type: high-resolution photorealistic food material atlas for an existing animated chicken nugget. Generate a square image filled edge-to-edge, no transparency, no text, no labels, no border, no plates or bowls, no whole nugget silhouette, no face, no props, no background. This is a technical texture map, not a presentation. TWO horizontal regions with a precise straight transition at 75% of image height: TOP 75% is a close-up evenly distributed surface texture of very dark toasted charcoal-brown fried chicken breading, cracked blackened crust peaks with deep umber and occasional copper-brown fissures, realistic dry char texture; retain readable detailed relief, not a flat black surface. BOTTOM 25% is an uninterrupted close-up surface texture of dark smoky charred-pepper barbecue dip with glossy espresso-brown swirls and black pepper flecks. Both regions shot straight overhead, uniform scale, sharp macro texture across the entire image, neutral diffuse lighting, realistic food highlights, no depth of field blur. Keep all surface features small enough that dozens of crumbs fit across the top width. Top should be physically convincing coated fried breading with relief and fine details, not a flat color. Bottom should be visibly smoother liquid sauce with subtle swirls. No dividing stripe, margins or gaps.

## Verification

work/verify-nugget-skins.cjs checks all flavor animations, full-resolution rendering, exact original body alpha, unchanged pixels outside the dip region, and seven distinct dip colors. work/verify-nugget-production.cjs checks skin selection/persistence and gallery thumbnails in Pet Studio, alongside all existing Nugget controls.
