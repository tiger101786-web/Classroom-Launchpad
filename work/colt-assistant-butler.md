# Colt Assistant — approved Butler skin

Applied the approved illustrated Butler design to the existing Colt Assistant. The 440x720 desktop rectangle remains in the same position. The title is centered across the illustrated top section, and the input/Send row clears the curved silver rail. Colors follow Launchpad burgundy (#7b0b31, #560720), black, white, and silver. The artwork has no hands or arms and no portrait in the conversation area.

Production assets (copied byte-for-byte from the approved preview):
- C:/Users/Sinister/Documents/GitHub/Classroom-Launchpad/assets/colt-assistant-butler-frame.png
- C:/Users/Sinister/Documents/GitHub/Classroom-Launchpad/assets/colt-assistant-butler-portrait.png

The approved CSS is in colt-assistant-butler.css. index.html loads it and refreshes the assistant script version. colt-assistant.js adds the skin class, uses the lazy-loaded Butler portrait, and builds the decorative Send bell with safe DOM APIs. Mode switching resets only the Send label, preserving the bell. Existing message content, AI requests, gradual text, classroom help, privacy behavior, preferences, and launcher remain unchanged. Pop-out copies the stylesheet through the existing mechanism.

Artwork prompts, hashes, exact source paths, and approved layout coordinates are recorded in colt-assistant-butler-artwork.json. Built-in ImageGen created the art; the saved PNGs have no additional resizing or recompression. The stylesheet matches the approved preview with only production asset URLs and its comment changed.

Verification passed:
- work/verify-colt-assistant.js
- work/verify-colt-assistant-ui.js (updated a stale directions-text assertion to match the existing classroom-directions wording)
- work/verify-colt-assistant-redesign-ui.js (updated portrait and background expectations)
- work/verify-colt-assistant-butler.cjs: desktop 440x720, centered title, composer clearance, 390/320/short viewports, both modes, Send/Enter, clear, icon persistence, pop-out/return with the same panel, and close/reopen.
- npm run check and git diff --check.

The new Butler check is included in npm test. UI tests stub AI responses and do not depend on an external AI provider.

Production screenshots: C:/Users/Sinister/.codex/visualizations/2026/11/03/01a19f35-f5fe-7a53-be7e-17a3b74d1da1/colt-assistant-butler-production-20261113.

Commit message: Add illustrated Colt Butler Assistant skin
