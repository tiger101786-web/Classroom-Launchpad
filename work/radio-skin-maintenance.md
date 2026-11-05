# Maintaining Colt Radio skins

The chooser and browser checks use `radio-skin-definitions.js` as the skin registry. Each entry defines:

- `id` and `label`: stable saved preference and visible menu name.
- `layout`: `original`, `illustrated` (specialized older artwork), or `genre` (shared layout).
- `title`: `plain`, `words` (styled word spans), or `letters` (punk-style letter cutouts).
- `assets`: required artwork checked by the browser suite. Listing assets does not preload them.
- `variables`: shared palette, material, backdrop-band and portrait crop CSS properties.
- `swatch`: menu preview gradient.

For a new genre skin, start with a similar registry entry, choose a unique ID, supply its atlas and adjust the `--genre-*` properties. `--genre-art` points to the atlas; `--genre-band`, `--genre-band-position` and `--genre-portrait` control the existing proportional crops. The shared responsive rules target `data-radio-layout=genre`, so their selectors need no new skin IDs. Additional typography or illustration details can use a skin-specific CSS rule. Older illustrated skins retain their specialized CSS to preserve their appearance.

Returning to Original clears prior skin variables. Changing skins never creates or replaces the audio element. Keep the original source artwork unchanged.

`npm run test:radio` runs the favorites/playback regression checks, all registered skins and the isolated favorites API check. Playwright must be available to Node. The browser tests default to local Edge; set `RADIO_BROWSER_PATH` for another Chromium executable. `PREVIEW_OUTPUT` selects the screenshot folder. `RADIO_ASSET_ROOT` optionally supplies assets when testing a staged source directory. Browser checks simulate audio; verify live playback separately when changing providers or stream handling.

`npm run check` includes both skin scripts. The authenticated API check uses a temporary database, never the classroom database.

## Exact artwork optimization

Production serves `*-lossless.png` copies of the illustrated skin assets. The original PNGs stay unchanged at their existing paths. Copies preserve the original RGB values and dimensions; only PNG compression changes. There is no resizing, palette reduction, sharpening or regenerated artwork.

Run `python work/optimize-radio-artwork.py` with Pillow installed to rebuild the copies and `work/radio-artwork-lossless.json`. The report records source/delivery hashes and byte counts. A changed image mode or metadata requires manual review rather than silently dropping color information.

Run `npm run test:radio-artwork` with the same Playwright/browser setup as the radio suite. It checks all 24 original hashes and browser-decoded image pairs, then compares complete source and delivery player screenshots for all 16 skins at desktop and 320px widths with **zero pixel tolerance**. It also checks that normal skin use requests the optimized files, preserving lazy loading. `PREVIEW_OUTPUT` optionally chooses its screenshot directory.

The current copies reduce the combined delivery artwork from 64,242,224 to 60,562,666 bytes (5.73%). Delivery remains PNG to keep the original format and decoding path. Screenshot comparisons use software rendering to remove GPU rounding noise observed even when comparing the source files with themselves. Exact appearance takes priority over larger savings.
