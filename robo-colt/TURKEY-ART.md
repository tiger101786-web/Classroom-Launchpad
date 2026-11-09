# Thanksgiving Turkey Robo-Colt skin

Asset: `parts-turkey-v4.png`, full-resolution transparent 1254 × 1254 PNG, generated with the built-in image tool from `parts-v1.png`.

Final prompt direction: Preserve Robo-Colt horse anatomy, muzzle, pointed ears, joint segmentation, four-part atlas layout, empty eye sockets, and neutral mouth. Repaint surfaces with realistic charcoal turkey feathers, natural bronze/green iridescence, cream-and-black barring, pale blue facial skin, crimson caruncles, gray scaly hooves, and a swept cream-tipped turkey-feather tail. Keep actual transparency; no props, text, platform, or background.

Each component is registered independently to the original atlas bounds. Existing animation pivots and accessory layers are retained. The skin is categorized as Seasonal and allowed in saved server preferences.

Validation: `work/verify-turkey-skin.cjs` checks production Studio selection, server persistence, reload, greeting, dance, sleep, and browser errors.

Revision: Remove all forehead and side mane feathers, replace with bare blue/red turkey skin, retain horse ears. Generate an upright broad natural turkey feather fan; render it behind the body at its own aspect ratio, independent of the original narrow tail registration. Use round brown irises with black round pupils and no glow, retaining live blink/sleep groups. Switching skins restores the original tail size and pupil geometry.

Final direction retains the original horse muzzle and ears; the beaked head experiment is excluded. Fan expanded to 850 viewBox units with a root pivot at (365,640). Turkey-only tail animation uses a gentle 3-degree sway and reduced flex, retaining the shared wag/dance rig. Tests verify animated fan keyframes and restoration of original tail/eyes when switching skins.

Turkey platform and nameplate: generated with the built-in image tool as transparent full-resolution replacements based on platform-v1.png and nameplate-bolts-v1.png. Final prompts preserve the original silhouettes, perspective, and transparent margins; dress structural borders in realistic charcoal/bronze turkey feathers with cream barring, thin aged copper trim, and muted cranberry accents. Platform has a clear walnut sitting surface and feather medallion. Nameplate retains a blank walnut center for live editable lettering and feather rosettes at its ends. Assets: platform-turkey-v1.png and nameplate-turkey-v1.png. Only the Thanksgiving Turkey skin selects these assets; switching skins restores the original art. Browser test checks both asset delivery and restoration.

Final localized wattle edit: retain a full red throat under the horse muzzle, shorten lower folds to end around atlas y505, restore charcoal chest feathers below. Preserve ears, face, component placement, and transparency. Built-in image tool used; shipped atlas parts-turkey-v4.png. Turkey skin hides the dark neck filler during dance to keep the red throat visible.
