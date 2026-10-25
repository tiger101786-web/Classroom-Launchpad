# Roblox Buddy

Production pet adapted from the approved local Roblox preview. Includes the original chest logo, live facial expressions, rigid arm animation, look-around, sleep/wake, music headphones/notes, speech, smooth beveled platform and matching editable nameplate with yellow accents.

`interactive.js` exposes `robloxDefaults` and `createRobloxPet`, using the shared companion controller contract. SVG IDs and CSS are namespaced to avoid collisions with other pets. Pet Studio owns settings and account persistence; dragging uses a per-account local position. The local preview remains separate and excluded from Git.

Run `node work/verify-roblox-production.cjs` with Playwright available to test the production integration using an isolated temporary database.

## Outfits

`skins.js` shares the Classic, Classic Guest, Builder, Bacon Hair, and Knight catalog with the server. Fitted SVG clothing attaches to the existing torso, legs, and arm layers. The hard hat, bacon hair, and knight helmet are independent headwear; music temporarily replaces them with headphones. Skin changes choose matching headwear unless the user has mixed in another item.

`work/roblox-skins-preview.html` uses the real production renderer without saving account changes. Run `node work/render-roblox-skins.cjs` to regenerate gallery thumbnails from those actual outfits.
