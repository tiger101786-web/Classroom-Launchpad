# Colt accessories

Headwear: headphones, a spiral metallic unicorn horn, or a burgundy star sleep cap.
Eyewear: fitted burgundy/silver sunglasses with lenses, reflections, and side arms.
Neckwear: a striped school-color scarf with fringe, or a layered jeweled bow tie.

Categories save independently under `robo.headwear`, `robo.eyewear`, and
`robo.neckwear`. Older preferences default the new categories to none; old-client
saves preserve existing eyewear/neckwear. All designs are code-native SVG and
attach to the head rig, outside all skin filters. Radio headphones temporarily
replace headwear and restore the user's choice when playback stops.

The sleep mouth is enlarged to rx=10, ry=13 before skin-specific fitting; its
centered 2.8-second motion and accessibility settings remain unchanged.

Verify with `node work/verify-colt-accessories.cjs`,
`node work/verify-colt-sleep-mouth.cjs`, and `npm run test:robo`.
