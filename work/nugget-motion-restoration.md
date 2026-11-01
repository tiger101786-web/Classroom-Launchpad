# Restore Nugget's full limb movement

The continuous-arm deformation introduced to remove alpha fragments reduced the original wave and dance gestures. Increasing that deformation stretched the shoulder and exposed cut-looking edges. This change restores the original shoulder rotation with dedicated native-resolution arm layers and a torso underlay.

- The original wave/hello angle is unchanged: `1.4 + .32 * sin(t * 15)` radians, approximately 62–99 degrees at full envelope. The original alternating arm-wiggle and dance angles are also retained.
- The torso underlay uses the approved armless body silhouette only around the shoulders. The full photographic master and all artwork files are unchanged. At rest, the renderer draws the complete original photographic master directly.
- Moving hands use complete rounded alpha mattes. The original hand pixels paint above a continuation of the same native hand texture, filling transparent edge holes that previously rotated into pointed shards. The hands rotate independently instead of dragging the torso.
- Feet retain the continuous mesh. A flat weight across each whole foot and a smooth ankle hinge lift the entire toe, rather than fading movement toward the toe edges. Photographic foot actions use a 20px lift and dance steps use 12px; Golden/Frozen retain their existing 18px/10px movement. The renderer remains 2048px and source PNGs are untouched.
- Both script URLs are versioned together so a cached older material loader cannot be paired with the new rig.

Validation: `work/verify-nugget-photo-skins.cjs` checks every photographic skin in Pet Studio, including exact resting-foot pixels, native source/layer dimensions, saving/reload, visible animation changes, dance, sleep and Golden/Frozen switching. A separate isolated rendering measures arm centroid rise and toe height at controlled animation times. The wave must rise at least20 logical pixels and the complete foot at least18. Peak-wave and both-arm screenshots are reviewed for clipping or pointed fragments. JavaScript syntax and whitespace checks are required.
