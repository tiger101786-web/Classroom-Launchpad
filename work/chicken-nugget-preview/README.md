# Chicken Nugget — animation test

## Current preview-only experiment

The preview loads rig-test.js instead of the production renderer to test eye-brown facial features. Eyebrows, closed/happy eyes, smile outlines and open-mouth fill use #491e18, sampled from the original left eye at logical coordinate (433,335). Line widths, shapes, timing and source artwork are unchanged. Pet Studio still uses nugget-pet/rig.js with its existing colors. This experiment has not been promoted to production.

Open index.html directly in a browser. This standalone preview shares its renderer with the Chicken Nugget now available in Pet Studio. No production files or account data are changed.

For Codex's embedded browser, run `node work/chicken-nugget-preview/serve.cjs` from the repository and open http://127.0.0.1:8766/. The loopback-only server serves this preview's public assets without caching. This avoids embedded file-preview image loading failures. The loader uses image load events and identifies any failing asset by filename. Test the web route with `NUGGET_PREVIEW_URL=http://127.0.0.1:8766/` set when running verify-animation.cjs.

The full-size transparent artwork is nugget-concept.png. The nameplate label is live HTML text; controls change the name, display size and backdrop. No source downsampling or lossy conversion is applied.

## Animation

Gentle anchored breathing, automatic blinking, hello, happy eyes, chatter, arm wiggle, wave, quick body shake, eye scanning, foot lift, dance, sleep and waking. Dancing includes headphones, alternating feet and floating music notes. Sleeping includes continuous breathing and rising Zs. Music mode is silent in this preview.

The shared nugget-pet/rig.js renderer uses a single requestAnimationFrame clock and a 2048px canvas. The basket and nameplate remain stationary. Motion can be paused, respects reduced-motion preferences, and pauses in hidden tabs. Click the pet or press Enter/Space while focused to say hello.

Two transparent image-generation edits provide clean layers: basket.png removes the character and reconstructs the checkered paper; body.png isolates the crispy body with a blank face and no arms. Both PNGs retain their generated resolution. The isolated body is registered to the approved composite in canvas coordinates; arms, feet and eyes use masked pieces of the original artwork. No low-resolution sprite cache or lossy encoding is used.

Layer-edit briefs: preserve the original basket, sauce, label and framing while removing the pet; isolate the original nugget body, remove the face and arms, and reconstruct detailed breading with transparent surroundings. Generated sources: exec-e101854e-7953-4b48-8eba-8bef37939586.png (basket), exec-a326bb35-8b08-43fd-9a4d-1b5f6d59dc11.png (body).

## Generation

Created with the built-in image-generation tool, transparent background enabled.

Prompt: Create one adorable but genuinely realistic chicken nugget character standing securely inside a shallow red oval fast-food basket lined with cream-and-red checkered deli paper. A single upright irregular rounded nugget with richly detailed crispy golden breading, tiny crags and toasted flakes, realistic food-photography texture, no exposed meat. Tiny glossy dark brown eyes, subtle friendly curved smile, two tiny breaded feet and small breaded arms. No bird features or cartoon outlines. Warm studio lighting, dimensional premium 3D realism. Front view slightly above, basket comfortably wider and deeper than the pet, feet firmly planted. Small white honey-mustard dipping cup at back right. A generously wide blank cream takeout-label nameplate on front basket wall with toasted-gold beveled rim and thin red inner border. Square composition, full character and basket visible, transparent background, no letters or watermark.

Generated source: exec-659a3866-fdf3-4f7f-b47c-2a8d935a8fec.png. Copied unchanged into this directory.

## Checks

verify.cjs opens the preview via file URL, verifies the image loads at full resolution, tests name updates including long text, preview sizes, backdrop controls, and narrow-screen overflow. Screenshots are stored in a temporary verification directory outside the repository.

verify-animation.cjs tests every action control, sleep/wake and dance states, frame progression, pausing, reduced motion, canvas resolution, mobile overflow and browser errors. It saves pose screenshots outside the repository for visual inspection.
