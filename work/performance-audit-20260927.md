# Conservative performance audit — September 27, 2026

## Implemented

Scene and scene-frame chooser thumbnails now receive their image URLs only when their page or search result becomes visible. Already-loaded images remain available when returning to a page. The selected-scene preview and homepage frame still load normally. Original images, animation settings, saved IDs and server behavior are unchanged.

## Measured result

Local Chrome, 1200 × 900 viewport, cold scene-frame picker with original scene and no frame selected, compared against the committed version before this change:

| Metric | Before | After |
| --- | ---: | ---: |
| Unique requested PNGs | 21 | 5 |
| Combined source bytes for those images | 28,549,436 | 6,850,575 |

Approximately 76% fewer requested image bytes for that picker opening. This measures local requested asset sizes, not production timing or whole-site bandwidth. Other saved choices and viewport sizes may differ.

## Existing optimizations retained

- Static gzip compression, cache headers, ETags and conditional responses.
- Video byte-range responses.
- Intersection-based deferred video loading and responsive desktop/mobile video selection.
- Paginated pickers and moderation lists.
- Existing lazy image loading in several profile controls.

## Follow-up opportunities, not changed

- app.js is approximately 665 KB uncompressed; styles.css approximately 313 KB. Splitting feature code could improve initial loading but requires broad navigation and authentication regression testing.
- Several optional game/video assets are 10–21 MB. Their size alone does not mean they load on the homepage. Profile actual production network requests before re-encoding or removing any assets.
- Responsive image variants could reduce thumbnail payloads further. Keep full-quality originals and visually verify transparency and small-avatar detail before switching formats.
- Do not delete seemingly unused artwork automatically: persisted student choices may still reference it.

## Verification

- All root JavaScript files passed syntax checks.
- Before/after picker network-request test; visible images decode after changing pages.
- Scene and frame pagination, search, clearing, empty results and selection retention at desktop/mobile widths.
- Profile frame and banner page/selection checks.
- Moderation sections and nested pagination checks in light/dark and desktop/mobile layouts.
- git diff --check passed.

No production deployment, database changes, dependency upgrades, asset deletion, image/video re-encoding, or full authenticated production load test was performed.
