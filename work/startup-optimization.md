# First startup optimization pass

The homepage uses a lossless WebP title image and defers eight unselected pet renderer bundles and their styles until needed. No artwork, saved preference formats, animations, or API routes were changed. The original PNG is retained as the picture fallback; the preload matches the WebP source to avoid downloading both images.

## Loading behavior

- The existing small Squishy/Dumpling setup and shared accessory helpers remain part of the picker bridge. They are needed to initialize its existing controls; this pass does not rebuild that bridge.
- Guests download no deferred species bundles. After preferences load, only the equipped species is requested.
- Pet Studio prepares the remaining existing controllers on first open, then uses the same live hosts. Reopening does not download or mount duplicates.
- Styles are inserted at their original markers to preserve cascade order. Each species loads scripts in dependency order; different species can prepare concurrently.
- Latest visibility/account state is applied when a delayed load completes. Logout during download does not reveal the previous account's pet.
- Failed files can be retried. The selected pet shows a compact retry message; Studio uses its existing retry handling.
- Speech listeners bind after their pet exists, preserving chat mouth animations. The approved Colt accessory extension installs after its deferred base accessory function exists.

## File-size evidence

See `startup-loading-budget.json` for the exact raw-file counts against baseline commit `2e76274`. These are file sizes and HTML references, not a measured load-time percentage.

- Initial static script tags: 42 to 21. Script source bytes: 1,552,165 to 1,250,868 before compression and separately requested equipped-pet files.
- Initial stylesheet links: 22 to 14. Stylesheet source bytes: 621,851 to 568,257.
- Logo: 1,542,239 to 1,137,816 bytes, about 26.2% smaller. Resolution and every decoded RGBA pixel match; the source PNG remains unchanged.

## Verification

Passed: `npm run check`, `work/verify-startup-loading.cjs`, `work/verify-shared-startup.cjs`, `work/verify-pet-studio-production.cjs`, `work/verify-pet-talk.cjs`, and `work/verify-companion-picker.js`.

The new startup test covers guest and saved Colt/Nugget/Eagle/Highland/Dumpling sessions, absent unselected species requests, one logo download, all nine Studio previews, deduplicated reopening, failed-script retry, and logout during a delayed load. Existing suites cover teacher/student isolation and persistence, skins/accessories, names, undo, dancing, sleep/wake, mobile layouts, chat mouth movement, and reduced motion. No live service changes or deployment were performed.

Rebuild the lossless logo with `work/optimize-homepage-title.py` (Pillow), which asserts exact decoded pixels and preserved original bytes. Run startup regressions with `npm run test:startup` in an environment with Playwright available.

Commit message: `Speed up startup with on-demand pet bundles and a lossless logo`
