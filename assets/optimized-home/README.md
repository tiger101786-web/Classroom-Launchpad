# Homepage video delivery copies

Original files remain in assets/. These copies keep the original resolution and frame count. Audio is omitted because these homepage videos always play muted. The MP4 index is moved to the front for streaming.

Encoded with FFmpeg/libx264, preset slow, CRF 20 (profile clips) or 24 (logo), yuv420p, passthrough frame timing, and +faststart. Accepted copies must be smaller and score at least 0.99 SSIM against their originals at the displayed comparison sizes (310 px profiles, 356 px logo). Visual comparisons were also reviewed. Timing metadata can differ by less than a millisecond from MP4 timescale rounding.

| File | Original bytes | Delivery bytes | Display-size SSIM |
|---|---:|---:|---:|
| st-cletus-logo.mp4 | 1859177 | 1083910 | 0.995576 |
| mr-nieves-colts.mp4 | 1917034 | 1022785 | 0.994555 |
| home-profile-04.mp4 | 1415620 | 774978 | 0.995894 |
| home-profile-06.mp4 | 1369590 | 926535 | 0.994382 |
| home-profile-07.mp4 | 1594609 | 804173 | 0.995269 |
| home-profile-08.mp4 | 2039610 | 872771 | 0.994641 |
| home-profile-09.mp4 | 2060665 | 890427 | 0.995932 |
| home-profile-10.mp4 | 2393706 | 1280999 | 0.994533 |
| home-profile-11.mp4 | 1855605 | 846845 | 0.995878 |

Profiles 02, 03, 05 and 12 keep their original delivery files because the trial did not meet the size or comparison threshold.
