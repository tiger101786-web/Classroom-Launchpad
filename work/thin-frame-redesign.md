# Decorative scene frame redesign

Scope: all 89 decorative frames, not just Disney/anime. User approved proceeding through the full collection. Preserve scene size and proportions relative to No Frame. Do not modify the original scene images or move shelves.

Rejected experiment: CSS masking the original thick frames left clipped fragments and lost their design. Experiment removed; not shipped.

Built-in image_gen sample: `assets/scene-frame-match-disney-adventure-falls-thin-v2.png`.

Reference: `assets/scene-frame-match-disney-adventure-falls.png`.

Prompt: Redesign the reference as a MUCH THINNER circular transparent frame retaining dimensional carved gold stone, tiny tropical leaves, red hibiscus, amber lanterns and turquoise water accents. Square PNG with transparent center/exterior, centered at 50%,50%. Requested transparent opening radius45% of canvas; decorations restricted to radius45–49%, miniaturized engraved reliefs rather than bulky pillars/medallions. Front-on, entire frame visible, no scene, text or black fill.

Measured output: 1254×1254; minimum transparent opening radius0.407 at alpha100. This is thinner than the original but does not exactly meet requested geometry. Preview scales FRAME ONLY to put all decorations outside the unframed artwork's content area. At310px outer scene box with8px border, frame is approximately361px wide, extending25.6px per side. Original homepage gap28px; full responsive/shelf clearance validation still required before activation. The preview confirms equal scene image dimensions with/without frame.

Preview script: `work/preview-thin-frame.js`; screenshot: `work/thin-adventureland-comparison.png`.

Production implementation: a separate exterior layer sits behind the unchanged scene, avoiding every legacy small-aperture fit rule. Each new transparent PNG is generated individually from its original frame using built-in image_gen. Original frame and scene files are preserved. Prompts and output provenance are in `work/thin-frame-generation/`; the full catalog is `work/thin-frame-plan.json`.

Frame footprint is capped at 116% of the original stage, fitting inside the existing 28px shelf gaps at the full-size 310px stage. Per-asset rim measurements can reduce that footprint to prevent gaps. Only the frame size is adjusted; scene dimensions, transforms, crop, effects and shelf layout remain unchanged. Frame-picker thumbnails reuse the existing Disney crop correction.

Completed: all 89 new assets are integrated. The standalone fairytale castle frame was refined after visual review; its final prompt/output record is `work/thin-frame-generation/disney-castle-refinement.json`.

Validation passed:
- All 89 transparent PNGs: square dimensions, transparent centers and continuous rims. Measurements: `work/thin-frame-rim-audit.json`.
- All 89 frames at 1280, 1024 and 820px viewport widths: unchanged scene image dimensions, transform and crop; unchanged shelf positions; no frame/shelf overlap. Every image scene also matches its No Frame baseline. Scenes paint above borders.
- 49 earlier matching frames plus 12 October Disney matching frames: desktop/mobile chooser, search, preview and saving.
- Disney animation, pause and reduced-motion behavior; all 37 Disney scene thumbnails retain preview crop parity and aspect ratio.
- Visual review of the full collection: `work/exterior-frame-catalog-0.png`, `work/exterior-frame-catalog-30.png`, `work/exterior-frame-catalog-60.png`.
- JavaScript syntax and Git whitespace checks. No original scene or frame image files changed; no shelf code or layout changed.

Tests: `work/verify-exterior-frames.js`, `work/audit-thin-frame-assets.js`, `work/verify-scene-matched-frames.js`, `work/verify-disney-oct6.js`, `work/verify-disney-thumbnail-audit.js`.
