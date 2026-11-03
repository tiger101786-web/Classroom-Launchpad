# Additional Colt Radio skins

Ten skins were added to the existing production gear menu, alongside Original, Retro Arcade and Neon Graffiti. The same player, controls, station catalog and account favorites remain live. Skin changes do not rebuild or restart the player.

## Supplied artwork

All ten user-supplied PNGs were copied unchanged into `assets/radio-skins/`. The original pixel dimensions and quality are retained. CSS uses the original header art and a dedicated portrait source rectangle, with containment inside the existing portrait frame. Headers fit proportionally within the fixed player header, using equal horizontal and vertical scaling and matching background space when needed. The header artwork is not stretched to fill the available box. Fonts, station tiles and playback controls retain their original geometry. `work/radio-skin-sources.json` records the original source hashes, dimensions and header regions; the browser verification checks those hashes and proportional scaling at each viewport.

Portrait rectangles below use source-pixel x, y, width, height. Arctic excludes the adjacent baked track title while keeping the complete horse face. The other original source files remain the references for each crop.

| Skin | Asset | Native dimensions | Portrait rectangle |
| --- | --- | --- | --- |
| Rock Stage | `rock-stage-reference.png` | 924×1702 | 40, 1250, 350, 300 |
| Bayou Dance Hall | `bayou-reference.png` | 924×1702 | 68, 1230, 208, 230 |
| Arctic Aurora | `arctic-reference.png` | 924×1702 | 24, 1195, 300, 321 |
| Cosmic Voyage | `cosmic-reference.png` | 923×1703 | 50, 1210, 213, 250 |
| Moonlit Sakura | `sakura-reference.png` | 923×1704 | 55, 1145, 222, 219 |
| Industrial Forge | `forge-reference.png` | 924×1702 | 72, 1200, 220, 225 |
| Neon City | `neon-city-reference.png` | 924×1702 | 52, 977, 230, 213 |
| Underwater | `underwater-reference.png` | 923×1703 | 64, 1145, 202, 222 |
| Cyber Samurai | `samurai-reference.png` | 923×1703 | 45, 1166, 218, 227 |
| Pirate Cove | `pirate-reference.png` | 924×1702 | 76, 1166, 238, 297 |

## Prior fixes preserved

- Identical player and control dimensions, full square outer corners and uncropped portrait frames.
- The existing Launchpad Settings gear and compact styled dropdown, with swatches, a selected checkmark, arrow/Home/End/Enter navigation, Escape, outside-click dismissal and a second-gear-click toggle.
- The longer list is scrollable and limited to 296px or the available space above/below the gear. It cannot cover the gear, and the focused selection scrolls into view after the menu is sized.
- Placement after popover opening, resize/scroll handling, delayed stylesheet handling and floating/returned player behavior.
- Clean headphone masks without the old horse glyph; footer notes have opaque backgrounds to avoid baked reference text showing through.
- Saved choices and migration, readable light/dark mode text, unchanged audio/source/volume/favorites, deferred skin code and artwork requested only for the selected skin.

## Verification

- `work/verify-radio-expanded-skins.cjs`: all ten new skins and 13 menu choices; four viewport sizes; exact geometry comparisons with Original; portrait containment/aspect ratios; corners and headphone content; light/dark text; preserved audio calls, volume and favorites; persistence; menu placement/toggling; floating controls; reset to Original.
- `work/verify-radio-skin-menu-position.cjs`: desktop/mobile/short viewport placement, resize and page scroll, delayed CSS, floating/returned controls and repeated toggling. Resize checks wait for the browser to deliver the resize event before measuring.
- `work/verify-radio-skins-neon-studio.cjs`: existing two skins, production lazy loading, saved settings, playback and Studio layout regressions.
- `npm run check`, explicit syntax checks for new code/tests, and `git diff --check`.
- All ten desktop previews were visually inspected; reference artwork and all new cropped portraits were checked. Browser audio calls are simulated to verify no restarts without depending on external station availability. PNG dimensions and byte-for-byte source copies were verified.

Browser screenshots use `PREVIEW_OUTPUT` or temporary storage rather than adding generated screenshots to the repository. No image-generation or lossy compression is used for these supplied assets.

