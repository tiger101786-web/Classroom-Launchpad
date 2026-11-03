# Rebuilt Colt Radio artwork

All twelve themed choices now use rebuilt background plates with the original functional player controls. Original remains unchanged. Sources are kept for provenance, while runtime backgrounds use the new layout and header PNG files.

The built-in image-generation tool removed baked controls and adapted each reference to leave room for live station tiles, playback and text. The generation prompt asked to preserve the theme, horse identity, colors, lighting, borders and lower scenery; retain only the header title; leave dark thematic space for real controls; avoid duplicate buttons, rectangular black text insets and margins. Arctic, Pirate and Rock Stage additionally received wide headers with safe margins around the title, underline and horse.

Generated PNGs were copied directly at native resolution, without downsampling or lossy compression. Background sizing uses uniform scaling. These are redesigned assets, not pixel-identical copies of the original references.

Track text uses shadow over the artwork, with a transparent background. Per-theme offsets position the playback scenery. Existing player size, gear menu, station catalog and playback code are retained.

Verification uses work/verify-radio-expanded-skins.cjs for all twelve themes, four viewport sizes, player dimensions, transparent text panels, playback continuity, saved selection, Original reset and floating controls. Audio calls are simulated for deterministic verification. Browser screenshots are stored outside the repository.
