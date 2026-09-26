# Hero background stabilization

## Withdrawn after playback feedback

The user reported severe shaking in the stabilized version. The desktop player now uses the original `assets/hero-panel-bg.mp4` again, with refreshed cache versions. Do not use the stabilized asset: contact sheets and successful decoding did not establish smooth continuous playback. Original drift remains; a future fix requires full-motion and loop-boundary review before integration.

Original `assets/hero-panel-bg.mp4` preserved. New desktop source: `assets/hero-panel-bg-stable.mp4`.

The page has no translation animation on the background video; drift is embedded in the footage. Stabilization tracks the head region rather than the animated lightning/background. Non-rigid mane/head animation remains; this is not a frozen horse or a still-image replacement. Mobile's separate video is unchanged.

Reproduction with FFmpeg and libvidstab (run from repository root):

```sh
ffmpeg -i assets/hero-panel-bg.mp4 -vf "crop=360:340:890:100,vidstabdetect=tripod=1:accuracy=15:stepsize=4:result=work/hero-head.trf" -an -f null -
ffmpeg -i assets/hero-panel-bg.mp4 -vf "vidstabtransform=input=work/hero-head.trf:tripod=1:optzoom=1:maxangle=0:interpol=bicubic" -an -c:v libx264 -crf 20 -preset medium -movflags +faststart assets/hero-panel-bg-stable.mp4
```

Original and stabilized contact sheets retain changing lightning, eye glow and mane. The output retains the original dimensions, frame rate and duration; static auto-crop avoids moving stabilization edges.
