# KISS Starlight Arena

Adds the approved KISS-inspired skin to the Music gallery, with stage flames, chrome lightning trusses, leather and studded rails, silver armor, and star-painted rocker Colt. Both portrait frames use the separately fitted portrait from the approved preview. Full-resolution PNGs are copied unchanged; artwork hashes and generation prompts are in radio-kiss-artwork.json.

Uses the existing radio controls, saved skin setting, lazy asset loading and gallery. Cache versions are refreshed through the existing loading chain. Gallery thumbnails are captured from the actual player.

Commit message: Add KISS Starlight Arena Colt Radio skin

Production desktop (414x786) and mobile (374x769) screenshots match the approved fitted preview with zero differing color channels. Both installed PNGs match the approved source hashes.

Validation passed: npm run test:radio (reliability, all 41 skins, day/night gallery, mobile and short viewports, playback continuity, close/minimize, persistence, keyboard, pop-out and favorites), npm run check, and git diff --check.
