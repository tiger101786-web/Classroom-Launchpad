# Chicken Nugget in Pet Studio

Chicken Nugget is selectable in the shared Pet Studio and companion picker. Preferences are validated and saved through the existing companion-preferences API.

## Flavors

Golden is joined by Frozen, Spicy, Buffalo, BBQ, Garlic Parm, Honey Mustard, Extra Crispy, Teriyaki Sesame, Ranch and Burnt. Each coating has a matching dip. See skins/README.md for source PNGs, built-in generation prompts, and rendering details.

Face colors are shared with the preview: photographic reference skins and Frozen use black expressions; Golden retains its original eye-brown features. No lighter face patch is applied. Dips retain the original sauce relief, highlights and rim shadows. The live pet retains its selected size at narrow window widths rather than shrinking to 95px; source assets and the 2048px render buffer remain unchanged.

## Shared artwork and animation
- rig.js is used by production and work/chicken-nugget-preview; there is no separate reduced-quality production rig.
- nugget-concept.png, body.png and basket.png are byte-for-byte copies of the approved preview assets. Generation provenance is documented in ../work/chicken-nugget-preview/README.md.
- A fixed 2048 × 2048 canvas preserves detail at all display sizes. The basket remains stationary, and body/face/limbs use the same animation clock.
- Photographic skins retain one uncut body/arm/foot image. A continuous mesh gently lifts the limbs, avoiding clipped arm slivers and ankle fragments; resting poses use the native artwork directly.
- Idle breathing/blinking, hello, happy eyes, chatter, arm wiggle, wave, shake, scanning eyes, foot lift, dance, sleep and wake are supported.
- Dancing has happy eyes, a smile, headphones, alternating limbs and rising notes; sleep has the approved wider mouth and moving Zs.
- Production respects reduced motion and stops its frame loop when hidden. The preview permits explicit motion opt-in.

## Integration

Basket sides are selectable under Appearance → Accessories: None, French fries, or Waffle fries. The `basketAccessory` preference is validated and persisted per account. They are independent of headphones and skins, remain stationary with the basket, and disappear with the platform. `accessories.js` uses the approved full-resolution transparent PNGs in `accessories/`, with foot clearance and a ceramic-rim mask that excludes the red liner above the sauce cup. Preview and production use the same implementation. Generation prompts are retained in `../work/chicken-nugget-preview/accessories/README.md`.
interactive.js owns positioning, drag/keyboard movement, naming, hide/show, and studio opening. Pet Studio uses this same live instance. Red/gold headphones can be equipped separately; radio and dance mode show them automatically. Basket and nameplate visibility are configurable. A nugget-themed speech bubble announces a new spot after dragging.

Changes are local until committed and deployed. Restart the application server after deployment for the new server-side preference validation.

## Verification
Run node work/verify-nugget-production.cjs with Playwright available. It starts an isolated test server and temporary data directory, exercises all actions and saved preferences, tests radio, sleep/wake, motion pausing, sizes/mobile, switching, drag speech, invalid settings and logout, and writes screenshots outside the repository.
