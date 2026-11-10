# Thanksgiving Turkey Robo-Colt skin

## Matching platform and mouth cleanup

Current production assets: `parts-turkey-v6.png`, `platform-turkey-v2.png`, and `nameplate-turkey-v2.png`. All three were edited with the built-in image tool, preserving transparency and existing canvas proportions. The atlas retains the v5 registration and animation rig. The gallery thumbnail and review image were refreshed from the live renderer. Build and turkey browser checks passed, including greeting, dance, tail movement, sleep, saving/reloading, and switching back to Original.

Final atlas prompt: Remove only the thin baked horizontal mouth line at the lower blue muzzle, replacing it seamlessly with smooth blue-silver shading. Preserve nostrils, muzzle silhouette, all four separate component positions, colors, outlines, empty eye sockets, feather fan, red wattle and transparency. The live animated mouth remains.

Final platform prompt: Preserve the existing squat wide silhouette, elliptical perspective, transparent margins and centered medallion. Match the new turkey skin with smooth warm bronze top and edging, a cream inset ring, restrained glossy red accents, and neatly sculpted chestnut feather panels with cream tips and subtle barb texture. Use a bronze diamond medallion with crimson enamel and a feather motif. No text, character, floor or shadow.

Final nameplate prompt: Preserve the original chamfered silhouette, proportions, margins and clear center for live lettering. Match the turkey skin using polished bronze framing, ivory cream trim, glossy red accents and orderly chestnut feather details with cream tips. Use concentric bronze joint bolts with cream rings and red centers at both ends. Keep the dark chestnut-bronze center blank and opaque; preserve transparency outside. No baked text.

## November 9 clean armor revision

Current asset: `parts-turkey-v5.png` (1254 × 1254, transparent), generated with the built-in image tool using the previous turkey atlas as the layout target, `parts-v1.png` as the mechanical model reference, and the supplied turkey preview as the material reference. Earlier revisions below describe the retained v4 asset.

Final prompt: Make a production transparent four-part animation atlas in the exact existing layout: seated body without front legs at upper left, isolated front legs at upper right and lower left, detached upright turkey fan at lower right. Preserve Robo-Colt's mechanical geometry, pointed ears, horse muzzle, plate seams and neutral mouth. Paint pale blue metal face plates, red cheek panels and inner ears, feather-textured bronze armor, cream joint rings, red hooves, and a larger three-lobed red wattle. Keep both sockets empty for live animated eyes. Keep all pieces separate and preserve transparency. Render the brown tail fan with cream tips and fine feather barbs. No platform, lettering, background or assembled character.

The shared skin painter registers each part independently and retains the existing leg, hoof, ear, head, eye and tail animation groups. Socket centers were measured from the new atlas and registered at (266,277) and (452,277). The fan is 10% larger than v4 while retaining its root pivot and gentle sway. Complementary head/torso clips keep the entire enlarged wattle attached to the moving head and restore the original clips when switching away. The gallery thumbnail is captured from the live renderer; the review image is `work/pet-studio-assets/colt-thanksgiving-turkey-preview.png`.

Validation: build and turkey browser checks cover asset selection, eye alignment, wattle clipping, tail animation, greeting, dancing, sleep, persistence and restoration of Original.

Asset: `parts-turkey-v4.png`, full-resolution transparent 1254 × 1254 PNG, generated with the built-in image tool from `parts-v1.png`.

Final prompt direction: Preserve Robo-Colt horse anatomy, muzzle, pointed ears, joint segmentation, four-part atlas layout, empty eye sockets, and neutral mouth. Repaint surfaces with realistic charcoal turkey feathers, natural bronze/green iridescence, cream-and-black barring, pale blue facial skin, crimson caruncles, gray scaly hooves, and a swept cream-tipped turkey-feather tail. Keep actual transparency; no props, text, platform, or background.

Each component is registered independently to the original atlas bounds. Existing animation pivots and accessory layers are retained. The skin is categorized as Seasonal and allowed in saved server preferences.

Validation: `work/verify-turkey-skin.cjs` checks production Studio selection, server persistence, reload, greeting, dance, sleep, and browser errors.

Revision: Remove all forehead and side mane feathers, replace with bare blue/red turkey skin, retain horse ears. Generate an upright broad natural turkey feather fan; render it behind the body at its own aspect ratio, independent of the original narrow tail registration. Use round brown irises with black round pupils and no glow, retaining live blink/sleep groups. Switching skins restores the original tail size and pupil geometry.

Final direction retains the original horse muzzle and ears; the beaked head experiment is excluded. Fan expanded to 850 viewBox units with a root pivot at (365,640). Turkey-only tail animation uses a gentle 3-degree sway and reduced flex, retaining the shared wag/dance rig. Tests verify animated fan keyframes and restoration of original tail/eyes when switching skins.

Turkey platform and nameplate: generated with the built-in image tool as transparent full-resolution replacements based on platform-v1.png and nameplate-bolts-v1.png. Final prompts preserve the original silhouettes, perspective, and transparent margins; dress structural borders in realistic charcoal/bronze turkey feathers with cream barring, thin aged copper trim, and muted cranberry accents. Platform has a clear walnut sitting surface and feather medallion. Nameplate retains a blank walnut center for live editable lettering and feather rosettes at its ends. Assets: platform-turkey-v1.png and nameplate-turkey-v1.png. Only the Thanksgiving Turkey skin selects these assets; switching skins restores the original art. Browser test checks both asset delivery and restoration.

Final localized wattle edit: retain a full red throat under the horse muzzle, shorten lower folds to end around atlas y505, restore charcoal chest feathers below. Preserve ears, face, component placement, and transparency. Built-in image tool used; shipped atlas parts-turkey-v4.png. Turkey skin hides the dark neck filler during dance to keep the red throat visible.
