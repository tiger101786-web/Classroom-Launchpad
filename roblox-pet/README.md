# Roblox Buddy

Production pet adapted from the approved local Roblox preview. Includes the original chest logo, live facial expressions, rigid arm animation, look-around, sleep/wake, music headphones/notes, speech, smooth beveled platform and matching editable nameplate with yellow accents.

`interactive.js` exposes `robloxDefaults` and `createRobloxPet`, using the shared companion controller contract. SVG IDs and CSS are namespaced to avoid collisions with other pets. Pet Studio owns settings and account persistence; dragging uses a per-account local position. The local preview remains separate and excluded from Git.

Run `node work/verify-roblox-production.cjs` with Playwright available to test the production integration using an isolated temporary database.
